
FROM registry1.dso.mil/ironbank/opensource/nodejs/nodejs16:16.18.0  AS builder
USER node
WORKDIR /home/node
COPY --chown=node:node . .
RUN npx prisma generate --schema ./src/prisma/schema.prisma 
RUN npm run build
RUN npm prune --production --legacy-peer-deps


# Nextjs server
FROM registry1.dso.mil/ironbank/opensource/nodejs/nodejs16:16.18.0 AS application
USER node
WORKDIR /app

COPY ./public ./public
COPY ./src/prisma/migrations ./src/prisma/migrations
COPY ./src/prisma/prisma.ts ./src/prisma/schema.prisma ./src/prisma/
COPY twin.d.ts ./
COPY tsconfig.json ./
COPY package.json ./
COPY .env.production .env
COPY --chown=node:node --from=builder /home/node/node_modules ./node_modules
COPY --chown=node:node --from=builder /home/node/.next ./.next
COPY --chown=node:node  startup.sh timeout.js ./

ENV NODE_ENV=production
ENV PORT 8080
ENV NODE_PATH=.
EXPOSE 8080
USER node
# REQURIES PRISMA BE IN prod DEPEDENCIES
CMD ["sh", "startup.sh"]