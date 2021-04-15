# Dependencies
FROM registry.il2.dso.mil/platform-one/devops/pipeline-templates/ironbank/nodejs14:14.16.0 AS dependencies
RUN mkdir -p ${HOME}/deps
WORKDIR ${HOME}/deps
ENV NODE_ENV=production

COPY package.json package-lock.json .npmrc ./
RUN npm ci --no-fund --no-audit 


# Build artifacts
# ARG NEXT_PUBLIC_MAPBOX_TOKEN
FROM registry.il2.dso.mil/platform-one/devops/pipeline-templates/ironbank/nodejs14:14.16.0 AS builder
USER root
RUN mkdir -p ${HOME}/build
WORKDIR ${HOME}/build
ENV NODE_ENV=production

COPY --from=dependencies /home/node/deps/node_modules ./node_modules
COPY ./src package.json tsconfig.json .babelrc.js next-env.d.ts ./

RUN npx prisma generate
RUN npm run build


# Nextjs server
FROM registry.il2.dso.mil/platform-one/devops/pipeline-templates/base-image/harden-nodejs14:14.16.0 AS application

USER appuser
WORKDIR /app


COPY ./public ./public
COPY ./src/prisma ./prisma
COPY .env.production .env
COPY --chown=appuser:appuser --from=builder ${HOME}/build/node_modules ./node_modules
COPY --chown=appuser:appuser --from=builder ${HOME}/build/.next ./.next
COPY --chown=appuser:appuser  startup.sh timeout.js ./


ENV NODE_ENV=production
ENV PORT 8080
ENV NODE_PATH=.
EXPOSE 8080

# REQURIES PRISMA BE IN prod DEPEDENCIES
CMD ./startup.sh