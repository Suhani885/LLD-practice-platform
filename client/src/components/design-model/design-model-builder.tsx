import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DesignModel } from "@/lib/api";
import { EntityEditor } from "./entity-editor";
import { RelationshipEditor } from "./relationship-editor";

interface DesignModelBuilderProps {
  value: DesignModel;
  onChange: (next: DesignModel) => void;
}

export function DesignModelBuilder({ value, onChange }: DesignModelBuilderProps) {
  const entityNames = value.entities.map((e) => e.name).filter(Boolean);

  function addEntity() {
    onChange({
      ...value,
      entities: [
        ...value.entities,
        {
          id: crypto.randomUUID(),
          kind: "class",
          name: "",
          fields: [],
          methods: [],
          implementsOrExtends: [],
          responsibility: "",
        },
      ],
    });
  }

  function removeEntity(id: string) {
    const removed = value.entities.find((e) => e.id === id);
    onChange({
      entities: value.entities.filter((e) => e.id !== id),
      relationships: removed
        ? value.relationships.filter((r) => r.fromClassName !== removed.name && r.toClassName !== removed.name)
        : value.relationships,
    });
  }

  function addRelationship() {
    onChange({
      ...value,
      relationships: [
        ...value.relationships,
        {
          id: crypto.randomUUID(),
          fromClassName: entityNames[0] ?? "",
          toClassName: entityNames[1] ?? entityNames[0] ?? "",
          kind: "association",
          label: "",
        },
      ],
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Entities</CardTitle>
            <Button size="sm" onClick={addEntity}>
              <Plus className="size-4" /> Add entity
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {value.entities.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No entities yet. Add the classes/interfaces your design needs.
            </p>
          )}
          {value.entities.map((entity, i) => (
            <EntityEditor
              key={entity.id}
              entity={entity}
              onChange={(next) =>
                onChange({ ...value, entities: value.entities.map((e) => (e.id === entity.id ? next : e)) })
              }
              onRemove={() => removeEntity(entity.id)}
              defaultOpen={i === value.entities.length - 1 && entity.name === ""}
            />
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Relationships</CardTitle>
            <Button size="sm" onClick={addRelationship} disabled={entityNames.length < 1}>
              <Plus className="size-4" /> Add relationship
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {entityNames.length < 2 && value.relationships.length === 0 && (
            <p className="text-sm text-muted-foreground">Add at least two named entities to relate them.</p>
          )}
          {value.relationships.map((rel) => (
            <RelationshipEditor
              key={rel.id}
              relationship={rel}
              entityNames={entityNames}
              onChange={(next) =>
                onChange({
                  ...value,
                  relationships: value.relationships.map((r) => (r.id === rel.id ? next : r)),
                })
              }
              onRemove={() =>
                onChange({ ...value, relationships: value.relationships.filter((r) => r.id !== rel.id) })
              }
            />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
