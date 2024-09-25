#!/bin/bash

# updates the backend lambda
# (zips backend, then uploads that file onto the lambda)

LAMBDA_FUNCTION_NAME="myfunction"
ZIP_FILE="lambda-deployment-package.zip"
BACKEND_DIR="./server"  
AWS_REGION="us-east-2"

# Remove the old zip file if it exists
if [ -f $ZIP_FILE ]; then
  rm $ZIP_FILE
  echo "Old zip file removed."
fi

cd $BACKEND_DIR
zip -r $ZIP_FILE . -x "*.git*" -x "public/*"
echo "Backend folder zipped into $ZIP_FILE with specified file exclusions."

# Update the Lambda function with the new zip file
aws lambda update-function-code --function-name $LAMBDA_FUNCTION_NAME --zip-file fileb://$ZIP_FILE --region $AWS_REGION

# Check if the update was successful
if [ $? -eq 0 ]; then
  echo "Lambda function '$LAMBDA_FUNCTION_NAME' updated successfully."
else
  echo "Failed to update Lambda function '$LAMBDA_FUNCTION_NAME'."
fi
