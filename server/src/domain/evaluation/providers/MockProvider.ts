import type { EvaluationInput, LLMFeedback } from "../../types";
import type { FeedbackProvider } from "../FeedbackProvider";

export class MockProvider implements FeedbackProvider {
  async generateFeedback(input: EvaluationInput): Promise<LLMFeedback> {
    const { designModel, rationale, problem } = input;
    const entityNames = designModel.entities.map((e) => e.name).filter(Boolean);
    const strengths: string[] = [];
    const improvements: string[] = [];

    if (entityNames.length >= 3) {
      strengths.push(`Good decomposition into ${entityNames.length} distinct entities rather than one god class.`);
    } else {
      improvements.push(
        "Consider splitting responsibilities further - very few entities often means one class is doing too much.",
      );
    }

    if (designModel.relationships.some((r) => r.kind === "composition" || r.kind === "aggregation")) {
      strengths.push("Ownership relationships (composition/aggregation) are modeled explicitly, which clarifies lifecycle.");
    } else {
      improvements.push("No composition/aggregation relationships found - clarify which objects own or merely reference others.");
    }

    if (rationale.trim().length > 40) {
      strengths.push("The written rationale explains trade-offs, not just structure.");
    } else {
      improvements.push("Expand the rationale: explain why you split responsibilities this way and what alternative you rejected.");
    }

    if (strengths.length === 0) strengths.push("Submission received and structurally parsed successfully.");
    if (improvements.length === 0) improvements.push("Consider documenting how this design would extend to a new requirement.");

    const score = Math.min(
      100,
      Math.round(40 + entityNames.length * 8 + designModel.relationships.length * 6 + Math.min(rationale.length / 10, 20)),
    );

    return {
      summary: `Your solution to "${problem.title}" models ${entityNames.length} entities and ${designModel.relationships.length} relationship(s). ${
        score >= 70 ? "This is a solid structural foundation." : "The structure is a reasonable start but has clear gaps."
      }`,
      strengths,
      improvements,
      score,
    };
  }
}
