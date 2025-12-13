import { Router } from "express";
import { verifyFace } from "../controllers/VerifyController";

const router = Router();

router.post("/", verifyFace);

export default router;
