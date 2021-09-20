#!/bin/bash

set -e
this_script_dir="$(cd "$(dirname "$0")" && pwd)"

# TTS_TEST_VERSION="$TTS_VERSION"
cd $this_script_dir/..
source $this_script_dir/config.sh
# May need this later if tests end up using version
# if [ ! -z $TTS_TEST_VERSION ]; then
#     echo "Overriding TTS_VERSION for tests: $TTS_TEST_VERSION"
#     TTS_VERSION="$TTS_TEST_VERSION"
# fi
#
# if [ -z "$TTS_VERSION" ]; then
#     echo "WARNING: TTS_VERSION is not set; migration tests will not run."
# fi

TS_NODE_COMPILER_OPTIONS='{"module":"commonjs"}' ava "$@"
