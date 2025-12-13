// src/controllers/AbsensiController.ts
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

// Helper: Simpan Base64 ke File
function saveBase64Image(base64Str: string | null, prefix: string): string | null {
  if (!base64Str) return null;
  
  try {
    const cleanBase64 = base64Str.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(cleanBase64, 'base64');
    const filename = `${Date.now()}_${prefix}_${Math.floor(Math.random() * 1000)}.jpg`;
    
    const uploadDir = path.join(process.cwd(), "public/uploads/evidence");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, buffer);
    
    console.log(`✅ Gambar ${prefix} tersimpan: ${filename}`);
    return `/uploads/evidence/${filename}`;
  } catch (e) {
    console.error(`❌ Gagal simpan gambar ${prefix}:`, e);
    return null;
  }
}

export async function createLog(req: Request, res: Response) {
  try {
    const { 
      pekerja_id, 
      confidence, 
      is_manual, 
      ocr_result,
      helm_ok, 
      vest_ok, 
      gloves_ok, 
      glasses_ok, 
      boots_ok, 
      mask_ok,
      // ✅ PERBAIKAN: Gunakan nama field yang SAMA dengan frontend
      foto_wajah,
      foto_helm,
      foto_vest,
      foto_gloves,
      foto_glasses,
      foto_boots,
      foto_mask
    } = req.body;

    console.log("📥 Menerima Request Simpan Log:", pekerja_id);
    console.log("📸 Data Gambar Diterima:", {
      wajah: !!foto_wajah,
      helm: !!foto_helm,
      vest: !!foto_vest,
      gloves: !!foto_gloves,
      glasses: !!foto_glasses,
      boots: !!foto_boots,
      mask: !!foto_mask
    });

    // 1. VALIDASI ID
    if (!pekerja_id) {
      return res.status(400).json({ success: false, message: "ID Pekerja kosong!" });
    }

    const pekerjaExists = await prisma.pekerja.findUnique({
      where: { id_pekerja: String(pekerja_id) }
    });

    if (!pekerjaExists) {
      console.error(`❌ Gagal Simpan: ID '${pekerja_id}' tidak ditemukan.`);
      return res.status(404).json({ success: false, message: "ID tidak terdaftar!" });
    }

    // 2. VALIDASI NOMOR VEST (OCR)
    let ocr_match = false;
    if (ocr_result && pekerjaExists?.nomor_vest) {
      const detectedNum = String(ocr_result).replace(/\D/g, "");
      const dbNum = String(pekerjaExists.nomor_vest);
      
      if (detectedNum.includes(dbNum)) {
        console.log(`✅ OCR Match: Database(${dbNum}) vs Scan(${detectedNum})`);
        ocr_match = true;
      } else {
        console.warn(`⚠️ OCR Mismatch: Database(${dbNum}) vs Scan(${detectedNum})`);
      }
    }

    // 3. CEK SPAM (Prevent duplicate in 1 minute)
    const lastLog = await prisma.logAbsensi.findFirst({
      where: {
        pekerja_id: String(pekerja_id),
        waktu_absen: { gte: new Date(Date.now() - 60 * 1000) }
      }
    });

    if (lastLog) {
      console.log("⚠️ Spam detected, skipping save.");
      return res.json({ 
        success: true, 
        message: "Absensi sudah tercatat barusan.",
        data: lastLog 
      });
    }

    // 4. SIMPAN GAMBAR KE FILE
    const pathWajah = saveBase64Image(foto_wajah, "face");
    const pathHelm = saveBase64Image(foto_helm, "helm");
    const pathVest = saveBase64Image(foto_vest, "vest");
    const pathGloves = saveBase64Image(foto_gloves, "gloves");
    const pathGlasses = saveBase64Image(foto_glasses, "glasses");
    const pathBoots = saveBase64Image(foto_boots, "boots");
    const pathMask = saveBase64Image(foto_mask, "mask");

    console.log("💾 Path Gambar Tersimpan:", {
      wajah: pathWajah,
      helm: pathHelm,
      vest: pathVest,
      gloves: pathGloves,
      glasses: pathGlasses,
      boots: pathBoots,
      mask: pathMask
    });

    // 5. HITUNG KELENGKAPAN
    const isComplete = Boolean(
      helm_ok && vest_ok && gloves_ok && 
      glasses_ok && boots_ok && mask_ok
    );

    // 6. SIMPAN KE DATABASE
    const log = await prisma.logAbsensi.create({
      data: {
        pekerja_id: String(pekerja_id),
        confidence: parseFloat(confidence) || 0,
        apd_lengkap: isComplete,
        is_manual: Boolean(is_manual),
        ocr_result: ocr_result ? String(ocr_result) : null,
        
        // Status APD
        helm_ok: Boolean(helm_ok),
        vest_ok: Boolean(vest_ok),
        gloves_ok: Boolean(gloves_ok),
        glasses_ok: Boolean(glasses_ok),
        boots_ok: Boolean(boots_ok),
        mask_ok: Boolean(mask_ok),
        
        // Path Gambar
        foto_wajah: pathWajah,
        foto_helm: pathHelm,
        foto_vest: pathVest,
        foto_gloves: pathGloves,
        foto_glasses: pathGlasses,
        foto_boots: pathBoots,
        foto_mask: pathMask
      },
      include: { 
        Pekerja: {
          include: {
            Jabatan: true
          }
        }
      }
    });

    console.log("✅ Log Tersimpan dengan ID:", log.id);
    return res.json({ success: true, data: log });

  } catch (error: any) {
    console.error("❌ Database Error:", error);
    return res.status(500).json({ 
      success: false, 
      message: error.message || "Gagal menyimpan data" 
    });
  }
}

// UPDATE LOG (Manual Correction)
export async function updateLog(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { helm_ok, vest_ok, gloves_ok, glasses_ok, boots_ok, mask_ok } = req.body;
    // Hitung ulang kelengkapan
    const isComplete = helm_ok && vest_ok && gloves_ok && glasses_ok && boots_ok && mask_ok;
    const updated = await prisma.logAbsensi.update({
      where: { id: Number(id) },
      data: {
        helm_ok: Boolean(helm_ok),
        vest_ok: Boolean(vest_ok),
        gloves_ok: Boolean(gloves_ok),
        glasses_ok: Boolean(glasses_ok),
        boots_ok: Boolean(boots_ok),
        mask_ok: Boolean(mask_ok),
        apd_lengkap: Boolean(isComplete),
        is_manual: true // Tandai bahwa ini hasil edit manual
      },
      include: { Pekerja: true }
    });
    return res.json({ success: true, data: updated });
  } catch (error) {
    console.error("Gagal update log:", error);
    return res.status(500).json({ success: false, message: "Gagal update data" });
  }
}
// GET TODAY'S LOGS
export async function getTodayLogs(req: Request, res: Response) {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const logs = await prisma.logAbsensi.findMany({
      where: { 
        waktu_absen: { gte: startOfDay } 
      },
      include: { 
        Pekerja: { 
          include: {
            Jabatan: true
          }
        } 
      },
      orderBy: { waktu_absen: 'desc' }
    });

    return res.json(logs);

  } catch (error: any) {
    console.error("❌ Gagal ambil data:", error);
    return res.status(500).json({ 
      success: false, 
      message: error.message || "Gagal mengambil data" 
    });
  }
}