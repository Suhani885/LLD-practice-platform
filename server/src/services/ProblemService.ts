import mongoose from "mongoose";
import { Problem, type ProblemDocument } from "../models/Problem";

export class ProblemService {
  async list(): Promise<ProblemDocument[]> {
    return Problem.find().sort({ createdAt: 1 });
  }

  async getBySlugOrId(idOrSlug: string): Promise<ProblemDocument | null> {
    if (mongoose.isValidObjectId(idOrSlug)) {
      const byId = await Problem.findById(idOrSlug);
      if (byId) return byId;
    }
    return Problem.findOne({ slug: idOrSlug.toLowerCase() });
  }
}

export const problemService = new ProblemService();
