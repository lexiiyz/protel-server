import { Router } from "express";
import { createLog, getTodayLogs, updateLog } from "../controllers/AbsensiController";

const router = Router();
router.post("/", createLog);
router.get("/today", getTodayLogs);
router.put("/:id", updateLog)

export default router;