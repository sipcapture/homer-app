#!/bin/bash

export NODE_OPTIONS="--max-old-space-size=2048"

cd /app
if [ ! -f bootstrap ]; then
   touch bootstrap
fi


if [ -s bootstrap ]; then
   knex migrate:latest
   echo "Migration Completed!"
else
   knex migrate:latest
   knex seed:run
   date=$(date '+%Y-%m-%d %H:%M:%S')
   echo "$date" > bootstrap
   echo "Seeding completed!"
   if [ -z "$DISABLE_GRAFANA" ]; then
     echo "Running Grafana Provisioning..."
     GHOST=grafana node provisioning/getgrafana.js
     if [ -f /tmp/grafana.json ]; then
       echo "Got Key! Running Grafana API Provisioning..."
       knex seed:run --specific=99_GrafanaAPI.js
       echo "Done! Running Grafana Cleanup..."
       rm -rf /tmp/grafana.json
     fi
   fi
fi

exec "$@"
