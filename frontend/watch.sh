#!/usr/bin/env bash

(cd ami && yarn dev:ami) &
AMI_PID=$!

(cd provenance-core && yarn start) &
CORE_PID=$!

(cd provenance-task-list && yarn start) &
TASK_LIST_PID=$!

(cd provenance-tree-visualization-grouping && yarn start) &
TREE_PID=$!

(cd slide-deck-visualization && yarn start) &
DECK_PID=$!

(cd storyvis && yarn start) &
STORYVIS_PID=$!

sleep 10d &
SLEEP_PID=$!

function stop() {
        echo "Received SIGINT / SIGTERM"
        kill $SLEEP_PID
}
trap stop SIGINT SIGTERM

wait $SLEEP_PID

kill $AMI_PID
kill $CORE_PID
kill $TASK_LIST_PID
kill $TREE_PID
kill $DECK_PID
kill $STORYVIS_PID

