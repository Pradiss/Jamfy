import type { Response } from "express";
import { notificationService } from "../services/notification.service.js";
import { requireParam } from "../utils/require-param.js";
import type { AuthRequest } from "../types/auth-request.js";
import type { ListNotificationsQuery } from "@jamfy/shared";

class NotificationController {
  async list(req: AuthRequest, res: Response) {
    if (!req.user) {
      return res.status(401).json({
        message: "Usuário não autenticado.",
      });
    }

    const result = await notificationService.list(
      req.user.id,
      req.query as unknown as ListNotificationsQuery,
    );

    return res.status(200).json(result);
  }

  async markAsRead(req: AuthRequest, res: Response) {
    if (!req.user) {
      return res.status(401).json({
        message: "Usuário não autenticado.",
      });
    }

    const notification = await notificationService.markAsRead(
      req.user.id,
      requireParam(req.params.id, "ID da notificação não informado."),
    );

    return res.status(200).json({
      mensagem: "Notificação marcada como lida.",
      notificacao: notification,
    });
  }

  async markAllAsRead(req: AuthRequest, res: Response) {
    if (!req.user) {
      return res.status(401).json({
        message: "Usuário não autenticado.",
      });
    }

    await notificationService.markAllAsRead(req.user.id);

    return res.status(200).json({
      mensagem: "Todas as notificações foram marcadas como lidas.",
    });
  }
}

export const notificationController = new NotificationController();
