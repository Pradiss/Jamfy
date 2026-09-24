import { Router } from "express";

import { hiringRequestController } from "../controllers/hiring-request.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";

import {
  createHiringRequestSchema,
  hiringRequestIdSchema,
} from "@jamfy/shared";

const hiringRequestRoutes: Router = Router();

hiringRequestRoutes.use(authMiddleware);

hiringRequestRoutes.post(
  "/",
  validate(createHiringRequestSchema),
  hiringRequestController.create,
);

hiringRequestRoutes.get("/sent", hiringRequestController.listSent);

hiringRequestRoutes.get("/received", hiringRequestController.listReceived);

hiringRequestRoutes.get(
  "/:id",
  validate(hiringRequestIdSchema),
  hiringRequestController.findById,
);

hiringRequestRoutes.patch(
  "/:id/accept",
  validate(hiringRequestIdSchema),
  hiringRequestController.accept,
);

hiringRequestRoutes.patch(
  "/:id/decline",
  validate(hiringRequestIdSchema),
  hiringRequestController.decline,
);

hiringRequestRoutes.patch(
  "/:id/cancel",
  validate(hiringRequestIdSchema),
  hiringRequestController.cancel,
);

export { hiringRequestRoutes };
