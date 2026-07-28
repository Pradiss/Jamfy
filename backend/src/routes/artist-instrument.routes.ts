import { Router } from "express";

import { artistInstrumentController } from "../controllers/artist-instrument.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

export const artistInstrumentRoutes = Router();

artistInstrumentRoutes.use(authMiddleware);

artistInstrumentRoutes.get(
  "/",
  artistInstrumentController.list.bind(artistInstrumentController),
);

artistInstrumentRoutes.post(
  "/",
  artistInstrumentController.save.bind(artistInstrumentController),
);

artistInstrumentRoutes.delete(
  "/:instrumentId",
  artistInstrumentController.remove.bind(artistInstrumentController),
);