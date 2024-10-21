#!/bin/bash

# Backend update

LAMBDA_FUNCTION_NAME="myfunction"
ZIP_FILE="lambda-deployment-package.zip"
BACKEND_DIR="./server"  
AWS_REGION="us-east-2"

echo "Are you sure? (yes/no)"
read input

if [ ! "${input}" = "yes" ]; then
  echo "exiting..."
  exit 1
fi

cd $BACKEND_DIR

# remove the old zip file if it exists
if [ -f $ZIP_FILE ]; then
  rm $ZIP_FILE
  echo "Old zip file removed."
fi

zip -r $ZIP_FILE . -x "*.git*" -x "public/*" 
echo "Backend folder zipped into $ZIP_FILE with specified file exclusions."

# update the Lambda function with the new zip file
aws lambda update-function-code --function-name $LAMBDA_FUNCTION_NAME --zip-file fileb://$ZIP_FILE --region $AWS_REGION

if [ $? -eq 0 ]; then
  echo "Lambda function '$LAMBDA_FUNCTION_NAME' updated successfully."
else
  echo "Failed to update Lambda function '$LAMBDA_FUNCTION_NAME'."
  exit 1
fi

# frontend

cd ../client
npm run build:prod # use production environment file and build


if [ $? -eq 0 ]; then
  echo "Frontend build completed successfully."
else
  echo "Frontend build failed. Aborting S3 upload and CloudFront invalidation."
  echo "Note: backend has still been updated. "
  exit 1
fi

# sync the build folder with the S3 bucket and delete old files
aws s3 sync ./build s3://boulderstat.com --delete

# cloudfront invalidation
DISTRIBUTION_ID="E1L6NAE7JZXM6G"
invalidation_id=$(aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths "/*" --query 'Invalidation.Id' --output text)

# check invalidation status to see if its completed.
status="InProgress"
while [ "$status" != "Completed" ]; do
    echo "Waiting for CloudFront invalidation to complete..."
    sleep 3
    status=$(aws cloudfront get-invalidation --distribution-id $DISTRIBUTION_ID --id $invalidation_id --query 'Invalidation.Status' --output text)
done

echo "CloudFront invalidation completed."
echo "Pushed to production."
