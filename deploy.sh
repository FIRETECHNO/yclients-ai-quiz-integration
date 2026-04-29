#!/usr/bin/env bash

SESSION_NAME="my-node-app"


if [ ! -f .env ]; then
echo ".env file not found!"
exit 1
fi


set -a
source .env
set +a


if screen -list | grep -q "$SESSION_NAME"; then
echo "Screen session '$SESSION_NAME' already exists"
else
echo "Starting app in screen session '$SESSION_NAME'..."
screen -dmS "$SESSION_NAME" bash -c "node .output/server/index.mjs"
fi

echo "Done. Attach with: screen -r $SESSION_NAME"