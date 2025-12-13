import { Request, Response } from "express";
import { cameraService } from "../db/CameraRepo";
import { rtspManager } from "../utils/rtspManager";
import { validateRTSP } from "../utils/validatesrtsp";

export const cameraController = {
  async getAll(req: Request, res: Response) {
    try {
      const cameras = await cameraService.getAllCameras();
      res.json(cameras);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch cameras" });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const payload = req.body;

      console.log("📥 Payload diterima:", payload);

      if (!payload.name || !payload.location) {
        return res.status(400).json({ error: "Name and Location are required" });
      }

      // --- LOGIC BARU: Jika Webcam, Skip Validasi RTSP ---
      if (payload.type === "WEBCAM") {
         // Simpan langsung sebagai webcam (Status: Ready)
         const camera = await cameraService.addCamera({
             ...payload,
             ipAddress: "localhost", // Dummy IP
             status: "Ready"
         });
         return res.status(201).json(camera);
      }
      // ---------------------------------------------------

      // Jika Tipe RTSP (CCTV), Lakukan Validasi
      if (!payload.ipAddress) {
          return res.status(400).json({ error: "IP Address required for RTSP" });
      }

      const rtspUrl = `rtsp://${payload.username}:${payload.password}@${payload.ipAddress}/${payload.channel}`;
      console.log("🔍 URL yang dites Backend:", rtspUrl);
      // Cek Validitas Stream (Maksimal 5 detik loading berkat update di utils)
      //const valid = await validateRTSP(rtspUrl);

      //if (!valid) {
        //return res.status(400).json({ error: "RTSP URL tidak valid atau kamera tidak merespons" });
      //}

      const camera = await cameraService.addCamera(payload);

      await rtspManager.startStream(
        camera.id,
        camera.name,
        rtspUrl,
        camera.wsPort
      );

      res.status(201).json(camera);
    } catch (err) {
      console.error("Camera create error:", err);
      res.status(400).json({ error: "Failed to create camera" });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const payload = req.body;

      // Stop stream lama (aman dilakukan walau id tidak ditemukan di manager)
      try { await rtspManager.stopStream(id); } catch {}

      // --- LOGIC BARU: Update Webcam ---
      if (payload.type === "WEBCAM") {
        const updated = await cameraService.updateCamera(id, {
            ...payload,
            status: "Ready"
        });
        return res.json(updated);
      }
      // --------------------------------

      const rtspUrl = `rtsp://${payload.username}:${payload.password}@${payload.ipAddress}/${payload.channel}`;
      const valid = await validateRTSP(rtspUrl);

      if (!valid) {
        return res.status(400).json({ error: "RTSP URL tidak valid (update aborted)" });
      }

      const updated = await cameraService.updateCamera(id, payload);

      await rtspManager.startStream(
        updated.id,
        updated.name,
        rtspUrl,
        updated.wsPort
      );

      res.json(updated);
    } catch (err) {
      console.error(err);
      res.status(400).json({ error: "Failed to update camera" });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      try { await rtspManager.stopStream(id); } catch {}
      await cameraService.deleteCamera(id);
      res.json({ message: "Camera deleted" });
    } catch (err) {
      console.error(err);
      res.status(400).json({ error: "Failed to delete camera" });
    }
  },

  async start(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const cam = await cameraService.getCameraById(id);

      // Webcam tidak perlu distart di server (karena jalan di browser user)
      if (cam.type === "WEBCAM") {
          return res.status(400).json({ message: "Webcam runs on client side" });
      }

      const rtspUrl = `rtsp://${cam.username}:${cam.password}@${cam.ipAddress}/${cam.channel}`;
      
      // Kita skip validasi berat di sini agar start lebih cepat (opsional)
      // atau pakai validasi jika ingin memastikan
      const r = await rtspManager.startStream(cam.id, cam.name, rtspUrl, cam.wsPort);
      res.json(r);
    } catch (err) {
      console.error(err);
      res.status(400).json({ error: "Failed to start camera" });
    }
  },

  async stop(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      await rtspManager.stopStream(id);
      res.json({ message: "stopped" });
    } catch (err) {
      console.error(err);
      res.status(400).json({ error: "Failed to stop camera" });
    }
  }
};