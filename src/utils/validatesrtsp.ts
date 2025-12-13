import { exec } from "child_process";

export function validateRTSP(rtspUrl: string): Promise<boolean> {
  return new Promise((resolve) => {
    // Tambahkan -stimeout 5000000 (5 detik dalam mikrotik)
    // Tambahkan opsi timeout pada exec nodejs juga (5000ms)
    const command = `ffprobe -stimeout 5000000 -rtsp_transport tcp -v error -select_streams v:0 -show_entries stream=codec_name -of csv=p=0 "${rtspUrl}"`;
    
    exec(command, { timeout: 5000 }, (err, stdout) => {
      if (err) {
        // console.error("RTSP Probe Error:", err.message); // Uncomment untuk debug
        return resolve(false);
      }
      
      if (!stdout || stdout.trim().length === 0) {
        return resolve(false);
      }

      resolve(true);
    });
  });
}