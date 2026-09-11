import { Schema, model, type Document, type Types } from "mongoose";
import { applyIdTransform } from "../utils/mongoose";
import { designModelSchema, emptyDesignModel } from "./designModel.schema";
import type { DesignModel } from "../domain/types";

export type AttemptStatus = "in_progress" | "submitted";

export interface AttemptDocument extends Document {
  _id: Types.ObjectId;
  problem: Types.ObjectId;
  user: Types.ObjectId;
  status: AttemptStatus;
  designModel: DesignModel;
  rationale: string;
  createdAt: Date;
  updatedAt: Date;
}

const attemptSchema = new Schema<AttemptDocument>(
  {
    problem: { type: Schema.Types.ObjectId, ref: "Problem", required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    status: { type: String, enum: ["in_progress", "submitted"], default: "in_progress" },
    designModel: { type: designModelSchema, default: emptyDesignModel },
    rationale: { type: String, default: "" },
  },
  { timestamps: true },
);

attemptSchema.index({ user: 1, problem: 1, status: 1 });

applyIdTransform(attemptSchema, { problem: "problemId", user: "userId" });

export const Attempt = model<AttemptDocument>("Attempt", attemptSchema);
