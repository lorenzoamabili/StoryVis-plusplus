
FROM node:12 as start
WORKDIR /frontend
RUN chown node:node /frontend
USER root
COPY --chown=root:root . /frontend
RUN apt-get update && apt-get install -y gettext 


FROM start
RUN yarn &&\
    chmod a+x build.sh 

ENTRYPOINT ["/bin/bash", "-c"]

CMD ["envsubst < ./storyvis/src/assets/env.template.js > ./storyvis/src/assets/env.js && ./build.sh"]

EXPOSE 4200