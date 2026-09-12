import request from "supertest";
import { createApp } from "../../src/app";
import { Problem } from "../../src/models/Problem";
import { clearTestDb, connectTestDb, disconnectTestDb } from "../utils/testDb";

const app = createApp();

beforeAll(async () => {
  await connectTestDb();
}, 30000);

afterEach(async () => {
  await clearTestDb();
});

afterAll(async () => {
  await disconnectTestDb();
});

async function registeredAgent(email: string) {
  const agent = request.agent(app);
  await agent.post("/api/auth/register").send({ name: "Learner", email, password: "password123" });
  return agent;
}

async function seedProblem() {
  return Problem.create({
    slug: "vending-machine",
    title: "Vending Machine",
    difficulty: "easy",
    summary: "Design a vending machine.",
    requirements: [],
    constraints: [],
    expectedEntities: ["VendingMachine"],
  });
}

async function waitForCompletion(agent: ReturnType<typeof request.agent>, submissionId: string) {
  for (let i = 0; i < 20; i++) {
    const res = await agent.get(`/api/submissions/${submissionId}`);
    if (res.body.submission.status === "completed" || res.body.submission.status === "failed") {
      return res.body.submission;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error("submission did not settle in time");
}

describe("submissions", () => {
  it("rejects submitting an attempt with no entities modeled", async () => {
    const agent = await registeredAgent("empty@example.com");
    const problem = await seedProblem();
    const { body } = await agent.post("/api/attempts").send({ problemId: problem.id });

    const res = await agent.post("/api/submissions").send({ attemptId: body.attempt.id });

    expect(res.status).toBe(400);
  });

  it("runs a submission through pending to a completed evaluation using the mock feedback provider", async () => {
    const agent = await registeredAgent("full@example.com");
    const problem = await seedProblem();
    const { body: attemptRes } = await agent.post("/api/attempts").send({ problemId: problem.id });

    await agent.patch(`/api/attempts/${attemptRes.attempt.id}`).send({
      designModel: {
        entities: [{ kind: "class", name: "VendingMachine", fields: [], methods: [], implementsOrExtends: [], responsibility: "Runs the machine" }],
        relationships: [],
      },
      rationale: "Kept it simple for the first pass.",
    });

    const submitRes = await agent.post("/api/submissions").send({ attemptId: attemptRes.attempt.id });
    expect(submitRes.status).toBe(201);
    expect(submitRes.body.submission.status).toBe("pending");

    const settled = await waitForCompletion(agent, submitRes.body.submission.id);

    expect(settled.status).toBe("completed");
    expect(settled.evaluation.deterministic.score).toBeGreaterThan(0);
    expect(settled.evaluation.llm).not.toBeNull();
    expect(typeof settled.evaluation.overallScore).toBe("number");
  });

  it("marks the attempt as submitted so it cannot be submitted twice", async () => {
    const agent = await registeredAgent("twice@example.com");
    const problem = await seedProblem();
    const { body: attemptRes } = await agent.post("/api/attempts").send({ problemId: problem.id });
    await agent.patch(`/api/attempts/${attemptRes.attempt.id}`).send({
      designModel: { entities: [{ kind: "class", name: "X", fields: [], methods: [], implementsOrExtends: [], responsibility: "x" }], relationships: [] },
    });

    const first = await agent.post("/api/submissions").send({ attemptId: attemptRes.attempt.id });
    expect(first.status).toBe(201);

    const second = await agent.post("/api/submissions").send({ attemptId: attemptRes.attempt.id });
    expect(second.status).toBe(400);
  });

  it("keeps each user's history isolated from other users", async () => {
    const agentA = await registeredAgent("historyA@example.com");
    const agentB = await registeredAgent("historyB@example.com");
    const problem = await seedProblem();
    const { body: attemptRes } = await agentA.post("/api/attempts").send({ problemId: problem.id });
    await agentA.patch(`/api/attempts/${attemptRes.attempt.id}`).send({
      designModel: { entities: [{ kind: "class", name: "X", fields: [], methods: [], implementsOrExtends: [], responsibility: "x" }], relationships: [] },
    });
    await agentA.post("/api/submissions").send({ attemptId: attemptRes.attempt.id });

    const historyA = await agentA.get("/api/submissions");
    const historyB = await agentB.get("/api/submissions");

    expect(historyA.body.submissions).toHaveLength(1);
    expect(historyB.body.submissions).toHaveLength(0);
  });

  it("filters history to a single problem when problemId is given", async () => {
    const agent = await registeredAgent("filter@example.com");
    const problemA = await seedProblem();
    const problemB = await Problem.create({
      slug: "library-management",
      title: "Library Management System",
      difficulty: "easy",
      summary: "Design a library system.",
      requirements: [],
      constraints: [],
      expectedEntities: ["Library"],
    });

    for (const problem of [problemA, problemB]) {
      const { body: attemptRes } = await agent.post("/api/attempts").send({ problemId: problem.id });
      await agent.patch(`/api/attempts/${attemptRes.attempt.id}`).send({
        designModel: { entities: [{ kind: "class", name: "X", fields: [], methods: [], implementsOrExtends: [], responsibility: "x" }], relationships: [] },
      });
      await agent.post("/api/submissions").send({ attemptId: attemptRes.attempt.id });
    }

    const filtered = await agent.get(`/api/submissions?problemId=${problemA.id}`);

    expect(filtered.body.submissions).toHaveLength(1);
    expect(filtered.body.submissions[0].problemId).toBe(problemA.id);
  });

  it("does not let one user read another user's submission", async () => {
    const agentA = await registeredAgent("ownerSub@example.com");
    const agentB = await registeredAgent("intruderSub@example.com");
    const problem = await seedProblem();
    const { body: attemptRes } = await agentA.post("/api/attempts").send({ problemId: problem.id });
    await agentA.patch(`/api/attempts/${attemptRes.attempt.id}`).send({
      designModel: { entities: [{ kind: "class", name: "X", fields: [], methods: [], implementsOrExtends: [], responsibility: "x" }], relationships: [] },
    });
    const submitRes = await agentA.post("/api/submissions").send({ attemptId: attemptRes.attempt.id });

    const res = await agentB.get(`/api/submissions/${submitRes.body.submission.id}`);

    expect(res.status).toBe(200);
    expect(res.body.submission).toBeNull();
  });

  it("marks the submission failed with a clear message if the problem behind it disappears mid-evaluation", async () => {
    const agent = await registeredAgent("vanish@example.com");
    const problem = await seedProblem();
    const { body: attemptRes } = await agent.post("/api/attempts").send({ problemId: problem.id });
    await agent.patch(`/api/attempts/${attemptRes.attempt.id}`).send({
      designModel: { entities: [{ kind: "class", name: "X", fields: [], methods: [], implementsOrExtends: [], responsibility: "x" }], relationships: [] },
    });

    await Problem.deleteOne({ _id: problem.id });

    const submitRes = await agent.post("/api/submissions").send({ attemptId: attemptRes.attempt.id });
    const settled = await waitForCompletion(agent, submitRes.body.submission.id);

    expect(settled.status).toBe("failed");
    expect(settled.errorMessage).toMatch(/no longer exists/i);
  });
});
