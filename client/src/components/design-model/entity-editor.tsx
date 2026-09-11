import { ChevronDown, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { ClassMember, ClassMethod, DesignEntity, DesignEntityKind } from "@/lib/api";

const KIND_LABELS: Record<DesignEntityKind, string> = {
  class: "Class",
  interface: "Interface",
  enum: "Enum",
};

interface EntityEditorProps {
  entity: DesignEntity;
  onChange: (next: DesignEntity) => void;
  onRemove: () => void;
  defaultOpen?: boolean;
}

export function EntityEditor({ entity, onChange, onRemove, defaultOpen }: EntityEditorProps) {
  const [open, setOpen] = useState(defaultOpen ?? false);

  function updateField(index: number, patch: Partial<ClassMember>) {
    const fields = entity.fields.map((f, i) => (i === index ? { ...f, ...patch } : f));
    onChange({ ...entity, fields });
  }

  function updateMethod(index: number, patch: Partial<ClassMethod>) {
    const methods = entity.methods.map((m, i) => (i === index ? { ...m, ...patch } : m));
    onChange({ ...entity, methods });
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="rounded-lg border">
        <div className="flex items-center gap-2 p-3">
          <CollapsibleTrigger
            render={<Button variant="ghost" size="icon-sm" />}
          >
            <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} />
          </CollapsibleTrigger>

          <Select
            value={entity.kind}
            onValueChange={(v) => v && onChange({ ...entity, kind: v as DesignEntityKind })}
          >
            <SelectTrigger size="sm" className="w-28 shrink-0">
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

          <Input
            value={entity.name}
            onChange={(e) => onChange({ ...entity, name: e.target.value })}
            placeholder="EntityName"
            className="max-w-52 font-medium"
          />

          <Input
            value={entity.responsibility}
            onChange={(e) => onChange({ ...entity, responsibility: e.target.value })}
            placeholder="One-line responsibility"
            className="flex-1"
          />

          <Button variant="ghost" size="icon-sm" onClick={onRemove} aria-label={`Remove ${entity.name || "entity"}`}>
            <Trash2 className="size-4 text-destructive" />
          </Button>
        </div>

        <CollapsibleContent>
          <div className="flex flex-col gap-4 border-t p-3">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <Label>Fields</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onChange({ ...entity, fields: [...entity.fields, { name: "", type: "" }] })}
                >
                  <Plus className="size-3.5" /> Add field
                </Button>
              </div>
              <div className="flex flex-col gap-2">
                {entity.fields.map((field, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      value={field.name}
                      onChange={(e) => updateField(i, { name: e.target.value })}
                      placeholder="name"
                      className="flex-1"
                    />
                    <Input
                      value={field.type}
                      onChange={(e) => updateField(i, { type: e.target.value })}
                      placeholder="type"
                      className="flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onChange({ ...entity, fields: entity.fields.filter((_, fi) => fi !== i) })}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                ))}
                {entity.fields.length === 0 && <p className="text-xs text-muted-foreground">No fields yet.</p>}
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <Label>Methods</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    onChange({ ...entity, methods: [...entity.methods, { name: "", signature: "" }] })
                  }
                >
                  <Plus className="size-3.5" /> Add method
                </Button>
              </div>
              <div className="flex flex-col gap-2">
                {entity.methods.map((method, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      value={method.name}
                      onChange={(e) => updateMethod(i, { name: e.target.value })}
                      placeholder="name"
                      className="flex-1"
                    />
                    <Input
                      value={method.signature}
                      onChange={(e) => updateMethod(i, { signature: e.target.value })}
                      placeholder="(params): ReturnType"
                      className="flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onChange({ ...entity, methods: entity.methods.filter((_, mi) => mi !== i) })}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                ))}
                {entity.methods.length === 0 && <p className="text-xs text-muted-foreground">No methods yet.</p>}
              </div>
            </div>

            <div>
              <Label htmlFor={`implements-${entity.id}`}>Implements / extends</Label>
              <Input
                id={`implements-${entity.id}`}
                className="mt-2"
                value={entity.implementsOrExtends.join(", ")}
                onChange={(e) =>
                  onChange({
                    ...entity,
                    implementsOrExtends: e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
                placeholder="e.g. PricingStrategy, Comparable"
              />
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
