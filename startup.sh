#!/bin/sh
set -x

# Timeout waits for istio pod to come up
node timeout.js

# Mainly for use in Development 
# npx prisma migrate dev --preview-feature 

# Will reset everything
# npx prisma migrate reset --force --skip-generate --preview-feature

# Seed is not very useful since it is run from migrate reset

# The normal production work flow
npx prisma migrate deploy
npx prisma db seed --preview-feature

node_modules/.bin/next start -p 8080
