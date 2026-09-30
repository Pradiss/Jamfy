import { Router } from "express";
import { functionController } from "../controllers/function.controller.js";

const functionRoutes: Router = Router();

functionRoutes.get("/", functionController.list);

export { functionRoutes };
