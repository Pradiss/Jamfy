import { prisma } from "../config/prisma.js";
import { withoutUndefined } from "../utils/without-undefined.js";
import { TipoUsuario } from "../../generated/prisma/client.js";

import type { UpsertContratanteProfileBody } from "@jamfy/shared";

class ContratanteProfileService {
  async findMe(userId: string) {
    return prisma.perfilContratante.findUnique({
      where: { usuarioId: userId },
    });
  }

  async upsert(userId: string, data: UpsertContratanteProfileBody) {
    const user = await prisma.usuario.findUnique({
      where: { id: userId },
      select: { tipo: true },
    });

    if (!user) {
      throw new Error("Usuário não encontrado.");
    }

    if (user.tipo !== TipoUsuario.CONTRATANTE) {
      throw new Error("Apenas contratantes podem ter esse perfil.");
    }

    const payload = withoutUndefined({
      nomeResponsavel: data.nomeResponsavel,
      nomeEmpresa: data.nomeEmpresa,
      cidade: data.cidade,
      estado: data.estado,
    });

    return prisma.perfilContratante.upsert({
      where: { usuarioId: userId },
      create: { usuarioId: userId, ...payload },
      update: payload,
    });
  }
}

export const contratanteProfileService = new ContratanteProfileService();
