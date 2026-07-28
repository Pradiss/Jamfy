import { Router } from "express";

import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";

import { artistFunctionController } from "../controllers/artist-function.controller.js";

import {
  removeArtistFunctionSchema,
  saveArtistFunctionsSchema,
} from "../validations/artist-function.validation.js";

export const artistFunctionRoutes = Router();

artistFunctionRoutes.use(authMiddleware);

artistFunctionRoutes.get("/", artistFunctionController.list);

artistFunctionRoutes.post(
  "/",
  validate(saveArtistFunctionsSchema),
  artistFunctionController.save,
);

artistFunctionRoutes.delete(
  "/:functionId",
  validate(removeArtistFunctionSchema),
  artistFunctionController.remove,
);
