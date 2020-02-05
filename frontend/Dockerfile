FROM node:12
WORKDIR /frontend
RUN chown node:node /frontend
USER node
COPY --chown=node:node . /frontend
RUN yarn &&\
    chmod a+x watch.sh
ENTRYPOINT ["/bin/bash", "-c"]
CMD ["./watch.sh"]
EXPOSE 4200