import { prisma } from "../config/prisma.js";

import type {
  CreateInstrumentInput,
  UpdateInstrumentInput,
} from "../validations/instrument.validation.js";

class InstrumentService {
  async list() {
    return prisma.instrumento.findMany({
      orderBy: {
        nome: "asc",
      },
    });
  }

  async findById(id: string) {
    const instrument = await prisma.instrumento.findUnique({
      where: {
        id,
      },
    });

    if (!instrument) {
      throw new Error("Instrumento não encontrado.");
    }

    return instrument;
  }

  async create(data: CreateInstrumentInput) {
    const normalizedName = data.name.trim();

    const existingInstrument = await prisma.instrumento.findUnique({
      where: {
        nome: normalizedName,
      },
    });

    if (existingInstrument) {
      throw new Error("Já existe um instrumento com esse nome.");
    }

    return prisma.instrumento.create({
      data: {
        nome: normalizedName,
        ativo: data.active,
      },
    });
  }

  async update(id: string, data: UpdateInstrumentInput) {
    const instrument = await prisma.instrumento.findUnique({
      where: {
        id,
      },
    });

    if (!instrument) {
      throw new Error("Instrumento não encontrado.");
    }

    const normalizedName = data.name?.trim();

    if (normalizedName && normalizedName !== instrument.nome) {
      const existingInstrument = await prisma.instrumento.findUnique({
        where: {
          nome: normalizedName,
        },
      });

      if (existingInstrument) {
        throw new Error("Já existe um instrumento com esse nome.");
      }
    }

    return prisma.instrumento.update({
      where: {
        id,
      },
      data: {
        nome: normalizedName,
        ativo: data.active,
      },
    });
  }

  async delete(id: string) {
    const instrument = await prisma.instrumento.findUnique({
      where: {
        id,
      },
      include: {
        artistas: true,
      },
    });

    if (!instrument) {
      throw new Error("Instrumento não encontrado.");
    }

    if (instrument.artistas.length > 0) {
      return prisma.instrumento.update({
        where: {
          id,
        },
        data: {
          ativo: false,
        },
      });
    }

    await prisma.instrumento.delete({
      where: {
        id,
      },
    });

    return {
      message: "Instrumento removido com sucesso.",
    };
  }
}

export const instrumentService = new InstrumentService();