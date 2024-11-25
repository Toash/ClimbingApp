#!/bin/bash

# bash script to automate setting perms to use function names as stage variables.

# Array of Lambda function names
# LAMBDA_FUNCTIONS=("myfunction" "backend-staging")
LAMBDA_FUNCTIONS=("myfunction")

API_METHODS=(
  "auth/check-token"
  "auth/exchange-code"
  "media/presigned-upload"
  "media/compress"
  "posts"
  "posts/post/*"
  "posts/post/*/*/like"
  "posts/post/*/comment"
  "posts/post/*/like"
  "posts/user/*"
  "posts/user/*/hiscore"
  "posts/user/*/weekly"
  "users/*"
  "users/*/*"
  "users/*/friends"
  "users/*/edit"
)

# Loop through each function and add permission
for FUNCTION in "${LAMBDA_FUNCTIONS[@]}"; do
  for METHOD in "${API_METHODS[@]}"; do

    RANDOM_ID=$((RANDOM))
    aws lambda add-permission \
      --function-name "arn:aws:lambda:us-east-2:443370702352:function:${FUNCTION}" \
      --source-arn "arn:aws:execute-api:us-east-2:443370702352:mkhhqgexii/*/*/${METHOD}" \
      --principal apigateway.amazonaws.com \
      --statement-id "permission-${FUNCTION}-${RANDOM_ID}" \
      --action lambda:InvokeFunction

    echo "Added perms for the function ${FUNCTION} for the method ${METHOD}."
  done
done