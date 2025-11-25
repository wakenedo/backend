import dotenv from "dotenv";
dotenv.config();

import { google } from "googleapis";
import fs from "fs";

let keyFilePath = "/google.json";
// ==========================================================
// 🔵 SUPORTE PARA GOOGLE_KEY_BASE64 (deploy no Render)
// ==========================================================
if (process.env.GOOGLE_KEY_BASE64) {
  const decoded = Buffer.from(process.env.GOOGLE_KEY_BASE64, "base64").toString(
    "utf8"
  );

  // Criar arquivo temporário no ambiente do Render
  keyFilePath = "/google.json";

  fs.writeFileSync(keyFilePath, decoded, { encoding: "utf8" });

  console.log("✔ GOOGLE_KEY_BASE64 carregado no /tmp/google.json");
} else {
  console.log("✔ Usando local:", keyFilePath);
}

// ==========================================================
// 🔵 AUTENTICAÇÃO GOOGLE
// ==========================================================
const auth = new google.auth.GoogleAuth({
  keyFile: keyFilePath,
  scopes: ["https://www.googleapis.com/auth/drive.readonly"],
});

const drive = google.drive({ version: "v3", auth });

export const GOOGLE_DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID;

// ==========================================================
// 🔵 LISTAR ARQUIVOS DO DRIVE
// ==========================================================
export async function listGoogleDriveFiles() {
  const res = await drive.files.list({
    q: `'${GOOGLE_DRIVE_FOLDER_ID}' in parents`,
    fields: "files(id, name, mimeType)",
  });

  return res.data.files;
}

// ==========================================================
// 🔵 DOWNLOAD DE ARQUIVO DO DRIVE
// ==========================================================
export async function downloadGoogleFile(fileId, fileName) {
  const destPath = `./tmp_${fileName}`;
  const dest = fs.createWriteStream(destPath);

  const response = await drive.files.get(
    { fileId, alt: "media" },
    { responseType: "stream" }
  );

  await new Promise((resolve, reject) => {
    response.data.on("end", resolve).on("error", reject).pipe(dest);
  });

  return destPath;
}
