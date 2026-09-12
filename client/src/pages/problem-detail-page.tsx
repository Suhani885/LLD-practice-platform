import { ArrowLeft, ArrowRight, Loader2, RotateCcw, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { DifficultyBadge } from "@/components/difficulty-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api, type Problem, type Submission } from "@/lib/api";
import { getDifficultyAccent, getProblemIcon } from "@/lib/problem-visuals";
import { cn } from "@/lib/utils";

export function ProblemDetailPage() {
  const { problemSlug = "" } = useParams();
  const navigate = useNavigate();
  const [problem, setProblem] = useState<Problem | null | undefined>(undefined);
  const [submissions, setSubmissions] = useState<Submission[] | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    setProblem(undefined);
    setSubmissions(null);
    api.getProblem(problemSlug).then(setProblem);
  }, [problemSlug]);

  useEffect(() => {
    if (!problem) return;
    api.listSubmissions(problem.id).then(setSubmissions);
  }, [problem]);

  async function handleStart(fromSubmissionId?: string) {
    if (!problem) return;
    setIsStarting(true);
    try {
      const attempt = await api.startAttempt(problem.id, fromSubmissionId);
      navigate(`/attempts/${attempt.id}`);
    } finally {
      setIsStarting(false);
    }
  }

  if (problem === undefined) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (problem === null) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
          <h2 className="text-lg font-medium">Problem not found</h2>
          <Button render={<Link to="/problems" />}>Back to problems</Button>
        </CardContent>
      </Card>
    );
  }

  const Icon = getProblemIcon(problem.slug);
  const accent = getDifficultyAccent(problem.difficulty);

  const completed = submissions?.filter((s) => s.status === "completed" && s.evaluation) ?? [];
  const bestScore = completed.length ? Math.max(...completed.map((s) => s.evaluation!.overallScore)) : null;
  const lastSubmission = submissions?.[0];
  const hasHistory = (submissions?.length ?? 0) > 0;

  return (
    <>
      <Link to="/problems" className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Back to problems
      </Link>

      <div className="bg-mesh mb-6 flex flex-col gap-5 rounded-2xl border px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div className="flex items-start gap-4">
          <div className={cn("flex size-12 shrink-0 items-center justify-center rounded-xl", accent.bg)}>
            <Icon className={cn("size-6", accent.fg)} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{problem.title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <DifficultyBadge difficulty={problem.difficulty} />
              {problem.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-stretch gap-2 sm:items-end">
          {hasHistory && (
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>Attempted {submissions!.length}×</span>
              {bestScore !== null && (
                <span className="flex items-center gap-1 font-medium text-success">
                  <Trophy className="size-3.5" /> Best: {bestScore}/100
                </span>
              )}
            </div>
          )}
          <div className="flex gap-2">
            {hasHistory && lastSubmission && (
              <Button variant="outline" onClick={() => handleStart(lastSubmission.id)} disabled={isStarting}>
                <RotateCcw className="size-4" /> Continue from last
              </Button>
            )}
            <Button onClick={() => handleStart()} disabled={isStarting} size="lg" className="shrink-0">
              {isStarting ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
              {hasHistory ? "Start fresh" : "Start attempt"}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{problem.summary}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
              {problem.requirements.map((req, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-primary">•</span>
                  {req}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Constraints</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
              {problem.constraints.map((c, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-primary">•</span>
                  {c}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
