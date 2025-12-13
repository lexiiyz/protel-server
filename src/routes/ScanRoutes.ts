import { Router } from "express";
import { scanFrame } from "../controllers/ScanController";

const router = Router();

// Endpoint ini dipanggil oleh Frontend (SmartCCTV) setiap detik
router.post("/", scanFrame);

export default router;