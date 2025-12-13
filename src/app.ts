import express from "express";
import cors from "cors";
import jabatanRoute from "./routes/JabatanRoutes";
import pekerjaRoute from "./routes/PekerjaRoutes";
import cameraRoute from "./routes/CameraRoutes";
import verifyRoute from "./routes/VerifyRoutes";
import { PrismaClient } from "@prisma/client";
import { rtspManager } from "./utils/rtspManager";
import absensiRoute from "./routes/AbsensiRoutes";
import scanRoute from "./routes/ScanRoutes";
import violationRoute from "./routes/ViolationRoutes";
import dashboardRoute from "./routes/DashboardRoutes";

const prisma = new PrismaClient();
const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Routes
app.use("/api/pekerja", pekerjaRoute);
app.use("/api/jabatan", jabatanRoute);
app.use("/api/cameras", cameraRoute);
app.use("/api/verify", verifyRoute);
app.use("/api/absensi", absensiRoute);
app.use("/api/scan", scanRoute);
app.use("/uploads", express.static("public/uploads"));
app.use("/api/violations", violationRoute);
app.use("/api/dashboard", dashboardRoute);

// Health check
app.get("/health", (req, res) => res.json({ status: "ok" }));

// Start server
const PORT = process.env.PORT || 5005;
app.listen(PORT, async () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);

  console.log("🔄 Starting all RTSP camera streams...");
  try {
    const cameras = await prisma.camera.findMany();

    cameras.forEach((cam, index) => {
      const wsPort = 9999 + index;

      const rtspUrl = `rtsp://${cam.username || "admin"}:${cam.password || ""}@${cam.ipAddress}/${cam.channel || "ch1/main"}`;

      rtspManager.startStream(
        cam.id,
        cam.name,
        rtspUrl,
        wsPort
      );
    });

    console.log("✅ All camera streams started.");
  } catch (err) {
    console.error("❌ Failed to start camera streams:", err);
  }
});
