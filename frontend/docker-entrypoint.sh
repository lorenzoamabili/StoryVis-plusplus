#!/bin/sh
set -e

# Validate required env vars
if [ -z "$API_URL" ]; then
  echo "ERROR: API_URL environment variable is required" >&2
  exit 1
fi

# Substitute env vars into env.js
envsubst < /env.template.js > /usr/share/nginx/html/assets/env.js

exec "$@"
