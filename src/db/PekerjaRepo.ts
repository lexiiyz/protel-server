import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function getPekerjaById(id_pekerja: string) {
  const pekerja = await prisma.pekerja.findUnique({
    where: { id_pekerja },
    include: {
      Jabatan: { select: { nama_jabatan: true } },
    },
  });

  if (!pekerja) return null;

  return {
    id_pekerja: pekerja.id_pekerja,
    nama: pekerja.nama,
    nomor_vest: pekerja.nomor_vest,
    jabatan: pekerja.Jabatan?.nama_jabatan || "Tidak diketahui",
    fotoBase64: pekerja.foto_wajah || null, // ✅ pastikan pakai foto_wajah
    has_face_data: !!pekerja.foto_wajah,    // ✅ tambahkan flag ini
  };
}

export async function getAllPekerja() {
  const pekerjaList = await prisma.pekerja.findMany({
    include: {
      Jabatan: {
        select: { nama_jabatan: true },
      },
    },
  });

  return pekerjaList.map((p) => ({
    id_pekerja: p.id_pekerja,
    nama: p.nama,
    nomor_vest: p.nomor_vest,
    jabatan: p.Jabatan?.nama_jabatan || "Tidak diketahui",
    is_active: p.is_active,
    has_face_data: !!p.foto_wajah, // ✅ ganti dari foto_base64 ke foto_wajah
  }));
}

export async function getAllPekerjaWithPhotos() {
  const pekerjaList = await prisma.pekerja.findMany({
    select: {
      id_pekerja: true,
      foto_wajah: true,
    }
  });

  const map: Record<string, string> = {};
  pekerjaList.forEach(p => {
    if (p.foto_wajah) map[p.id_pekerja] = p.foto_wajah as string;
  });

  return map;
}

export async function insertOrUpdatePekerja(
  id_pekerja: string,
  nama: string,
  nomor_vest: number,
  jabatan_id: number,
  foto_base64: string
) {
  try {
    const pekerja = await prisma.pekerja.upsert({
      where: { id_pekerja },
      update: {
        nama,
        nomor_vest,
        jabatan_id,
        foto_wajah:
          foto_base64 === "NO_PHOTO_UPDATE_NEEDED"
            ? undefined
            : foto_base64, // ✅ sesuaikan nama kolom
      },
      create: {
        id_pekerja,
        nama,
        nomor_vest,
        jabatan_id,
        foto_wajah: foto_base64,
      },
    });

    return { success: true, message: "Data pekerja berhasil disimpan.", pekerja };
  } catch (error: any) {
    console.error("Error insertOrUpdatePekerja:", error);
    return { success: false, message: "Gagal menyimpan data pekerja: " + error.message };
  }
}
export async function deletePekerjaById(id_pekerja: string) {
  const existing = await prisma.pekerja.findUnique({ where: { id_pekerja } });
  if (!existing) return false;

  await prisma.pekerja.delete({ where: { id_pekerja } });
  return true;
}
