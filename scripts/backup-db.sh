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

# Remove local backup
rm $BACKUP_FILE

# Keep only last 7 days of backups in S3
aws s3 ls s3://$S3_BUCKET/db_backups/acm/ | grep -v -E " PRE |total" | sort -r | tail -n +8 | while read -r line; do
    fileName=$(echo $line | awk '{print $4}')
    aws s3 rm s3://$S3_BUCKET/db_backups/acm/$fileName
done
