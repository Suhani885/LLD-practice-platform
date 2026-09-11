import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Difficulty } from "@/lib/api";

const STYLES: Record<Difficulty, string> = {
  easy: "bg-success/10 text-success",
  medium: "bg-warning/10 text-warning",
  hard: "bg-destructive/10 text-destructive",
};

const LABELS: Record<Difficulty, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  return <Badge className={cn("border-transparent", STYLES[difficulty])}>{LABELS[difficulty]}</Badge>;
}
