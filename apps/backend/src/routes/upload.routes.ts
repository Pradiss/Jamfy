import { Router } from "express";
import multer from "multer";

import { uploadController } from "../controllers/upload.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (_req, file, callback) => {
    if (!file.mimetype.startsWith("image/")) {
      callback(new Error("Apenas arquivos de imagem são permitidos."));
      return;
    }

    callback(null, true);
  },
});

const uploadRoutes: Router = Router();

uploadRoutes.use(authMiddleware);

uploadRoutes.post(
  "/avatar",
  upload.single("file"),
  uploadController.avatar,
);

uploadRoutes.post(
  "/cover",
  upload.single("file"),
  uploadController.cover,
);

export { uploadRoutes };
