import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError";

export function notFound(req: Request, res: Response): void {
  res.status(404).json({ error: { message: `Route not found: ${req.method} ${req.originalUrl}` } });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: { message: err.message } });
    return;
  }

  console.error("[error]", err);
  const message = err instanceof Error ? err.message : "Internal server error";
  const exposeDetail = process.env.NODE_ENV !== "production";
  res.status(500).json({ error: { message: exposeDetail ? message : "Internal server error" } });
}
