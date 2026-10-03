import { prisma } from "../config/prisma.js";
import { StatusConversa, TipoNotificacao } from "../../generated/prisma/client.js";

import type { StartConversaBody, SendMensagemBody } from "@jamfy/shared";

const counterpartSelect = {
  id: true,
  nome: true,
  fotoUrl: true,
} as const;

const anuncioSummarySelect = {
  id: true,
  titulo: true,
  fotos: true,
} as const;

class ConversaService {
  async startOrSend(userId: string, { anuncioId, conteudo }: StartConversaBody) {
    const anuncio = await prisma.anuncio.findUnique({
      where: { id: anuncioId },
      select: { id: true, usuarioId: true, titulo: true },
    });

    if (!anuncio) {
      throw new Error("Anúncio não encontrado.");
    }

    if (anuncio.usuarioId === userId) {
      throw new Error(
        "Você não pode iniciar uma conversa no seu próprio anúncio.",
      );
    }

    const existing = await prisma.conversa.findUnique({
      where: {
        anuncioId_compradorId: {
          anuncioId,
          compradorId: userId,
        },
      },
      select: { id: true, status: true },
    });

    if (existing) {
      if (existing.status === StatusConversa.RECUSADA) {
        throw new Error("O vendedor recusou esta conversa.");
      }

      await this.createMessage({
        conversaId: existing.id,
        autorId: userId,
        recipientId: anuncio.usuarioId,
        anuncioTitulo: anuncio.titulo,
        conteudo,
      });

      return prisma.conversa.findUniqueOrThrow({ where: { id: existing.id } });
    }

    return prisma.$transaction(async (transaction) => {
      const conversa = await transaction.conversa.create({
        data: {
          anuncioId,
          compradorId: userId,
          vendedorId: anuncio.usuarioId,
        },
      });

      await transaction.mensagem.create({
        data: {
          conversaId: conversa.id,
          autorId: userId,
          conteudo,
        },
      });

      await transaction.notificacao.create({
        data: {
          tipo: TipoNotificacao.CONVERSA_SOLICITADA,
          titulo: "Nova mensagem sobre seu anúncio",
          mensagem: `Você recebeu uma mensagem sobre "${anuncio.titulo}".`,
          usuarioId: anuncio.usuarioId,
          conversaId: conversa.id,
        },
      });

      return conversa;
    });
  }

  async sendMessage(
    userId: string,
    conversaId: string,
    { conteudo }: SendMensagemBody,
  ) {
    const conversa = await prisma.conversa.findUnique({
      where: { id: conversaId },
      select: {
        id: true,
        status: true,
        compradorId: true,
        vendedorId: true,
        anuncio: { select: { titulo: true } },
      },
    });

    if (
      !conversa ||
      (conversa.compradorId !== userId && conversa.vendedorId !== userId)
    ) {
      throw new Error("Conversa não encontrada.");
    }

    if (conversa.status === StatusConversa.RECUSADA) {
      throw new Error("Esta conversa foi recusada.");
    }

    const recipientId =
      userId === conversa.compradorId ? conversa.vendedorId : conversa.compradorId;

    return this.createMessage({
      conversaId,
      autorId: userId,
      recipientId,
      anuncioTitulo: conversa.anuncio.titulo,
      conteudo,
    });
  }

  async list(userId: string) {
    const conversas = await prisma.conversa.findMany({
      where: {
        OR: [{ compradorId: userId }, { vendedorId: userId }],
      },
      select: {
        id: true,
        status: true,
        criadoEm: true,
        anuncio: { select: anuncioSummarySelect },
        comprador: { select: counterpartSelect },
        vendedor: { select: counterpartSelect },
        mensagens: {
          orderBy: { criadoEm: "desc" },
          take: 1,
          select: { conteudo: true, criadoEm: true, autorId: true },
        },
        _count: {
          select: {
            mensagens: {
              where: { lida: false, autorId: { not: userId } },
            },
          },
        },
      },
    });

    return conversas
      .map((conversa) => {
        const isComprador = conversa.comprador.id === userId;

        return {
          id: conversa.id,
          status: conversa.status,
          anuncio: conversa.anuncio,
          counterpart: isComprador ? conversa.vendedor : conversa.comprador,
          papel: isComprador ? ("comprador" as const) : ("vendedor" as const),
          ultimaMensagem: conversa.mensagens[0] ?? null,
          naoLidas: conversa._count.mensagens,
        };
      })
      .sort((a, b) => {
        const aTime = a.ultimaMensagem
          ? new Date(a.ultimaMensagem.criadoEm).getTime()
          : 0;
        const bTime = b.ultimaMensagem
          ? new Date(b.ultimaMensagem.criadoEm).getTime()
          : 0;

        return bTime - aTime;
      });
  }

