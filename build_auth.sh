# Zip auth lambda to upload on aws

DIR=auth-lambda
ZIP_FILE=auth-lambda.zip

cd $DIR

if [ -f $ZIP_FILE ]; then
    rm $ZIP_FILE
    echo "Zip file removed."
fi

zip -r $ZIP_FILE . -x "*.git*" -x "node_modules/*"
echo "Zipped file."