import { Router } from "express";
import { denunciaController } from "../controllers/denuncia.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createDenunciaSchema } from "@jamfy/shared";

const denunciaRoutes: Router = Router();

denunciaRoutes.post(
  "/",
  authMiddleware,
  validate(createDenunciaSchema),
  denunciaController.create,
);

export { denunciaRoutes };
