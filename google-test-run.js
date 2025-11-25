// google-test-run.js
import dotenv from "dotenv";
dotenv.config();

import {
  listGoogleDriveFiles,
  downloadGoogleFile,
  GOOGLE_DRIVE_FOLDER_ID,
} from "./services/google.js";
import path from "path";

async function testGoogleDrive() {
  console.log("🔹 GOOGLE_DRIVE_FOLDER_ID:", GOOGLE_DRIVE_FOLDER_ID);

  try {
    // Listar arquivos
    const files = await listGoogleDriveFiles();
    console.log(`✅ Encontrados ${files.length} arquivos na pasta:`);

    files.forEach((file, i) => {
      console.log(`${i + 1}. ${file.name} (${file.id})`);
    });

    if (files.length === 0) {
      console.log("⚠️ Nenhum arquivo para download. Finalizando teste.");
      return;
    }

    // Baixar o primeiro arquivo como teste
    const testFile = files[0];
    console.log(`🔹 Tentando baixar arquivo de teste: ${testFile.name}`);

    const localPath = await downloadGoogleFile(testFile.id, testFile.name);
    console.log(
      `✅ Arquivo baixado com sucesso em: ${path.resolve(localPath)}`
    );
  } catch (err) {
    console.error("❌ Erro durante teste Google Drive:", err.message);
  }
}

// Executa teste
testGoogleDrive();
