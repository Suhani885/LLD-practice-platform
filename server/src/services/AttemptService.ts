import { Attempt, type AttemptDocument } from "../models/Attempt";
import { Problem } from "../models/Problem";
import type { DesignModel } from "../domain/types";
import { AppError } from "../utils/AppError";

export interface AttemptDraftPatch {
  designModel?: DesignModel;
  rationale?: string;
}

export class AttemptService {
  async startOrResume(userId: string, problemId: string): Promise<AttemptDocument> {
    const problem = await Problem.findById(problemId);
    if (!problem) {
      throw new AppError("Problem not found.", 404);
    }

    const existing = await Attempt.findOne({ user: userId, problem: problemId, status: "in_progress" });
    if (existing) return existing;

    return Attempt.create({ user: userId, problem: problemId });
  }

  async getOwned(userId: string, attemptId: string): Promise<AttemptDocument | null> {
    return Attempt.findOne({ _id: attemptId, user: userId });
  }

  async saveDraft(userId: string, attemptId: string, patch: AttemptDraftPatch): Promise<AttemptDocument> {
    const attempt = await this.getOwned(userId, attemptId);
    if (!attempt) {
      throw new AppError("Attempt not found.", 404);
    }
    if (attempt.status !== "in_progress") {
      throw new AppError("This attempt has already been submitted.", 400);
    }

    if (patch.designModel) attempt.designModel = patch.designModel;
    if (patch.rationale !== undefined) attempt.rationale = patch.rationale;
    await attempt.save();
    return attempt;
  }
}

export const attemptService = new AttemptService();
