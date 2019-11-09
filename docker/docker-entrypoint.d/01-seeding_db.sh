#!/bin/bash

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
fi
exec "$@"
