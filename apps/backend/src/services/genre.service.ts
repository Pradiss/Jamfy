import { prisma } from "../config/prisma.js";
import { withoutUndefined } from "../utils/without-undefined.js";

import type {
  CreateGenreInput,
  UpdateGenreInput,
} from "@jamfy/shared";

class GenreService {
  async list() {
    return prisma.generoMusical.findMany({
      orderBy: {
        nome: "asc",
      },
    });
  }

  async findById(id: string) {
    const genre = await prisma.generoMusical.findUnique({
      where: {
        id,
      },
    });

    if (!genre) {
      throw new Error("Gênero musical não encontrado.");
    }

    return genre;
  }

  async create(data: CreateGenreInput) {
    const normalizedName = data.name.trim();

    const existingGenre = await prisma.generoMusical.findUnique({
      where: {
        nome: normalizedName,
      },
    });

    if (existingGenre) {
      throw new Error("Já existe um gênero musical com esse nome.");
    }

    return prisma.generoMusical.create({
      data: {
        nome: normalizedName,
        ativo: data.active,
      },
    });
  }

  async update(id: string, data: UpdateGenreInput) {
    const genre = await prisma.generoMusical.findUnique({
      where: {
        id,
      },
    });

    if (!genre) {
      throw new Error("Gênero musical não encontrado.");
    }

    const normalizedName = data.name?.trim();

    if (normalizedName && normalizedName !== genre.nome) {
      const existingGenre = await prisma.generoMusical.findUnique({
        where: {
          nome: normalizedName,
        },
      });

      if (existingGenre) {
        throw new Error("Já existe um gênero musical com esse nome.");
      }
    }

    return prisma.generoMusical.update({
      where: {
        id,
      },
      data: withoutUndefined({
        nome: normalizedName,
        ativo: data.active,
      }),
    });
  }

  async delete(id: string) {
    const genre = await prisma.generoMusical.findUnique({
      where: {
        id,
      },
      include: {
        artistas: true,
      },
    });

    if (!genre) {
      throw new Error("Gênero musical não encontrado.");
    }

    if (genre.artistas.length > 0) {
      return prisma.generoMusical.update({
        where: {
          id,
        },
        data: {
          ativo: false,
        },
      });
    }

    await prisma.generoMusical.delete({
      where: {
        id,
      },
    });

    return {
      message: "Gênero musical removido com sucesso.",
    };
  }
}

export const genreService = new GenreService();