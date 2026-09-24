import { Router } from "express";
import multer from "multer";

import { portfolioController } from "../controllers/portfolio.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";

import {
  createPortfolioSchema,
  updatePortfolioSchema,
  portfolioIdSchema,
} from "@jamfy/shared";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
  fileFilter: (_req, file, callback) => {
    if (!file.mimetype.startsWith("image/") && !file.mimetype.startsWith("video/")) {
      callback(new Error("Apenas imagens ou vídeos são permitidos."));
      return;
    }

    callback(null, true);
  },
});

const portfolioRoutes: Router = Router();

portfolioRoutes.use(authMiddleware);

portfolioRoutes.get("/", portfolioController.list);

portfolioRoutes.post(
  "/upload",
  upload.single("file"),
  portfolioController.uploadItem,
);

portfolioRoutes.get(
  "/:id",
  validate(portfolioIdSchema),
  portfolioController.findById,
);

portfolioRoutes.post(
  "/",
  validate(createPortfolioSchema),
  portfolioController.create,
);

portfolioRoutes.put(
  "/:id",
  validate(updatePortfolioSchema),
  portfolioController.update,
);

portfolioRoutes.delete(
  "/:id",
  validate(portfolioIdSchema),
  portfolioController.delete,
);

portfolioRoutes.patch(
  "/:id/highlight",
  validate(portfolioIdSchema),
  portfolioController.setHighlight,
);

export { portfolioRoutes };