#!/bin/sh
# Wait for LocalStack to be ready
echo "Waiting for LocalStack to start..."
until curl -s http://localstack:4566 > /dev/null; do
  sleep 2
done
echo "LocalStack is ready!"

# Create the S3 bucket
/root/.local/pipx/venvs/awscli-local/bin/awslocal --endpoint-url=http://localstack:4566 s3 mb s3://localstack-bucket

# Create lambda functions on localstack
# Refs: https://docs.localstack.cloud/user-guide/aws/lambda/
cd /app/amplify/backend/function/watchMegumiContractDeploymentStatusAndInsertMerkletree/src && zip function.zip index.js
/root/.local/pipx/venvs/awscli-local/bin/awslocal --endpoint-url=http://localstack:4566 lambda create-function \
    --function-name watchMegumiContractDeploymentStatusAndInsertMerkletree \
    --runtime nodejs18.x \
    --handler index.handler \
    --zip-file fileb://function.zip \
    --role arn:aws:iam::000000000000:role/lambda-role

# npx amplify mock function --name watchMegumiContractDeploymentStatusAndInsertMerkletree --event /app/amplify/backend/function/watchMegumiContractDeploymentStatusAndInsertMerkletree/src/event.json

# Run the app
exec "$@"
