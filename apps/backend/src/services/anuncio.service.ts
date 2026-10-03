import { prisma } from "../config/prisma.js";
import { withoutUndefined } from "../utils/without-undefined.js";
import { uploadService } from "./upload.service.js";

import type {
  CreateAnuncioBody,
  UpdateAnuncioBody,
  ListAnunciosQuery,
} from "@jamfy/shared";

// Contact details are never exposed here — buyers reach the seller through
// the in-app chat (Conversa) instead of a phone number shown to anyone who
// opens the listing.
const ownerSelect = {
  id: true,
  nome: true,
  fotoUrl: true,
} as const;

const anuncioListSelect = {
  id: true,
  tipo: true,
  titulo: true,
  categoria: true,
  preco: true,
  cidade: true,
  estado: true,
  fotos: true,
  status: true,
  criadoEm: true,
  usuarioId: true,
} as const;

class AnuncioService {
  async list({
    tipo,
    categoria,
    cidade,
    estado,
    busca,
    precoMin,
    precoMax,
    page,
    limit,
  }: ListAnunciosQuery) {
    const precoFilter =
      precoMin !== undefined || precoMax !== undefined
        ? withoutUndefined({ gte: precoMin, lte: precoMax })
        : undefined;

    const where = withoutUndefined({
      tipo,
      status: "ATIVO" as const,
      categoria: categoria
        ? { equals: categoria, mode: "insensitive" as const }
        : undefined,
      cidade: cidade
        ? { equals: cidade, mode: "insensitive" as const }
        : undefined,
      estado,
      preco: precoFilter,
      titulo: busca
        ? { contains: busca, mode: "insensitive" as const }
        : undefined,
    });

    const [items, total] = await Promise.all([
      prisma.anuncio.findMany({
        where,
        select: anuncioListSelect,
        orderBy: { criadoEm: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.anuncio.count({ where }),
    ]);

    return {
      anuncios: items,
      paginacao: {
        pagina: page,
        limite: limit,
        total,
        totalPaginas: Math.max(Math.ceil(total / limit), 1),
      },
    };
  }

  async findById(id: string) {
    const existing = await prisma.anuncio.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      throw new Error("Anúncio não encontrado.");
    }

    return prisma.anuncio.update({
      where: { id },
      data: { visualizacoes: { increment: 1 } },
      include: { usuario: { select: ownerSelect } },
    });
  }

  async listMine(userId: string) {
    return prisma.anuncio.findMany({
      where: { usuarioId: userId },
      orderBy: { criadoEm: "desc" },
    });
  }

  async create(userId: string, data: CreateAnuncioBody) {
    return prisma.anuncio.create({
      data: {
        usuarioId: userId,
        tipo: data.tipo,
        titulo: data.titulo,
        descricao: data.descricao,
        categoria: data.categoria,
        preco: data.preco ?? null,
        cidade: data.cidade,
        estado: data.estado,
        fotos: data.fotos ?? [],
      },
    });
  }

  async update(userId: string, id: string, data: UpdateAnuncioBody) {
    const anuncio = await prisma.anuncio.findUnique({
      where: { id },
      select: { usuarioId: true, fotos: true },
    });

    if (!anuncio) {
      throw new Error("Anúncio não encontrado.");
    }

    if (anuncio.usuarioId !== userId) {
      throw new Error("Você não tem permissão para editar este anúncio.");
    }

    const updated = await prisma.anuncio.update({
      where: { id },
      data: withoutUndefined({
        tipo: data.tipo,
        titulo: data.titulo,
        descricao: data.descricao,
        categoria: data.categoria,
        preco: data.preco,
        cidade: data.cidade,
        estado: data.estado,
        fotos: data.fotos,
        status: data.status,
      }),
    });

    if (data.fotos) {
      const removedFotos = anuncio.fotos.filter(
        (foto) => !data.fotos?.includes(foto),
      );

      if (removedFotos.length > 0) {
        await uploadService.deleteFiles(removedFotos);
      }
    }

    return updated;
  }

  async remove(userId: string, id: string) {
    const anuncio = await prisma.anuncio.findUnique({
      where: { id },
      select: { usuarioId: true, fotos: true },
    });

    if (!anuncio) {
      throw new Error("Anúncio não encontrado.");
    }

    if (anuncio.usuarioId !== userId) {
      throw new Error("Você não tem permissão para remover este anúncio.");
    }

    await prisma.anuncio.delete({ where: { id } });

    if (anuncio.fotos.length > 0) {
      await uploadService.deleteFiles(anuncio.fotos);
    }

    return { message: "Anúncio removido com sucesso." };
  }
}

export const anuncioService = new AnuncioService();
