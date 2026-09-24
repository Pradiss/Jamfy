import { prisma } from "../config/prisma.js";
import { withoutUndefined } from "../utils/without-undefined.js";

import type { ListNotificationsQuery } from "@jamfy/shared";

class NotificationService {
  async list(userId: string, { apenasNaoLidas, page, limit }: ListNotificationsQuery) {
    const where = withoutUndefined({
      usuarioId: userId,
      lida: apenasNaoLidas ? false : undefined,
    });

    const [items, total, naoLidas] = await Promise.all([
      prisma.notificacao.findMany({
        where,
        orderBy: {
          criadoEm: "desc",
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.notificacao.count({ where }),
      prisma.notificacao.count({
        where: {
          usuarioId: userId,
          lida: false,
        },
      }),
    ]);

    return {
      notificacoes: items,
      naoLidas,
      paginacao: {
        pagina: page,
        limite: limit,
        total,
        totalPaginas: Math.max(Math.ceil(total / limit), 1),
      },
    };
  }

  async markAsRead(userId: string, id: string) {
    const notification = await prisma.notificacao.findFirst({
      where: {
        id,
        usuarioId: userId,
      },
      select: {
        id: true,
      },
    });

    if (!notification) {
      throw new Error("Notificação não encontrada.");
    }

    return prisma.notificacao.update({
      where: {
        id,
      },
      data: {
        lida: true,
      },
    });
  }

  async markAllAsRead(userId: string) {
    await prisma.notificacao.updateMany({
      where: {
        usuarioId: userId,
        lida: false,
      },
      data: {
        lida: true,
      },
    });
  }
}

export const notificationService = new NotificationService();
