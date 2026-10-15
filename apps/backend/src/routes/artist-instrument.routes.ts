import { Router } from "express";

import { artistInstrumentController } from "../controllers/artist-instrument.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  removeArtistInstrumentSchema,
  saveArtistInstrumentsSchema,
} from "@jamfy/shared";

export const artistInstrumentRoutes: Router = Router();

artistInstrumentRoutes.use(authMiddleware);

artistInstrumentRoutes.get(
  "/",
  artistInstrumentController.list.bind(artistInstrumentController),
);

artistInstrumentRoutes.post(
  "/",
  validate(saveArtistInstrumentsSchema),
  artistInstrumentController.save.bind(artistInstrumentController),
);

artistInstrumentRoutes.delete(
  "/:instrumentId",
  validate(removeArtistInstrumentSchema),
  artistInstrumentController.remove.bind(artistInstrumentController),
);