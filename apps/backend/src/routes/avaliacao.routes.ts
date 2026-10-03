import { Router } from "express";
import { avaliacaoController } from "../controllers/avaliacao.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createAvaliacaoSchema, listAvaliacoesQuerySchema } from "@jamfy/shared";

const avaliacaoRoutes: Router = Router();

avaliacaoRoutes.get(
  "/",
  validate(listAvaliacoesQuerySchema),
  avaliacaoController.listByArtist,
);

avaliacaoRoutes.post(
  "/",
  authMiddleware,
  validate(createAvaliacaoSchema),
  avaliacaoController.create,
);

export { avaliacaoRoutes };
