import { prisma } from "../config/prisma.js";
import { StatusSolicitacao } from "../../generated/prisma/client.js";

import type { CreateAvaliacaoBody, ListAvaliacoesQuery } from "@jamfy/shared";

class AvaliacaoService {
  async create(userId: string, data: CreateAvaliacaoBody) {
    const solicitacao = await prisma.solicitacaoContratacao.findUnique({
      where: { id: data.solicitacaoId },
      select: {
        id: true,
        contratanteId: true,
        artistaId: true,
        status: true,
        avaliacao: { select: { id: true } },
      },
    });

    if (!solicitacao) {
      throw new Error("Solicitação não encontrada.");
    }

    if (solicitacao.contratanteId !== userId) {
      throw new Error(
        "Apenas quem fez a solicitação pode avaliar esse atendimento.",
      );
    }

    if (solicitacao.status !== StatusSolicitacao.ACEITA) {
      throw new Error(
        "Só é possível avaliar solicitações que foram aceitas.",
      );
    }

    if (solicitacao.avaliacao) {
      throw new Error("Essa solicitação já foi avaliada.");
    }

    const avaliacao = await prisma.$transaction(async (transaction) => {
      const created = await transaction.avaliacao.create({
        data: {
          solicitacaoId: solicitacao.id,
          artistaId: solicitacao.artistaId,
          contratanteId: userId,
          nota: data.nota,
          comentario: data.comentario ?? null,
        },
      });

      const aggregate = await transaction.avaliacao.aggregate({
        where: { artistaId: solicitacao.artistaId },
        _avg: { nota: true },
        _count: true,
      });

      await transaction.perfilArtista.update({
        where: { id: solicitacao.artistaId },
        data: {
          avaliacao: aggregate._avg.nota ?? 0,
          quantidadeAvaliacoes: aggregate._count,
        },
      });

      return created;
    });

    return avaliacao;
  }

  async listByArtist({ artistaId, page, limit }: ListAvaliacoesQuery) {
    const [items, total] = await Promise.all([
      prisma.avaliacao.findMany({
        where: { artistaId },
        select: {
          id: true,
          nota: true,
          comentario: true,
          criadoEm: true,
          contratante: { select: { nome: true, fotoUrl: true } },
        },
        orderBy: { criadoEm: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.avaliacao.count({ where: { artistaId } }),
    ]);

    return {
      avaliacoes: items,
      paginacao: {
        pagina: page,
        limite: limit,
        total,
        totalPaginas: Math.max(Math.ceil(total / limit), 1),
      },
    };
  }
}

export const avaliacaoService = new AvaliacaoService();
