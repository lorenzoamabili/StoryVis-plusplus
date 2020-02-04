FROM node:12
WORKDIR /backend
RUN chown node:node /backend
USER node
COPY --chown=node:node . /backend
RUN yarn
CMD ["yarn", "start-dev"]
EXPOSE 4000