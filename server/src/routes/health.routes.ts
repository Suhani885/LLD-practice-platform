import { Router } from "express";
import mongoose from "mongoose";

const router = Router();

router.get("/", (_req, res) => {
  res.json({
    status: "ok",
    uptimeSeconds: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

const CONNECTION_STATE_NAMES: Record<number, string> = {
  0: "disconnected",
  1: "connected",
  2: "connecting",
  3: "disconnecting",
};

router.get("/db", (_req, res) => {
  res.json({ db: CONNECTION_STATE_NAMES[mongoose.connection.readyState] ?? "unknown" });
});

export default router;
