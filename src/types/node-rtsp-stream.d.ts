declare module 'node-rtsp-stream' {
  interface StreamOptions {
    name: string;
    streamUrl: string;
    wsPort: number;
    ffmpegOptions?: Record<string, string | number>;
  }

  export default class Stream {
    on(arg0: string, arg1: () => void) {
      throw new Error("Method not implemented.");
    }
    constructor(options: StreamOptions);
    stop(): void;
  }
}
