#!/usr/bin/env bash
set -euo pipefail

# Generates a fastlane env file from a template by:
# 1) validating prerequisites/auth/env vars
# 2) creating/reusing Firebase apps
# 3) registering Android devDebug SHA1 on Firebase
# 4) downloading Android/iOS Firebase config files for selected environments
# 5) creating/reusing a GCP service account + key
# 6) writing deterministic key/value output to the target env file

SCRIPT_NAME="$(basename "$0")"

TEMPLATE_PATH="fastlane/.env.template"
OUTPUT_PATH="fastlane/.env"
ENV_FILE_PATH="${ENVFILE:-}"
SERVICE_ACCOUNT_KEY_PATH="fastlane/firebase-service-account.json"
SERVICE_ACCOUNT_NAME="fad-admin"
FIREBASE_APPDIST_ROLE="roles/firebaseappdistro.admin"
AUTO_APPROVE=0
OUTPUT_PATH_EXPLICIT=0

usage() {
  cat <<USAGE
Usage: $SCRIPT_NAME [options]

Generate fastlane/.env from fastlane/.env.template by reading env vars and ensuring
Firebase/GCP resources exist.

Options:
  --env-file <path>              Load input variables from dotenv file (same as ENVFILE=<path>)
  --template <path>              Template file path (default: fastlane/.env.template)
  --output <path>                Output env file path (default: fastlane/.env)
  --service-account-key <path>   Service account JSON key path (default: fastlane/firebase-service-account.json)
  --service-account-name <name>  Service account name prefix (default: fad-admin)
  --appdist-role <role>          IAM role for Firebase App Distribution (default: roles/firebaseappdistro.admin)
  --yes                          Skip interactive account confirmation prompt
  -h, --help                     Show this help
USAGE
}

log() { printf '[%s] %s\n' "$SCRIPT_NAME" "$*" >&2; }
warn() { printf '[%s] WARNING: %s\n' "$SCRIPT_NAME" "$*" >&2; }
die() { printf '[%s] ERROR: %s\n' "$SCRIPT_NAME" "$*" >&2; exit 1; }

command_exists() { command -v "$1" >/dev/null 2>&1; }

require_command() {
  local cmd="$1"
  command_exists "$cmd" || die "Required command not found: $cmd"
}

require_env() {
  local name="$1"
  if [[ -z "${!name:-}" ]]; then
    die "Required environment variable is missing: $name"
  fi
}

load_env_file_if_configured() {
  if [[ -z "$ENV_FILE_PATH" ]]; then
    return
  fi

  [[ -f "$ENV_FILE_PATH" ]] || die "Env file not found: $ENV_FILE_PATH"
  log "Loading variables from $ENV_FILE_PATH"
  # shellcheck disable=SC1090
  set -a
  source "$ENV_FILE_PATH"
  set +a
}

has_gcp_project_visibility() {
  local project_id="$1"

  # Prefer direct describe when allowed.
  if gcloud projects describe "$project_id" --format='value(projectId)' >/dev/null 2>&1; then
    return 0
  fi

  # Fallback for identities that cannot call describe but can still list projects.
  local listed_id=''
  listed_id="$(gcloud projects list --filter="projectId=$project_id" --format='value(projectId)' 2>/dev/null | head -n1 || true)"
  [[ "$listed_id" == "$project_id" ]]
}

require_firebase_project_access() {
  local project_id="$1"
  local projects_json=''

  # Verifies the current Firebase auth can access this project.
  projects_json="$(firebase projects:list --json --non-interactive)"
  if ! jq -e --arg pid "$project_id" '[.. | objects | .projectId? // empty] | index($pid) != null' <<<"$projects_json" >/dev/null; then
    die "Firebase account cannot access project: $project_id"
  fi
}

get_active_gcloud_account() {
  gcloud auth list --filter=status:ACTIVE --format='value(account)' 2>/dev/null | head -n1
}

get_active_firebase_account() {
  # login:list is the least ambiguous source for current Firebase CLI identity.
  firebase login:list --json --non-interactive 2>/dev/null \
    | jq -r '[.. | objects | .email? // empty][0] // empty' \
    | head -n1
}

get_base64_file() {
  local file_path="$1"
  # Keep the value on one line to fit dotenv usage and Fastfile decoding.
  base64 < "$file_path" | tr -d '\n'
}

