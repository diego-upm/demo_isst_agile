FROM node:20-alpine AS build
WORKDIR /app

COPY package.json tsconfig.json tsconfig.app.json tsconfig.node.json vite.config.ts index.html ./
COPY src ./src

RUN npm install
RUN npm run build

FROM nginx:1.27-alpine
RUN apk add --no-cache gettext

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY nginx/docker-entrypoint.sh /docker-entrypoint.sh

ENV BACKEND_UPSTREAM_HOST=backend
ENV BACKEND_UPSTREAM_PORT=8080

EXPOSE 80
CMD ["/docker-entrypoint.sh"]
