#!/usr/bin/env bash
set -e
cd storyvis
cross-env NODE_OPTIONS=--openssl-legacy-provider npx ng build --configuration=production
