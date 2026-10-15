import type { NextFunction, Request, Response } from "express";

import { artistInstrumentService } from "../services/artist-instrument.service.js";

import type {
  RemoveArtistInstrumentInput,
  SaveArtistInstrumentsInput,
} from "@jamfy/shared";

type AuthenticatedRequest<
  Params = Record<string, string>,
  Body = unknown,
> = Request<Params, unknown, Body> & {
  user?: { id: string };
};

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
    req: AuthenticatedRequest<
      Record<string, string>,
      SaveArtistInstrumentsInput
    >,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        throw new Error("Usuário não autenticado.");
      }

      const instruments = await artistInstrumentService.save(
        userId,
        req.body,
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
    req: AuthenticatedRequest<RemoveArtistInstrumentInput>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        throw new Error("Usuário não autenticado.");
      }

      const result = await artistInstrumentService.remove(
        userId,
        req.params.instrumentId,
      );

      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  }
}

export const artistInstrumentController =
  new ArtistInstrumentController();