import { beforeEach, describe, expect, it } from "vitest";
import { MockApiClient } from "./mockClient";
import { PROBLEM_FIXTURES } from "./fixtures";
import type { Submission } from "./types";

async function waitForCompletion(client: MockApiClient, submissionId: string): Promise<Submission> {
  let settled = (await client.getSubmission(submissionId))!;
  for (let i = 0; i < 30 && settled.status !== "completed"; i++) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    settled = (await client.getSubmission(submissionId))!;
  }
  return settled;
}

describe("MockApiClient", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("requires an email and password to log in", async () => {
    const client = new MockApiClient();
    await expect(client.login({ email: "", password: "" })).rejects.toThrow();
  });

  it("returns null from currentUser before any login", async () => {
    const client = new MockApiClient();
    await expect(client.currentUser()).resolves.toBeNull();
  });

  it("resumes the same in-progress attempt instead of creating a duplicate", async () => {
    const client = new MockApiClient();
    const problem = PROBLEM_FIXTURES[0];

    const first = await client.startAttempt(problem.id);
    const second = await client.startAttempt(problem.id);

    expect(second.id).toBe(first.id);
  });

  it("rejects saving a draft for an attempt that does not exist", async () => {
    const client = new MockApiClient();
    await expect(client.saveAttemptDraft("does-not-exist", { rationale: "x" })).rejects.toThrow();
  });

  it("runs a submission through pending to a completed evaluation with a plausible score", async () => {
    const client = new MockApiClient();
    const problem = PROBLEM_FIXTURES[0];
    const attempt = await client.startAttempt(problem.id);

    await client.saveAttemptDraft(attempt.id, {
      designModel: {
        entities: [
          { id: "e1", kind: "class", name: problem.expectedEntities[0], fields: [], methods: [], implementsOrExtends: [], responsibility: "Owns the core flow" },
        ],
        relationships: [],
      },
      rationale: "Kept it minimal for the first pass.",
    });

    const submission = await client.submitAttempt(attempt.id);
    expect(submission.status).toBe("pending");

    const settled = await waitForCompletion(client, submission.id);

    expect(settled.status).toBe("completed");
    expect(settled.evaluation).not.toBeNull();
    expect(settled.evaluation!.overallScore).toBeGreaterThanOrEqual(0);
    expect(settled.evaluation!.overallScore).toBeLessThanOrEqual(100);
    expect(settled.evaluation!.deterministic.checks.some((c) => c.passed)).toBe(true);
  }, 10000);

  it("keeps submissions scoped to the current demo user across listSubmissions", async () => {
    const client = new MockApiClient();
    const problem = PROBLEM_FIXTURES[0];
    const attempt = await client.startAttempt(problem.id);
    await client.saveAttemptDraft(attempt.id, {
      designModel: { entities: [{ id: "e1", kind: "class", name: "X", fields: [], methods: [], implementsOrExtends: [], responsibility: "x" }], relationships: [] },
    });
    await client.submitAttempt(attempt.id);

    const history = await client.listSubmissions();
    expect(history).toHaveLength(1);
    expect(history[0].attemptId).toBe(attempt.id);
  });

  it("filters listSubmissions to a single problem when given a problemId", async () => {
    const client = new MockApiClient();
    const [problemA, problemB] = PROBLEM_FIXTURES;

    for (const problem of [problemA, problemB]) {
      const attempt = await client.startAttempt(problem.id);
      await client.saveAttemptDraft(attempt.id, {
        designModel: { entities: [{ id: "e1", kind: "class", name: "X", fields: [], methods: [], implementsOrExtends: [], responsibility: "x" }], relationships: [] },
      });
      await client.submitAttempt(attempt.id);
    }

    const filtered = await client.listSubmissions(problemA.id);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].problemId).toBe(problemA.id);
  });

  it("pre-fills a fresh attempt from a previous submission's design when retrying", async () => {
    const client = new MockApiClient();
    const problem = PROBLEM_FIXTURES[0];
    const attempt = await client.startAttempt(problem.id);
    await client.saveAttemptDraft(attempt.id, {
      designModel: {
        entities: [{ id: "e1", kind: "class", name: "ParkingLot", fields: [], methods: [], implementsOrExtends: [], responsibility: "Owns levels" }],
        relationships: [],
      },
      rationale: "First pass.",
    });
    const submission = await client.submitAttempt(attempt.id);
    await waitForCompletion(client, submission.id);

    const retry = await client.startAttempt(problem.id, submission.id);

    expect(retry.id).not.toBe(attempt.id);
    expect(retry.rationale).toBe("First pass.");
    expect(retry.designModel.entities).toHaveLength(1);
    expect(retry.designModel.entities[0].name).toBe("ParkingLot");
  });
});
