FROM node:18-alpine
WORKDIR /backend
RUN chown node:node /backend
USER node
COPY --chown=node:node . /backend
RUN npm install --omit=dev
EXPOSE 4000
CMD ["node", "server.js"]
