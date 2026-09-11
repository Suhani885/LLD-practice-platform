import request from "supertest";
import { createApp } from "../../src/app";
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

describe("auth", () => {
  it("registers a user and never returns the password hash", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Ada Lovelace",
      email: "ada@example.com",
      password: "password123",
    });

    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe("ada@example.com");
    expect(res.body.user.passwordHash).toBeUndefined();
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  it("rejects registering the same email twice", async () => {
    await request(app).post("/api/auth/register").send({ name: "Ada", email: "dup@example.com", password: "password123" });
    const res = await request(app).post("/api/auth/register").send({ name: "Ada 2", email: "dup@example.com", password: "password123" });

    expect(res.status).toBe(409);
  });

  it("rejects a password shorter than 6 characters", async () => {
    const res = await request(app).post("/api/auth/register").send({ name: "Ada", email: "short@example.com", password: "123" });

    expect(res.status).toBe(400);
  });

  it("rejects login with a wrong password", async () => {
    await request(app).post("/api/auth/register").send({ name: "Ada", email: "wrongpw@example.com", password: "password123" });
    const res = await request(app).post("/api/auth/login").send({ email: "wrongpw@example.com", password: "not-the-password" });

    expect(res.status).toBe(401);
  });

  it("rejects login for a nonexistent email", async () => {
    const res = await request(app).post("/api/auth/login").send({ email: "nobody@example.com", password: "password123" });

    expect(res.status).toBe(401);
  });

  it("returns user: null from /me when not authenticated, without erroring", async () => {
    const res = await request(app).get("/api/auth/me");

    expect(res.status).toBe(200);
    expect(res.body.user).toBeNull();
  });

  it("keeps a session across requests via the cookie, and clears it on logout", async () => {
    const agent = request.agent(app);
    await agent.post("/api/auth/register").send({ name: "Ada", email: "session@example.com", password: "password123" });

    const me = await agent.get("/api/auth/me");
    expect(me.body.user.email).toBe("session@example.com");

    await agent.post("/api/auth/logout");
    const meAfterLogout = await agent.get("/api/auth/me");
    expect(meAfterLogout.body.user).toBeNull();
  });
});
