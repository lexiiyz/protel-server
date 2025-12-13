import { Request, Response } from "express";
import { getAllPekerja, insertOrUpdatePekerja, getPekerjaById, deletePekerjaById, } from "../db/PekerjaRepo";

export async function getPekerja(req: Request, res: Response) {
  try {
    const data = await getAllPekerja();
    res.status(200).json(data);
  } catch (err: any) {
    res.status(500).json({ status: "error", message: err.message });
  }
}

export async function addPekerja(req: Request, res: Response) {
  const { id_pekerja, nama, nomor_vest, jabatan, foto_base64 } = req.body;

  if (!id_pekerja || !nama || !nomor_vest || !jabatan || !foto_base64) {
    return res.status(400).json({
      status: "error",
      message: "Semua field wajib diisi.",
    });
  }

  const result = await insertOrUpdatePekerja(
    id_pekerja,
    nama,
    Number(nomor_vest),
    Number(jabatan),
    foto_base64
  );

  res.status(result.success ? 201 : 400).json(result);
}

export async function getPekerjaByIdHandler(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const data = await getPekerjaById(id);
    if (!data) return res.status(404).json({ message: "Pekerja tidak ditemukan" });
    res.status(200).json(data);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
}

export async function deletePekerja(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const result = await deletePekerjaById(id);
    if (result) res.json({ message: "Pekerja berhasil dihapus" });
    else res.status(404).json({ message: "Pekerja tidak ditemukan" });
  } catch (err: any) {
    res.status(500).json({ message: "Gagal menghapus pekerja" });
  }
}
