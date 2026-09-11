import type { ApiClient, AttemptDraftPatch, AuthCredentials, RegisterInput } from "./client";
import type { Attempt, Problem, Submission, User } from "./types";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });

  const body = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(body?.error?.message ?? `Request failed with status ${res.status}`);
  }

  return body as T;
}

export class HttpApiClient implements ApiClient {
  async login(input: AuthCredentials): Promise<User> {
    const { user } = await request<{ user: User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(input),
    });
    return user;
  }

  async register(input: RegisterInput): Promise<User> {
    const { user } = await request<{ user: User }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(input),
    });
    return user;
  }

  async logout(): Promise<void> {
    await request<null>("/auth/logout", { method: "POST" });
  }

  async currentUser(): Promise<User | null> {
    const { user } = await request<{ user: User | null }>("/auth/me");
    return user;
  }

  async listProblems(): Promise<Problem[]> {
    const { problems } = await request<{ problems: Problem[] }>("/problems");
    return problems;
  }

  async getProblem(problemIdOrSlug: string): Promise<Problem | null> {
    const { problem } = await request<{ problem: Problem | null }>(`/problems/${problemIdOrSlug}`);
    return problem;
  }

  async startAttempt(problemId: string): Promise<Attempt> {
    const { attempt } = await request<{ attempt: Attempt }>("/attempts", {
      method: "POST",
      body: JSON.stringify({ problemId }),
    });
    return attempt;
  }

  async getAttempt(attemptId: string): Promise<Attempt | null> {
    const { attempt } = await request<{ attempt: Attempt | null }>(`/attempts/${attemptId}`);
    return attempt;
  }

  async saveAttemptDraft(attemptId: string, patch: AttemptDraftPatch): Promise<Attempt> {
    const { attempt } = await request<{ attempt: Attempt }>(`/attempts/${attemptId}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    });
    return attempt;
  }

  async submitAttempt(attemptId: string): Promise<Submission> {
    const { submission } = await request<{ submission: Submission }>("/submissions", {
      method: "POST",
      body: JSON.stringify({ attemptId }),
    });
    return submission;
  }

  async getSubmission(submissionId: string): Promise<Submission | null> {
    const { submission } = await request<{ submission: Submission | null }>(`/submissions/${submissionId}`);
    return submission;
  }

  async listSubmissions(): Promise<Submission[]> {
    const { submissions } = await request<{ submissions: Submission[] }>("/submissions");
    return submissions;
  }
}
