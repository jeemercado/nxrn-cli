#!/bin/bash
# Interactive Android launcher - picks variant and device

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ANDROID_DIR="$SCRIPT_DIR/android"

source "$SCRIPT_DIR/picker.sh"

# --- Variant selection via gradle install tasks ---
echo ""
echo "Fetching build variants..."

INSTALL_TASKS=$(cd "$ANDROID_DIR" && ./gradlew app:tasks --group=install --quiet 2>/dev/null | grep "^install" | grep -vi "AndroidTest\|Optimized" | awk '{print $1}')

if [ -z "$INSTALL_TASKS" ]; then
  echo "Could not read build variants from Gradle"
  exit 1
fi

BASE_APP_ID=$(grep -m1 'applicationId' "$ANDROID_DIR/app/build.gradle" | sed -E 's/.*applicationId[[:space:]]+"([^"]+)".*/\1/' | tr -d '[:space:]')

TASK_ARRAY=()
DISPLAY_ARRAY=()
while IFS= read -r line; do
  [ -z "$line" ] && continue
  TASK_ARRAY+=("$line")
  VARIANT="${line#install}"
  # Derive bundle ID for display
  VARIANT_FLAVOR=$(echo "$VARIANT" | sed -E 's/(Debug|Release)$//' | tr '[:upper:]' '[:lower:]')
  if [ "$VARIANT_FLAVOR" != "production" ] && [ -n "$VARIANT_FLAVOR" ]; then
    VARIANT_BUNDLE_ID="${BASE_APP_ID}.${VARIANT_FLAVOR}"
  else
    VARIANT_BUNDLE_ID="$BASE_APP_ID"
  fi
  DISPLAY_ARRAY+=("$VARIANT ($VARIANT_BUNDLE_ID)")
done <<< "$INSTALL_TASKS"

pick "Select a build variant:" "${DISPLAY_ARRAY[@]}" --key "android-variant"
SELECTED_TASK="${TASK_ARRAY[$PICKED_INDEX]}"
SELECTED_VARIANT="${SELECTED_TASK#install}"

# Mode is the full variant name with first letter lowercased (e.g. devDebug, productionRelease)
MODE="$(tr '[:upper:]' '[:lower:]' <<< "${SELECTED_VARIANT:0:1}")${SELECTED_VARIANT:1}"

# Infer appIdSuffix and bundle ID from flavor
FLAVOR=$(echo "$SELECTED_VARIANT" | sed -E 's/(Debug|Release)$//' | tr '[:upper:]' '[:lower:]')
APP_ID_SUFFIX=""
if [ "$FLAVOR" != "production" ] && [ -n "$FLAVOR" ]; then
  APP_ID_SUFFIX="$FLAVOR"
  BUNDLE_ID="${BASE_APP_ID}.${APP_ID_SUFFIX}"
else
  BUNDLE_ID="$BASE_APP_ID"
fi

# --- Device selection (booted devices + shutdown AVDs) ---
DEVICE_ARRAY=()
DEVICE_IDS=()
DEVICE_TYPES=() # "booted" or "avd"

# Collect running devices/emulators
RUNNING_AVDS=()
DEVICES=$(adb devices -l 2>/dev/null | tail -n +2 | grep -v '^$')
if [ -n "$DEVICES" ]; then
  while IFS= read -r line; do
    [ -z "$line" ] && continue
    SERIAL=$(echo "$line" | awk '{print $1}')
    MODEL=$(echo "$line" | grep -o 'model:[^ ]*' | cut -d: -f2)

    if echo "$SERIAL" | grep -q "emulator"; then
      # Get AVD name for this running emulator
      AVD_NAME=$(adb -s "$SERIAL" emu avd name 2>/dev/null | head -1 | tr -d '\r')
      RUNNING_AVDS+=("$AVD_NAME")
      LABEL="[Booted] $SERIAL${AVD_NAME:+ ($AVD_NAME)}"
    else
      LABEL="[Device] $SERIAL${MODEL:+ ($MODEL)}"
    fi

    DEVICE_ARRAY+=("$LABEL")
    DEVICE_IDS+=("$SERIAL")
    DEVICE_TYPES+=("booted")
  done <<< "$DEVICES"
fi

# Collect shutdown AVDs
ALL_AVDS=$(emulator -list-avds 2>/dev/null)
if [ -n "$ALL_AVDS" ]; then
  while IFS= read -r avd; do
    [ -z "$avd" ] && continue
    # Skip if already running
    ALREADY_RUNNING=false
    for running in "${RUNNING_AVDS[@]}"; do
      if [ "$avd" = "$running" ]; then
        ALREADY_RUNNING=true
        break
      fi
    done
    if [ "$ALREADY_RUNNING" = false ]; then
      DEVICE_ARRAY+=("[Shutdown] $avd")
      DEVICE_IDS+=("$avd")
      DEVICE_TYPES+=("avd")
    fi
  done <<< "$ALL_AVDS"
fi

if [ ${#DEVICE_ARRAY[@]} -eq 0 ]; then
  echo ""
  echo "No Android devices or AVDs found."
  exit 1
fi

pick "Select a device:" "${DEVICE_ARRAY[@]}" --key "android-device"
SELECTED_INDEX=$PICKED_INDEX
SELECTED_DEVICE="${DEVICE_IDS[$SELECTED_INDEX]}"

# Boot AVD if shutdown
if [ "${DEVICE_TYPES[$SELECTED_INDEX]}" = "avd" ]; then
  echo ""
  echo "Booting AVD: $SELECTED_DEVICE..."
  # Launch in a new session so it's fully detached from this script
  perl -e 'use POSIX "setsid"; setsid(); exec("emulator", "-avd", $ARGV[0], "-no-snapshot-load")' "$SELECTED_DEVICE" </dev/null &>/dev/null &

  # Wait for device to come online
  echo "Waiting for device to boot..."
  adb wait-for-device
  # Wait for boot animation to finish
  while [ "$(adb shell getprop sys.boot_completed 2>/dev/null | tr -d '\r')" != "1" ]; do
    sleep 1
  done
  echo "Device booted."

  # Get the serial of the newly booted emulator
  SELECTED_DEVICE=$(adb devices | grep "emulator" | tail -1 | awk '{print $1}')
fi

echo ""
echo "Running: task=$SELECTED_TASK mode=$MODE device=$SELECTED_DEVICE bundleId=$BUNDLE_ID"
echo ""

RN_ARGS="--tasks=$SELECTED_TASK --mode=$MODE --device=$SELECTED_DEVICE"
if [ -n "$APP_ID_SUFFIX" ]; then
  RN_ARGS="$RN_ARGS --appIdSuffix=$APP_ID_SUFFIX"
fi

cd "$SCRIPT_DIR" && npx react-native run-android $RN_ARGS
