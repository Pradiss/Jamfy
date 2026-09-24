import type { NextFunction, Request, Response } from "express";
import { genreService } from "../services/genre.service.js";
import { requireParam } from "../utils/require-param.js";

import {
  createGenreSchema,
  updateGenreSchema,
} from "@jamfy/shared";

class GenreController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const genres = await genreService.list();

      return res.status(200).json(genres);
    } catch (error) {
      return next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = requireParam(req.params.id, "ID do gênero musical não informado.");

      const genre = await genreService.findById(id);

      return res.status(200).json(genre);
    } catch (error) {
      return next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createGenreSchema.parse(req.body);

      const genre = await genreService.create(data);

      return res.status(201).json(genre);
    } catch (error) {
      return next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = requireParam(req.params.id, "ID do gênero musical não informado.");

      const data = updateGenreSchema.parse(req.body);

      const genre = await genreService.update(id, data);

      return res.status(200).json(genre);
    } catch (error) {
      return next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = requireParam(req.params.id, "ID do gênero musical não informado.");

      const result = await genreService.delete(id);

      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  }
}

export const genreController = new GenreController();