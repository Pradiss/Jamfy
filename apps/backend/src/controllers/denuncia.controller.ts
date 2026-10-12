import type { Response, NextFunction } from "express";
import { denunciaService } from "../services/denuncia.service.js";
import { requireParam } from "../utils/require-param.js";
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

  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await denunciaService.list(req.query as never);
      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  }

  async updateStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = requireParam(req.params.id, "ID de denúncia não informado.");
      const denuncia = await denunciaService.updateStatus(id, req.body);

      return res.status(200).json({
        mensagem: "Status da denúncia atualizado.",
        denuncia,
      });
    } catch (error) {
      return next(error);
    }
  }
}

export const denunciaController = new DenunciaController();
