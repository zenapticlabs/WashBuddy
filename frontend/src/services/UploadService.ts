import { PutObjectCommand } from "@aws-sdk/client-s3";

import { S3Client } from "@aws-sdk/client-s3";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
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

export const getPresignedUrl = async (fileName: string) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/v1/carwash/get-s3-presigned-url/`,
      {
        filename: fileName,
      }
    );
    return response.data.data.signed_url_object;
  } catch (error) {
    console.error("Error getting presigned url:", error);
    throw error;
  }
};

export const uploadFile = async (presignedUrl: string, file: File) => {
  try {
    const response = await axios.put(presignedUrl, file);
    return response.data;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};
