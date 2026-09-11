import { Router } from "express";
import { getProblem, listProblems } from "../controllers/problems.controller";

const router = Router();

router.get("/", listProblems);
router.get("/:idOrSlug", getProblem);

export default router;
