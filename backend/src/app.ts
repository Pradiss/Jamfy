import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { authRoutes } from "./routes/auth.routes.js";
import { artistProfileRoutes  } from  "./routes/artist-profile.routes.js"
import { errorMiddleware } from "./middlewares/error.middleware.js";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

app.get("/health", (_, res) => {
  return res.status(200).json({
    success: true,
    message: "API online",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/artist-profile", artistProfileRoutes);

app.use(errorMiddleware);

export { app };