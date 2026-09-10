#!/usr/bin/env bash
set -e

# Resolve script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo "=== PulseOS End-to-End Test Suite Launcher ==="
echo "Project Root: $PROJECT_ROOT"
echo "Target: $SCRIPT_DIR/runner.mjs"

# Check Node.js
if ! command -v node >/dev/null 2>&1; then
  echo "Error: Node.js is required to run the E2E test runner." >&2
  exit 1
fi

# Run tests
node "$SCRIPT_DIR/runner.mjs" "$@"
