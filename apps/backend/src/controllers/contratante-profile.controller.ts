import type { Response, NextFunction } from "express";
import { contratanteProfileService } from "../services/contratante-profile.service.js";
import type { AuthRequest } from "../types/auth-request.js";

class ContratanteProfileController {
  async me(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new Error("Usuário não autenticado.");
      }

      const profile = await contratanteProfileService.findMe(req.user.id);

      return res.status(200).json(profile);
    } catch (error) {
      return next(error);
    }
  }

  async upsert(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new Error("Usuário não autenticado.");
      }

      const profile = await contratanteProfileService.upsert(
        req.user.id,
        req.body,
      );

      return res.status(200).json({
        mensagem: "Perfil atualizado com sucesso.",
        profile,
      });
    } catch (error) {
      return next(error);
    }
  }
}

export const contratanteProfileController = new ContratanteProfileController();
