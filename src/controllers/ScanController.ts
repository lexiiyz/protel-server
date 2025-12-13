import { Request, Response } from "express";
import axios from "axios";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();
const PYTHON_API_URL = "http://localhost:8000/scan";

// Memory State (Sama seperti sebelumnya)
const violationState = new Map<number, { firstSeen: number; count: number }>();
const dbCooldown = new Map<number, number>();

const THRESHOLD_TIME_MS = 3000; 
const DB_COOLDOWN_MS = 15000;   

export const scanFrame = async (req: Request, res: Response) => {
  try {
    const { image, cameraId } = req.body;
    if (!image) return res.status(400).json({ success: false });

    // 1. Kirim ke Python AI
    const aiResponse = await axios.post(PYTHON_API_URL, { image });
    const { detections } = aiResponse.data;

    // 2. Cek Pelanggaran
    const violations = detections.filter((d: any) => !d.is_compliant);
    const hasViolation = violations.length > 0;
    const camId = Number(cameraId);
    let shouldAlert = false;

    if (hasViolation && cameraId) {
      const now = Date.now();
      const state = violationState.get(camId);

      if (state) {
        // Cek Durasi Pelanggaran (3 Detik)
        if (now - state.firstSeen > THRESHOLD_TIME_MS) {
           shouldAlert = true; 

           const lastDbLog = dbCooldown.get(camId) || 0;
           
           if (now - lastDbLog > DB_COOLDOWN_MS) {
              
              // A. Simpan Gambar
              const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
              const buffer = Buffer.from(base64Data, "base64");
              const uploadDir = path.join(__dirname, "../../public/uploads");
              if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
              const fileName = `violation-${camId}-${now}.jpg`;
              fs.writeFileSync(path.join(uploadDir, fileName), buffer);

              // B. Ambil Vest Number dari OCR (Hasil AI)
              let detectedVest = "None";
              const ocrData = detections.find((d: any) => d.ocr_id && d.ocr_id !== "None");
              if (ocrData) detectedVest = ocrData.ocr_id;

              // --- LOGIC BARU: CARI NAMA PEKERJA ---
              let workerName = "Unknown";
              
              if (detectedVest !== "None") {
                  // Karena di DB Pekerja nomor_vest itu Int, kita convert dulu
                  const vestInt = parseInt(detectedVest);
                  
                  if (!isNaN(vestInt)) {
                      // Cari di Database Pekerja
                      const worker = await prisma.pekerja.findFirst({
                          where: { nomor_vest: vestInt }
                      });

                      if (worker) {
                          workerName = worker.nama;
                          console.log(`✅ Match found: Vest ${vestInt} is ${worker.nama}`);
                      } else {
                          console.log(`⚠️ Vest ${vestInt} detected but not found in DB`);
                      }
                  }
              }

              // C. Simpan Log ke DB
              await prisma.violationLog.create({
                data: {
                  camera_id: camId,
                  details: JSON.stringify(violations),
                  image_path: `/uploads/${fileName}`,
                  vest_number: detectedVest,
                  worker_name: workerName // <--- Simpan Nama
                }
              });

              dbCooldown.set(camId, now);
           }
        }
      } else {
        violationState.set(camId, { firstSeen: now, count: 1 });
      }
    } else {
      if (violationState.has(camId)) violationState.delete(camId);
    }

    res.json({ success: true, detections, shouldAlert });

  } catch (error) {
    console.error("Scan Error:", error);
    res.json({ success: false, detections: [] });
  }
};