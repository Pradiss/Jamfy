import type { Response, NextFunction } from "express";
import { denunciaService } from "../services/denuncia.service.js";
import type { AuthRequest } from "../types/auth-request.js";

class DenunciaController {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new Error("Usuário não autenticado.");
      }

      await denunciaService.create(req.user.id, req.body);

      return res.status(201).json({
        mensagem:
          "Denúncia enviada com sucesso. Nossa equipe vai analisar o quanto antes.",
      });
    } catch (error) {
      return next(error);
    }
  }
}

export const denunciaController = new DenunciaController();
