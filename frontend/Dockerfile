
# Stage 1: build Angular app
FROM node:20 AS builder
WORKDIR /frontend
RUN apt-get update && apt-get install -y gettext
COPY --chown=node:node . /frontend
RUN yarn install --ignore-engines
RUN cd storyvis && cross-env NODE_OPTIONS=--openssl-legacy-provider npx ng build --configuration=production

# Stage 2: serve with nginx
FROM nginx:1.25-alpine
COPY --from=builder /frontend/storyvis/dist/storyvis /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Substitute env vars into env.js at container start, then start nginx
COPY storyvis/src/assets/env.template.js /env.template.js
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
