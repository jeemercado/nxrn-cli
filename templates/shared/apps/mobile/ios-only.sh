#!/bin/bash
# Wrapper to run iOS-only commands
# Usage: ./ios-only.sh <command>
# Only executes the command on macOS, exits gracefully on other platforms

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

if [[ "$OSTYPE" == "darwin"* ]]; then
  # Execute the command from the script's directory
  cd "$SCRIPT_DIR" && eval "$@"
else
  echo "⚠️  Skipping iOS-only command on non-macOS platform: $@"
  exit 0
fi
