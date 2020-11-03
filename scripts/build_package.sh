#!/bin/bash

VERSION=$($PWD/homer-app -version | egrep -o '[0-9]+.[0-9]+.[0-9]+')

PACKAGE="homer-app"
RELEASE=${VERSION:-"0.0.0"}
ARCH="amd64"

# CHECK FOR DOCKER
if ! [ -x "$(command -v docker)" ]; then
  echo 'Error: docker is not installed. Exiting...' >&2
  exit 1
fi

echo "Packaging release $RELEASE ..."
# BUILD DEB PACKAGE
EXT="deb"
docker run --rm \
  -v $PWD:/tmp/pkg \
  -e VERSION="$RELEASE" \
  goreleaser/nfpm pkg --config /tmp/pkg/$PACKAGE.yaml --target "/tmp/pkg/$PACKAGE-$RELEASE-$ARCH.$EXT"

# BUILD RPM PACKAGE
EXT="rpm"
docker run --rm \
  -v $PWD:/tmp/pkg \
  -e VERSION="$RELEASE" \
  goreleaser/nfpm pkg --config /tmp/pkg/$PACKAGE.yaml --target "/tmp/pkg/$PACKAGE-$RELEASE-$ARCH.$EXT"

