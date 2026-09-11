import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError";
import { verifyToken } from "../utils/jwt";

const COOKIE_NAME = "token";

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) {
    next(new AppError("Not authenticated", 401));
    return;
  }

  try {
    const { userId } = verifyToken(token);
    req.userId = userId;
    next();
  } catch {
    next(new AppError("Invalid or expired session", 401));
  }
}

export { COOKIE_NAME };
