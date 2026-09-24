import { Router } from "express";

import { notificationController } from "../controllers/notification.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";

import {
  listNotificationsQuerySchema,
  notificationIdSchema,
} from "@jamfy/shared";

const notificationRoutes: Router = Router();

notificationRoutes.use(authMiddleware);

notificationRoutes.get(
  "/",
  validate(listNotificationsQuerySchema),
  notificationController.list,
);

notificationRoutes.patch(
  "/read-all",
  notificationController.markAllAsRead,
);

notificationRoutes.patch(
  "/:id/read",
  validate(notificationIdSchema),
  notificationController.markAsRead,
);

export { notificationRoutes };