dotenv_escape() {
  local raw="$1"
  if [[ -z "$raw" ]]; then
    printf ''
    return
  fi

  # Keep unquoted when safe; quote and escape otherwise.
  if [[ "$raw" =~ ^[A-Za-z0-9_./:@,+=-]+$ ]]; then
    printf '%s' "$raw"
    return
  fi

  local escaped="$raw"
  escaped=${escaped//\\/\\\\}
  escaped=${escaped//\"/\\\"}
  escaped=${escaped//\$/\\$}
  printf '"%s"' "$escaped"
}

extract_first_app_id_from_json() {
  local json="$1"
  local selector="$2"
  # Firebase CLI JSON shape can vary, so traverse recursively and match by identifier.
  jq -r --arg selector "$selector" '
    [
      .. | objects |
      select(.appId? != null) |
      select((.packageName? == $selector) or (.bundleId? == $selector)) |
      .appId
    ][0] // empty
  ' <<<"$json"
}

extract_first_app_id_from_create_json() {
  local json="$1"
  # Read appId from create response regardless of nesting shape.
  jq -r '[.. | objects | .appId? // empty][0] // empty' <<<"$json"
}

ensure_firebase_app() {
  local platform="$1"
  local identifier="$2"
  local display_name="$3"
  local app_id=''
  local list_json=''

  # First try to find an existing app for idempotent behavior.
  list_json="$(firebase apps:list "$platform" --project "$GCP_PROJECT_ID" --json --non-interactive)"
  app_id="$(extract_first_app_id_from_json "$list_json" "$identifier")"

  if [[ -n "$app_id" ]]; then
    log "Reusing existing Firebase $platform app for identifier $identifier"
    printf '%s' "$app_id"
    return
  fi

  # Create only when no matching app exists.
  log "Creating Firebase $platform app for identifier $identifier"
  local create_json=''
  if [[ "$platform" == "ANDROID" ]]; then
    create_json="$(firebase apps:create ANDROID "$display_name" --package-name "$identifier" --project "$GCP_PROJECT_ID" --json --non-interactive)"
  elif [[ "$platform" == "IOS" ]]; then
    create_json="$(firebase apps:create IOS "$display_name" --bundle-id "$identifier" --project "$GCP_PROJECT_ID" --json --non-interactive)"
  else
    die "Unsupported Firebase platform: $platform"
  fi

  app_id="$(extract_first_app_id_from_create_json "$create_json")"
  [[ -n "$app_id" ]] || die "Failed to detect appId after creating Firebase $platform app"
  printf '%s' "$app_id"
}

extract_devdebug_hash_from_signing_report() {
  local report="$1"
  local hash_label="$2"
  awk -v label="$hash_label" '
    /^Variant: / {
      in_variant = ($2 == "devDebug")
      next
    }
    in_variant && index($0, label ":") == 1 {
      sub("^" label ":[[:space:]]*", "", $0)
      print
      exit
    }
  ' <<<"$report"
}

get_android_devdebug_hashes() {
  local signing_report=''
  local sha1=''
  local sha256=''
  local gradlew_path="android/gradlew"

  [[ -x "$gradlew_path" ]] || die "Android gradle wrapper not found or not executable: $gradlew_path"

  log "Running Android signingReport to read devDebug signing hashes"
  signing_report="$(cd android && ./gradlew signingReport --console=plain)"
  sha1="$(extract_devdebug_hash_from_signing_report "$signing_report" "SHA1")"
  sha256="$(extract_devdebug_hash_from_signing_report "$signing_report" "SHA-256")"
  [[ -n "$sha1" ]] || die "Could not find SHA1 for Variant: devDebug in Android signingReport output"
  [[ -n "$sha256" ]] || die "Could not find SHA-256 for Variant: devDebug in Android signingReport output"
  printf '%s\n%s' "$sha1" "$sha256"
}

ensure_firebase_android_hash() {
  local app_id="$1"
  local hash_value="$2"
  local hash_name="$3"
  local list_json=''

  list_json="$(firebase apps:android:sha:list "$app_id" --project "$GCP_PROJECT_ID" --json --non-interactive 2>/dev/null || true)"
  if [[ -n "$list_json" ]] && jq -e --arg sha "$hash_value" '[.. | objects | .shaHash? // empty] | index($sha) != null' <<<"$list_json" >/dev/null; then
    log "Reusing existing Firebase Android $hash_name for app $app_id"
    return
  fi

  log "Registering devDebug $hash_name on Firebase Android app $app_id"
  if ! firebase apps:android:sha:create "$app_id" "$hash_value" --project "$GCP_PROJECT_ID" --json --non-interactive >/dev/null 2>&1; then
    # Handle eventual consistency/races where another process created the SHA after list.
    list_json="$(firebase apps:android:sha:list "$app_id" --project "$GCP_PROJECT_ID" --json --non-interactive 2>/dev/null || true)"
    if [[ -n "$list_json" ]] && jq -e --arg sha "$hash_value" '[.. | objects | .shaHash? // empty] | index($sha) != null' <<<"$list_json" >/dev/null; then
      log "Firebase Android $hash_name already exists after retry check; continuing"
      return
    fi
    die "Failed to register $hash_name $hash_value on Firebase Android app $app_id"
  fi
}

download_android_google_services_json() {
  local app_id="$1"
  local destination_dir=''
  local destination_file=''
  local tmp_file=''

  case "$ENVIRONMENT" in
    development)
      destination_dir="android/app/src/dev"
      ;;
    production)
      destination_dir="android/app/src/production"
      ;;
    *)
      warn "Skipping google-services.json download for ENVIRONMENT=$ENVIRONMENT (supported by this step: development, production)"
      return 0
      ;;
  esac

  destination_file="${destination_dir}/google-services.json"
  mkdir -p "$destination_dir"

  tmp_file="$(mktemp)"
  if ! firebase apps:sdkconfig ANDROID "$app_id" --project "$GCP_PROJECT_ID" --non-interactive >"$tmp_file"; then
    rm -f "$tmp_file"
    warn "Failed to download Android google-services.json for app $app_id"
    return 1
  fi

  if [[ ! -s "$tmp_file" ]]; then
    rm -f "$tmp_file"
    warn "Downloaded Android google-services.json was empty for app $app_id"
    return 1
  fi

  mv "$tmp_file" "$destination_file"
  chmod 600 "$destination_file"
  log "Wrote $destination_file"
}

