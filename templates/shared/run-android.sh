#!/bin/bash
# Convenience wrapper — run from project root
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
exec bash "$SCRIPT_DIR/apps/mobile/run-android.sh" "$@"
