import express from "express";
import { cameraController } from "../controllers/CameraController";

const router = express.Router();

router.get("/", cameraController.getAll);
router.post("/", cameraController.create);
router.delete("/:id", cameraController.delete);
router.post("/:id/start", cameraController.start); 
router.post("/:id/stop", cameraController.stop); 
router.put("/:id", cameraController.update);  
router.delete("/:id", cameraController.delete);


export default router;
