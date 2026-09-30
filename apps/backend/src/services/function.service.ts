import { prisma } from "../config/prisma.js";

class FunctionService {
  async list() {
    return prisma.funcaoArtistica.findMany({
      where: {
        ativo: true,
      },
      orderBy: {
        nome: "asc",
      },
    });
  }
}

export const functionService = new FunctionService();
