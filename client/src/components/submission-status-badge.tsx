import { CheckCircle2, CircleX, Clock, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { SubmissionStatus } from "@/lib/api";

const CONFIG: Record<SubmissionStatus, { label: string; className: string; icon: typeof Clock }> = {
  pending: { label: "Pending", className: "bg-muted text-muted-foreground", icon: Clock },
  evaluating: { label: "Evaluating", className: "bg-info/10 text-info", icon: Loader2 },
  completed: { label: "Completed", className: "bg-success/10 text-success", icon: CheckCircle2 },
  failed: { label: "Failed", className: "bg-destructive/10 text-destructive", icon: CircleX },
};

export function SubmissionStatusBadge({ status }: { status: SubmissionStatus }) {
  const { label, className, icon: Icon } = CONFIG[status];
  return (
    <Badge className={cn("border-transparent gap-1", className)}>
      <Icon className={cn("size-3", status === "evaluating" && "animate-spin")} />
      {label}
    </Badge>
  );
}
