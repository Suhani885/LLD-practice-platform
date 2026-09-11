import { Router } from "express";
import { createSubmission, getSubmission, listSubmissions } from "../controllers/submissions.controller";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.use(requireAuth);

router.post("/", createSubmission);
router.get("/", listSubmissions);
router.get("/:id", getSubmission);

export default router;
