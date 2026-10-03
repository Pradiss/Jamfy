import type { Response, NextFunction } from "express";
import { anuncioService } from "../services/anuncio.service.js";
import { requireParam } from "../utils/require-param.js";
import type { AuthRequest } from "../types/auth-request.js";

class AnuncioController {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await anuncioService.list(req.query as never);

      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  }

  async findById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = requireParam(req.params.id, "ID do anúncio não informado.");

      const anuncio = await anuncioService.findById(id);

      return res.status(200).json(anuncio);
    } catch (error) {
      return next(error);
    }
  }

  async listMine(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new Error("Usuário não autenticado.");
      }

      const anuncios = await anuncioService.listMine(req.user.id);

      return res.status(200).json({ anuncios });
    } catch (error) {
      return next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new Error("Usuário não autenticado.");
      }

      const anuncio = await anuncioService.create(req.user.id, req.body);

      return res.status(201).json({
        mensagem: "Anúncio criado com sucesso.",
        anuncio,
      });
    } catch (error) {
      return next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new Error("Usuário não autenticado.");
      }

      const id = requireParam(req.params.id, "ID do anúncio não informado.");

      const anuncio = await anuncioService.update(req.user.id, id, req.body);

      return res.status(200).json({
        mensagem: "Anúncio atualizado com sucesso.",
        anuncio,
      });
    } catch (error) {
      return next(error);
    }
  }

  async remove(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new Error("Usuário não autenticado.");
      }

      const id = requireParam(req.params.id, "ID do anúncio não informado.");

      const result = await anuncioService.remove(req.user.id, id);

      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  }
}

export const anuncioController = new AnuncioController();
