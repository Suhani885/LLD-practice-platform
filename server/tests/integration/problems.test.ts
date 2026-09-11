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

async function seedProblem() {
  return Problem.create({
    slug: "parking-lot",
    title: "Parking Lot System",
    difficulty: "medium",
    summary: "Design a parking lot.",
    requirements: ["Support multiple vehicle types."],
    constraints: [],
    expectedEntities: ["ParkingLot", "Ticket"],
  });
}

describe("problems", () => {
  it("lists seeded problems", async () => {
    await seedProblem();
    const res = await request(app).get("/api/problems");

    expect(res.status).toBe(200);
    expect(res.body.problems).toHaveLength(1);
    expect(res.body.problems[0].slug).toBe("parking-lot");
  });

  it("finds a problem by slug", async () => {
    await seedProblem();
    const res = await request(app).get("/api/problems/parking-lot");

    expect(res.status).toBe(200);
    expect(res.body.problem.title).toBe("Parking Lot System");
  });

  it("finds a problem by id", async () => {
    const problem = await seedProblem();
    const res = await request(app).get(`/api/problems/${problem.id}`);

    expect(res.body.problem.slug).toBe("parking-lot");
  });

  it("returns problem: null for an unknown slug instead of erroring", async () => {
    const res = await request(app).get("/api/problems/does-not-exist");

    expect(res.status).toBe(200);
    expect(res.body.problem).toBeNull();
  });
});
