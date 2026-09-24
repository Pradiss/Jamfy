import { prisma } from "../config/prisma.js";

import type { SaveArtistInstrumentsInput } from "@jamfy/shared";

class ArtistInstrumentService {
  async list(userId: string) {
    const artist = await prisma.perfilArtista.findUnique({
      where: {
        usuarioId: userId,
      },
      include: {
        instrumentos: {
          include: {
            instrumento: true,
          },
          orderBy: {
            principal: "desc",
          },
        },
      },
    });

    if (!artist) {
      throw new Error("Perfil do artista não encontrado.");
    }

    return artist.instrumentos.map((item) => ({
      id: item.instrumento.id,
      name: item.instrumento.nome,
      primary: item.principal,
      active: item.instrumento.ativo,
    }));
  }

  async save(userId: string, data: SaveArtistInstrumentsInput) {
    const artist = await prisma.perfilArtista.findUnique({
      where: {
        usuarioId: userId,
      },
    });

    if (!artist) {
      throw new Error("Perfil do artista não encontrado.");
    }

    const instruments = await prisma.instrumento.findMany({
      where: {
        id: {
          in: data.instruments.map(
            (instrument) => instrument.instrumentId,
          ),
        },
        ativo: true,
      },
    });

    if (instruments.length !== data.instruments.length) {
      throw new Error(
        "Um ou mais instrumentos são inválidos ou estão inativos.",
      );
    }

    await prisma.$transaction([
      prisma.artistaInstrumento.deleteMany({
        where: {
          artistaId: artist.id,
        },
      }),

      prisma.artistaInstrumento.createMany({
        data: data.instruments.map((instrument) => ({
          artistaId: artist.id,
          instrumentoId: instrument.instrumentId,
          principal: instrument.primary,
        })),
      }),
    ]);

    return this.list(userId);
  }

  async remove(userId: string, instrumentId: string) {
    const artist = await prisma.perfilArtista.findUnique({
      where: {
        usuarioId: userId,
      },
    });

    if (!artist) {
      throw new Error("Perfil do artista não encontrado.");
    }

    const relation = await prisma.artistaInstrumento.findUnique({
      where: {
        artistaId_instrumentoId: {
          artistaId: artist.id,
          instrumentoId: instrumentId,
        },
      },
    });

    if (!relation) {
      throw new Error(
        "Instrumento não encontrado para este artista.",
      );
    }

    await prisma.artistaInstrumento.delete({
      where: {
        artistaId_instrumentoId: {
          artistaId: artist.id,
          instrumentoId: instrumentId,
        },
      },
    });

    return {
      message: "Instrumento removido do artista com sucesso.",
    };
  }
}

export const artistInstrumentService =
  new ArtistInstrumentService();