download_ios_google_service_info_plist() {
  local app_id="$1"
  local destination_dir=''
  local destination_file=''
  local tmp_file=''

  case "$ENVIRONMENT" in
    development)
      destination_dir="ios/Firebase/Dev"
      ;;
    production)
      destination_dir="ios/Firebase/Prod"
      ;;
    *)
      warn "Skipping iOS GoogleService-Info.plist download for ENVIRONMENT=$ENVIRONMENT (supported by this step: development, production)"
      return 0
      ;;
  esac

  destination_file="${destination_dir}/GoogleService-Info.plist"
  mkdir -p "$destination_dir"

  tmp_file="$(mktemp)"
  if ! firebase apps:sdkconfig IOS "$app_id" --project "$GCP_PROJECT_ID" --non-interactive >"$tmp_file"; then
    rm -f "$tmp_file"
    warn "Failed to download iOS GoogleService-Info.plist for app $app_id"
    return 1
  fi

  if [[ ! -s "$tmp_file" ]]; then
    rm -f "$tmp_file"
    warn "Downloaded iOS GoogleService-Info.plist was empty for app $app_id"
    return 1
  fi

  mv "$tmp_file" "$destination_file"
  chmod 600 "$destination_file"
  log "Wrote $destination_file"
}

ensure_service_account() {
  local sa_email="$1"

  # Create once, then reuse across runs.
  if gcloud iam service-accounts describe "$sa_email" --project "$GCP_PROJECT_ID" >/dev/null 2>&1; then
    log "Reusing existing service account: $sa_email"
  else
    log "Creating service account: $sa_email"
    if ! gcloud iam service-accounts create "$SERVICE_ACCOUNT_NAME" \
      --project "$GCP_PROJECT_ID" \
      --display-name "Firebase App Distribution Service Account" \
      --description "Used by Fastlane Firebase App Distribution" \
      --quiet >/dev/null 2>&1; then
      return 1
    fi
  fi

  # Safe to call repeatedly; command is effectively idempotent for existing binding.
  if ! gcloud projects add-iam-policy-binding "$GCP_PROJECT_ID" \
    --member "serviceAccount:$sa_email" \
    --role "$FIREBASE_APPDIST_ROLE" \
    --quiet >/dev/null 2>&1; then
    return 1
  fi

  return 0
}

ensure_service_account_key() {
  local sa_email="$1"
  local key_path="$2"

  mkdir -p "$(dirname "$key_path")"

  # Keys should be generated once and then reused (avoid key sprawl).
  if [[ -s "$key_path" ]]; then
    log "Reusing existing service account key file at $key_path"
    return
  fi

  log "Creating new service account key at $key_path"
  umask 077
  if ! gcloud iam service-accounts keys create "$key_path" \
    --iam-account "$sa_email" \
    --project "$GCP_PROJECT_ID" \
    --quiet >/dev/null 2>&1; then
    return 1
  fi

  return 0
}

