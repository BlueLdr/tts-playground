#!/bin/sh
# Apply or validate formatting of source code.

set -e

command="${1:-write}"
cd "$(cd "$(dirname "$0")" && pwd)/.."

`npm bin`/prettier "--$command" "./*.json" "**/*.{js,ts,tsx}"
