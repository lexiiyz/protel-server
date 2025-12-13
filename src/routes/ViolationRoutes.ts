import { Router } from "express";
import { getViolationLogs } from "../controllers/ViolationController";

const router = Router();

// GET /api/violations
router.get("/", getViolationLogs);

export default router;