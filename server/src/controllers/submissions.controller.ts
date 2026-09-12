import type { Request, Response } from "express";
import { AppError } from "../utils/AppError";
import { asyncHandler } from "../utils/asyncHandler";
import { submissionService } from "../services/SubmissionService";

export const createSubmission = asyncHandler(async (req: Request, res: Response) => {
  const { attemptId } = req.body ?? {};
  if (!attemptId) {
    throw new AppError("attemptId is required.", 400);
  }
  const submission = await submissionService.create(req.userId!, attemptId);
  res.status(201).json({ submission });
});

export const getSubmission = asyncHandler(async (req: Request, res: Response) => {
  const submission = await submissionService.getOwned(req.userId!, req.params.id);
  res.json({ submission });
});

export const listSubmissions = asyncHandler(async (req: Request, res: Response) => {
  const problemId = typeof req.query.problemId === "string" ? req.query.problemId : undefined;
  const submissions = await submissionService.listForUser(req.userId!, problemId);
  res.json({ submissions });
});
