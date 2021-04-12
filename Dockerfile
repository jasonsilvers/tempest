FROM registry.il2.dso.mil/platform-one/devops/pipeline-templates/base-image/harden-nodejs14:14.16.0
ENV NODE_ENV=production
WORKDIR /app
COPY ["package.json", "package-lock.json*", "./"]
RUN npm install --production
COPY . .
RUN npx prisma generate
RUN npm run build

# Stage 2
FROM registry.il2.dso.mil/platform-one/devops/pipeline-templates/base-image/harden-nodejs14:14.15.4
USER appuser
COPY --from=builder --chown=appuser:appuser /app/build /var/ww
EXPOSE 8080
CMD [ "nginx", "-g", "daemon off;" ]
This 