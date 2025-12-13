import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { startOfDay, endOfDay, subDays, format } from "date-fns";

const prisma = new PrismaClient();

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const today = new Date();
    const startOfToday = new Date(today.setHours(0, 0, 0, 0));
    const endOfToday = new Date(today.setHours(23, 59, 59, 999));

    // 1. CARD STATS
    const totalPekerja = await prisma.pekerja.count({
        where: { is_active: true }
    });

    const violationsToday = await prisma.violationLog.count({
      where: {
        timestamp: {
          gte: startOfToday,
          lte: endOfToday,
        },
      },
    });

    const totalViolationsAllTime = await prisma.violationLog.count();
    const attendanceChart = [];
    const daysMap = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

    for (let i = 4; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const start = new Date(d.setHours(0,0,0,0));
        const end = new Date(d.setHours(23,59,59,999));
        
        const count = await prisma.logAbsensi.count({
            where: {
                waktu_absen: { gte: start, lte: end }
            }
        });

        attendanceChart.push({
            name: daysMap[start.getDay()], // Sen, Sel, dst
            hadir: count
        });
    }

    // 3. PIE CHART (Kepatuhan Hari Ini)
    // Asumsi: Jumlah yang hadir hari ini vs Jumlah yang melanggar hari ini
    const presentToday = await prisma.logAbsensi.count({
        where: { waktu_absen: { gte: startOfToday } }
    });
    
    // Hitung pelanggar unik hari ini (1 orang bisa melanggar berkali-kali, dihitung 1)
    const uniqueViolators = await prisma.violationLog.groupBy({
        by: ['worker_name'], // Atau vest_number kalau nama null
        where: { timestamp: { gte: startOfToday } },
    });
    const violatorCount = uniqueViolators.length;
    const compliantCount = Math.max(0, presentToday - violatorCount);

    const complianceData = [
        { name: "Patuh", value: compliantCount },
        { name: "Melanggar", value: violatorCount } // Ubah label jadi Melanggar
    ];

    // 4. AKTIVITAS TERBARU (Gabungan Absen & Pelanggaran)
    // Ambil 3 Log Pelanggaran Terakhir
    const recentViolations = await prisma.violationLog.findMany({
        take: 3,
        orderBy: { timestamp: 'desc' },
        include: { Camera: true }
    });

    // Format Data untuk Frontend
    const activities = recentViolations.map(log => ({
        type: "violation",
        message: `Pelanggaran di ${log.Camera.name}: ${log.worker_name !== 'Unknown' ? log.worker_name : 'Seseorang'} tidak pakai APD`,
        time: log.timestamp
    }));

    res.json({
        totalPekerja,
        violationsToday,
        totalViolationsAllTime,
        attendanceChart,
        complianceData,
        activities
    });

  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({ error: "Gagal memuat data dashboard" });
  }
};