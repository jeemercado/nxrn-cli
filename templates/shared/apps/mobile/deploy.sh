#!/bin/bash
# Interactive deployment - picks platform, lane, and environment

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
FASTLANE_DIR="$SCRIPT_DIR/fastlane"

source "$SCRIPT_DIR/picker.sh"

# --- Platform selection ---
PLATFORMS=("ios" "android")
pick "Select a platform:" "${PLATFORMS[@]}" --key "deploy-platform"
SELECTED_PLATFORM="${PLATFORMS[$PICKED_INDEX]}"

# --- Lane selection (dynamically parsed from Fastfile) ---
LANES=$(python3 -c "
import re
with open('$FASTLANE_DIR/Fastfile') as f:
    content = f.read()

# Find the platform block for the selected platform
pattern = r'platform\s+:$SELECTED_PLATFORM\s+do(.*?)^end'
match = re.search(pattern, content, re.DOTALL | re.MULTILINE)
if match:
    block = match.group(1)
    # Find all lane declarations
    lanes = re.findall(r'lane\s+:(\w+)\s+do', block)
    for lane in lanes:
        print(lane)
")

if [ -z "$LANES" ]; then
  echo "No lanes found for platform: $SELECTED_PLATFORM"
  exit 1
fi

LANE_ARRAY=()
while IFS= read -r line; do
  [ -z "$line" ] && continue
  LANE_ARRAY+=("$line")
done <<< "$LANES"

pick "Select a lane:" "${LANE_ARRAY[@]}" --key "deploy-lane-$SELECTED_PLATFORM"
SELECTED_LANE="${LANE_ARRAY[$PICKED_INDEX]}"

# --- Environment selection (dynamically from .env.* files) ---
ENV_ARRAY=()
for env_file in "$FASTLANE_DIR"/.env.*; do
  [ -f "$env_file" ] || continue
  env_name=$(basename "$env_file" | sed 's/^\.env\.//')
  # Skip template
  if [ "$env_name" = "template" ]; then
    continue
  fi
  ENV_ARRAY+=("$env_name")
done

if [ ${#ENV_ARRAY[@]} -eq 0 ]; then
  echo ""
  echo "No environment files found. Create at least one of:"
  echo "  fastlane/.env.development"
  echo "  fastlane/.env.staging"
  echo "  fastlane/.env.production"
  exit 1
fi

pick "Select an environment:" "${ENV_ARRAY[@]}" --key "deploy-env"
SELECTED_ENV="${ENV_ARRAY[$PICKED_INDEX]}"

# --- Safeguard: check for local URLs in .env ---
APP_ENV="$SCRIPT_DIR/.env"
if [ -f "$APP_ENV" ]; then
  if grep -qiE 'localhost|192\.168\.' "$APP_ENV"; then
    echo ""
    echo "Deployment aborted: apps/mobile/.env contains a local URL (localhost or 192.168.*)."
    echo "Update your .env to point to the correct remote server before deploying."
    exit 1
  fi
fi

# --- Confirmation ---
echo ""
echo "Deploy summary:"
echo "  Platform:    $SELECTED_PLATFORM"
echo "  Lane:        $SELECTED_LANE"
if [ -n "$SELECTED_ENV" ]; then
  echo "  Environment: $SELECTED_ENV"
fi
echo ""

CONFIRM_ARRAY=("Yes" "No")
pick "Proceed with deployment?" "${CONFIRM_ARRAY[@]}"
if [ "$PICKED_INDEX" -ne 0 ]; then
  echo "Deployment cancelled."
  exit 0
fi

# --- Run fastlane ---
echo ""
FASTLANE_CMD="bundle exec fastlane $SELECTED_PLATFORM $SELECTED_LANE"
if [ -n "$SELECTED_ENV" ]; then
  FASTLANE_CMD="$FASTLANE_CMD --env $SELECTED_ENV"
fi

echo "Running: $FASTLANE_CMD"
echo ""

cd "$SCRIPT_DIR" && $FASTLANE_CMD
