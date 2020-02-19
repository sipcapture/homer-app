#!/bin/bash
# CHECK FOR DOCKER
if ! [ -x "$(command -v docker)" ]; then
  echo 'Error: docker is not installed. Exiting...' >&2
  exit 1
fi
# REBUILD FRONTEND
read -p "This will drop and rebuild the Frontend from GIT. Continue (y/n)?" CONT
if [ "$CONT" = "y" ]; then
  echo "Cleaning up..." 
  mv dist dist.backup
  mkdir dist
  echo "Rebuilding Frontend...";
  docker run --rm \
  -v $PWD/dist:/dist \
  node:12-alpine \
  sh -c "apk --update add git && git clone https://github.com/sipcapture/homer-ui /app && cd /app && npm install && npm install -g @angular/cli && npm audit fix && npm run build && cp -R /app/dist/homer-ui/* /dist/ && echo 'done!'"
  ls -alF ./dist
  VERSION=$(cat src/VERSION.ts | egrep -o '[0-9].[0-9].[0-9]+')
  echo "$VERSION" > dist/VERSION
  rm -rf dist.backup
else
  echo "Exiting...";
fi

