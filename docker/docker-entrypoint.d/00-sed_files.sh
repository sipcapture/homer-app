#!/bin/bash

# sed -i 's/CONFIG_VALUE/'"$CONFIG_VALUE"'/g' CONFIG_FILE
echo "Pre-Flight completed!"

exec "$@"
