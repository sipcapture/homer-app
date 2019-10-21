#!/bin/bash

cd /app
if [ -f bootstrapped ]; then
   echo "Bootstrap exists!"
   knex migrate:latest
else
   knex migrate:latest
   knex seed:run
   touch bootstrapped
   echo "Seeding completed!"
fi

exec "$@"
