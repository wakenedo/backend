import dotenv from "dotenv";
dotenv.config();

import { BlobServiceClient } from "@azure/storage-blob";
import fs from "fs";
import mime from "mime-types";

const blobServiceClient = BlobServiceClient.fromConnectionString(
  process.env.AZURE_STORAGE_CONNECTION_STRING
);

export async function getContainerClient() {
  const containerName = process.env.AZURE_CONTAINER_NAME.toLowerCase();
  const containerClient = blobServiceClient.getContainerClient(containerName);

  if (!(await containerClient.exists())) {
    await containerClient.create();
  }

  return containerClient;
}

export async function listBlobFiles() {
  const containerClient = await getContainerClient();

  let blobs = [];
  for await (const blob of containerClient.listBlobsFlat()) {
    blobs.push({
      name: blob.name,
      size: blob.properties.contentLength,
    });
  }

  return blobs;
}

export async function uploadToBlob(filePath, blobName) {
  const containerClient = await getContainerClient();
  const mimeType = mime.lookup(blobName) || "application/octet-stream";

  const blockBlob = containerClient.getBlockBlobClient(blobName);
  const data = fs.readFileSync(filePath);

  await blockBlob.upload(data, data.length, {
    blobHTTPHeaders: {
      blobContentType: mimeType,
    },
  });

  console.log(`✔ Upload concluído: ${blobName}`);
  return true;
}
