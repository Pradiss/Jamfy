import { Router } from "express";
import { authController } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { loginSchema, registerSchema } from "../validations/auth.validation.js";

const authRoutes = Router();

authRoutes.post(
  "/register",
  validate(registerSchema),
  authController.register.bind(authController),
);

authRoutes.post(
  "/login",
  validate(loginSchema),
  authController.login.bind(authController),
);

authRoutes.get("/me", authMiddleware, authController.me.bind(authController));

authRoutes.post("/logout", authController.logout.bind(authController));

authRoutes.post("/refresh", authController.refresh.bind(authController));

export { authRoutes };
