import type { Attempt, DesignModel, Problem, Submission, User } from "./types";

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface RegisterInput extends AuthCredentials {
  name: string;
}

export interface AttemptDraftPatch {
  designModel?: DesignModel;
  rationale?: string;
}

export interface ApiClient {
  login(input: AuthCredentials): Promise<User>;
  register(input: RegisterInput): Promise<User>;
  logout(): Promise<void>;
  currentUser(): Promise<User | null>;

  listProblems(): Promise<Problem[]>;
  getProblem(problemIdOrSlug: string): Promise<Problem | null>;

  startAttempt(problemId: string, fromSubmissionId?: string): Promise<Attempt>;
  getAttempt(attemptId: string): Promise<Attempt | null>;
  saveAttemptDraft(attemptId: string, patch: AttemptDraftPatch): Promise<Attempt>;

  submitAttempt(attemptId: string): Promise<Submission>;
  getSubmission(submissionId: string): Promise<Submission | null>;

  listSubmissions(problemId?: string): Promise<Submission[]>;
}
