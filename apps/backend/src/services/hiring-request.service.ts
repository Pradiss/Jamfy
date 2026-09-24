import { prisma } from "../config/prisma.js";
import { withoutUndefined } from "../utils/without-undefined.js";
import {
  StatusAgenda,
  OrigemAgenda,
  StatusSolicitacao,
  TipoNotificacao,
  TipoUsuario,
} from "../../generated/prisma/client.js";

import type { CreateHiringRequestBody } from "@jamfy/shared";

type CreateHiringRequestInput = CreateHiringRequestBody & {
  userId: string;
};

const artistContactSelect = {
  id: true,
  nomeArtistico: true,
  slug: true,
  fotoCapaUrl: true,
  usuarioId: true,
  usuario: {
    select: {
      telefone: true,
      whatsapp: true,
    },
  },
} as const;

const requesterContactSelect = {
  id: true,
  nome: true,
  email: true,
  telefone: true,
  whatsapp: true,
} as const;

// Contact details (phone/WhatsApp/email) are only revealed to the other
// party once a request is accepted, so nobody can spam a number just by
// browsing pending or past requests.
function revealArtistContact(
  artista: {
    id: string;
    nomeArtistico: string;
    slug: string;
    fotoCapaUrl: string | null;
    usuarioId: string;
    usuario: { telefone: string; whatsapp: string | null };
  },
  revealed: boolean,
) {
  return {
    id: artista.id,
    nomeArtistico: artista.nomeArtistico,
    slug: artista.slug,
    fotoCapaUrl: artista.fotoCapaUrl,
    usuarioId: artista.usuarioId,
    telefone: revealed ? artista.usuario.telefone : null,
    whatsapp: revealed ? artista.usuario.whatsapp : null,
  };
}

function revealContratanteContact(
  contratante: {
    id: string;
    nome: string;
    email: string;
    telefone: string;
    whatsapp: string | null;
  },
  revealed: boolean,
) {
  return {
    id: contratante.id,
    nome: contratante.nome,
    email: revealed ? contratante.email : null,
    telefone: revealed ? contratante.telefone : null,
    whatsapp: revealed ? contratante.whatsapp : null,
  };
}

class HiringRequestService {
  async create({
    userId,
    artistaId,
    descricao,
    tipoEvento,
    dataEvento,
    nomeLocal,
    cidade,
    estado,
    endereco,
    orcamento,
  }: CreateHiringRequestInput) {
    const requester = await prisma.usuario.findUnique({
      where: {
        id: userId,
      },
      select: {
        tipo: true,
        ativo: true,
      },
    });

    if (!requester) {
      throw new Error("Usuário não encontrado.");
    }

    if (!requester.ativo) {
      throw new Error("Usuário está inativo.");
    }

    if (requester.tipo !== TipoUsuario.CONTRATANTE) {
      throw new Error(
        "Somente contratantes podem enviar solicitações de contratação.",
      );
    }

    const artistProfile = await prisma.perfilArtista.findUnique({
      where: {
        id: artistaId,
      },
      select: {
        id: true,
        usuarioId: true,
      },
    });

    if (!artistProfile) {
      throw new Error("Artista não encontrado.");
    }

    if (dataEvento) {
      const conflict = await prisma.agendaArtista.findFirst({
        where: {
          artistaId,
          status: {
            in: [StatusAgenda.RESERVADO, StatusAgenda.INDISPONIVEL],
          },
          dataInicio: { lte: dataEvento },
          dataFim: { gte: dataEvento },
        },
        select: {
          id: true,
        },
      });

      if (conflict) {
        throw new Error("O artista não está disponível na data informada.");
      }
    }

    return prisma.$transaction(async (transaction) => {
      const hiringRequest = await transaction.solicitacaoContratacao.create({
        data: withoutUndefined({
          descricao,
          tipoEvento,
          dataEvento,
          nomeLocal,
          cidade,
          estado,
          endereco,
          orcamento,
          contratanteId: userId,
          artistaId,
        }),
      });

      if (dataEvento) {
        const { start, end } = this.dayRange(dataEvento);

        await transaction.agendaArtista.create({
          data: {
            dataInicio: start,
            dataFim: end,
            diaInteiro: true,
            status: StatusAgenda.PENDENTE,
            origem: OrigemAgenda.CONTRATACAO,
            titulo: nomeLocal ?? "Solicitação de contratação",
            artistaId,
            solicitacaoId: hiringRequest.id,
          },
        });
      }

      await transaction.notificacao.create({
        data: {
          tipo: TipoNotificacao.SOLICITACAO_CRIADA,
          titulo: "Nova solicitação de contratação",
          mensagem: nomeLocal
            ? `Você recebeu uma nova solicitação de contratação para "${nomeLocal}".`
            : "Você recebeu uma nova solicitação de contratação.",
          usuarioId: artistProfile.usuarioId,
          solicitacaoId: hiringRequest.id,
        },
      });

      return hiringRequest;
    });
  }

  private dayRange(date: Date) {
    const start = new Date(date);
    start.setUTCHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 1);

