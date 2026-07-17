import type { Request, Response } from "express";
import { artistProfileService } from "../services/artist-profile.service.js";
import type { AuthRequest } from "../types/auth-request.js";

class ArtistProfileController {
  async create(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          message: "Unauthorized.",
        });
      }

      const profile = await artistProfileService.create(
        req.user.id,
        req.body,
      );

      return res.status(201).json({
        message: "Artist profile created successfully.",
        profile,
      });
    } catch (error) {
      return res.status(400).json({
        message:
          error instanceof Error
            ? error.message
            : "Internal server error.",
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

      const profile = await artistProfileService.findMe(req.user.id);

      return res.status(200).json(profile);
    } catch (error) {
      return res.status(404).json({
        message:
          error instanceof Error
            ? error.message
            : "Internal server error.",
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

      const profile = await artistProfileService.update(
        req.user.id,
        req.body,
      );

      return res.status(200).json({
        message: "Artist profile updated successfully.",
        profile,
      });
    } catch (error) {
      return res.status(400).json({
        message:
          error instanceof Error
            ? error.message
            : "Internal server error.",
      });
    }
  }
}

export const artistProfileController =
  new ArtistProfileController();