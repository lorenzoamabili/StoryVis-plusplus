FROM node:12
WORKDIR /backend
RUN chown node:node /backend
USER node
COPY --chown=node:node . /backend
RUN yarn &&\ 
    chmod a+x build.sh
ENTRYPOINT ["/bin/bash", "-c"]
CMD ["./build.sh"]
EXPOSE 4000
