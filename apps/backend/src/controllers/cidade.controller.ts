import type { Request, Response, NextFunction } from "express";
import { cidadeService } from "../services/cidade.service.js";

class CidadeController {
  async listByUf(req: Request, res: Response, next: NextFunction) {
    try {
      const { uf } = req.query as { uf: string };

      const cidades = await cidadeService.listByUf(uf);

      return res.status(200).json(cidades);
    } catch (error) {
      return next(error);
    }
  }
}

export const cidadeController = new CidadeController();
