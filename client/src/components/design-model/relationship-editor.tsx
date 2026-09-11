import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ClassRelationship, RelationshipKind } from "@/lib/api";

const KIND_LABELS: Record<RelationshipKind, string> = {
  association: "Association",
  aggregation: "Aggregation",
  composition: "Composition",
  inheritance: "Inheritance",
  implementation: "Implementation",
};

interface RelationshipEditorProps {
  relationship: ClassRelationship;
  entityNames: string[];
  onChange: (next: ClassRelationship) => void;
  onRemove: () => void;
}

export function RelationshipEditor({ relationship, entityNames, onChange, onRemove }: RelationshipEditorProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border p-2.5">
      <EntitySelect
        value={relationship.fromClassName}
        entityNames={entityNames}
        onChange={(v) => onChange({ ...relationship, fromClassName: v })}
      />

      <Select
        value={relationship.kind}
        onValueChange={(v) => v && onChange({ ...relationship, kind: v as RelationshipKind })}
      >
        <SelectTrigger size="sm" className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(KIND_LABELS).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <EntitySelect
        value={relationship.toClassName}
        entityNames={entityNames}
        onChange={(v) => onChange({ ...relationship, toClassName: v })}
      />

      <Input
        value={relationship.label ?? ""}
        onChange={(e) => onChange({ ...relationship, label: e.target.value })}
        placeholder="label (optional)"
        className="min-w-32 flex-1"
      />

      <Button variant="ghost" size="icon-sm" onClick={onRemove} aria-label="Remove relationship">
        <Trash2 className="size-3.5 text-destructive" />
      </Button>
    </div>
  );
}

function EntitySelect({
  value,
  entityNames,
  onChange,
}: {
  value: string;
  entityNames: string[];
  onChange: (v: string) => void;
}) {
  return (
    <Select value={value} onValueChange={(v) => v && onChange(v)}>
      <SelectTrigger size="sm" className="w-40">
        <SelectValue placeholder="Select entity" />
      </SelectTrigger>
      <SelectContent>
        {entityNames.map((name) => (
          <SelectItem key={name} value={name}>
            {name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
