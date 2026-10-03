import { prisma } from "../config/prisma.js";

import type { CreateDenunciaBody } from "@jamfy/shared";

class DenunciaService {
  async create(userId: string, data: CreateDenunciaBody) {
    return prisma.denuncia.create({
      data: {
        tipo: data.tipo,
        motivo: data.motivo,
        referenciaId: data.referenciaId,
        descricao: data.descricao ?? null,
        denuncianteId: userId,
      },
    });
  }
}

export const denunciaService = new DenunciaService();
