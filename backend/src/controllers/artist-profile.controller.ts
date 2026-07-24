import type { Response } from "express";
import { artistProfileService } from "../services/artist-profile.service";
import type { AuthRequest } from "../types/auth-request";
import {
  createArtistProfileSchema,
  updateArtistProfileSchema,
} from "../validations/artist-profile.validation";

class ArtistProfileController {
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
      return res.status(400).json({
        message:
          error instanceof Error ? error.message : "Internal server error.",
      });
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
      return res.status(400).json({
        message:
          error instanceof Error ? error.message : "Internal server error.",
      });
    }
  }
}

export const artistProfileController = new ArtistProfileController();