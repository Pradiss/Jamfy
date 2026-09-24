import { prisma } from "../config/prisma.js";
import { withoutUndefined } from "../utils/without-undefined.js";
import { TipoArtista } from "../../generated/prisma/client.js";

import type {
  CreateBandMemberBody,
  UpdateBandMemberBody,
} from "@jamfy/shared";

type CreateBandMemberInput = CreateBandMemberBody & {
  userId: string;
};

type UpdateBandMemberInput = UpdateBandMemberBody & {
  userId: string;
  id: string;
};

class BandMemberService {
  private async findBandProfile(userId: string) {
    const artistProfile = await prisma.perfilArtista.findUnique({
      where: {
        usuarioId: userId,
      },
      select: {
        id: true,
        tipo: true,
      },
    });

    if (!artistProfile) {
      throw new Error("Perfil de artista não encontrado.");
    }

    if (artistProfile.tipo !== TipoArtista.BANDA) {
      throw new Error(
        "Somente perfis de banda podem gerenciar integrantes.",
      );
    }

    return artistProfile;
  }

  async list(userId: string) {
    const bandProfile = await this.findBandProfile(userId);

    return prisma.integranteBanda.findMany({
      where: {
        bandaId: bandProfile.id,
      },
      orderBy: [
        {
          ativo: "desc",
        },
        {
          criadoEm: "asc",
        },
      ],
    });
  }

  async create({
    userId,
    nome,
    funcao,
    outraFuncao,
    instrumento,
    telefone,
    instagramUrl,
    fotoUrl,
    ativo = true,
  }: CreateBandMemberInput) {
    const bandProfile = await this.findBandProfile(userId);

    return prisma.integranteBanda.create({
      data: withoutUndefined({
        nome,
        funcao,
        outraFuncao,
        instrumento,
        telefone,
        instagramUrl,
        fotoUrl,
        ativo,
        bandaId: bandProfile.id,
      }),
    });
  }

  async update({
    userId,
    id,
    nome,
    funcao,
    outraFuncao,
    instrumento,
    telefone,
    instagramUrl,
    fotoUrl,
    ativo,
  }: UpdateBandMemberInput) {
    const bandProfile = await this.findBandProfile(userId);

    const existing = await prisma.integranteBanda.findFirst({
      where: {
        id,
        bandaId: bandProfile.id,
      },
      select: {
        id: true,
      },
    });

    if (!existing) {
      throw new Error("Integrante não encontrado.");
    }

    return prisma.integranteBanda.update({
      where: {
        id,
      },
      data: withoutUndefined({
        nome,
        funcao,
        outraFuncao,
        instrumento,
        telefone,
        instagramUrl,
        fotoUrl,
        ativo,
      }),
    });
  }

  async delete(userId: string, id: string) {
    const bandProfile = await this.findBandProfile(userId);

    const existing = await prisma.integranteBanda.findFirst({
      where: {
        id,
        bandaId: bandProfile.id,
      },
      select: {
        id: true,
      },
    });

    if (!existing) {
      throw new Error("Integrante não encontrado.");
    }

    await prisma.integranteBanda.delete({
      where: {
        id,
      },
    });
  }
}

export const bandMemberService = new BandMemberService();
