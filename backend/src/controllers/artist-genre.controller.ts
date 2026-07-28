import type { Request, Response } from "express";
import { artistGenreService } from "../services/artist-genre.service.js";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
  };
}

class ArtistGenreController {
  async list(req: AuthenticatedRequest, res: Response) {
    const userId = req.user?.id;

    if (!userId) {
      throw new Error("Usuário não autenticado.");
    }

    const genres = await artistGenreService.list(userId);

    return res.status(200).json({
      genres,
    });
  }

  async save(req: AuthenticatedRequest, res: Response) {
    const userId = req.user?.id;

    if (!userId) {
      throw new Error("Usuário não autenticado.");
    }

    const { genres } = req.body;

    const savedGenres = await artistGenreService.save({
      userId,
      genres,
    });

    return res.status(200).json({
      mensagem: "Gêneros musicais salvos com sucesso.",
      genres: savedGenres,
    });
  }
}

export const artistGenreController = new ArtistGenreController();