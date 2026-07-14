#!/bin/sh
set -e

SCHEMA=./packages/db/prisma/schema.prisma

echo "Waiting for Postgres..."
until node -e "
  const net = require('net');
  const client = net.createConnection({host: 'db', port: 5432}, () => { client.end(); process.exit(0); });
  client.on('error', () => process.exit(1));
" 2>/dev/null; do
  sleep 1
done
echo "Postgres is ready."

echo "Pushing schema..."
prisma db push --schema="$SCHEMA" --skip-generate

echo "Seeding database..."
cd packages/db && tsx prisma/seed.ts && cd /app

echo "Starting app..."
exec "$@"
