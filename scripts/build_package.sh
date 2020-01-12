#!/bin/bash

PACKAGE="homer-app"
VERSION="7.7.0"
ARCH="amd64"

# CHECK FOR DOCKER
if ! [ -x "$(command -v docker)" ]; then
  echo 'Error: docker is not installed. Exiting...' >&2
  exit 1
fi

# BUILD DEB PACKAGE
EXT="deb"
docker run --rm \
  -v $PWD:/tmp/pkg \
  -e VERSION="$VERSION" \
  goreleaser/nfpm pkg --config /tmp/pkg/$PACKAGE.yaml --target "/tmp/pkg/$PACKAGE-$VERSION-$ARCH.$EXT"

# BUILD RPM PACKAGE
EXT="rpm"
docker run --rm \
  -v $PWD:/tmp/pkg \
  -e VERSION="$VERSION" \
  goreleaser/nfpm pkg --config /tmp/pkg/$PACKAGE.yaml --target "/tmp/pkg/$PACKAGE-$VERSION-$ARCH.$EXT"

