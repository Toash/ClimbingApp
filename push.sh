#!/bin/bash

# Configuration for both environments
PROD_LAMBDA_FUNCTION_NAME="myfunction"
PROD_S3_BUCKET="boulderstat.com"
PROD_DISTRIBUTION_ID="E1L6NAE7JZXM6G"

STAGING_LAMBDA_FUNCTION_NAME="backend-staging"
STAGING_S3_BUCKET="toash-climbing-staging"
STAGING_DISTRIBUTION_ID="EW9BUDUWG0IMV"

LAYER_NAME="backend-dependencies"
LAYER_DIR="./server"
LAYER_ZIP_FILE="lambda-layer-dependencies.zip"

ZIP_FILE="lambda-deployment-package.zip"
BACKEND_DIR="./server"
AWS_REGION="us-east-2"

echo "Which environment would you like to push to? (production/staging)"
read ENV_CHOICE

if [ "$ENV_CHOICE" = "production" ]; then
  LAMBDA_FUNCTION_NAME=$PROD_LAMBDA_FUNCTION_NAME
  S3_BUCKET=$PROD_S3_BUCKET
  DISTRIBUTION_ID=$PROD_DISTRIBUTION_ID
  FRONTEND_BUILD_CMD="npm run build:prod"
elif [ "$ENV_CHOICE" = "staging" ]; then
  LAMBDA_FUNCTION_NAME=$STAGING_LAMBDA_FUNCTION_NAME
  S3_BUCKET=$STAGING_S3_BUCKET
  DISTRIBUTION_ID=$STAGING_DISTRIBUTION_ID
  FRONTEND_BUILD_CMD="npm run build:staging"
else
  echo "Invalid environment. Please choose 'production' or 'staging'."
  exit 1
fi

if [ "$ENV_CHOICE" = "production" ]; then
    echo "Are you sure you want to push to $ENV_CHOICE? (yes/no)"
    read CONFIRMATION
    if [ "$CONFIRMATION" != "yes" ]; then
        echo "Exiting..."
        exit 1
    fi
fi


# Option to update dependencies
echo "Would you like to update dependencies in the Lambda layer? (yes/no)"
read UPDATE_LAYER

if [ "$UPDATE_LAYER" = "yes" ]; then
  mkdir -p $LAYER_DIR/nodejs
  cp -r $LAYER_DIR/node_modules $LAYER_DIR/nodejs/

  cd $LAYER_DIR

  if [ -f $LAYER_ZIP_FILE ]; then
    rm $LAYER_ZIP_FILE
    echo "Old layer zip file removed."
  fi

  zip -r $LAYER_ZIP_FILE nodejs/
  echo "Dependencies layer zipped into $LAYER_ZIP_FILE with nodejs/node_modules format."

  # Publish the new layer version and capture the ARN
  layer_arn=$(aws lambda publish-layer-version --layer-name $LAYER_NAME --zip-file fileb://$LAYER_ZIP_FILE --region $AWS_REGION --query 'LayerVersionArn' --output text)

  if [ $? -eq 0 ]; then
    echo "Lambda layer '$LAYER_NAME' updated successfully with ARN: $layer_arn."
  else
    echo "Failed to update Lambda layer '$LAYER_NAME'."
    exit 1
  fi

  # Update the Lambda function to use the new layer version
  aws lambda update-function-configuration --function-name $LAMBDA_FUNCTION_NAME --layers $layer_arn --region $AWS_REGION

  if [ $? -eq 0 ]; then
    echo "Lambda function '$LAMBDA_FUNCTION_NAME' updated to use the new layer version."
  else
    echo "Failed to update Lambda function '$LAMBDA_FUNCTION_NAME' with the new layer."
    exit 1
  fi

  # Clean up the copied nodejs folder after zipping
  rm -rf $LAYER_DIR/nodejs
  cd ..
fi


cd $BACKEND_DIR
npx tsc
if [ $? -ne 0 ]; then
  echo "TypeScript compilation failed. Exiting..."
  exit 1
fi

# TODO: ask user if they would like to update dependencies.

cd dist

if [ -f $ZIP_FILE ]; then
  rm $ZIP_FILE
  echo "Old zip file removed."
fi

zip -r $ZIP_FILE . -x "*.git*"
echo "Backend folder zipped into $ZIP_FILE with specified file exclusions."

# update the function code and skip the json response.
# windows use NUL
# linux use /dev/null
aws lambda update-function-code --function-name $LAMBDA_FUNCTION_NAME --zip-file fileb://$ZIP_FILE --region $AWS_REGION --output text > /dev/null

if [ $? -eq 0 ]; then
  echo "Lambda function '$LAMBDA_FUNCTION_NAME' updated successfully."
else
  echo "Failed to update Lambda function '$LAMBDA_FUNCTION_NAME'."
  exit 1
fi

cd ../.. # undo backend dist traversal

if [ "$ENV_CHOICE" = "production" ]; then
  cd ./client
  $FRONTEND_BUILD_CMD

  if [ $? -eq 0 ]; then
    echo "Frontend build completed successfully."
  else
    echo "Frontend build failed. Aborting S3 upload and CloudFront invalidation."
    echo "Note: backend has still been updated."
    exit 1
  fi

  aws s3 sync ./dist s3://$S3_BUCKET --delete

  invalidation_id=$(aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths "/*" --query 'Invalidation.Id' --output text)

  status="InProgress"
  while [ "$status" != "Completed" ]; do
    echo "Waiting for CloudFront invalidation to complete..."
    sleep 3
    status=$(aws cloudfront get-invalidation --distribution-id $DISTRIBUTION_ID --id $invalidation_id --query 'Invalidation.Status' --output text)
  done

  echo "CloudFront invalidation completed."
  echo "Pushed to production."
else
  echo "Pushed to staging. Frontend updates skipped for staging."
fi
