// src/repos/jabatanRepo.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class JabatanRepo {
  async getAll() {
    return await prisma.jabatan.findMany({
      orderBy: { id: "asc" },
    });
  }

  async getById(id: number) {
    return await prisma.jabatan.findUnique({
      where: { id },
    });
  }

  async create(data: { nama_jabatan: string }) {
    return await prisma.jabatan.create({ data });
  }

  async update(id: number, data: { nama_jabatan: string }) {
    return await prisma.jabatan.update({
      where: { id },
      data,
    });
  }

  async delete(id: number) {
    return await prisma.jabatan.delete({
      where: { id },
    });
  }
}
