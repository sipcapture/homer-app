#!/bin/bash
# CHECK FOR DOCKER
if ! [ -x "$(command -v docker)" ]; then
  echo 'Error: docker is not installed. Exiting...' >&2
  exit 1
fi

# CHECK FOR SPECIFIC DOCKER IMAGE
IMAGE_NAME="homer-ui"
if ! docker image inspect $IMAGE_NAME > /dev/null 2>&1; then
  echo "Error: Docker image '$IMAGE_NAME' does not exist. Exiting..." >&2
  exit 1
fi

# PULL FRONTEND
read -p "This will pull the Frontend from local ${IMAGE_NAME} docker image. Continue (y/n)?" CONT
if [ "$CONT" = "y" ]; then
  echo "Cleaning up..." 
  mv dist dist.backup
  mkdir dist
  echo "Pulling Frontend...";

  if ! docker create --name homer-ui ${IMAGE_NAME} > /dev/null 2>&1; then
    echo "Error: unable to create homer-ui container. Exiting..." >&2
    exit 1
  fi

  docker cp homer-ui:/app/dist/homer-ui/. ./dist/
  docker cp homer-ui:/app/src/VERSION.ts /tmp/VERSION.ts
  cat /tmp/VERSION.ts | egrep -o '[0-9].[0-9].[0-9]+' > ./dist/VERSION
  docker rm -f homer-ui

  ls -alF ./dist
  rm -rf dist.backup
else
  echo "Exiting...";
fi

