import { prisma } from "../config/prisma.js";

import type {
  SaveArtistFunctionsInput,
} from "@jamfy/shared";

class ArtistFunctionService {
  async list(userId: string) {
    const profile = await prisma.perfilArtista.findUnique({
      where: {
        usuarioId: userId,
      },
      select: {
        id: true,
      },
    });

    if (!profile) {
      throw new Error("Perfil artístico não encontrado.");
    }

    const artistFunctions = await prisma.artistaFuncao.findMany({
      where: {
        artistaId: profile.id,
      },
      select: {
        principal: true,
        funcao: {
          select: {
            id: true,
            nome: true,
            ativo: true,
          },
        },
      },
      orderBy: [
        {
          principal: "desc",
        },
        {
          funcao: {
            nome: "asc",
          },
        },
      ],
    });

    return artistFunctions.map((item) => ({
      id: item.funcao.id,
      name: item.funcao.nome,
      primary: item.principal,
      active: item.funcao.ativo,
    }));
  }

  async save(
    userId: string,
    data: SaveArtistFunctionsInput,
  ) {
    const profile = await prisma.perfilArtista.findUnique({
      where: {
        usuarioId: userId,
      },
      select: {
        id: true,
      },
    });

    if (!profile) {
      throw new Error("Perfil artístico não encontrado.");
    }

    const functionIds = data.functions.map(
      (item) => item.functionId,
    );

    const existingFunctions =
      await prisma.funcaoArtistica.findMany({
        where: {
          id: {
            in: functionIds,
          },
          ativo: true,
        },
        select: {
          id: true,
        },
      });

    if (existingFunctions.length !== functionIds.length) {
      throw new Error(
        "Uma ou mais funções artísticas não existem ou estão inativas.",
      );
    }

    return prisma.$transaction(async (transaction) => {
      await transaction.artistaFuncao.deleteMany({
        where: {
          artistaId: profile.id,
        },
      });

      await transaction.artistaFuncao.createMany({
        data: data.functions.map((item) => ({
          artistaId: profile.id,
          funcaoId: item.functionId,
          principal: item.primary,
        })),
      });

      const savedFunctions =
        await transaction.artistaFuncao.findMany({
          where: {
            artistaId: profile.id,
          },
          select: {
            principal: true,
            funcao: {
              select: {
                id: true,
                nome: true,
                ativo: true,
              },
            },
          },
          orderBy: [
            {
              principal: "desc",
            },
            {
              funcao: {
                nome: "asc",
              },
            },
          ],
        });

      return savedFunctions.map((item) => ({
        id: item.funcao.id,
        name: item.funcao.nome,
        primary: item.principal,
        active: item.funcao.ativo,
      }));
    });
  }

  async remove(
    userId: string,
    functionId: string,
  ) {
    const profile = await prisma.perfilArtista.findUnique({
      where: {
        usuarioId: userId,
      },
      select: {
        id: true,
      },
    });

    if (!profile) {
      throw new Error("Perfil artístico não encontrado.");
    }

    const artistFunction =
      await prisma.artistaFuncao.findUnique({
        where: {
          artistaId_funcaoId: {
            artistaId: profile.id,
            funcaoId: functionId,
          },
        },
        select: {
          principal: true,
        },
      });

    if (!artistFunction) {
      throw new Error(
        "A função artística não está vinculada a este perfil.",
      );
    }

    await prisma.artistaFuncao.delete({
      where: {
        artistaId_funcaoId: {
          artistaId: profile.id,
          funcaoId: functionId,
        },
      },
    });

    return {
      message: "Função artística removida com sucesso.",
    };
  }
}

export const artistFunctionService =
  new ArtistFunctionService();