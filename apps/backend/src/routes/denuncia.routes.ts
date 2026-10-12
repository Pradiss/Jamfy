import { Router } from "express";
import { denunciaController } from "../controllers/denuncia.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { adminMiddleware } from "../middlewares/admin.middlewares.js";
import { validate } from "../middlewares/validate.middleware.js";
import { denunciaRateLimit } from "../middlewares/rate-limit.middleware.js";
import {
  createDenunciaSchema,
  listDenunciasQuerySchema,
  updateDenunciaStatusSchema,
} from "@jamfy/shared";

const denunciaRoutes: Router = Router();

denunciaRoutes.post(
  "/",
  authMiddleware,
  denunciaRateLimit,
  validate(createDenunciaSchema),
  denunciaController.create,
);

// Admin-only: review and act on reported content/users. There's no admin
// panel yet (deferred until after launch — see catalog routes for the same
// pattern), so these are meant to be called directly (curl/Postman) by an
// account whose `tipo` was set to ADMIN via Prisma Studio.
denunciaRoutes.get(
  "/",
  authMiddleware,
  adminMiddleware,
  validate(listDenunciasQuerySchema),
  denunciaController.list,
);

denunciaRoutes.patch(
  "/:id",
  authMiddleware,
  adminMiddleware,
  validate(updateDenunciaStatusSchema),
  denunciaController.updateStatus,
);

export { denunciaRoutes };
