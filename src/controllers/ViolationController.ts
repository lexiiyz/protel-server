import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getViolationLogs = async (req: Request, res: Response) => {
  try {
    const logs = await prisma.violationLog.findMany({
      include: { 
        Camera: true // Include info kamera
      },
      orderBy: { 
        timestamp: 'desc' // Paling baru diatas
      },
      take: 200 // Limit 200 terakhir
    });
    
    res.json(logs);
  } catch (error) {
    console.error("Error fetching logs:", error);
    res.status(500).json({ error: "Gagal mengambil log pelanggaran" });
  }
};