/*
  Warnings:

  - A unique constraint covering the columns `[wsPort]` on the table `Camera` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `wsPort` to the `Camera` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Camera" ADD COLUMN     "wsPort" INTEGER NOT NULL,
ALTER COLUMN "location" DROP NOT NULL,
ALTER COLUMN "status" DROP NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'Offline';

-- CreateIndex
CREATE UNIQUE INDEX "Camera_wsPort_key" ON "Camera"("wsPort");
