import type { ApiClient, AttemptDraftPatch, AuthCredentials, RegisterInput } from "./client";
import { PROBLEM_FIXTURES } from "./fixtures";
import {
  emptyDesignModel,
  type Attempt,
  type DeterministicCheck,
  type DeterministicReport,
  type EvaluationResult,
  type LLMFeedback,
  type Problem,
  type Submission,
  type User,
} from "./types";

const STORAGE_KEY = "lld-practice-mock-db";
const USER_STORAGE_KEY = "lld-practice-mock-user";
const DEMO_USER: User = { id: "user_demo", name: "Learner", email: "learner@example.com" };

interface MockDb {
  attempts: Attempt[];
  submissions: Submission[];
}

function loadDb(): MockDb {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as MockDb;
  } catch {
    // ignore
  }
  return { attempts: [], submissions: [] };
}

function saveDb(db: MockDb): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    // ignore
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function newId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID().slice(0, 8)}`;
}

function runDeterministicEvaluation(problem: Problem, model: Attempt["designModel"]): DeterministicReport {
  const modeledNames = new Set(model.entities.map((e) => e.name.trim().toLowerCase()));

  const entityChecks: DeterministicCheck[] = problem.expectedEntities.map((expected) => {
    const passed = modeledNames.has(expected.toLowerCase());
    return {
      id: `entity:${expected}`,
      label: `Models a "${expected}" entity`,
      passed,
      detail: passed
        ? `Found "${expected}" in your design.`
        : `No entity named "${expected}" (or a close match) was found.`,
    };
  });

  const hasRelationships = model.relationships.length > 0;
  const allEntitiesHaveResponsibility = model.entities.every((e) => e.responsibility.trim().length > 0);

  const hygieneChecks: DeterministicCheck[] = [
    {
      id: "hygiene:relationships",
      label: "Declares at least one relationship between entities",
      passed: hasRelationships,
      detail: hasRelationships
        ? `${model.relationships.length} relationship(s) declared.`
        : "No relationships declared - isolated classes usually signal a missing collaboration.",
    },
    {
      id: "hygiene:responsibility",
      label: "Every entity states its responsibility",
      passed: model.entities.length > 0 && allEntitiesHaveResponsibility,
      detail:
        model.entities.length === 0
          ? "No entities defined yet."
          : allEntitiesHaveResponsibility
            ? "Every entity has a one-line responsibility."
            : "One or more entities are missing a responsibility statement.",
    },
  ];

  const checks = [...entityChecks, ...hygieneChecks];
  const score = Math.round((checks.filter((c) => c.passed).length / checks.length) * 100);

  return { score, checks };
}

function runMockLlmFeedback(problem: Problem, model: Attempt["designModel"], rationale: string): LLMFeedback {
  const entityNames = model.entities.map((e) => e.name).filter(Boolean);
  const strengths: string[] = [];
  const improvements: string[] = [];

  if (entityNames.length >= 3) {
    strengths.push(`Good decomposition into ${entityNames.length} distinct entities rather than one god class.`);
  } else {
    improvements.push("Consider splitting responsibilities further - very few entities often means one class is doing too much.");
  }

  if (model.relationships.some((r) => r.kind === "composition" || r.kind === "aggregation")) {
    strengths.push("Ownership relationships (composition/aggregation) are modeled explicitly, which clarifies lifecycle.");
  } else {
    improvements.push("No composition/aggregation relationships found - clarify which objects own or merely reference others.");
  }

  if (rationale.trim().length > 40) {
    strengths.push("The written rationale explains trade-offs, not just structure - that's what separates a good LLD answer from a diagram dump.");
  } else {
    improvements.push("Expand the rationale: explain *why* you split responsibilities this way and what alternative you rejected.");
  }

  if (strengths.length === 0) strengths.push("Submission received and structurally parsed successfully.");
  if (improvements.length === 0) improvements.push("Consider documenting how this design would extend to a new requirement.");

  const score = Math.min(
    100,
    Math.round(40 + entityNames.length * 8 + model.relationships.length * 6 + Math.min(rationale.length / 10, 20)),
  );

  return {
    summary: `Your solution to "${problem.title}" models ${entityNames.length} entities and ${model.relationships.length} relationship(s). ${
      score >= 70 ? "This is a solid structural foundation." : "The structure is a reasonable start but has clear gaps."
    }`,
    strengths,
    improvements,
    score,
  };
}

export class MockApiClient implements ApiClient {
  private latencyMs = 350;

  async login(input: AuthCredentials): Promise<User> {
    await delay(this.latencyMs);
    if (!input.email || !input.password) {
      throw new Error("Email and password are required.");
    }
    const user: User = { ...DEMO_USER, email: input.email };
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    return user;
  }

  async register(input: RegisterInput): Promise<User> {
    await delay(this.latencyMs);
    if (!input.email || !input.password || !input.name) {
      throw new Error("Name, email, and password are required.");
    }
    const user: User = { id: newId("user"), name: input.name, email: input.email };
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    return user;
  }

  async logout(): Promise<void> {
    await delay(150);
    localStorage.removeItem(USER_STORAGE_KEY);
  }

  async currentUser(): Promise<User | null> {
    await delay(150);
    try {
      const raw = localStorage.getItem(USER_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  }

  async listProblems(): Promise<Problem[]> {
    await delay(this.latencyMs);
    return PROBLEM_FIXTURES;
  }

  async getProblem(problemIdOrSlug: string): Promise<Problem | null> {
    await delay(this.latencyMs);
    return (
      PROBLEM_FIXTURES.find((p) => p.id === problemIdOrSlug || p.slug === problemIdOrSlug) ?? null
    );
  }

  async startAttempt(problemId: string, fromSubmissionId?: string): Promise<Attempt> {
    await delay(this.latencyMs);
    const problem = PROBLEM_FIXTURES.find((p) => p.id === problemId);
    if (!problem) throw new Error(`Unknown problem: ${problemId}`);

    const db = loadDb();
    const existing = db.attempts.find(
      (a) => a.problemId === problemId && a.userId === DEMO_USER.id && a.status === "in_progress",
    );
    if (existing) return existing;

    let designModel = emptyDesignModel();
    let rationale = "";
    if (fromSubmissionId) {
      const source = db.submissions.find((s) => s.id === fromSubmissionId && s.problemId === problemId);
      if (source) {
        designModel = JSON.parse(JSON.stringify(source.designModel)) as typeof designModel;
        rationale = source.rationale;
      }
    }

    const now = new Date().toISOString();
    const attempt: Attempt = {
      id: newId("attempt"),
      problemId,
      userId: DEMO_USER.id,
      status: "in_progress",
      designModel,
      rationale,
      createdAt: now,
      updatedAt: now,
    };
    db.attempts.push(attempt);
    saveDb(db);
    return attempt;
  }

  async getAttempt(attemptId: string): Promise<Attempt | null> {
    await delay(this.latencyMs);
    const db = loadDb();
    return db.attempts.find((a) => a.id === attemptId) ?? null;
  }

  async saveAttemptDraft(attemptId: string, patch: AttemptDraftPatch): Promise<Attempt> {
    await delay(200);
    const db = loadDb();
    const attempt = db.attempts.find((a) => a.id === attemptId);
    if (!attempt) throw new Error(`Unknown attempt: ${attemptId}`);
    if (patch.designModel) attempt.designModel = patch.designModel;
    if (patch.rationale !== undefined) attempt.rationale = patch.rationale;
    attempt.updatedAt = new Date().toISOString();
    saveDb(db);
    return attempt;
  }

  async submitAttempt(attemptId: string): Promise<Submission> {
    await delay(this.latencyMs);
    const db = loadDb();
    const attempt = db.attempts.find((a) => a.id === attemptId);
    if (!attempt) throw new Error(`Unknown attempt: ${attemptId}`);

    attempt.status = "submitted";
    attempt.updatedAt = new Date().toISOString();

    const now = new Date().toISOString();
    const submission: Submission = {
      id: newId("submission"),
      attemptId: attempt.id,
      problemId: attempt.problemId,
      userId: attempt.userId,
      status: "pending",
      designModel: attempt.designModel,
      rationale: attempt.rationale,
      evaluation: null,
      createdAt: now,
      updatedAt: now,
    };
    db.submissions.push(submission);
    saveDb(db);

    this.runBackgroundEvaluation(submission.id);
    return submission;
  }

  async getSubmission(submissionId: string): Promise<Submission | null> {
    await delay(200);
    const db = loadDb();
    return db.submissions.find((s) => s.id === submissionId) ?? null;
  }

  async listSubmissions(problemId?: string): Promise<Submission[]> {
    await delay(this.latencyMs);
    const db = loadDb();
    return db.submissions
      .filter((s) => s.userId === DEMO_USER.id && (!problemId || s.problemId === problemId))
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }

  private runBackgroundEvaluation(submissionId: string): void {
    const setStatus = (status: Submission["status"], patch: Partial<Submission> = {}) => {
      const db = loadDb();
      const submission = db.submissions.find((s) => s.id === submissionId);
      if (!submission) return;
      Object.assign(submission, { status, updatedAt: new Date().toISOString() }, patch);
      saveDb(db);
    };

    setTimeout(() => setStatus("evaluating"), 600);

    setTimeout(() => {
      const db = loadDb();
      const submission = db.submissions.find((s) => s.id === submissionId);
      if (!submission) return;
      const problem = PROBLEM_FIXTURES.find((p) => p.id === submission.problemId);
      if (!problem) {
        setStatus("failed", { errorMessage: "Could not find the problem this submission belongs to." });
        return;
      }

      try {
        const deterministic = runDeterministicEvaluation(problem, submission.designModel);
        const llm = runMockLlmFeedback(problem, submission.designModel, submission.rationale);
        const overallScore = Math.round(deterministic.score * 0.5 + llm.score * 0.5);

        const evaluation: EvaluationResult = {
          deterministic,
          llm,
          overallScore,
          createdAt: new Date().toISOString(),
        };
        setStatus("completed", { evaluation });
      } catch (err) {
        setStatus("failed", {
          errorMessage: err instanceof Error ? err.message : "Evaluation failed unexpectedly.",
        });
      }
    }, 2200);
  }
}
