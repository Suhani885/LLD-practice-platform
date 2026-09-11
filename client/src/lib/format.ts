export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function scoreTone(score: number): "success" | "warning" | "destructive" {
  if (score >= 70) return "success";
  if (score >= 40) return "warning";
  return "destructive";
}
