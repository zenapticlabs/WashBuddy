import { PutObjectCommand } from "@aws-sdk/client-s3";

import { S3Client } from "@aws-sdk/client-s3";

export const uploadFileToS3 = async (file: File) => {
  try {
    const s3Client = new S3Client({
      forcePathStyle: true,
      region: process.env.NEXT_PUBLIC_STORAGE_REGION,
      endpoint: process.env.NEXT_PUBLIC_STORAGE_ENDPOINT + "/s3",
      credentials: {
        accessKeyId: process.env.NEXT_PUBLIC_STORAGE_ACCESS_KEY_ID!,
        secretAccessKey: process.env.NEXT_PUBLIC_STORAGE_SECRET_ACCESS_KEY!,
      },
    });

    // Generate a unique file name
    const fileName = `${Date.now()}-${file.name}`;

    // Convert File to ArrayBuffer
    const fileBuffer = await file.arrayBuffer();

    const uploadCommand = new PutObjectCommand({
      Bucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET_NAME!,
      Key: fileName,
      Body: Buffer.from(fileBuffer), // Convert ArrayBuffer to Buffer
      ContentType: file.type,
    });

    await s3Client.send(uploadCommand);
    const uploadedFileUrl = `${process.env.NEXT_PUBLIC_STORAGE_ENDPOINT}/object/public/${process.env.NEXT_PUBLIC_STORAGE_BUCKET_NAME}/${fileName}`;
    return uploadedFileUrl;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};
