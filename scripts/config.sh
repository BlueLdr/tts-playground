#!/bin/bash

set -e
this_script_dir="$(cd "$(dirname "$0")" && pwd)"

if [ -f "$this_script_dir/../.env" ]; then
  source $this_script_dir/../.env
fi
