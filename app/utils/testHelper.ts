// Utils for testing
import fs from "fs";
import {
  PutObjectCommand,
  ListObjectsV2Command,
  DeleteObjectsCommand,
  s3Client,
} from "@/app/lib/aws";

export const uploadMerkleTree = async (filePath: string, itemKey: string) => {
  const buffer = fs.readFileSync(filePath);
  //   const json = JSON.parse(buffer.toString("utf-8"));
  const command = new PutObjectCommand({
    Body: buffer,
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: itemKey,
    ContentType: "application/json",
  });
  await s3Client.send(command);
};

export async function deleteAllObjects(bucketName: string) {
  try {
    // Get all objects
    const listCommand = new ListObjectsV2Command({ Bucket: bucketName });
    const listResponse = await s3Client.send(listCommand);

    if (!listResponse.Contents || listResponse.Contents.length === 0) {
      return;
    }

    const deleteParams = {
      Bucket: bucketName,
      Delete: {
        Objects: listResponse.Contents.map((obj) => ({ Key: obj.Key })),
      },
    };

    const deleteCommand = new DeleteObjectsCommand(deleteParams);
    const deleteResponse = await s3Client.send(deleteCommand);
  } catch (err) {
    console.error(err);
  }
}
