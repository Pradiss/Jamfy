import { Router } from "express";
import { contratanteProfileController } from "../controllers/contratante-profile.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { upsertContratanteProfileSchema } from "@jamfy/shared";

const contratanteProfileRoutes: Router = Router();

contratanteProfileRoutes.use(authMiddleware);

contratanteProfileRoutes.get("/me", contratanteProfileController.me);

contratanteProfileRoutes.put(
  "/",
  validate(upsertContratanteProfileSchema),
  contratanteProfileController.upsert,
);

export { contratanteProfileRoutes };
