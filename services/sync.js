import { listGoogleDriveFiles, downloadGoogleFile } from "./google.js";
import { uploadToBlob } from "./azure.js";
import fs from "fs";

let lastStatus = {
  success: false,
  transferred: 0,
  errors: [],
  finishedAt: null,
};

export async function runSync() {
  try {
    const files = await listGoogleDriveFiles();
    let count = 0;
    let errors = [];

    function sanitizeBlobName(name) {
      return name
        .normalize("NFKD") // remove acentos/artefatos unicode
        .replace(/[^\w.-]/g, "_") // troca caracteres inválidos por "_"
        .replace(/_+/g, "_") // evita múltiplos underscores
        .replace(/^_+/, "") // remove underscores do início
        .replace(/_+$/, ""); // remove underscores do final
    }

    for (const file of files) {
      try {
        const cleanedName = sanitizeBlobName(file.name);

        const local = await downloadGoogleFile(file.id, cleanedName);
        await uploadToBlob(local, cleanedName);

        await fs.promises.unlink(local);

        count++;
      } catch (err) {
        errors.push({ file: file.name, error: err.message });
      }
    }

    lastStatus = {
      success: errors.length === 0,
      transferred: count,
      errors,
      finishedAt: new Date(),
    };

    return lastStatus;
  } catch (error) {
    lastStatus = {
      success: false,
      transferred: 0,
      errors: [{ error: error.message }],
      finishedAt: new Date(),
    };
    return lastStatus;
  }
}

export function getLastStatus() {
  return lastStatus;
}
