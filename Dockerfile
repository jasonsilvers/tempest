# Dependencies
FROM registry.il2.dso.mil/platform-one/devops/pipeline-templates/ironbank/nodejs14:14.16.0 AS dependencies
USER root
RUN mkdir -p "${HOME}"/deps
WORKDIR ${HOME}/deps
ENV NODE_ENV=production

COPY package.json package-lock.json .npmrc ./
RUN npm ci --no-fund --no-audit 
USER appuser

# Build artifacts
# ARG NEXT_PUBLIC_MAPBOX_TOKEN
FROM registry.il2.dso.mil/platform-one/devops/pipeline-templates/ironbank/nodejs14:14.16.0 AS builder
USER root
RUN mkdir -p "${HOME}"/build
WORKDIR ${HOME}/build
ENV NODE_ENV=production

COPY --from=dependencies /home/node/deps/node_modules ./node_modules
COPY ./src package.json tsconfig.json tailwind.config.js .babelrc.js next-env.d.ts ./

RUN npx prisma generate
RUN npm run build:seed
RUN npm run build
USER appuser

# Nextjs server
FROM registry.il2.dso.mil/platform-one/devops/pipeline-templates/base-image/harden-nodejs14:14.16.0 AS application
USER appuser
WORKDIR /app

COPY ./public ./public
COPY ./src/prisma/migrations ./prisma/migrations
COPY ./src/prisma/prisma.ts ./src/prisma/schema.prisma ./prisma/
COPY tsconfig.json ./
COPY package.json ./
COPY .env.production .env
COPY --chown=appuser:appuser --from=builder ${HOME}/build/node_modules ./node_modules
COPY --chown=appuser:appuser --from=builder ${HOME}/build/.next ./.next
COPY --chown=appuser:appuser --from=builder ${HOME}/build/prisma/seed.js ./prisma/
COPY --chown=appuser:appuser --from=builder ${HOME}/build/utils/Grants.js ./utils/
COPY --chown=appuser:appuser --from=builder ${HOME}/build/types/global.js ./types/
COPY --chown=appuser:appuser  startup.sh timeout.js ./

ENV NODE_ENV=production
ENV PORT 8080
ENV NODE_PATH=.
EXPOSE 8080
USER appuser
# REQURIES PRISMA BE IN prod DEPEDENCIES
CMD ["sh", "startup.sh"]
