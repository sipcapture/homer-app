#!/bin/bash

DIR=/docker-entrypoint.d

if [[ -d "$DIR" ]]
then
  run-parts --verbose --regex '\.(sh|rb)$' "$DIR"
fi

exec "$@"
