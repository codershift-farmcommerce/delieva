#!/bin/bash

set -e

S3_PATH="s3://codershift/db_backups/delieva/"
LOCAL_DIR="/Users/alayor/src/codershift/db_backups/delieva"

mkdir -p "$LOCAL_DIR"

echo "Fetching latest backup file from $S3_PATH..."
LATEST=$(aws s3 ls "$S3_PATH" | sort | tail -n 1 | awk '{print $4}')

if [ -z "$LATEST" ]; then
  echo "No backup files found in $S3_PATH"
  exit 1
fi

echo "Latest backup: $LATEST"
aws s3 cp "${S3_PATH}${LATEST}" "$LOCAL_DIR/$LATEST"

echo "Terminating existing connections to delieva..."
psql -h localhost -p 6432 -U postgres -d postgres -c "
  SELECT pg_terminate_backend(pid)
  FROM pg_stat_activity
  WHERE datname = 'delieva'
    AND pid <> pg_backend_pid();
"

echo "Recreating database..."
psql -h localhost -p 6432 -U postgres -d postgres -c "DROP DATABASE IF EXISTS delieva;"
psql -h localhost -p 6432 -U postgres -d postgres -c "CREATE DATABASE delieva;"

echo "Restoring database..."
psql -h localhost -d delieva -p 6432 -U postgres < "$LOCAL_DIR/$LATEST"

echo "Done."
