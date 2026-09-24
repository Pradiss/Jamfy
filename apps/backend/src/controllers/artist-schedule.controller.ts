import type { Request, Response } from "express";
import { artistScheduleService } from "../services/artist-schedule.service.js";
import { requireParam } from "../utils/require-param.js";
import type { AuthRequest } from "../types/auth-request.js";
import type { AgendaQuery } from "@jamfy/shared";

class ArtistScheduleController {
  async list(req: AuthRequest, res: Response) {
    if (!req.user) {
      return res.status(401).json({
        message: "Usuário não autenticado.",
      });
    }

    const agenda = await artistScheduleService.list(
      req.user.id,
      req.query as unknown as AgendaQuery,
    );

    return res.status(200).json({
      agenda,
    });
  }

  async listPublic(req: Request, res: Response) {
    const artistaId = requireParam(
      req.params.artistaId,
      "ID do artista não informado.",
    );

    const agenda = await artistScheduleService.listPublic(
      artistaId,
      req.query as unknown as AgendaQuery,
    );

    return res.status(200).json({
      agenda,
    });
  }

  async create(req: AuthRequest, res: Response) {
    if (!req.user) {
      return res.status(401).json({
        message: "Usuário não autenticado.",
      });
    }

    const entry = await artistScheduleService.create({
      userId: req.user.id,
      ...req.body,
    });

    return res.status(201).json({
      mensagem: "Período de agenda cadastrado com sucesso.",
      agenda: entry,
    });
  }

  async update(req: AuthRequest, res: Response) {
    if (!req.user) {
      return res.status(401).json({
        message: "Usuário não autenticado.",
      });
    }

    const entry = await artistScheduleService.update({
      userId: req.user.id,
      id: requireParam(req.params.id, "ID do período de agenda não informado."),
      ...req.body,
    });

    return res.status(200).json({
      mensagem: "Período de agenda atualizado com sucesso.",
      agenda: entry,
    });
  }

  async delete(req: AuthRequest, res: Response) {
    if (!req.user) {
      return res.status(401).json({
        message: "Usuário não autenticado.",
      });
    }

    await artistScheduleService.delete(
      req.user.id,
      requireParam(req.params.id, "ID do período de agenda não informado."),
    );

    return res.status(200).json({
      mensagem: "Período de agenda removido com sucesso.",
    });
  }
}

export const artistScheduleController = new ArtistScheduleController();
