import { prisma } from "../config/prisma.js";

class CidadeService {
  async listByUf(uf: string) {
    return prisma.cidade.findMany({
      where: {
        uf,
      },
      orderBy: {
        nome: "asc",
      },
    });
  }
}

export const cidadeService = new CidadeService();
