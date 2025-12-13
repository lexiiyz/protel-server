import { Request, Response } from "express";
import { getAllPekerjaWithPhotos } from "../db/PekerjaRepo";
import axios from "axios"; // PENTING: Ganti spawnSync dengan axios

export async function verifyFace(req: Request, res: Response) {
  try {
    const { frames, mode = "face" } = req.body;
    
    if (!frames || !Array.isArray(frames) || frames.length === 0) {
      return res.status(400).json({ success: false, message: "No frames" });
    }

    // 1. Ambil data referensi dari DB
    const refs = await getAllPekerjaWithPhotos();

    console.log(`🔄 Sending to AI Server... (${frames.length} frames, Mode: ${mode})`);

    // 2. Kirim Request ke Python API (Port 8000)
    // Pastikan python api.py sudah dijalankan!
    try {
      const response = await axios.post("http://localhost:8000/verify", {
        frames: frames,
        refs: refs,
        mode: mode
      }, {
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      });

      const result = response.data;
      
      // Log Singkat
      if(result.face?.match) console.log(`✅ MATCH: ${result.face.best_match_key}`);
      else console.log(`⏳ AI Processed (No Match/PPE Mode)`);

      return res.json(result);

    } catch (apiError) {
      console.error("❌ Gagal connect ke Python API. Pastikan api.py jalan!");
      return res.status(503).json({ success: false, message: "AI Server Offline" });
    }

  } catch (err: any) {
    console.error("❌ Controller Error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
}