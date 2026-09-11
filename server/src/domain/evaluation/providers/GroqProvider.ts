import type { EvaluationInput, LLMFeedback } from "../../types";
import type { FeedbackProvider } from "../FeedbackProvider";

const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";

const SYSTEM_PROMPT = `You review Low-Level Design (LLD) submissions from learners practicing object-oriented design.
You are given a problem statement, the entities/relationships the learner modeled, and their written rationale.
Judge responsibility assignment, cohesion/coupling, and whether the rationale shows real trade-off reasoning - not just whether the diagram looks complete (a separate deterministic check already covers structural coverage).
Respond with ONLY a JSON object matching this exact shape, no markdown fences, no extra text:
{"summary": string, "strengths": string[], "improvements": string[], "score": number}
"score" is 0-100. "strengths" and "improvements" must each have 1-4 short, specific bullet points.`;

function buildUserPrompt(input: EvaluationInput): string {
  const { problem, designModel, rationale } = input;

  const entities = designModel.entities
    .map((e) => {
      const fields = e.fields.map((f) => `${f.name}: ${f.type}`).join(", ") || "none";
      const methods = e.methods.map((m) => `${m.name}${m.signature}`).join(", ") || "none";
      const implementsOrExtends = e.implementsOrExtends.join(", ") || "none";
      return `- ${e.kind} ${e.name} (implements/extends: ${implementsOrExtends})\n  responsibility: ${e.responsibility || "(not stated)"}\n  fields: ${fields}\n  methods: ${methods}`;
    })
    .join("\n");

  const relationships = designModel.relationships
    .map((r) => `- ${r.fromClassName} --${r.kind}--> ${r.toClassName}${r.label ? ` (${r.label})` : ""}`)
    .join("\n");

  return [
    `Problem: ${problem.title}`,
    `Expected entities (for context, already checked deterministically): ${problem.expectedEntities.join(", ")}`,
    "",
    "Entities:",
    entities || "(none modeled)",
    "",
    "Relationships:",
    relationships || "(none modeled)",
    "",
    `Rationale: ${rationale || "(none provided)"}`,
  ].join("\n");
}

export class GroqProvider implements FeedbackProvider {
  constructor(
    private readonly apiKey: string,
    private readonly model: string,
  ) {}

  async generateFeedback(input: EvaluationInput): Promise<LLMFeedback> {
    const response = await fetch(GROQ_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        temperature: 0.3,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: buildUserPrompt(input) },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API request failed: ${response.status} ${await response.text()}`);
    }

    const body = (await response.json()) as { choices?: { message?: { content?: string } }[] };
    const content = body.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("Groq API returned no content");
    }

    const parsed = JSON.parse(content) as Partial<LLMFeedback>;
    if (
      typeof parsed.summary !== "string" ||
      !Array.isArray(parsed.strengths) ||
      !Array.isArray(parsed.improvements) ||
      typeof parsed.score !== "number"
    ) {
      throw new Error("Groq API returned an unexpected response shape");
    }

    return {
      summary: parsed.summary,
      strengths: parsed.strengths,
      improvements: parsed.improvements,
      score: Math.max(0, Math.min(100, Math.round(parsed.score))),
    };
  }
}
