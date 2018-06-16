#!/bin/bash

cd /app
knex migrate:latest
knex seed:run

echo "Seeding completed!"

exec "$@"
