import { Blocks, Car, MoveVertical, Package, type LucideIcon } from "lucide-react";
import type { Difficulty } from "@/lib/api";

const PROBLEM_ICONS: Record<string, LucideIcon> = {
  "parking-lot": Car,
  "elevator-system": MoveVertical,
  "vending-machine": Package,
};

export function getProblemIcon(slug: string): LucideIcon {
  return PROBLEM_ICONS[slug] ?? Blocks;
}

const DIFFICULTY_ACCENT: Record<Difficulty, { bg: string; fg: string }> = {
  easy: { bg: "bg-success/10", fg: "text-success" },
  medium: { bg: "bg-warning/10", fg: "text-warning" },
  hard: { bg: "bg-destructive/10", fg: "text-destructive" },
};

export function getDifficultyAccent(difficulty: Difficulty): { bg: string; fg: string } {
  return DIFFICULTY_ACCENT[difficulty];
}
