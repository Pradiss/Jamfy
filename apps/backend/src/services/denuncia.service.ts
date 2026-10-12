import { prisma } from "../config/prisma.js";
import { withoutUndefined } from "../utils/without-undefined.js";

import type {
  CreateDenunciaBody,
  ListDenunciasQuery,
  UpdateDenunciaStatusBody,
} from "@jamfy/shared";

const denuncianteSelect = {
  id: true,
  nome: true,
  email: true,
} as const;

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

  async list({ status, tipo, page, limit }: ListDenunciasQuery) {
    const where = withoutUndefined({ status, tipo });

    const [items, total] = await Promise.all([
      prisma.denuncia.findMany({
        where,
        include: { denunciante: { select: denuncianteSelect } },
        orderBy: { criadoEm: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.denuncia.count({ where }),
    ]);

    return {
      denuncias: items,
      paginacao: {
        pagina: page,
        limite: limit,
        total,
        totalPaginas: Math.max(Math.ceil(total / limit), 1),
      },
    };
  }

  async updateStatus(id: string, { status }: UpdateDenunciaStatusBody) {
    const existing = await prisma.denuncia.findUnique({ where: { id } });

    if (!existing) {
      throw new Error("Denúncia não encontrada.");
    }

    return prisma.denuncia.update({
      where: { id },
      data: { status },
    });
  }
}

export const denunciaService = new DenunciaService();
