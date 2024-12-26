import { S3ClientConfig, S3Client } from "@aws-sdk/client-s3";
import { LambdaClientConfig, LambdaClient } from "@aws-sdk/client-lambda";

export const s3Config: S3ClientConfig = {
  region: process.env.AWS_REGION,
  forcePathStyle: true,
  endpoint: process.env.AWS_S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
};

export const s3Client = new S3Client(s3Config);

const lambdaConfig: LambdaClientConfig = {
  endpoint: process.env.AWS_LAMBDA_ENDPOINT,
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
};
console.log(process.env.AWS_REGION, process.env.AWS_ACCESS_KEY_ID);

export const lambdaClient = new LambdaClient(lambdaConfig);
