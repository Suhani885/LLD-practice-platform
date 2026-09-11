import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Express } from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import { errorHandler, notFound } from "./middleware/errorHandler";
import router from "./routes";

export function createApp(): Express {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.corsOrigin, credentials: true }));
  app.use(express.json());
  app.use(cookieParser());

  if (env.nodeEnv !== "test") {
    app.use(morgan(env.nodeEnv === "development" ? "dev" : "combined"));
  }

  app.use("/api", router);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
