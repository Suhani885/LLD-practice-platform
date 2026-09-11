import type { EvaluationInput, LLMFeedback } from "../types";

export interface FeedbackProvider {
  generateFeedback(input: EvaluationInput): Promise<LLMFeedback>;
}
