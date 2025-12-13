/*
  Warnings:

  - You are about to drop the column `channel` on the `Camera` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `Camera` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `Camera` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Camera` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Camera" DROP COLUMN "channel",
DROP COLUMN "password",
DROP COLUMN "username",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'Offline',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