    return { start, end };
  }

  async listSent(userId: string) {
    const requests = await prisma.solicitacaoContratacao.findMany({
      where: {
        contratanteId: userId,
      },
      include: {
        artista: {
          select: artistContactSelect,
        },
      },
      orderBy: {
        criadoEm: "desc",
      },
    });

    return requests.map((request) => ({
      ...request,
      artista: revealArtistContact(
        request.artista,
        request.status === StatusSolicitacao.ACEITA,
      ),
    }));
  }

  async listReceived(userId: string) {
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

    const requests = await prisma.solicitacaoContratacao.findMany({
      where: {
        artistaId: artistProfile.id,
      },
      include: {
        contratante: {
          select: requesterContactSelect,
        },
      },
      orderBy: {
        criadoEm: "desc",
      },
    });

    return requests.map((request) => ({
      ...request,
      contratante: revealContratanteContact(
        request.contratante,
        request.status === StatusSolicitacao.ACEITA,
      ),
    }));
  }

  async findById(userId: string, id: string) {
    const request = await prisma.solicitacaoContratacao.findUnique({
      where: {
        id,
      },
      include: {
        artista: {
          select: artistContactSelect,
        },
        contratante: {
          select: requesterContactSelect,
        },
      },
    });

    if (
      !request ||
      (request.contratanteId !== userId &&
        request.artista.usuarioId !== userId)
    ) {
      throw new Error("Solicitação de contratação não encontrada.");
    }

    const revealed = request.status === StatusSolicitacao.ACEITA;

    return {
      ...request,
      artista: revealArtistContact(request.artista, revealed),
      contratante: revealContratanteContact(request.contratante, revealed),
    };
  }

  async accept(userId: string, id: string) {
    return this.resolveAsArtist(userId, id, StatusSolicitacao.ACEITA);
  }

  async decline(userId: string, id: string) {
    return this.resolveAsArtist(userId, id, StatusSolicitacao.RECUSADA);
  }

  async cancel(userId: string, id: string) {
    const request = await prisma.solicitacaoContratacao.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        status: true,
        contratanteId: true,
        artista: {
          select: {
            usuarioId: true,
          },
        },
      },
    });

    if (!request || request.contratanteId !== userId) {
      throw new Error("Solicitação de contratação não encontrada.");
    }

    if (request.status !== StatusSolicitacao.PENDENTE) {
      throw new Error(
        "Somente solicitações pendentes podem ser canceladas.",
      );
    }

    return prisma.$transaction(async (transaction) => {
      const updated = await transaction.solicitacaoContratacao.update({
        where: {
          id,
        },
        data: {
          status: StatusSolicitacao.CANCELADA,
        },
      });

      await transaction.agendaArtista.deleteMany({
        where: {
          solicitacaoId: id,
        },
      });

      await transaction.notificacao.create({
        data: {
          tipo: TipoNotificacao.SOLICITACAO_CANCELADA,
          titulo: "Solicitação cancelada",
          mensagem: "O contratante cancelou a solicitação de contratação.",
          usuarioId: request.artista.usuarioId,
          solicitacaoId: id,
        },
      });

      return updated;
    });
  }

  private async resolveAsArtist(
    userId: string,
    id: string,
    status: typeof StatusSolicitacao.ACEITA | typeof StatusSolicitacao.RECUSADA,
  ) {
    const request = await prisma.solicitacaoContratacao.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        status: true,
        dataEvento: true,
        contratanteId: true,
        artista: {
          select: {
            id: true,
            usuarioId: true,
          },
        },
      },
    });

    if (!request || request.artista.usuarioId !== userId) {
      throw new Error("Solicitação de contratação não encontrada.");
    }

    if (request.status !== StatusSolicitacao.PENDENTE) {
      throw new Error(
        "Somente solicitações pendentes podem ser respondidas.",
      );
    }

    if (status === StatusSolicitacao.ACEITA && request.dataEvento) {
      const conflict = await prisma.agendaArtista.findFirst({
        where: {
          artistaId: request.artista.id,
          solicitacaoId: { not: id },
          status: {
            in: [StatusAgenda.RESERVADO, StatusAgenda.INDISPONIVEL],
          },
          dataInicio: { lte: request.dataEvento },
          dataFim: { gte: request.dataEvento },
        },
        select: {
          id: true,
        },
      });

      if (conflict) {
        throw new Error(
          "Já existe uma reserva confirmada para essa data. Recuse esta solicitação para liberar a agenda.",
        );
      }
    }

    return prisma.$transaction(async (transaction) => {
      const updated = await transaction.solicitacaoContratacao.update({
        where: {
          id,
        },
        data: {
          status,
        },
      });

      if (status === StatusSolicitacao.ACEITA) {
        await transaction.agendaArtista.updateMany({
          where: {
            solicitacaoId: id,
          },
          data: {
            status: StatusAgenda.RESERVADO,
          },
        });
      } else {
        await transaction.agendaArtista.deleteMany({
          where: {
            solicitacaoId: id,
          },
        });
      }

      await transaction.notificacao.create({
        data: {
          tipo:
            status === StatusSolicitacao.ACEITA
              ? TipoNotificacao.SOLICITACAO_ACEITA
              : TipoNotificacao.SOLICITACAO_RECUSADA,
          titulo:
            status === StatusSolicitacao.ACEITA
              ? "Solicitação aceita"
              : "Solicitação recusada",
          mensagem:
            status === StatusSolicitacao.ACEITA
              ? "O artista aceitou sua solicitação de contratação."
              : "O artista recusou sua solicitação de contratação.",
          usuarioId: request.contratanteId,
          solicitacaoId: id,
        },
      });

      return updated;
    });
  }
}

export const hiringRequestService = new HiringRequestService();
