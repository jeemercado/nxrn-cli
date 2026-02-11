#!/bin/bash
# Wrapper to run iOS-only commands
# Usage: ./ios-only.sh <command>
# Only executes the command on macOS, exits gracefully on other platforms

if [[ "$OSTYPE" == "darwin"* ]]; then
  # Execute the command passed as arguments
  eval "$@"
else
  echo "⚠️  Skipping iOS-only command on non-macOS platform: $@"
  exit 0
fi
