FROM node:12
WORKDIR /backend
RUN chown node:node /backend
USER node
COPY --chown=node:node . /backend
RUN yarn
ENTRYPOINT ["/bin/bash", "-c"]
CMD ["yarn", "start-dev"]
EXPOSE 27017