#!/bin/bash
# Smart pod install - only runs when dependencies have changed
# Compares checksum of Podfile + root package.json deps against cached value

if [[ "$OSTYPE" != "darwin"* ]]; then
  echo "Skipping pod install on non-macOS platform"
  exit 0
fi

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
IOS_DIR="$SCRIPT_DIR/ios"
ROOT_DIR="$SCRIPT_DIR/../.."
CHECKSUM_FILE="$IOS_DIR/.pods-checksum"

# Generate checksum from files that affect pods
CURRENT_CHECKSUM=$(cat \
  "$IOS_DIR/Podfile" \
  "$ROOT_DIR/package.json" \
  "$ROOT_DIR/yarn.lock" \
  2>/dev/null | shasum -a 256 | awk '{print $1}')

# Compare with cached checksum
if [ -f "$CHECKSUM_FILE" ]; then
  CACHED_CHECKSUM=$(cat "$CHECKSUM_FILE")
  if [ "$CURRENT_CHECKSUM" = "$CACHED_CHECKSUM" ]; then
    echo "Pods up to date, skipping install."
    exit 0
  fi
fi

echo "Dependencies changed, running pod install..."
cd "$IOS_DIR" && bundle install && bundle exec pod install

if [ $? -eq 0 ]; then
  echo "$CURRENT_CHECKSUM" > "$CHECKSUM_FILE"
  cd "$SCRIPT_DIR" && ./export-node-binary.sh
else
  echo "Pod install failed"
  exit 1
fi
