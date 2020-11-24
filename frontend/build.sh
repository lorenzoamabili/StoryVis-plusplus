#!/usr/bin/env bash

(cd storyvis && yarn start --host 0.0.0.0) &
STORYVIS_PID=$!

sleep 10d &
SLEEP_PID=$!

function stop() {
        echo "Received SIGINT / SIGTERM"
        kill $SLEEP_PID
}
trap stop SIGINT SIGTERM

wait $SLEEP_PID

kill $STORYVIS_PID