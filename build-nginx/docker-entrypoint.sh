#!/bin/bash
set -e

# Run entry point scripts, if any
DIR=/opt/docker-entrypoint.d
if [[ -d "$DIR" ]]
then
    for env_file in `/bin/run-parts --list --regex '\.env$' "$DIR"`
    do
        . "$env_file"
    done
    /bin/run-parts --regex '\.sh$' "$DIR"
fi

echo "Starting up..."
exec "$@"
