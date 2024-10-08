#!/bin/bash

# run the script to update the frontend files

cd client
npm run build

# Delete old s3 files and upload new ones from build folder
aws s3 sync ./build s3://toash-climbing --delete

# Create a CloudFront invalidation and capture the invalidation ID
invalidation_id=$(aws cloudfront create-invalidation --distribution-id E2D4K72RXKEF95 --paths "/*" --query 'Invalidation.Id' --output text)

# Poll the invalidation status until it's completed
status="InProgress"
while [ "$status" != "Completed" ]; do
    echo "Waiting for CloudFront invalidation to complete..."
    sleep 2
    status=$(aws cloudfront get-invalidation --distribution-id E2D4K72RXKEF95 --id $invalidation_id --query 'Invalidation.Status' --output text)
done

echo "CloudFront invalidation completed."
