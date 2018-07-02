#!/bin/bash

if [ -f /app/server/config.js ]; then
   sed -i "s/localhost/${DB_HOST}/g" /app/server/config.js
   sed -i "s/homer_user/${DB_USER}/g" /app/server/config.js
   sed -i "s/homer_password/${DB_PASS}/g" /app/server/config.js
   echo "Pre-Flight provisioning completed!"
else
   echo "Configuration file not found!"
fi

exec "$@"
