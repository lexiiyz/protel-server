-- AlterTable
ALTER TABLE "Camera" ADD COLUMN     "channel" TEXT,
ADD COLUMN     "password" TEXT,
ADD COLUMN     "username" TEXT,
ALTER COLUMN "status" SET DEFAULT 'Online';
