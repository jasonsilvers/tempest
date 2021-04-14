FROM registry.il2.dso.mil/platform-one/devops/pipeline-templates/ironbank/nodejs14:14.16.0 AS builder
ENV NODE_ENV=production
WORKDIR /app
COPY . .
USER root
RUN npm install --production
RUN npx prisma generate
RUN npm run build

# Stage 2
FROM registry.il2.dso.mil/platform-one/devops/pipeline-templates/base-image/harden-nodejs14:14.16.0
USER appuser
COPY --from=builder --chown=appuser:appuser /app/build /var/ww
EXPOSE 8080
CMD [ "nginx", "-g", "daemon off;" ]
