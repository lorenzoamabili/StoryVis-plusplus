# Run DEV using Dockerfile
```
    docker build . -t storyvis

    # mount all sub-module volumes so that they are watched.
    docker run --rm -it \
        -v $PWD/ami:/frontend/ami \
        -v $PWD/provenance-core:/frontend/provenance-core \
        -v $PWD/provenance-task-list:/frontend/provenance-task-list \
        -v $PWD/provenance-tree-visualization-grouping:/frontend/provenance-tree-visualization-grouping\
        -v $PWD/slide-deck-visualization:/frontend/slide-deck-visualization \
        -v $PWD/storyvis:/frontend/storyvis \
        -p 4200:4200 \
        storyvis
```

# Production build using Dockerfile
```
    # build base container
    docker build . -t storyvis

    # create production build
    docker run -it --name storyvis-prod-build storyvis "cd storyvis && yarn build"

    # copy build artifacts to ./dist
    docker cp storyvis-prod-build:/frontend/storyvis/dist ./dist

    # remove build container
    docker rm storyvis-prod-build
```