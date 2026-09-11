import { connectDB, disconnectDB } from "../config/db";
import { Problem } from "../models/Problem";
import { PROBLEM_SEEDS } from "./problems.data";

async function main(): Promise<void> {
  await connectDB();

  for (const seed of PROBLEM_SEEDS) {
    await Problem.findOneAndUpdate({ slug: seed.slug }, seed, { upsert: true, new: true, setDefaultsOnInsert: true });
    console.log(`[seed] upserted problem: ${seed.slug}`);
  }

  await disconnectDB();
  console.log(`[seed] done (${PROBLEM_SEEDS.length} problems)`);
}

main().catch((err) => {
  console.error("[seed] failed", err);
  process.exit(1);
});
