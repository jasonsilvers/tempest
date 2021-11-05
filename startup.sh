#!/bin/sh
set -x

# Timeout waits for istio pod to come up
node timeout.js

# The normal production work flow
# npx prisma migrate deploy

# For Staging ONLY will reset the database and apply seed. 
npx prisma migrate reset --force --schema ./src/prisma/schema.prisma"

node_modules/.bin/next start -p 8080
