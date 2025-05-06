#!/bin/bash

# Set variables
DB_HOST="localhost"
DB_NAME="delieva"
DB_USER="postgres"
DB_PORT="6432"
S3_BUCKET="codershift/db_backups/delieva"

# Run pg_dump and pipe to S3
pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME -p $DB_PORT | gzip | aws s3 cp - s3://$S3_BUCKET/db_dump.sql.gz
