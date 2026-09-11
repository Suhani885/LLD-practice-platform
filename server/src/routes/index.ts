import { Router } from "express";
import attemptsRoutes from "./attempts.routes";
import authRoutes from "./auth.routes";
import healthRoutes from "./health.routes";
import problemsRoutes from "./problems.routes";
import submissionsRoutes from "./submissions.routes";

const router = Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/problems", problemsRoutes);
router.use("/attempts", attemptsRoutes);
router.use("/submissions", submissionsRoutes);

export default router;
