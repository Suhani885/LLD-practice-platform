import type { EvaluationInput, EvaluationResult, LLMFeedback } from "../types";
import type { FeedbackProvider } from "./FeedbackProvider";
import type { StructuralEvaluator } from "./StructuralEvaluator";

export class EvaluationPipeline {
  constructor(
    private readonly structuralEvaluator: StructuralEvaluator,
    private readonly feedbackProvider: FeedbackProvider,
  ) {}

  async run(input: EvaluationInput): Promise<EvaluationResult> {
    const deterministic = this.structuralEvaluator.evaluate(input);
    const llm = await this.tryGenerateFeedback(input);

    const overallScore = llm ? Math.round(deterministic.score * 0.5 + llm.score * 0.5) : deterministic.score;

    return {
      deterministic,
      llm,
      overallScore,
      createdAt: new Date(),
    };
  }

  private async tryGenerateFeedback(input: EvaluationInput): Promise<LLMFeedback | null> {
    try {
      return await this.feedbackProvider.generateFeedback(input);
    } catch (err) {
      console.error("[evaluation] feedback provider failed, degrading to deterministic-only result:", err);
      return null;
    }
  }
}
