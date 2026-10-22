#!/bin/bash
set -euo pipefail
# CHECK FOR DOCKER
if ! [ -x "$(command -v docker)" ]; then
  echo 'Error: docker is not installed. Exiting...' >&2
  exit 1
fi
# REBUILD FRONTEND
read -p "This will drop and rebuild the Frontend from GIT. Continue (y/n)?" CONT
if [ "$CONT" = "y" ]; then
  echo "Cleaning up..."
  if [ -d dist ]; then
    mv dist dist.backup
  fi
  mkdir dist
  echo "Rebuilding Frontend..."
  # homer-ui (Angular 20) needs Node ^20.19 or ^22.12. Node 16 exits before ng build
  # and used to leave dist empty, which then failed packaging.
  docker run --rm \
  -v "$PWD/dist:/dist" \
  node:22-alpine \
  sh -c "apk --update add git && git clone https://github.com/sipcapture/homer-ui /app && cd /app && npm install && npm install -g @angular/cli && npm run build && cp -R /app/dist/homer-ui/* /dist/ && cat /app/src/VERSION.ts | grep -Eo '[0-9]+[.][0-9]+[.][0-9]+' > /dist/VERSION && echo 'done!'"
  ls -alF ./dist
  rm -rf dist.backup
else
  echo "Exiting..."
  exit 1
fi

