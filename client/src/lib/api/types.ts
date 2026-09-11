export type ID = string;

export type Difficulty = "easy" | "medium" | "hard";

export interface Problem {
  id: ID;
  slug: string;
  title: string;
  difficulty: Difficulty;
  tags: string[];
  summary: string;
  requirements: string[];
  constraints: string[];
  expectedEntities: string[];
}

export interface ClassMember {
  name: string;
  type: string;
}

export interface ClassMethod {
  name: string;
  signature: string;
}

export type RelationshipKind =
  | "association"
  | "aggregation"
  | "composition"
  | "inheritance"
  | "implementation";

export interface ClassRelationship {
  id: ID;
  fromClassName: string;
  toClassName: string;
  kind: RelationshipKind;
  label?: string;
}

export type DesignEntityKind = "class" | "interface" | "enum";

export interface DesignEntity {
  id: ID;
  kind: DesignEntityKind;
  name: string;
  fields: ClassMember[];
  methods: ClassMethod[];
  implementsOrExtends: string[];
  responsibility: string;
}

export interface DesignModel {
  entities: DesignEntity[];
  relationships: ClassRelationship[];
}

export function emptyDesignModel(): DesignModel {
  return { entities: [], relationships: [] };
}

export type AttemptStatus = "in_progress" | "submitted";

export interface Attempt {
  id: ID;
  problemId: ID;
  userId: ID;
  status: AttemptStatus;
  designModel: DesignModel;
  rationale: string;
  createdAt: string;
  updatedAt: string;
}

export type SubmissionStatus = "pending" | "evaluating" | "completed" | "failed";

export interface DeterministicCheck {
  id: string;
  label: string;
  passed: boolean;
  detail: string;
}

export interface DeterministicReport {
  score: number;
  checks: DeterministicCheck[];
}

export interface LLMFeedback {
  summary: string;
  strengths: string[];
  improvements: string[];
  score: number;
}

export interface EvaluationResult {
  deterministic: DeterministicReport;
  llm: LLMFeedback | null;
  overallScore: number;
  createdAt: string;
}

export interface Submission {
  id: ID;
  attemptId: ID;
  problemId: ID;
  userId: ID;
  status: SubmissionStatus;
  designModel: DesignModel;
  rationale: string;
  errorMessage?: string;
  evaluation: EvaluationResult | null;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: ID;
  name: string;
  email: string;
}
