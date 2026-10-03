import { Router } from "express";
import { anuncioController } from "../controllers/anuncio.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { optionalAuthMiddleware } from "../middlewares/optional-auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";

import {
  createAnuncioSchema,
  updateAnuncioSchema,
  anuncioIdSchema,
  listAnunciosQuerySchema,
} from "@jamfy/shared";

const anuncioRoutes: Router = Router();

anuncioRoutes.get(
  "/",
  validate(listAnunciosQuerySchema),
  anuncioController.list,
);

anuncioRoutes.get("/me", authMiddleware, anuncioController.listMine);

anuncioRoutes.post(
  "/",
  authMiddleware,
  validate(createAnuncioSchema),
  anuncioController.create,
);

anuncioRoutes.get(
  "/:id",
  optionalAuthMiddleware,
  anuncioController.findById,
);

anuncioRoutes.put(
  "/:id",
  authMiddleware,
  validate(updateAnuncioSchema),
  anuncioController.update,
);

anuncioRoutes.delete(
  "/:id",
  authMiddleware,
  validate(anuncioIdSchema),
  anuncioController.remove,
);

export { anuncioRoutes };
