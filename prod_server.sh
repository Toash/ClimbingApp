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