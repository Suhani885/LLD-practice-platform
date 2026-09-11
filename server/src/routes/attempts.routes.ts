import { Router } from "express";
import { getAttempt, saveAttemptDraft, startAttempt } from "../controllers/attempts.controller";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.use(requireAuth);

router.post("/", startAttempt);
router.get("/:id", getAttempt);
router.patch("/:id", saveAttemptDraft);

export default router;
