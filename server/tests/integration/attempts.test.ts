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

describe("attempts", () => {
  it("requires authentication", async () => {
    const res = await request(app).post("/api/attempts").send({ problemId: "irrelevant" });
    expect(res.status).toBe(401);
  });

  it("starts a new attempt for a valid problem", async () => {
    const agent = await registeredAgent("a@example.com");
    const problem = await seedProblem();

    const res = await agent.post("/api/attempts").send({ problemId: problem.id });

    expect(res.status).toBe(201);
    expect(res.body.attempt.status).toBe("in_progress");
    expect(res.body.attempt.problemId).toBe(problem.id);
    expect(res.body.attempt.designModel).toEqual({ entities: [], relationships: [] });
  });

  it("resumes the same in-progress attempt instead of creating a duplicate", async () => {
    const agent = await registeredAgent("b@example.com");
    const problem = await seedProblem();

    const first = await agent.post("/api/attempts").send({ problemId: problem.id });
    const second = await agent.post("/api/attempts").send({ problemId: problem.id });

    expect(second.body.attempt.id).toBe(first.body.attempt.id);
  });

  it("saves a draft with entities and rationale", async () => {
    const agent = await registeredAgent("c@example.com");
    const problem = await seedProblem();
    const { body } = await agent.post("/api/attempts").send({ problemId: problem.id });

    const res = await agent.patch(`/api/attempts/${body.attempt.id}`).send({
      designModel: {
        entities: [{ kind: "class", name: "VendingMachine", fields: [], methods: [], implementsOrExtends: [], responsibility: "x" }],
        relationships: [],
      },
      rationale: "Because.",
    });

    expect(res.status).toBe(200);
    expect(res.body.attempt.rationale).toBe("Because.");
    expect(res.body.attempt.designModel.entities).toHaveLength(1);
  });

  it("saves a draft containing a freshly-added entity/field/method that has no name yet", async () => {
    const agent = await registeredAgent("blank@example.com");
    const problem = await seedProblem();
    const { body } = await agent.post("/api/attempts").send({ problemId: problem.id });

    const res = await agent.patch(`/api/attempts/${body.attempt.id}`).send({
      designModel: {
        entities: [
          {
            kind: "class",
            name: "",
            fields: [{ name: "", type: "" }],
            methods: [{ name: "", signature: "" }],
            implementsOrExtends: [],
            responsibility: "",
          },
        ],
        relationships: [],
      },
    });

    expect(res.status).toBe(200);
    expect(res.body.attempt.designModel.entities).toHaveLength(1);
    expect(res.body.attempt.designModel.entities[0].name).toBe("");
  });

  it("does not let one user read another user's attempt", async () => {
    const agentA = await registeredAgent("owner@example.com");
    const agentB = await registeredAgent("intruder@example.com");
    const problem = await seedProblem();
    const { body } = await agentA.post("/api/attempts").send({ problemId: problem.id });

    const res = await agentB.get(`/api/attempts/${body.attempt.id}`);

    expect(res.status).toBe(200);
    expect(res.body.attempt).toBeNull();
  });

  it("rejects a 404 problemId with a clear error instead of a raw cast error", async () => {
    const agent = await registeredAgent("d@example.com");
    const res = await agent.post("/api/attempts").send({ problemId: "000000000000000000000000" });

    expect(res.status).toBe(404);
  });

  it("pre-fills a fresh attempt from a previous submission when fromSubmissionId is given", async () => {
    const agent = await registeredAgent("retry@example.com");
    const problem = await seedProblem();

    const first = await agent.post("/api/attempts").send({ problemId: problem.id });
    const designModel = {
      entities: [{ kind: "class", name: "VendingMachine", fields: [], methods: [], implementsOrExtends: [], responsibility: "Runs the machine" }],
      relationships: [],
    };
    await agent.patch(`/api/attempts/${first.body.attempt.id}`).send({ designModel, rationale: "First pass." });
    const submission = await agent.post("/api/submissions").send({ attemptId: first.body.attempt.id });

    const retry = await agent.post("/api/attempts").send({ problemId: problem.id, fromSubmissionId: submission.body.submission.id });

    expect(retry.status).toBe(201);
    expect(retry.body.attempt.id).not.toBe(first.body.attempt.id);
    expect(retry.body.attempt.rationale).toBe("First pass.");
    expect(retry.body.attempt.designModel.entities).toHaveLength(1);
    expect(retry.body.attempt.designModel.entities[0].name).toBe("VendingMachine");
  });

  it("ignores a fromSubmissionId that doesn't belong to the requesting user", async () => {
    const owner = await registeredAgent("srcowner@example.com");
    const intruder = await registeredAgent("srcintruder@example.com");
    const problem = await seedProblem();

    const ownerAttempt = await owner.post("/api/attempts").send({ problemId: problem.id });
    await owner.patch(`/api/attempts/${ownerAttempt.body.attempt.id}`).send({
      designModel: { entities: [{ kind: "class", name: "X", fields: [], methods: [], implementsOrExtends: [], responsibility: "x" }], relationships: [] },
    });
    const ownerSubmission = await owner.post("/api/submissions").send({ attemptId: ownerAttempt.body.attempt.id });

    const res = await intruder
      .post("/api/attempts")
      .send({ problemId: problem.id, fromSubmissionId: ownerSubmission.body.submission.id });

    expect(res.status).toBe(201);
    expect(res.body.attempt.designModel.entities).toHaveLength(0);
  });
});
