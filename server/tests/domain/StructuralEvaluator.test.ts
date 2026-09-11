import { RuleBasedStructuralEvaluator } from "../../src/domain/evaluation/StructuralEvaluator";
import type { EvaluationInput } from "../../src/domain/types";

function baseInput(overrides: Partial<EvaluationInput> = {}): EvaluationInput {
  return {
    problem: { title: "Parking Lot System", expectedEntities: ["ParkingLot", "Ticket"] },
    designModel: { entities: [], relationships: [] },
    rationale: "",
    ...overrides,
  };
}

describe("RuleBasedStructuralEvaluator", () => {
  const evaluator = new RuleBasedStructuralEvaluator();

  it("scores 100 when every expected entity is modeled with relationships and responsibilities", () => {
    const input = baseInput({
      designModel: {
        entities: [
          { kind: "class", name: "ParkingLot", fields: [], methods: [], implementsOrExtends: [], responsibility: "Owns levels" },
          { kind: "class", name: "Ticket", fields: [], methods: [], implementsOrExtends: [], responsibility: "Tracks a session" },
        ],
        relationships: [{ fromClassName: "ParkingLot", toClassName: "Ticket", kind: "composition" }],
      },
    });

    const report = evaluator.evaluate(input);

    expect(report.score).toBe(100);
    expect(report.checks.every((c) => c.passed)).toBe(true);
  });

  it("scores 0 and fails every check on a completely empty design model", () => {
    const report = evaluator.evaluate(baseInput());

    expect(report.score).toBe(0);
    expect(report.checks.every((c) => !c.passed)).toBe(true);
  });

  it("matches expected entity names case-insensitively", () => {
    const input = baseInput({
      designModel: {
        entities: [{ kind: "class", name: "parkinglot", fields: [], methods: [], implementsOrExtends: [], responsibility: "x" }],
        relationships: [],
      },
    });

    const report = evaluator.evaluate(input);
    const check = report.checks.find((c) => c.id === "entity:ParkingLot");

    expect(check?.passed).toBe(true);
  });

  it("fails the responsibility hygiene check when any entity is missing a responsibility, even if others have one", () => {
    const input = baseInput({
      designModel: {
        entities: [
          { kind: "class", name: "ParkingLot", fields: [], methods: [], implementsOrExtends: [], responsibility: "Owns levels" },
          { kind: "class", name: "Ticket", fields: [], methods: [], implementsOrExtends: [], responsibility: "" },
        ],
        relationships: [],
      },
    });

    const report = evaluator.evaluate(input);
    const check = report.checks.find((c) => c.id === "hygiene:responsibility");

    expect(check?.passed).toBe(false);
  });

  it("fails the relationship hygiene check when entities exist but nothing connects them", () => {
    const input = baseInput({
      designModel: {
        entities: [{ kind: "class", name: "ParkingLot", fields: [], methods: [], implementsOrExtends: [], responsibility: "x" }],
        relationships: [],
      },
    });

    const report = evaluator.evaluate(input);
    const check = report.checks.find((c) => c.id === "hygiene:relationships");

    expect(check?.passed).toBe(false);
  });
});
