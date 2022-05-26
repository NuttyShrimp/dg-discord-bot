#!/bin/bash

cd degrensbot
git reset --hard
git fetch
git pull --rebase
docker compose down
docker compose up -d --build