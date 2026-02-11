#!/bin/bash

# Only export node binary on macOS (iOS development only)
if [[ "$OSTYPE" == "darwin"* ]]; then
  cat << EOF > ./ios/.xcode.env.local
export NODE_BINARY=$(which node)
export ENTRY_FILE="\${PROJECT_DIR}/../src/main.tsx"
EOF
  echo "Node binary exported to .xcode.env.local"
else
  echo "Non-macOS platform - Skipping node binary export (iOS-only)"
  exit 0
fi
