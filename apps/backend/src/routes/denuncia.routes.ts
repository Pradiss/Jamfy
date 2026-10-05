import { Router } from "express";
import { denunciaController } from "../controllers/denuncia.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { denunciaRateLimit } from "../middlewares/rate-limit.middleware.js";
import { createDenunciaSchema } from "@jamfy/shared";

const denunciaRoutes: Router = Router();

denunciaRoutes.post(
  "/",
  authMiddleware,
  denunciaRateLimit,
  validate(createDenunciaSchema),
  denunciaController.create,
);

export { denunciaRoutes };
