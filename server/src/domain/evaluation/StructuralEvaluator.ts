import type { DesignModel, DeterministicCheck, DeterministicReport, EvaluationInput } from "../types";

export interface StructuralEvaluator {
  evaluate(input: EvaluationInput): DeterministicReport;
}

export class RuleBasedStructuralEvaluator implements StructuralEvaluator {
  evaluate(input: EvaluationInput): DeterministicReport {
    const checks = [
      ...this.checkExpectedEntities(input.problem.expectedEntities, input.designModel),
      ...this.checkHygiene(input.designModel),
    ];

    const score = checks.length === 0 ? 0 : Math.round((checks.filter((c) => c.passed).length / checks.length) * 100);

    return { score, checks };
  }

  private checkExpectedEntities(expectedEntities: string[], model: DesignModel): DeterministicCheck[] {
    const modeledNames = new Set(model.entities.map((e) => e.name.trim().toLowerCase()));

    return expectedEntities.map((expected) => {
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
  }

  private checkHygiene(model: DesignModel): DeterministicCheck[] {
    const hasRelationships = model.relationships.length > 0;
    const allEntitiesHaveResponsibility = model.entities.every((e) => e.responsibility.trim().length > 0);

    return [
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
  }
}
