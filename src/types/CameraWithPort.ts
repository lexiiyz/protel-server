import { Camera } from "@prisma/client";

export type CameraWithPort = Camera & {
  wsPort: number;
};
