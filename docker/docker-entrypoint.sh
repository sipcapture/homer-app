#!/bin/bash

DIR=/docker-entrypoint.d

if [[ -d "$DIR" ]]
then
  run-parts "$DIR"
fi

exec "$@"
