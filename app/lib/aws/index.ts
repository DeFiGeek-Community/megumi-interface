import { S3ClientConfig, S3Client } from "@aws-sdk/client-s3";

export const s3Config: S3ClientConfig = {
  region: process.env.AWS_REGION,
  forcePathStyle: true,
  endpoint: process.env.AWS_S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
};

export const awsClient = new S3Client(s3Config);
