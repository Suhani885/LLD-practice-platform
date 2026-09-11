import { EvaluationPipeline } from "../../src/domain/evaluation/EvaluationPipeline";
import type { FeedbackProvider } from "../../src/domain/evaluation/FeedbackProvider";
import type { StructuralEvaluator } from "../../src/domain/evaluation/StructuralEvaluator";
import type { EvaluationInput } from "../../src/domain/types";

const input: EvaluationInput = {
  problem: { title: "Vending Machine", expectedEntities: ["VendingMachine"] },
  designModel: { entities: [], relationships: [] },
  rationale: "",
};

function fakeEvaluator(score: number): StructuralEvaluator {
  return { evaluate: () => ({ score, checks: [] }) };
}

describe("EvaluationPipeline", () => {
  it("blends deterministic and AI scores 50/50 on the happy path", async () => {
    const provider: FeedbackProvider = {
      generateFeedback: async () => ({ summary: "ok", strengths: [], improvements: [], score: 80 }),
    };
    const pipeline = new EvaluationPipeline(fakeEvaluator(40), provider);

    const result = await pipeline.run(input);

    expect(result.deterministic.score).toBe(40);
    expect(result.llm?.score).toBe(80);
    expect(result.overallScore).toBe(60);
  });

  it("degrades gracefully to a deterministic-only result when the feedback provider fails", async () => {
    const provider: FeedbackProvider = {
      generateFeedback: async () => {
        throw new Error("Groq API request failed: 503");
      },
    };
    const pipeline = new EvaluationPipeline(fakeEvaluator(55), provider);

    const result = await pipeline.run(input);

    expect(result.llm).toBeNull();
    expect(result.overallScore).toBe(55);
    expect(result.deterministic.score).toBe(55);
  });

  it("never throws even when the feedback provider throws", async () => {
    const provider: FeedbackProvider = {
      generateFeedback: async () => {
        throw new Error("network timeout");
      },
    };
    const pipeline = new EvaluationPipeline(fakeEvaluator(10), provider);

    await expect(pipeline.run(input)).resolves.not.toThrow();
  });
});
