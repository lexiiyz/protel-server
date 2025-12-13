import { PrismaClient } from "@prisma/client";
import { rtspManager } from "../utils/rtspManager";
import { CameraWithPort } from "../types/CameraWithPort";

const prisma = new PrismaClient();
const BASE_WS_PORT = 9999;

export const cameraService = {

  async getAllCameras(): Promise<CameraWithPort[]> {
    const cameras = await prisma.camera.findMany({ orderBy: { id: "asc" } });

    return cameras.map(c => ({
      ...c,
      wsPort: c.wsPort ?? BASE_WS_PORT + c.id
    }));
  },

  async getCameraById(id: number): Promise<CameraWithPort> {
    const cam = await prisma.camera.findUnique({ where: { id } });
    if (!cam) throw new Error("Camera not found");

    return {
      ...cam,
      wsPort: cam.wsPort ?? BASE_WS_PORT + cam.id
    };
  },

  async addCamera(data: any) {
    // 1. Simpan ke DB
    const camera = await prisma.camera.create({ 
      data: {
        ...data,
        // Jika WEBCAM, ipAddress bisa diisi dummy atau null (tergantung schema)
        ipAddress: data.type === 'WEBCAM' ? 'localhost' : data.ipAddress
      } 
    });

    const wsPort = BASE_WS_PORT + camera.id;
    await prisma.camera.update({ where: { id: camera.id }, data: { wsPort } });

    // 2. Jika RTSP, jalankan Stream. Jika WEBCAM, skip.
    if (camera.type === "RTSP") {
        const rtspUrl = `rtsp://${camera.username}:${camera.password}@${camera.ipAddress}/${camera.channel}`;
        try {
            await rtspManager.startStream(camera.id, camera.name, rtspUrl, wsPort);
            await prisma.camera.update({ where: { id: camera.id }, data: { status: "Online" } });
        } catch {
            await prisma.camera.update({ where: { id: camera.id }, data: { status: "Offline" } });
        }
    } else {
        // Webcam dianggap selalu "Online" (client side) atau "Ready"
        await prisma.camera.update({ where: { id: camera.id }, data: { status: "Ready" } });
    }

    return { ...camera, wsPort };
  },
  
  async updateCamera(id: number, data: any): Promise<CameraWithPort> {
    const updated = await prisma.camera.update({
      where: { id },
      data
    });

    return {
      ...updated,
      wsPort: updated.wsPort ?? BASE_WS_PORT + updated.id
    };
  },

  async deleteCamera(id: number) {
    try { rtspManager.stopStream(id); } catch {}
    await prisma.camera.delete({ where: { id } });
  },

  async stopCamera(id: number) {
    rtspManager.stopStream(id);
    await prisma.camera.update({ where: { id }, data: { status: "Offline" } });
  }
};
