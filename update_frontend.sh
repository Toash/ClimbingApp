#!/bin/bash

# run the script to update the frontend files

cd client
npm run build


# Delete old s3 files and upload new ones from build folder,
aws s3 sync ./build s3://toash-climbing --delete

# invalidate the old cache from the CDN, so it can show the new files
aws cloudfront create-invalidation --distribution-id E2D4K72RXKEF95 --paths "/*"
