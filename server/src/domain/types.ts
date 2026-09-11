export type DesignEntityKind = "class" | "interface" | "enum";

export type RelationshipKind =
  | "association"
  | "aggregation"
  | "composition"
  | "inheritance"
  | "implementation";

export interface ClassMember {
  name: string;
  type: string;
}

export interface ClassMethod {
  name: string;
  signature: string;
}

export interface DesignEntity {
  kind: DesignEntityKind;
  name: string;
  fields: ClassMember[];
  methods: ClassMethod[];
  implementsOrExtends: string[];
  responsibility: string;
}

export interface ClassRelationship {
  fromClassName: string;
  toClassName: string;
  kind: RelationshipKind;
  label?: string;
}

export interface DesignModel {
  entities: DesignEntity[];
  relationships: ClassRelationship[];
}

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
  createdAt: Date;
}

export interface EvaluationInput {
  problem: {
    title: string;
    expectedEntities: string[];
  };
  designModel: DesignModel;
  rationale: string;
}
