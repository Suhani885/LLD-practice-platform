import { env } from "../../config/env";
import { EvaluationPipeline } from "./EvaluationPipeline";
import { createFeedbackProvider } from "./providers";
import { RuleBasedStructuralEvaluator } from "./StructuralEvaluator";

export function createEvaluationPipeline(): EvaluationPipeline {
  return new EvaluationPipeline(new RuleBasedStructuralEvaluator(), createFeedbackProvider(env.groqApiKey, env.groqModel));
}

export { EvaluationPipeline } from "./EvaluationPipeline";
export type { FeedbackProvider } from "./FeedbackProvider";
export type { StructuralEvaluator } from "./StructuralEvaluator";
export { RuleBasedStructuralEvaluator } from "./StructuralEvaluator";
export { GroqProvider, MockProvider, createFeedbackProvider } from "./providers";
