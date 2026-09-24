import type { Request, Response } from "express";
import { ZodError } from "zod";
import { artistProfileService } from "../services/artist-profile.service.js";
import { requireParam } from "../utils/require-param.js";
import type { AuthRequest } from "../types/auth-request.js";
import {
  createArtistProfileSchema,
  updateArtistProfileSchema,
  listArtistProfilesQuerySchema,
} from "@jamfy/shared";

function badRequest(res: Response, error: unknown) {
  if (error instanceof ZodError) {
    return res.status(400).json({
      message: "Validation error.",
      errors: error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  return res.status(400).json({
    message: error instanceof Error ? error.message : "Internal server error.",
  });
}

class ArtistProfileController {
  async list(req: Request, res: Response) {
    try {
      const query = listArtistProfilesQuerySchema.parse(req.query);

      const result = await artistProfileService.list(query);

      return res.status(200).json(result);
    } catch (error) {
      return badRequest(res, error);
    }
  }

  async findBySlug(req: Request, res: Response) {
    try {
      const slug = requireParam(req.params.slug, "Artist slug not provided.");

      const artistProfile = await artistProfileService.findBySlug(slug);

      return res.status(200).json(artistProfile);
    } catch (error) {
      return res.status(404).json({
        message:
          error instanceof Error ? error.message : "Artist profile not found.",
      });
    }
  }

  async create(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          message: "Unauthorized.",
        });
      }

      const data = createArtistProfileSchema.parse(req.body);

      const artistProfile = await artistProfileService.create(
        req.user.id,
        data,
      );

      return res.status(201).json(artistProfile);
    } catch (error) {
      return badRequest(res, error);
    }
  }

  async me(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          message: "Unauthorized.",
        });
      }

      const artistProfile = await artistProfileService.findMe(req.user.id);

      return res.status(200).json(artistProfile);
    } catch (error) {
      return res.status(404).json({
        message:
          error instanceof Error ? error.message : "Artist profile not found.",
      });
    }
  }

  async update(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          message: "Unauthorized.",
        });
      }

      const data = updateArtistProfileSchema.parse(req.body);

      const artistProfile = await artistProfileService.update(
        req.user.id,
        data,
      );

      return res.status(200).json(artistProfile);
    } catch (error) {
      return badRequest(res, error);
    }
  }
}

export const artistProfileController = new ArtistProfileController();