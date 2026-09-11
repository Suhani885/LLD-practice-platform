import { Schema, model, type Document, type Types } from "mongoose";
import { applyIdTransform } from "../utils/mongoose";
import { designModelSchema } from "./designModel.schema";
import { evaluationResultSchema } from "./evaluationResult.schema";
import type { DesignModel, EvaluationResult } from "../domain/types";

export type SubmissionStatus = "pending" | "evaluating" | "completed" | "failed";

export interface SubmissionDocument extends Document {
  _id: Types.ObjectId;
  attempt: Types.ObjectId;
  problem: Types.ObjectId;
  user: Types.ObjectId;
  status: SubmissionStatus;
  designModel: DesignModel;
  rationale: string;
  errorMessage?: string;
  evaluation: EvaluationResult | null;
  createdAt: Date;
  updatedAt: Date;
}

const submissionSchema = new Schema<SubmissionDocument>(
  {
    attempt: { type: Schema.Types.ObjectId, ref: "Attempt", required: true, index: true },
    problem: { type: Schema.Types.ObjectId, ref: "Problem", required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    status: { type: String, enum: ["pending", "evaluating", "completed", "failed"], default: "pending" },
    designModel: { type: designModelSchema, required: true },
    rationale: { type: String, default: "" },
    errorMessage: { type: String },
    evaluation: { type: evaluationResultSchema, default: null },
  },
  { timestamps: true },
);

submissionSchema.index({ user: 1, createdAt: -1 });

applyIdTransform(submissionSchema, { attempt: "attemptId", problem: "problemId", user: "userId" });

export const Submission = model<SubmissionDocument>("Submission", submissionSchema);
