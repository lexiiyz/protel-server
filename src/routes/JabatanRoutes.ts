// src/routes/jabatanRoute.ts
import express from "express";
import { JabatanController } from "../controllers/JabatanController";

const router = express.Router();

router.get("/", JabatanController.getAll);
router.get("/:id", JabatanController.getById);
router.post("/add", JabatanController.create);
router.put("/:id", JabatanController.update);
router.delete("/:id", JabatanController.delete);

export default router;
