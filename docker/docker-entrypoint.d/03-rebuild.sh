#!/bin/bash

if [ -n "$REBUILD" ]; then 
  echo "Rebuilding from GIT master..."
  cd /app && git pull && npm run build && cd -; 
fi

exec "$@"
