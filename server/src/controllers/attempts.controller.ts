import type { Request, Response } from "express";
import { attemptService } from "../services/AttemptService";
import { AppError } from "../utils/AppError";
import { asyncHandler } from "../utils/asyncHandler";

export const startAttempt = asyncHandler(async (req: Request, res: Response) => {
  const { problemId } = req.body ?? {};
  if (!problemId) {
    throw new AppError("problemId is required.", 400);
  }
  const attempt = await attemptService.startOrResume(req.userId!, problemId);
  res.status(201).json({ attempt });
});

export const getAttempt = asyncHandler(async (req: Request, res: Response) => {
  const attempt = await attemptService.getOwned(req.userId!, req.params.id);
  res.json({ attempt });
});

export const saveAttemptDraft = asyncHandler(async (req: Request, res: Response) => {
  const { designModel, rationale } = req.body ?? {};
  const attempt = await attemptService.saveDraft(req.userId!, req.params.id, { designModel, rationale });
  res.json({ attempt });
});
