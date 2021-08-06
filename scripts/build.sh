#!/bin/bash

set -e
this_script_dir="$(cd "$(dirname "$0")" && pwd)"

source $this_script_dir/config.sh
parcel build src/index.html
