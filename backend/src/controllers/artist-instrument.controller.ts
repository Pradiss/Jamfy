import type { NextFunction, Request, Response } from "express";

import { artistInstrumentService } from "../services/artist-instrument.service.js";

import {
  removeArtistInstrumentSchema,
  saveArtistInstrumentsSchema,
} from "../validations/artist-instrument.validation.js";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
  };
}

class ArtistInstrumentController {
  async list(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        throw new Error("Usuário não autenticado.");
      }

      const instruments = await artistInstrumentService.list(userId);

      return res.status(200).json({
        instruments,
      });
    } catch (error) {
      return next(error);
    }
  }

  async save(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        throw new Error("Usuário não autenticado.");
      }

      const { body } = saveArtistInstrumentsSchema.parse({
        body: req.body,
      });

      const instruments = await artistInstrumentService.save(
        userId,
        body,
      );

      return res.status(200).json({
        message: "Instrumentos do artista salvos com sucesso.",
        instruments,
      });
    } catch (error) {
      return next(error);
    }
  }

  async remove(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        throw new Error("Usuário não autenticado.");
      }

      const { params } = removeArtistInstrumentSchema.parse({
        params: req.params,
      });

      const result = await artistInstrumentService.remove(
        userId,
        params.instrumentId,
      );

      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  }
}

export const artistInstrumentController =
  new ArtistInstrumentController();