preflight_checks() {
  # Validate tools, template, required env, and auth access early.
  require_command firebase
  require_command gcloud
  require_command jq
  require_command base64

  [[ -f "$TEMPLATE_PATH" ]] || die "Template not found: $TEMPLATE_PATH"

  require_env GCP_PROJECT_ID
  require_env FASTLANE_APP_IDENTIFIER
  require_env MATCH_PASSWORD
  require_env MATCH_GIT_URL
  require_env FASTLANE_APPSTORE_KEY_ID
  require_env FASTLANE_APPSTORE_ISSUER_ID
  require_env FASTLANE_APPSTORE_KEY_CONTENT
  require_env ENVIRONMENT

  local active_account
  active_account="$(get_active_gcloud_account || true)"
  [[ -n "$active_account" ]] || die "No active gcloud account found. Run: gcloud auth login"

  local current_project
  current_project="$(gcloud config get-value project 2>/dev/null || true)"
  if [[ -z "$current_project" || "$current_project" == "(unset)" ]]; then
    warn "No default gcloud project configured. Commands will use GCP_PROJECT_ID=$GCP_PROJECT_ID explicitly."
  fi

  # Firebase confirms project existence in this workflow.
  require_firebase_project_access "$GCP_PROJECT_ID"

  # gcloud visibility checks can be stricter in some IAM setups; warn and continue.
  if ! has_gcp_project_visibility "$GCP_PROJECT_ID"; then
    warn "gcloud cannot verify visibility for project $GCP_PROJECT_ID. Proceeding because Firebase access is confirmed; IAM steps may still fail if permissions are insufficient."
  fi
}

confirm_accounts() {
  local gcloud_account="$1"
  local firebase_account="$2"

  if [[ "$AUTO_APPROVE" -eq 1 ]]; then
    return
  fi

  if [[ ! -t 0 ]]; then
    die "Interactive confirmation required but no TTY detected. Re-run with --yes."
  fi

  log "gcloud account: ${gcloud_account:-<unknown>}"
  log "firebase account: ${firebase_account:-<unknown>}"

  local reply=''
  read -r -p "Proceed with these accounts? [y/N] " reply
  case "$reply" in
    y|Y|yes|YES)
      ;;
    *)
      die "Aborted by user."
      ;;
  esac
}

render_env_file() {
  local android_app_id="$1"
  local ios_app_id="$2"
  local firebase_service_account_b64="$3"
  local is_ci="${IS_CI:-true}"

  local git_branch="${GIT_BRANCH:-main}"
  local app_identifiers="${FASTLANE_APP_IDENTIFIERS:-${FASTLANE_APP_IDENTIFIER}}"

  # Backward compatibility for templates that still have a single Firebase app id variable.
  local legacy_firebase_app_id="${FASTLANE_FIREBASE_APP_ID:-$android_app_id}"

  : > "$OUTPUT_PATH"

  while IFS= read -r line || [[ -n "$line" ]]; do
    if [[ "$line" =~ ^([A-Za-z_][A-Za-z0-9_]*)=(.*)$ ]]; then
      local key="${BASH_REMATCH[1]}"
      local template_val="${BASH_REMATCH[2]}"
      local value=''
      local rendered_value=''

      # Map known keys to computed/discovered values, fallback to env/template.
      case "$key" in
        IS_CI)
          value="$is_ci"
          ;;
        GIT_BRANCH)
          value="$git_branch"
          ;;
        GIT_URL)
          value="${MATCH_GIT_URL:-}"
          ;;
        FIREBASE_SERVICE_ACCOUNT)
          value="$firebase_service_account_b64"
          # Always quote this value explicitly to avoid dotenv parsing issues.
          rendered_value="\"$value\""
          ;;
        FASTLANE_FIREBASE_APP_ID_ANDROID)
          value="$android_app_id"
          ;;
        FASTLANE_FIREBASE_APP_ID_IOS)
          value="$ios_app_id"
          ;;
        FASTLANE_FIREBASE_APP_ID)
          value="$legacy_firebase_app_id"
          ;;
        FASTLANE_APP_IDENTIFIER)
          value="${FASTLANE_APP_IDENTIFIER}"
          ;;
        FASTLANE_APP_IDENTIFIERS)
          value="$app_identifiers"
          ;;
        KEY_ALIAS)
          value="${KEY_ALIAS:-production}"
          ;;
        *)
          # Prefer runtime env var, else preserve template default literal.
          if [[ -n "${!key+x}" ]]; then
            value="${!key}"
            rendered_value="$(dotenv_escape "$value")"
          else
            rendered_value="$template_val"
          fi
          ;;
      esac

      if [[ -z "$rendered_value" ]]; then
        rendered_value="$(dotenv_escape "$value")"
      fi
      printf '%s=%s\n' "$key" "$rendered_value" >> "$OUTPUT_PATH"
    else
      printf '%s\n' "$line" >> "$OUTPUT_PATH"
    fi
  done < "$TEMPLATE_PATH"

  chmod 600 "$OUTPUT_PATH"
  log "Wrote $OUTPUT_PATH"
}

