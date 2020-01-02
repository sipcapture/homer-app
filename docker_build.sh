#!/bin/bash
#
# SIPCAPTURE HOMER 7.7
# Docker App Builder & Slimmer
#
# ENV OPTIONS:
#    PUSH     = push images to dockerhub
#    SLIM     = build slim docker image
#    REPO     = default image respository/name
#    TAG      = defailt image tag (server)
#    TAG_SLIM = default slim image tag (slim)

REPO=${REPO:-sipcapture/homer-app}
TAG=${TAG:-server}
TAG_SLIM=${TAG_SLIM:-slim}

echo "Building HOMER docker ..."
docker build -t $REPO:$TAG .
if [ ! -z "$PUSH" ]; then
  echo "Pushing $REPO:$TAG ..."
  docker push $REPO:$TAG
fi
if [ ! -z "$SLIM" ]; then
	echo "Building HOMER slim docker ..."
	docker-slim build \
	--include-path /app/migrations \
	--include-path /app/public \
	--include-path /usr/local/lib/node_modules \
	--tag $REPO:$TAG_SLIM \
	$REPO:$TAG
	if [ ! -z "$PUSH" ]; then
	  echo "Pushing $REPO:$TAG_SLIM ..."
	  docker push $REPO:$TAG_SLIM
	fi
fi
