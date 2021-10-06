#!/bin/bash

# CHECK FOR Swagger
if ! [ -x "$(command -v swagger)" ]; then
  echo 'Error: swagger is not installed. Exiting...' >&2
  exit 1
fi

swagger generate spec -m -o ./swagger.json