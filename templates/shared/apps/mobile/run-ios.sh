#!/bin/bash
# Interactive iOS launcher - picks scheme, device, or simulator

if [[ "$OSTYPE" != "darwin"* ]]; then
echo "iOS builds only work on macOS"
exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$SCRIPT_DIR/ios"

source "$SCRIPT_DIR/picker.sh"

# --- Scheme selection ---
SCHEMES=$(cd "$PROJECT_DIR" && xcodebuild -list -json 2>/dev/null | python3 -c "
import sys, json
data = json.load(sys.stdin)
for s in data.get('project', {}).get('schemes', []):
  print(s)
")

if [ -z "$SCHEMES" ]; then
echo "Could not read schemes from Xcode project"
exit 1
fi

SCHEME_ARRAY=()
DISPLAY_SCHEME_ARRAY=()
while IFS= read -r line; do
[ -z "$line" ] && continue
SCHEME_ARRAY+=("$line")
# Derive bundle ID from Xcode build settings
BUNDLE_ID=$(cd "$PROJECT_DIR" && xcodebuild -showBuildSettings -scheme "$line" 2>/dev/null | grep 'PRODUCT_BUNDLE_IDENTIFIER' | grep -v 'DERIVE_' | awk '{print $NF}')
if [ -n "$BUNDLE_ID" ]; then
  DISPLAY_SCHEME_ARRAY+=("$line ($BUNDLE_ID)")
else
  DISPLAY_SCHEME_ARRAY+=("$line")
fi
done <<< "$SCHEMES"

pick "Select a scheme:" "${DISPLAY_SCHEME_ARRAY[@]}" --key "ios-scheme"
SELECTED_SCHEME="${SCHEME_ARRAY[$PICKED_INDEX]}"

# --- Device / Simulator selection ---
# Collect physical devices (iPhone only) via devicectl
PHYSICAL_DEVICES=$(xcrun devicectl list devices 2>/dev/null | python3 -c "
import sys, re

lines = sys.stdin.read().strip().split('\n')
# Skip header lines (name, dashes)
for line in lines[2:]:
  if not line.strip():
      continue
  # Parse columns: Name, Hostname, Identifier, State, Model
  parts = re.split(r'\s{3,}', line.strip())
  if len(parts) < 5:
      continue
  name, hostname, identifier, state, model = parts[0], parts[1], parts[2], parts[3], parts[4]
  if 'iPhone' not in model:
      continue
  if 'available' not in state:
      continue
  print(f'[Device] {name} ({model})|{identifier}')
")

# Collect simulators via simctl
SIMULATORS=$(xcrun simctl list devices available -j 2>/dev/null | python3 -c "
import sys, json, re

data = json.load(sys.stdin)
devices_list = []

for runtime, devices in data.get('devices', {}).items():
  if 'iOS' not in runtime:
      continue
  ver_match = re.search(r'(\d+)[\-\.](\d+)', runtime)
  if not ver_match:
      continue
  ver_major, ver_minor = int(ver_match.group(1)), int(ver_match.group(2))
  ver = f'{ver_major}.{ver_minor}'
  for d in devices:
      is_booted = d['state'] == 'Booted'
      devices_list.append((is_booted, d['name'], ver_major, ver_minor, ver))

# Parse model number from name (e.g. 'iPhone 16 Pro Max' -> 16)
def sort_key(x):
  is_booted, name, ver_major, ver_minor, ver = x
  is_iphone = name.startswith('iPhone')
  model_match = re.search(r'(\d+)', name)
  model_num = int(model_match.group(1)) if model_match else 0
  # booted first, iPhone over iPad, highest model first, Pro Max > Pro > base, newest iOS first
  return (not is_booted, not is_iphone, -model_num, name.count('Pro') == 0, 'Max' not in name, -ver_major, -ver_minor)

devices_list.sort(key=sort_key)

for is_booted, name, _, _, ver in devices_list:
  prefix = '[Booted] ' if is_booted else ''
  print(f'{prefix}{name} ({ver})')
")

# Merge: physical devices first, then simulators
ALL_DEVICES=""
DEVICE_UDIDS=()

if [ -n "$PHYSICAL_DEVICES" ]; then
while IFS= read -r line; do
  display=$(echo "$line" | cut -d'|' -f1)
  udid=$(echo "$line" | cut -d'|' -f2)
  ALL_DEVICES+="$display"$'\n'
  DEVICE_UDIDS+=("$udid")
done <<< "$PHYSICAL_DEVICES"
fi

PHYSICAL_COUNT=${#DEVICE_UDIDS[@]}

if [ -n "$SIMULATORS" ]; then
while IFS= read -r line; do
  ALL_DEVICES+="$line"$'\n'
  DEVICE_UDIDS+=("")
done <<< "$SIMULATORS"
fi

# Remove trailing newline
ALL_DEVICES=$(echo "$ALL_DEVICES" | sed '/^$/d')

if [ -z "$ALL_DEVICES" ]; then
echo "No iOS devices or simulators found"
exit 1
fi

DEVICE_ARRAY=()
while IFS= read -r line; do
DEVICE_ARRAY+=("$line")
done <<< "$ALL_DEVICES"

pick "Select a device:" "${DEVICE_ARRAY[@]}" --key "ios-device"
SELECTED="${DEVICE_ARRAY[$PICKED_INDEX]}"

echo ""

if [[ "$SELECTED" == "[Device]"* ]]; then
# Physical device — use UDID
UDID="${DEVICE_UDIDS[$PICKED_INDEX]}"
echo "Running: scheme=$SELECTED_SCHEME device=$SELECTED (udid=$UDID)"
echo ""
cd "$SCRIPT_DIR" && npx react-native run-ios --scheme="$SELECTED_SCHEME" --udid="$UDID"
else
# Simulator — strip [Booted] prefix to get "Name (version)"
SIM_NAME=$(echo "$SELECTED" | sed 's/^\[Booted\] //')
echo "Running: scheme=$SELECTED_SCHEME simulator=$SIM_NAME"
echo ""
cd "$SCRIPT_DIR" && npx react-native run-ios --scheme="$SELECTED_SCHEME" --simulator="$SIM_NAME"
fi
