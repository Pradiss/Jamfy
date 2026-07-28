import { Router } from "express";

import { portfolioController } from "../controllers/portfolio.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";

import {
  createPortfolioSchema,
  updatePortfolioSchema,
  portfolioIdSchema,
} from "../validations/portfolio.validation.js";

const portfolioRoutes = Router();

portfolioRoutes.use(authMiddleware);

portfolioRoutes.get("/", portfolioController.list);

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