#!/bin/bash

# Set variables
DB_HOST="localhost"
DB_NAME="delieva"
DB_USER="postgres"
DB_PORT="6432"
S3_BUCKET="codershift/db_backups/delieva"

# Generate timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="db_dump_${TIMESTAMP}.sql.gz"

# Run pg_dump and upload to S3
pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME -p $DB_PORT | gzip | aws s3 cp - s3://$S3_BUCKET/$BACKUP_FILE

# List all backup files, sort by date, and keep only the last 7
aws s3api list-objects --bucket $(echo $S3_BUCKET | cut -d'/' -f1) --prefix $(echo $S3_BUCKET | cut -d'/' -f2-)/db_dump_ \
    --query 'reverse(sort_by(Contents[].{Key:Key,LastModified:LastModified},&LastModified))[7:].Key' \
    --output text | xargs -r -n1 -I {} aws s3 rm s3://$(echo $S3_BUCKET | cut -d'/' -f1)/{}
