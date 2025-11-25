import dotenv from "dotenv";
dotenv.config();

console.log("DEBUG PWD:", process.cwd());
console.log("DEBUG RAW:", process.env.AZURE_STORAGE_CONNECTION_STRING);

import express from "express";
import cors from "cors";
import routes from "./api/routes.js";

const app = express();

// Liberar acesso do GitHub Pages
app.use(
  cors({
    origin: ["https://wakenedo.github.io/frontend"],
    credentials: false,
  })
);

app.use(express.json());
app.use("/api", routes);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 API Running on http://localhost:${PORT}`);
});
