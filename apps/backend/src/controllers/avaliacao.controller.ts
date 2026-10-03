import type { Response, NextFunction } from "express";
import { avaliacaoService } from "../services/avaliacao.service.js";
import type { AuthRequest } from "../types/auth-request.js";

class AvaliacaoController {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new Error("Usuário não autenticado.");
      }

      const avaliacao = await avaliacaoService.create(req.user.id, req.body);

      return res.status(201).json({
        mensagem: "Avaliação enviada com sucesso.",
        avaliacao,
      });
    } catch (error) {
      return next(error);
    }
  }

  async listByArtist(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await avaliacaoService.listByArtist(req.query as never);

      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  }
}

export const avaliacaoController = new AvaliacaoController();
