#!/bin/sh
# Wait for LocalStack to be ready
echo "Waiting for LocalStack to start..."
until curl -s http://localstack:4566 > /dev/null; do
  sleep 2
done
echo "LocalStack is ready!"

# Create the S3 bucket
/root/.local/pipx/venvs/awscli-local/bin/awslocal --endpoint-url=http://localstack:4566 s3 mb s3://localstack-bucket

# Run the app
exec "$@"
