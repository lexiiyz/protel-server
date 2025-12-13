-- DropIndex
DROP INDEX "Camera_wsPort_key";

-- AlterTable
ALTER TABLE "Camera" ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'RTSP',
ALTER COLUMN "ipAddress" DROP NOT NULL,
ALTER COLUMN "wsPort" DROP NOT NULL;

-- CreateTable
CREATE TABLE "LogAbsensi" (
    "id" SERIAL NOT NULL,
    "waktu_absen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pekerja_id" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "apd_lengkap" BOOLEAN NOT NULL DEFAULT false,
    "is_manual" BOOLEAN NOT NULL DEFAULT false,
    "ocr_result" TEXT,
    "foto_wajah" TEXT,
    "foto_helm" TEXT,
    "foto_vest" TEXT,
    "foto_gloves" TEXT,
    "foto_glasses" TEXT,
    "foto_boots" TEXT,
    "foto_mask" TEXT,
    "foto_vest_number" TEXT,
    "helm_ok" BOOLEAN NOT NULL DEFAULT false,
    "vest_ok" BOOLEAN NOT NULL DEFAULT false,
    "gloves_ok" BOOLEAN NOT NULL DEFAULT false,
    "glasses_ok" BOOLEAN NOT NULL DEFAULT false,
    "boots_ok" BOOLEAN NOT NULL DEFAULT false,
    "mask_ok" BOOLEAN NOT NULL DEFAULT false,
    "ocr_match" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "LogAbsensi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ViolationLog" (
    "id" SERIAL NOT NULL,
    "camera_id" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "details" TEXT NOT NULL,
    "image_path" TEXT,
    "vest_number" TEXT DEFAULT 'None',
    "worker_name" TEXT DEFAULT 'Unknown',

    CONSTRAINT "ViolationLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "LogAbsensi" ADD CONSTRAINT "LogAbsensi_pekerja_id_fkey" FOREIGN KEY ("pekerja_id") REFERENCES "Pekerja"("id_pekerja") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ViolationLog" ADD CONSTRAINT "ViolationLog_camera_id_fkey" FOREIGN KEY ("camera_id") REFERENCES "Camera"("id") ON DELETE CASCADE ON UPDATE CASCADE;
