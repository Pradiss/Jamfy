import { prisma } from "../config/prisma.js";
import { withoutUndefined } from "../utils/without-undefined.js";

import type {
  CreatePortfolioBody,
  UpdatePortfolioBody,
  PortfolioParams,
} from "@jamfy/shared";

type CreatePortfolioInput = CreatePortfolioBody & {
  userId: string;
};

type UpdatePortfolioInput = UpdatePortfolioBody & {
  userId: string;
  portfolioId: string;
};

type PortfolioIdInput = PortfolioParams & {
  userId: string;
};

class PortfolioService {
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

  async list(userId: string) {
    const artistProfile = await this.findArtistProfile(userId);

    const portfolioItems = await prisma.portfolio.findMany({
      where: {
        artistaId: artistProfile.id,
      },
      orderBy: [
        {
          destaque: "desc",
        },
        {
          ordem: "asc",
        },
        {
          criadoEm: "desc",
        },
      ],
    });

    return portfolioItems;
  }

  async findById({ userId, id }: PortfolioIdInput) {
    const artistProfile = await this.findArtistProfile(userId);

    const portfolioItem = await prisma.portfolio.findFirst({
      where: {
        id,
        artistaId: artistProfile.id,
      },
    });

    if (!portfolioItem) {
      throw new Error("Item do portfólio não encontrado.");
    }

    return portfolioItem;
  }

  async create({
    userId,
    titulo,
    descricao,
    arquivoUrl,
    miniaturaUrl,
    tipo,
    destaque = false,
    ordem = 0,
  }: CreatePortfolioInput) {
    const artistProfile = await this.findArtistProfile(userId);

    const portfolioItem = await prisma.$transaction(async (transaction) => {
      if (destaque) {
        await transaction.portfolio.updateMany({
          where: {
            artistaId: artistProfile.id,
            destaque: true,
          },
          data: {
            destaque: false,
          },
        });
      }

      return transaction.portfolio.create({
        data: withoutUndefined({
          titulo,
          descricao,
          arquivoUrl,
          miniaturaUrl,
          tipo,
          destaque,
          ordem,
          artistaId: artistProfile.id,
        }),
      });
    });

    return portfolioItem;
  }

  async update({
    userId,
    portfolioId,
    titulo,
    descricao,
    arquivoUrl,
    miniaturaUrl,
    tipo,
    destaque,
    ordem,
  }: UpdatePortfolioInput) {
    const artistProfile = await this.findArtistProfile(userId);

    const existingPortfolioItem = await prisma.portfolio.findFirst({
      where: {
        id: portfolioId,
        artistaId: artistProfile.id,
      },
      select: {
        id: true,
      },
    });

    if (!existingPortfolioItem) {
      throw new Error("Item do portfólio não encontrado.");
    }

    const updatedPortfolioItem = await prisma.$transaction(
      async (transaction) => {
        if (destaque === true) {
          await transaction.portfolio.updateMany({
            where: {
              artistaId: artistProfile.id,
              destaque: true,
              id: {
                not: portfolioId,
              },
            },
            data: {
              destaque: false,
            },
          });
        }

        return transaction.portfolio.update({
          where: {
            id: portfolioId,
          },
          data: {
            ...(titulo !== undefined && { titulo }),
            ...(descricao !== undefined && { descricao }),
            ...(arquivoUrl !== undefined && { arquivoUrl }),
            ...(miniaturaUrl !== undefined && { miniaturaUrl }),
            ...(tipo !== undefined && { tipo }),
            ...(destaque !== undefined && { destaque }),
            ...(ordem !== undefined && { ordem }),
          },
        });
      },
    );

    return updatedPortfolioItem;
  }

  async delete({ userId, id }: PortfolioIdInput) {
    const artistProfile = await this.findArtistProfile(userId);

    const portfolioItem = await prisma.portfolio.findFirst({
      where: {
        id,
        artistaId: artistProfile.id,
      },
      select: {
        id: true,
      },
    });

    if (!portfolioItem) {
      throw new Error("Item do portfólio não encontrado.");
    }

    await prisma.portfolio.delete({
      where: {
        id,
      },
    });
  }

  async setHighlight({ userId, id }: PortfolioIdInput) {
    const artistProfile = await this.findArtistProfile(userId);

    const portfolioItem = await prisma.portfolio.findFirst({
      where: {
        id,
        artistaId: artistProfile.id,
      },
      select: {
        id: true,
      },
    });

    if (!portfolioItem) {
      throw new Error("Item do portfólio não encontrado.");
    }

    const highlightedPortfolioItem = await prisma.$transaction(
      async (transaction) => {
        await transaction.portfolio.updateMany({
          where: {
            artistaId: artistProfile.id,
            destaque: true,
          },
          data: {
            destaque: false,
          },
        });

        return transaction.portfolio.update({
          where: {
            id,
          },
          data: {
            destaque: true,
          },
        });
      },
    );

    return highlightedPortfolioItem;
  }
}

export const portfolioService = new PortfolioService();