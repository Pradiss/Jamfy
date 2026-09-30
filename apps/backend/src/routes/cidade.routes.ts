import { Router } from "express";
import { cidadeController } from "../controllers/cidade.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { listCidadesQuerySchema } from "@jamfy/shared";

const cidadeRoutes: Router = Router();

cidadeRoutes.get(
  "/",
  validate(listCidadesQuerySchema),
  cidadeController.listByUf,
);

export { cidadeRoutes };
