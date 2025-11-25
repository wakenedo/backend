import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

console.log("🔹 Variáveis de ambiente carregadas:");

for (const key of Object.keys(process.env)) {
  if (key.startsWith("GOOGLE_") || key.startsWith("AZURE_")) {
    console.log(`${key} = ${process.env[key] ? "✅ set" : "❌ missing"}`);
  }
}

// ==========================================================
// Cria google.json se GOOGLE_KEY_BASE64 estiver presente
// ==========================================================
if (process.env.GOOGLE_KEY_BASE64) {
  const decoded = Buffer.from(process.env.GOOGLE_KEY_BASE64, "base64").toString(
    "utf8"
  );

  const tmpDir = "./tmp_build";
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

  const filePath = path.join(tmpDir, "google.json");
  fs.writeFileSync(filePath, decoded, "utf8");

  console.log(`✔ google.json gerado em: ${filePath}`);
} else {
  console.log("ℹ️ GOOGLE_KEY_BASE64 não definido, nada a gerar.");
}
