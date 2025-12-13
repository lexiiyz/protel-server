import { Router } from "express";
import { getPekerja, addPekerja, getPekerjaByIdHandler, deletePekerja } from "../controllers/PekerjaController";

const router = Router();

router.get("/", getPekerja);
router.get("/:id", getPekerjaByIdHandler); // 
router.post("/add", addPekerja);
router.delete("/:id", deletePekerja); // 
export default router;
