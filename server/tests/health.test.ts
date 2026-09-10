import request from "supertest";
import { createApp } from "../src/app";

describe("GET /api/health", () => {
  const app = createApp();

  it("returns 200 with status ok", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });

  it("includes a timestamp and uptime", async () => {
    const res = await request(app).get("/api/health");
    expect(typeof res.body.timestamp).toBe("string");
    expect(typeof res.body.uptimeSeconds).toBe("number");
  });
});

describe("unknown routes", () => {
  it("returns 404 with a helpful error message", async () => {
    const app = createApp();
    const res = await request(app).get("/api/this-route-does-not-exist");
    expect(res.status).toBe(404);
    expect(res.body.error.message).toContain("Route not found");
  });
});
