-- CreateTable
CREATE TABLE "Pekerja" (
    "id_pekerja" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "nomor_vest" INTEGER NOT NULL,
    "jabatan_id" INTEGER NOT NULL,
    "foto_wajah" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Pekerja_pkey" PRIMARY KEY ("id_pekerja")
);

-- CreateTable
CREATE TABLE "Jabatan" (
    "id" SERIAL NOT NULL,
    "nama_jabatan" TEXT NOT NULL,

    CONSTRAINT "Jabatan_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Pekerja" ADD CONSTRAINT "Pekerja_jabatan_id_fkey" FOREIGN KEY ("jabatan_id") REFERENCES "Jabatan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
