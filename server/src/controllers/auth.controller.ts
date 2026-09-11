import type { Request, Response } from "express";
import { env } from "../config/env";
import { COOKIE_NAME } from "../middleware/auth";
import { authService } from "../services/AuthService";
import { asyncHandler } from "../utils/asyncHandler";
import { verifyToken } from "../utils/jwt";

const COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function setAuthCookie(res: Response, token: string): void {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.nodeEnv === "production",
    sameSite: env.nodeEnv === "production" ? "none" : "lax",
    maxAge: COOKIE_MAX_AGE_MS,
  });
}

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body ?? {};
  const { user, token } = await authService.register(name, email, password);
  setAuthCookie(res, token);
  res.status(201).json({ user });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body ?? {};
  const { user, token } = await authService.login(email, password);
  setAuthCookie(res, token);
  res.json({ user });
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  res.clearCookie(COOKIE_NAME);
  res.status(204).end();
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) {
    res.json({ user: null });
    return;
  }

  try {
    const { userId } = verifyToken(token);
    const user = await authService.getUserById(userId);
    res.json({ user });
  } catch {
    res.json({ user: null });
  }
});
