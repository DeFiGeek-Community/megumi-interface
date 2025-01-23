#!/bin/sh
# Wait for LocalStack to be ready
echo "Waiting for LocalStack to start..."
until curl -s http://localstack:4566 > /dev/null; do
  sleep 2
done
echo "LocalStack is ready!"

# # Global install
# npm install -g @aws-amplify/cli -y

# Create the S3 bucket
/root/.local/pipx/venvs/awscli-local/bin/awslocal --endpoint-url=http://localstack:4566 s3 mb s3://localstack-bucket

# Create lambda functions on localstack --------------->
# Refs: https://docs.localstack.cloud/user-guide/aws/lambda/

# cd /app/amplify/backend/function/watchMegumiContractDeploymentStatusAndInsertMerkletree/src
# # Install dependencies
# npm i -y
# # Bundle TypeScript code using esbuild
# npx esbuild ../ts/index.ts --bundle --platform=node --target=node18 --outfile=index.js
# # Zip the output file
# zip function.zip index.js

cd /app/amplify/backend/function/watchMegumiContractDeploymentStatusAndInsertMerkletree && npx tsc -p ./tsconfig.json && cd ./src && zip function.zip index.js && cd -
/root/.local/pipx/venvs/awscli-local/bin/awslocal lambda create-function \
    --endpoint-url=http://localstack:4566 \
    --function-name watchMegumiContractDeploymentStatusAndInsertMerkletree \
    --runtime nodejs18.x \
    --handler index.handler \
    --zip-file fileb://function.zip \
    --role arn:aws:iam::000000000000:role/lambda-role

# npx amplify mock function --name watchMegumiContractDeploymentStatusAndInsertMerkletree --event /app/amplify/backend/function/watchMegumiContractDeploymentStatusAndInsertMerkletree/src/event.json
# <---------------


# Run the app
exec "$@"
