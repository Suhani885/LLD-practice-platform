import { evaluationQueue } from "../jobs/EvaluationQueue";
import { Attempt } from "../models/Attempt";
import { Submission, type SubmissionDocument } from "../models/Submission";
import { AppError } from "../utils/AppError";

export class SubmissionService {
  async create(userId: string, attemptId: string): Promise<SubmissionDocument> {
    const attempt = await Attempt.findOne({ _id: attemptId, user: userId });
    if (!attempt) {
      throw new AppError("Attempt not found.", 404);
    }
    if (attempt.status !== "in_progress") {
      throw new AppError("This attempt has already been submitted.", 400);
    }
    if (attempt.designModel.entities.length === 0) {
      throw new AppError("Add at least one entity before submitting.", 400);
    }

    attempt.status = "submitted";
    await attempt.save();

    const submission = await Submission.create({
      attempt: attempt.id,
      problem: attempt.problem,
      user: userId,
      designModel: attempt.designModel,
      rationale: attempt.rationale,
    });

    evaluationQueue.enqueue(submission.id);
    return submission;
  }

  async getOwned(userId: string, submissionId: string): Promise<SubmissionDocument | null> {
    return Submission.findOne({ _id: submissionId, user: userId });
  }

  async listForUser(userId: string): Promise<SubmissionDocument[]> {
    return Submission.find({ user: userId }).sort({ createdAt: -1 });
  }
}

export const submissionService = new SubmissionService();
