import dotenv from "dotenv";
dotenv.config();

import { google } from "googleapis";
import fs from "fs";
import path from "path";

let keyFilePath;

// Diretórios temporários
const tempDirRender = "/tmp"; // Render
const tempDirLocal = path.join(process.cwd(), "tmp_build"); // Local (simula Render)

// Determina se estamos rodando no Render
const isRender = process.env.RENDER === "true";
const finalDir = isRender ? tempDirRender : tempDirLocal;

// Garante que o diretório existe
if (!fs.existsSync(finalDir)) {
  fs.mkdirSync(finalDir, { recursive: true });
}

// Se GOOGLE_KEY_BASE64 estiver definido, gera o arquivo temporário
if (process.env.GOOGLE_KEY_BASE64) {
  const decoded = Buffer.from(process.env.GOOGLE_KEY_BASE64, "base64").toString(
    "utf8"
  );
  keyFilePath = path.join(finalDir, "google.json");
  fs.writeFileSync(keyFilePath, decoded, { encoding: "utf8" });
  console.log("✔ GOOGLE_KEY_BASE64 carregado em:", keyFilePath);
} else {
  // Fallback para arquivo local direto (google.json)
  keyFilePath = path.join(process.cwd(), "google.json");
  console.log("✔ Usando GOOGLE_SERVICE_ACCOUNT local:", keyFilePath);
}

// ==========================================================
// 🔵 Autenticação Google
// ==========================================================
const auth = new google.auth.GoogleAuth({
  keyFile: keyFilePath,
  scopes: [
    "https://www.googleapis.com/auth/drive.readonly",
    "https://www.googleapis.com/auth/drive",
  ],
});

const drive = google.drive({ version: "v3", auth });

export const GOOGLE_DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID;

// ==========================================================
// 🔵 Listar arquivos
// ==========================================================
export async function listGoogleDriveFiles() {
  const res = await drive.files.list({
    q: `'${GOOGLE_DRIVE_FOLDER_ID}' in parents`,
    fields: "files(id, name, mimeType)",
  });
  return res.data.files;
}

// ==========================================================
// 🔵 Download de arquivo
// ==========================================================
export async function downloadGoogleFile(fileId, fileName) {
  const destPath = path.join(finalDir, fileName);
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
