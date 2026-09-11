import { Schema } from "mongoose";
import type { DeterministicCheck, DeterministicReport, EvaluationResult, LLMFeedback } from "../domain/types";

const deterministicCheckSchema = new Schema<DeterministicCheck>(
  {
    id: { type: String, required: true },
    label: { type: String, required: true },
    passed: { type: Boolean, required: true },
    detail: { type: String, required: true },
  },
  { _id: false },
);

const deterministicReportSchema = new Schema<DeterministicReport>(
  {
    score: { type: Number, required: true },
    checks: { type: [deterministicCheckSchema], default: [] },
  },
  { _id: false },
);

const llmFeedbackSchema = new Schema<LLMFeedback>(
  {
    summary: { type: String, required: true },
    strengths: { type: [String], default: [] },
    improvements: { type: [String], default: [] },
    score: { type: Number, required: true },
  },
  { _id: false },
);

export const evaluationResultSchema = new Schema<EvaluationResult>(
  {
    deterministic: { type: deterministicReportSchema, required: true },
    llm: { type: llmFeedbackSchema, default: null },
    overallScore: { type: Number, required: true },
    createdAt: { type: Date, default: () => new Date() },
  },
  { _id: false },
);
