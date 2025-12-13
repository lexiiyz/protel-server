import { Request, Response } from "express";
import { JabatanRepo } from "../db/JabatanRepo";

const repo = new JabatanRepo();

export class JabatanController {
  static async getAll(req: Request, res: Response) {
    try {
      const data = await repo.getAll();
      return res.json(data);
    } catch (error) {
      console.error("❌ Gagal ambil jabatan:", error);
      return res.status(500).json({ error: "Gagal mengambil data jabatan" });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const data = await repo.getById(id);
      if (!data) {
        return res.status(404).json({ error: "Jabatan tidak ditemukan" });
      }
      return res.json(data);
    } catch (error) {
      console.error("❌ Gagal ambil jabatan:", error);
      return res.status(500).json({ error: "Gagal mengambil jabatan" });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const { nama_jabatan } = req.body;
      if (!nama_jabatan || nama_jabatan.trim() === "") {
        return res.status(400).json({ error: "Nama jabatan wajib diisi" });
      }

      const newData = await repo.create({ nama_jabatan });
      return res.status(201).json(newData);
    } catch (error: any) {
      console.error("❌ Error menambah jabatan:", error);

      // Prisma unique constraint error
      if (error.code === "P2002") {
        return res.status(400).json({ error: "Nama jabatan sudah ada" });
      }

      return res.status(500).json({ error: "Gagal menambah jabatan" });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const { nama_jabatan } = req.body;

      const updated = await repo.update(id, { nama_jabatan });
      return res.json(updated);
    } catch (error: any) {
      console.error("❌ Error update jabatan:", error);

      if (error.code === "P2025") {
        return res.status(404).json({ error: "Jabatan tidak ditemukan" });
      }

      return res.status(500).json({ error: "Gagal memperbarui jabatan" });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const deleted = await repo.delete(id);
      return res.json(deleted);
    } catch (error: any) {
      console.error("❌ Error hapus jabatan:", error);

      if (error.code === "P2025") {
        return res.status(404).json({ error: "Jabatan tidak ditemukan" });
      }

      // Foreign key constraint (masih dipakai di pekerja)
      if (error.code === "P2003") {
        return res.status(400).json({ error: "Jabatan masih digunakan oleh pekerja" });
      }

      return res.status(500).json({ error: "Gagal menghapus jabatan" });
    }
  }
}
