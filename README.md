# About
## Frontend

S3 bucket, Cloudfront. (Uses MUI and inline styling) <br />

## Backend

API Gateway into lambda with serverless-express, S3 bucket to store media, MongoDB to store user data <br />

## Authentication

Cognito to manage Authentication, using OAuth2 flow. Getting authentiation code from hosted ui, sending request to token endpoint to get the tokens. Storing refresh token in a secure cookie to get new tokens if they expire. <br />

## Media upload

Hit backend endpoint to get presigned url, use this to upload. Use object url to get media as the bucket is public. <br/>

## Media storage (images and video)

S3 bucket uses the Cognito user id as a folder name for each user to store images / videos. <br/>

## Staging environment.

Uses seperate cloudfront distribution and s3 bucket\
Seperate API Gateway stages\
Seperate lambda\
Same user pool with different app client\



## WIP

https://trello.com/b/1NERCnDG/climbing-app <br/>


### env files

frontend <br/>

REACT_APP_BASE_URL=
REACT_APP_API_BASE_URL=
REACT_APP_LOGIN_URL=
REACT_APP_MEDIA_S3_URL=

backend <br/>
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=


ensure to npm install the respective directories. <br/>


