#!/bin/bash
# CHECK FOR DOCKER
if ! [ -x "$(command -v docker)" ]; then
  echo 'Error: docker is not installed. Exiting...' >&2
  exit 1
fi

GOOS=${GOOS:-linux}

# BUILD GO BINARY
read -p "This will drop and rebuild the homer-app binary from source for ${GOOS}. Continue (y/n)?" CONT
if [ "$CONT" = "y" ]; then
 docker run --rm \
  -v $PWD:/app \
  -e GOOS=${GOOS} \
  golang:1.22 \
  bash -c "cd /app && make modules && make all"
else
  echo "Exiting..."
fi
