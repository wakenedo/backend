import dotenv from "dotenv";
dotenv.config();

import { google } from "googleapis";
import fs from "fs";

const auth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_SERVICE_ACCOUNT,
  scopes: ["https://www.googleapis.com/auth/drive.readonly"],
});

const drive = google.drive({ version: "v3", auth });

export const GOOGLE_DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID;

export async function listGoogleDriveFiles() {
  const res = await drive.files.list({
    q: `'${GOOGLE_DRIVE_FOLDER_ID}' in parents`,
    fields: "files(id, name, mimeType)",
  });

  return res.data.files;
}

export async function downloadGoogleFile(fileId, fileName) {
  const destPath = `./tmp_${fileName}`;
  const dest = fs.createWriteStream(destPath);

  // Baixar arquivo como stream
  const response = await drive.files.get(
    { fileId, alt: "media" },
    { responseType: "stream" }
  );

  await new Promise((resolve, reject) => {
    response.data.on("end", resolve).on("error", reject).pipe(dest);
  });

  return destPath;
}
