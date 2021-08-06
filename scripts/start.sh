#!/bin/bash

set -e
this_script_dir="$(cd "$(dirname "$0")" && pwd)"

source $this_script_dir/config.sh
parcel -p 8080 src/index.html
