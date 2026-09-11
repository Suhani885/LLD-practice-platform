import { beforeEach, describe, expect, it } from "vitest";
import { MockApiClient } from "./mockClient";
import { PROBLEM_FIXTURES } from "./fixtures";

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

    let settled = submission;
    for (let i = 0; i < 30 && settled.status !== "completed"; i++) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      settled = (await client.getSubmission(submission.id))!;
    }

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
});
