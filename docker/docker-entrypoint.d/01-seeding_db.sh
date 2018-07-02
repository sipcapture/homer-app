#!/bin/bash

cd /app
if [ -f bootstrapped ]; then
   echo "Bootstrap exists!"
else
   knex migrate:latest
   knex seed:run
   touch bootstrapped
   echo "Seeding completed!"
fi

exec "$@"
