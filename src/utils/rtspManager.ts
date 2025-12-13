import Stream from "node-rtsp-stream";

export interface ActiveStream {
  id: number;
  name: string;
  wsPort: number;
  stream: any;
}

const activeStreams: ActiveStream[] = [];

export const rtspManager = {
  startStream(id: number, name: string, rtspUrl: string, wsPort: number) {
    const exists = activeStreams.find(s => s.id === id);
    if (exists) return exists;

    console.log(`🎥 Starting ${name} on ws://localhost:${wsPort}`);

    try {
      const stream = new Stream({
        name,
        streamUrl: rtspUrl,
        wsPort,
        ffmpegOptions: {
          "-hide_banner": "", 
          "-loglevel": "quiet", // Ganti 'error' jadi 'quiet' biar hevc error gak muncul
          
          // 2. OPTIMASI INPUT H.265 (HEVC)
          "-rtsp_transport": "tcp", // Wajib TCP biar gambar gak pecah
          "-probesize": "10000000", // Tambah buffer analisa
          "-analyzeduration": "10000000", // Tambah durasi analisa

          // 3. OPTIMASI OUTPUT (Biar ringan di browser)
          "-r": 25,                 
          "-s": "640x480",          
          "-bf": 0,                 
          "-vcodec": "mpeg1video",
        }
      });

      // ⛑ Stop spam FFmpeg error logs
      stream.on("exit", () => {
         // Cleanup otomatis jika mati sendiri
         const idx = activeStreams.findIndex(s => s.id === id);
         if (idx !== -1) activeStreams.splice(idx, 1);
      });
      const obj = { id, name, wsPort, stream };
      activeStreams.push(obj);
      return obj;

    } catch (err) {
      console.error(`❌ Cannot start stream for ${name}`, err);
      throw err;
    }
  },

  stopStream(id: number) {
    const index = activeStreams.findIndex(s => s.id === id);
    if (index !== -1) {
      const s = activeStreams[index];

      try {
        s.stream?.stop?.();
      } catch {}

      activeStreams.splice(index, 1);
      console.log(`🛑 Stopped ${s.name}`);
    }
  },

  getAll() {
    return activeStreams;
  }
};
