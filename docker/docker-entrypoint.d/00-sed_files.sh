#!/bin/bash

if [ -f /app/server/config.js ]; then

   if [ -n "$DB_HOST" ]; then sed -i "s/localhost/${DB_HOST}/g" /app/server/config.js; fi
   if [ -n "$DB_USER" ]; then sed -i "s/homer_user/${DB_USER}/g" /app/server/config.js; fi
   if [ -n "$DB_PASS" ]; then sed -i "s/homer_password/${DB_PASS}/g" /app/server/config.js; fi
   if [ -n "$DB_PASS" ]; then sed -i "s/homer_password/${DB_PASS}/g" /app/server/config.js; fi
   
   if [ -n "$INFLUX_HOST" ]; then sed -i "s/host: 'influxdb'/host: '${INFLUX_HOST}'/g" /app/server/config.js; fi
   if [ -n "$INFLUX_PORT" ]; then sed -i "s/port: 8086/port: ${INFLUX_PORT}/g" /app/server/config.js; fi
   if [ -n "$INFLUX_DB" ]; then sed -i "s/database: 'homer'/database: '${INFLUX_DB}'/g" /app/server/config.js; fi

   if [ -n "$TIMEZONE" ]; then sed -i "s/timezone: 'utc'/timezone: '${TIMEZONE}'/g" /app/server/config.js; fi
   
   if [ -n "$HTTP_HOST" ]; then sed -i "s/http_host: '0.0.0.0'/http_host: '${HTTP_HOST}'/g" /app/server/config.js; fi
   if [ -n "$HTTP_PORT" ]; then sed -i "s/http_port: 80/http_port: {$HTTP_PORT}/g" /app/server/config.js; fi
   if [ -n "$HTTPS_HOST" ]; then sed -i "s/https_host: '0.0.0.0'/https_host: '${HTTPS_HOST}'/g" /app/server/config.js; fi
   if [ -n "$HTTPS_PORT" ]; then sed -i "s/https_port: 443/https_port: {$HTTPS_PORT}/g" /app/server/config.js; fi
    
   echo "Pre-Flight provisioning completed!"

else

   echo "Configuration file not found!"

fi

exec "$@"