main() {
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --env-file)
        ENV_FILE_PATH="$2"
        shift 2
        ;;
      --template)
        TEMPLATE_PATH="$2"
        shift 2
        ;;
      --output)
        OUTPUT_PATH="$2"
        OUTPUT_PATH_EXPLICIT=1
        shift 2
        ;;
      --service-account-key)
        SERVICE_ACCOUNT_KEY_PATH="$2"
        shift 2
        ;;
      --service-account-name)
        SERVICE_ACCOUNT_NAME="$2"
        shift 2
        ;;
      --appdist-role)
        FIREBASE_APPDIST_ROLE="$2"
        shift 2
        ;;
      --yes)
        AUTO_APPROVE=1
        shift
        ;;
      -h|--help)
        usage
        exit 0
        ;;
      *)
        die "Unknown argument: $1"
        ;;
    esac
  done

  load_env_file_if_configured
  preflight_checks

  if [[ ! "$ENVIRONMENT" =~ ^(development|staging|production)$ ]]; then
    die "ENVIRONMENT must be one of: development, staging, production. Got: $ENVIRONMENT"
  fi
  if [[ "$OUTPUT_PATH_EXPLICIT" -eq 0 ]]; then
    OUTPUT_PATH="fastlane/.env.${ENVIRONMENT}"
  fi

  local gcloud_account
  gcloud_account="$(get_active_gcloud_account || true)"
  local firebase_account
  firebase_account="$(get_active_firebase_account || true)"
  confirm_accounts "$gcloud_account" "$firebase_account"

  # Use explicit Android app id when provided; otherwise reuse iOS bundle id.
  local android_application_id="${ANDROID_APPLICATION_ID:-$FASTLANE_APP_IDENTIFIER}"
  local firebase_app_name_android="${FIREBASE_APP_NAME_ANDROID:-${android_application_id}-android}"
  local firebase_app_name_ios="${FIREBASE_APP_NAME_IOS:-${FASTLANE_APP_IDENTIFIER}-ios}"

  local android_app_id
  android_app_id="$(ensure_firebase_app "ANDROID" "$android_application_id" "$firebase_app_name_android")"

  local android_devdebug_signing_hashes
  android_devdebug_signing_hashes="$(get_android_devdebug_hashes)"
  local android_devdebug_sha1
  android_devdebug_sha1="$(sed -n '1p' <<<"$android_devdebug_signing_hashes")"
  local android_devdebug_sha256
  android_devdebug_sha256="$(sed -n '2p' <<<"$android_devdebug_signing_hashes")"
  ensure_firebase_android_hash "$android_app_id" "$android_devdebug_sha1" "SHA1"
  ensure_firebase_android_hash "$android_app_id" "$android_devdebug_sha256" "SHA-256"
  download_android_google_services_json "$android_app_id" || true

  local ios_app_id
  ios_app_id="$(ensure_firebase_app "IOS" "$FASTLANE_APP_IDENTIFIER" "$firebase_app_name_ios")"
  download_ios_google_service_info_plist "$ios_app_id" || true

  local sa_email="${SERVICE_ACCOUNT_NAME}@${GCP_PROJECT_ID}.iam.gserviceaccount.com"
  ensure_service_account "$sa_email" || true
  ensure_service_account_key "$sa_email" "$SERVICE_ACCOUNT_KEY_PATH" || true

  # Fastfile currently expects FIREBASE_SERVICE_ACCOUNT as base64-encoded JSON.
  local firebase_sa_b64
  firebase_sa_b64=''
  if [[ -s "$SERVICE_ACCOUNT_KEY_PATH" ]]; then
    firebase_sa_b64="$(get_base64_file "$SERVICE_ACCOUNT_KEY_PATH")"
  fi

  render_env_file "$android_app_id" "$ios_app_id" "$firebase_sa_b64"

  log "Done. Firebase app IDs and service account material written to $OUTPUT_PATH"
}

main "$@"
