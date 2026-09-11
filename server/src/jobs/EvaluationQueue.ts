import { createEvaluationPipeline, type EvaluationPipeline } from "../domain/evaluation";
import { Problem } from "../models/Problem";
import { Submission } from "../models/Submission";

export class EvaluationQueue {
  private readonly pipeline: EvaluationPipeline;

  constructor(pipeline: EvaluationPipeline = createEvaluationPipeline()) {
    this.pipeline = pipeline;
  }

  enqueue(submissionId: string): void {
    void this.process(submissionId);
  }

  private async process(submissionId: string): Promise<void> {
    const submission = await Submission.findById(submissionId);
    if (!submission) return;

    submission.status = "evaluating";
    await submission.save();

    try {
      const problem = await Problem.findById(submission.problem);
      if (!problem) {
        throw new Error("The problem this submission belongs to no longer exists.");
      }

      const result = await this.pipeline.run({
        problem: { title: problem.title, expectedEntities: problem.expectedEntities },
        designModel: submission.designModel,
        rationale: submission.rationale,
      });

      submission.status = "completed";
      submission.evaluation = result;
      await submission.save();
    } catch (err) {
      submission.status = "failed";
      submission.errorMessage = err instanceof Error ? err.message : "Evaluation failed unexpectedly.";
      await submission.save();
    }
  }
}

export const evaluationQueue = new EvaluationQueue();
