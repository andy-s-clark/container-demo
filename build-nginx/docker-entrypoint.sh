#!/bin/sh
set -e

# Run entry point scripts, if any
DIR=/opt/docker-entrypoint.d
if [[ -d "$DIR" ]]
then
    # Set DOLLAR_SIGN as a way to use dollar signs with envsubst
    export DOLLAR_SIGN='$'
    /bin/run-parts "$DIR"
fi

echo "Starting up..."
exec "$@"
