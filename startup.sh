#!/bin/sh
set -x

# Timeout waits for istio pod to come up
node timeout.js

# The normal production work flow
npx prisma migrate deploy

# npx prisma db push --force-reset --accept-data-loss
# npx prisma db seed --preview-feature


node_modules/.bin/next start -p 8080
