import { prisma } from "../config/prisma.js";
import { withoutUndefined } from "../utils/without-undefined.js";
import { OrigemAgenda } from "../../generated/prisma/client.js";

import type {
  CreateAgendaEntryBody,
  UpdateAgendaEntryBody,
  AgendaQuery,
} from "@jamfy/shared";

type CreateAgendaEntryInput = CreateAgendaEntryBody & {
  userId: string;
};

type UpdateAgendaEntryInput = UpdateAgendaEntryBody & {
  userId: string;
  id: string;
};

const publicAgendaSelect = {
  id: true,
  dataInicio: true,
  dataFim: true,
  diaInteiro: true,
  status: true,
} as const;

class ArtistScheduleService {
  private async findArtistProfile(userId: string) {
    const artistProfile = await prisma.perfilArtista.findUnique({
      where: {
        usuarioId: userId,
      },
      select: {
        id: true,
      },
    });

    if (!artistProfile) {
      throw new Error("Perfil de artista não encontrado.");
    }

    return artistProfile;
  }

  async assertNoOverlap(
    artistaId: string,
    dataInicio: Date,
    dataFim: Date,
    excludeId?: string,
  ) {
    const overlapping = await prisma.agendaArtista.findFirst({
      where: withoutUndefined({
        artistaId,
        id: excludeId ? { not: excludeId } : undefined,
        dataInicio: { lt: dataFim },
        dataFim: { gt: dataInicio },
      }),
      select: {
        id: true,
      },
    });

    if (overlapping) {
      throw new Error(
        "Já existe um período cadastrado que conflita com essas datas.",
      );
    }
  }

  async list(userId: string, query: AgendaQuery) {
    const artistProfile = await this.findArtistProfile(userId);

    return prisma.agendaArtista.findMany({
      where: withoutUndefined({
        artistaId: artistProfile.id,
        dataInicio: query.de ? { gte: query.de } : undefined,
        dataFim: query.ate ? { lte: query.ate } : undefined,
      }),
      orderBy: {
        dataInicio: "asc",
      },
    });
  }

  async listPublic(artistaId: string, query: AgendaQuery) {
    const artistProfile = await prisma.perfilArtista.findUnique({
      where: {
        id: artistaId,
      },
      select: {
        id: true,
      },
    });

    if (!artistProfile) {
      throw new Error("Artista não encontrado.");
    }

    return prisma.agendaArtista.findMany({
      where: withoutUndefined({
        artistaId,
        dataInicio: query.de ? { gte: query.de } : undefined,
        dataFim: query.ate ? { lte: query.ate } : undefined,
      }),
      select: publicAgendaSelect,
      orderBy: {
        dataInicio: "asc",
      },
    });
  }

  async create({
    userId,
    dataInicio,
    dataFim,
    diaInteiro = false,
    status,
    titulo,
    observacao,
  }: CreateAgendaEntryInput) {
    const artistProfile = await this.findArtistProfile(userId);

    await this.assertNoOverlap(artistProfile.id, dataInicio, dataFim);

    return prisma.agendaArtista.create({
      data: withoutUndefined({
        dataInicio,
        dataFim,
        diaInteiro,
        status,
        titulo,
        observacao,
        origem: OrigemAgenda.ARTISTA,
        artistaId: artistProfile.id,
      }),
    });
  }

  async update({
    userId,
    id,
    dataInicio,
    dataFim,
    diaInteiro,
    status,
    titulo,
    observacao,
  }: UpdateAgendaEntryInput) {
    const artistProfile = await this.findArtistProfile(userId);

    const existing = await prisma.agendaArtista.findFirst({
      where: {
        id,
        artistaId: artistProfile.id,
      },
    });

    if (!existing) {
      throw new Error("Período de agenda não encontrado.");
    }

    if (existing.origem !== OrigemAgenda.ARTISTA) {
      throw new Error(
        "Este período foi gerado por uma contratação e não pode ser editado manualmente.",
      );
    }

    const nextStart = dataInicio ?? existing.dataInicio;
    const nextEnd = dataFim ?? existing.dataFim;

    await this.assertNoOverlap(artistProfile.id, nextStart, nextEnd, id);

    return prisma.agendaArtista.update({
      where: {
        id,
      },
      data: withoutUndefined({
        dataInicio,
        dataFim,
        diaInteiro,
        status,
        titulo,
        observacao,
      }),
    });
  }

  async delete(userId: string, id: string) {
    const artistProfile = await this.findArtistProfile(userId);

    const existing = await prisma.agendaArtista.findFirst({
      where: {
        id,
        artistaId: artistProfile.id,
      },
      select: {
        id: true,
        origem: true,
      },
    });

    if (!existing) {
      throw new Error("Período de agenda não encontrado.");
    }

    if (existing.origem !== OrigemAgenda.ARTISTA) {
      throw new Error(
        "Este período foi gerado por uma contratação e não pode ser removido manualmente.",
      );
    }

    await prisma.agendaArtista.delete({
      where: {
        id,
      },
    });
  }
}

export const artistScheduleService = new ArtistScheduleService();
