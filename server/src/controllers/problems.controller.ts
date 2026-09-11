import type { Request, Response } from "express";
import { problemService } from "../services/ProblemService";
import { asyncHandler } from "../utils/asyncHandler";

export const listProblems = asyncHandler(async (_req: Request, res: Response) => {
  const problems = await problemService.list();
  res.json({ problems });
});

export const getProblem = asyncHandler(async (req: Request, res: Response) => {
  const problem = await problemService.getBySlugOrId(req.params.idOrSlug);
  res.json({ problem });
});
