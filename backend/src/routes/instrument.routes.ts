import { Router } from "express";
import { instrumentController } from "../controllers/instrument.controller.js";


const instrumentRoutes = Router();



instrumentRoutes.get("/", instrumentController.list);
instrumentRoutes.get("/:id", instrumentController.findById);



instrumentRoutes.post("/", instrumentController.create);
instrumentRoutes.put("/:id", instrumentController.update);
instrumentRoutes.delete("/:id", instrumentController.delete);

export { instrumentRoutes };