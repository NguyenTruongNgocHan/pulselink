#!/bin/sh

set -eu

STORAGE_DIRECTORY="${STORAGE_PATH:-/data/uploads}"

echo "Preparing storage directory: ${STORAGE_DIRECTORY}"

mkdir -p "${STORAGE_DIRECTORY}"

chown -R pulselink:pulselink "${STORAGE_DIRECTORY}"
chmod 750 "${STORAGE_DIRECTORY}"

echo "Starting PulseLink API as user pulselink..."

exec gosu pulselink "$@"