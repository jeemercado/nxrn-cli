#!/bin/bash
# Interactive iOS launcher - picks scheme and simulator

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
while IFS= read -r line; do
  SCHEME_ARRAY+=("$line")
done <<< "$SCHEMES"

pick "Select a scheme:" "${SCHEME_ARRAY[@]}" --key "ios-scheme"
SELECTED_SCHEME="${SCHEME_ARRAY[$PICKED_INDEX]}"

# --- Simulator selection (booted first, then by name, then iOS version desc) ---
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

if [ -z "$SIMULATORS" ]; then
  echo "No iOS simulators found"
  exit 1
fi

SIM_ARRAY=()
while IFS= read -r line; do
  SIM_ARRAY+=("$line")
done <<< "$SIMULATORS"

pick "Select a simulator:" "${SIM_ARRAY[@]}" --key "ios-simulator"
SELECTED_SIM="${SIM_ARRAY[$PICKED_INDEX]}"
# Strip [Booted] prefix to get "Name (version)"
SIM_NAME=$(echo "$SELECTED_SIM" | sed 's/^\[Booted\] //')

echo ""
echo "Running: scheme=$SELECTED_SCHEME simulator=$SIM_NAME"
echo ""

cd "$SCRIPT_DIR" && npx react-native run-ios --scheme="$SELECTED_SCHEME" --simulator="$SIM_NAME"
