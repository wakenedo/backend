import { Router } from "express";
import { listGoogleDriveFiles } from "../services/google.js";
import { listBlobFiles } from "../services/azure.js";
import { runSync, getLastStatus } from "../services/sync.js";

const router = Router();

router.get("/gdrive/files", async (req, res) => {
  res.json(await listGoogleDriveFiles());
});

router.get("/blob/files", async (req, res) => {
  res.json(await listBlobFiles());
});

router.post("/sync", async (req, res) => {
  const result = await runSync();
  res.json(result);
});

router.get("/status", (req, res) => {
  res.json(getLastStatus());
});

export default router;