  async findById(userId: string, id: string) {
    const conversa = await prisma.conversa.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        criadoEm: true,
        anuncio: { select: anuncioSummarySelect },
        comprador: { select: counterpartSelect },
        vendedor: { select: counterpartSelect },
        mensagens: {
          orderBy: { criadoEm: "asc" },
          select: {
            id: true,
            conteudo: true,
            autorId: true,
            lida: true,
            criadoEm: true,
          },
        },
      },
    });

    if (
      !conversa ||
      (conversa.comprador.id !== userId && conversa.vendedor.id !== userId)
    ) {
      throw new Error("Conversa não encontrada.");
    }

    await prisma.mensagem.updateMany({
      where: {
        conversaId: id,
        autorId: { not: userId },
        lida: false,
      },
      data: { lida: true },
    });

    const isComprador = conversa.comprador.id === userId;

    return {
      id: conversa.id,
      status: conversa.status,
      criadoEm: conversa.criadoEm,
      anuncio: conversa.anuncio,
      counterpart: isComprador ? conversa.vendedor : conversa.comprador,
      papel: isComprador ? ("comprador" as const) : ("vendedor" as const),
      mensagens: conversa.mensagens,
    };
  }

  async accept(userId: string, id: string) {
    return this.resolveAsVendedor(userId, id, StatusConversa.ACEITA);
  }

  async decline(userId: string, id: string) {
    return this.resolveAsVendedor(userId, id, StatusConversa.RECUSADA);
  }

  private async resolveAsVendedor(
    userId: string,
    id: string,
    status: typeof StatusConversa.ACEITA | typeof StatusConversa.RECUSADA,
  ) {
    const conversa = await prisma.conversa.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        vendedorId: true,
        compradorId: true,
        anuncio: { select: { titulo: true } },
      },
    });

    if (!conversa || conversa.vendedorId !== userId) {
      throw new Error("Conversa não encontrada.");
    }

    if (conversa.status !== StatusConversa.PENDENTE) {
      throw new Error("Esta conversa já foi respondida.");
    }

    return prisma.$transaction(async (transaction) => {
      const updated = await transaction.conversa.update({
        where: { id },
        data: { status },
      });

      await transaction.notificacao.create({
        data: {
          tipo:
            status === StatusConversa.ACEITA
              ? TipoNotificacao.CONVERSA_ACEITA
              : TipoNotificacao.CONVERSA_RECUSADA,
          titulo:
            status === StatusConversa.ACEITA
              ? "Conversa aceita"
              : "Conversa recusada",
          mensagem:
            status === StatusConversa.ACEITA
              ? `O vendedor aceitou sua mensagem sobre "${conversa.anuncio.titulo}".`
              : `O vendedor recusou sua mensagem sobre "${conversa.anuncio.titulo}".`,
          usuarioId: conversa.compradorId,
          conversaId: id,
        },
      });

      return updated;
    });
  }

  private async createMessage({
    conversaId,
    autorId,
    recipientId,
    anuncioTitulo,
    conteudo,
  }: {
    conversaId: string;
    autorId: string;
    recipientId: string;
    anuncioTitulo: string;
    conteudo: string;
  }) {
    return prisma.$transaction(async (transaction) => {
      const message = await transaction.mensagem.create({
        data: { conversaId, autorId, conteudo },
      });

      await transaction.notificacao.create({
        data: {
          tipo: TipoNotificacao.MENSAGEM_RECEBIDA,
          titulo: "Nova mensagem",
          mensagem: `Você recebeu uma nova mensagem sobre "${anuncioTitulo}".`,
          usuarioId: recipientId,
          conversaId,
        },
      });

      return message;
    });
  }
}

export const conversaService = new ConversaService();
