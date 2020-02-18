#!/bin/bash
#
# SIPCAPTURE HOMER 7.7 Webapp
# Docker Builder & Slimmer
#
# ENV OPTIONS:
#    PUSH     = push images to dockerhub
#    SLIM     = build slim docker image
#    REPO     = default image respository/name
#    TAG      = defailt image tag (server)
#    TAG_SLIM = default slim image tag (slim)

# CHECK FOR DOCKER
if ! [ -x "$(command -v docker)" ]; then
  echo 'Error: docker is not installed. Exiting...' >&2
  exit 1
fi

REPO=${REPO:-sipcapture/webapp}
TAG=${TAG:-latest}
TAG_SLIM=${TAG_SLIM:-slim}

echo "Building HOMER docker ..."
docker build --no-cache -t $REPO:$TAG .
if [ ! -z "$PUSH" ]; then
  echo "Pushing $REPO:$TAG ..."
  docker push $REPO:$TAG
fi
if [ ! -z "$SLIM" ]; then
	echo "Building HOMER slim docker ..."
	docker-slim build \
	--include-path /etc \
	--tag $REPO:$TAG_SLIM \
	$REPO:$TAG
	if [ ! -z "$PUSH" ]; then
	  echo "Pushing $REPO:$TAG_SLIM ..."
	  docker push $REPO:$TAG_SLIM
	fi
fi
