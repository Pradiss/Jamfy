import { prisma } from "../config/prisma.js";

interface SaveArtistGenresInput {
  userId: string;
  genres: {
    genreId: string;
  }[];
}

class ArtistGenreService {
  async list(userId: string) {
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

    const artistGenres = await prisma.artistaGenero.findMany({
      where: {
        artistaId: artistProfile.id,
      },
      include: {
        genero: true,
      },
      orderBy: {
        genero: {
          nome: "asc",
        },
      },
    });

    return artistGenres.map((artistGenre) => ({
      id: artistGenre.genero.id,
      name: artistGenre.genero.nome,
      active: artistGenre.genero.ativo,
    }));
  }

  async save({ userId, genres }: SaveArtistGenresInput) {
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

    const genreIds = [...new Set(genres.map((genre) => genre.genreId))];

    const existingGenres = await prisma.generoMusical.findMany({
      where: {
        id: {
          in: genreIds,
        },
        ativo: true,
      },
      select: {
        id: true,
      },
    });

    if (existingGenres.length !== genreIds.length) {
      throw new Error(
        "Um ou mais gêneros musicais não existem ou estão inativos.",
      );
    }

    await prisma.$transaction([
      prisma.artistaGenero.deleteMany({
        where: {
          artistaId: artistProfile.id,
        },
      }),

      prisma.artistaGenero.createMany({
        data: genreIds.map((genreId) => ({
          artistaId: artistProfile.id,
          generoId: genreId,
        })),
      }),
    ]);

    const savedGenres = await prisma.artistaGenero.findMany({
      where: {
        artistaId: artistProfile.id,
      },
      include: {
        genero: true,
      },
      orderBy: {
        genero: {
          nome: "asc",
        },
      },
    });

    return savedGenres.map((artistGenre) => ({
      id: artistGenre.genero.id,
      name: artistGenre.genero.nome,
      active: artistGenre.genero.ativo,
    }));
  }
}

export const artistGenreService = new ArtistGenreService();