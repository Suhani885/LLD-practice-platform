import { Schema, model, type Document, type Types } from "mongoose";
import { applyIdTransform } from "../utils/mongoose";

export type Difficulty = "easy" | "medium" | "hard";

export interface ProblemDocument extends Document {
  _id: Types.ObjectId;
  slug: string;
  title: string;
  difficulty: Difficulty;
  tags: string[];
  summary: string;
  requirements: string[];
  constraints: string[];
  expectedEntities: string[];
  createdAt: Date;
  updatedAt: Date;
}

const problemSchema = new Schema<ProblemDocument>(
  {
    slug: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    title: { type: String, required: true },
    difficulty: { type: String, enum: ["easy", "medium", "hard"], required: true },
    tags: { type: [String], default: [] },
    summary: { type: String, required: true },
    requirements: { type: [String], default: [] },
    constraints: { type: [String], default: [] },
    expectedEntities: { type: [String], default: [] },
  },
  { timestamps: true },
);

applyIdTransform(problemSchema);

export const Problem = model<ProblemDocument>("Problem", problemSchema);
