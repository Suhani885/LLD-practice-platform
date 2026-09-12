import { ArrowRight, ListChecks, Sparkles, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DifficultyBadge } from "@/components/difficulty-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api, type Problem, type Submission } from "@/lib/api";
import { getDifficultyAccent, getProblemIcon } from "@/lib/problem-visuals";
import { cn } from "@/lib/utils";

function ProblemCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-10 w-10 rounded-xl" />
        <Skeleton className="mt-2 h-5 w-40" />
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </CardContent>
    </Card>
  );
}

export function ProblemsPage() {
  const [problems, setProblems] = useState<Problem[] | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  useEffect(() => {
    api.listProblems().then(setProblems);
    api.listSubmissions().then(setSubmissions);
  }, []);

  const completed = submissions.filter((s) => s.status === "completed" && s.evaluation);
  const avgScore = completed.length
    ? Math.round(completed.reduce((sum, s) => sum + (s.evaluation?.overallScore ?? 0), 0) / completed.length)
    : null;

  const bestByProblem = new Map<string, number>();
  for (const s of completed) {
    const score = s.evaluation!.overallScore;
    bestByProblem.set(s.problemId, Math.max(bestByProblem.get(s.problemId) ?? 0, score));
  }

  return (
    <>
      <div className="sticky top-16 z-10 -mx-4 mb-8 bg-background px-6 py-6 sm:-mx-6 sm:px-10 lg:top-0 lg:-mx-8">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Problems</h1>
        <p className="mt-1.5 max-w-xl text-sm text-muted-foreground sm:text-base">
          Pick a problem, model it, and get feedback that combines structural checks with AI reasoning.
        </p>

        <div className="mt-6 grid grid-cols-3 gap-3 sm:max-w-md">
          <div className="rounded-xl border bg-card/60 px-3 py-3 backdrop-blur-sm">
            <ListChecks className="size-4 text-primary" />
            <div className="mt-1.5 text-xl font-semibold tabular-nums">{problems?.length ?? "–"}</div>
            <div className="text-xs text-muted-foreground">Problems</div>
          </div>
          <div className="rounded-xl border bg-card/60 px-3 py-3 backdrop-blur-sm">
            <Sparkles className="size-4 text-info" />
            <div className="mt-1.5 text-xl font-semibold tabular-nums">{submissions.length}</div>
            <div className="text-xs text-muted-foreground">Attempts</div>
          </div>
          <div className="rounded-xl border bg-card/60 px-3 py-3 backdrop-blur-sm">
            <Trophy className="size-4 text-success" />
            <div className="mt-1.5 text-xl font-semibold tabular-nums">{avgScore ?? "–"}</div>
            <div className="text-xs text-muted-foreground">Avg. score</div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {problems === null
          ? Array.from({ length: 3 }).map((_, i) => <ProblemCardSkeleton key={i} />)
          : problems.map((problem) => {
              const Icon = getProblemIcon(problem.slug);
              const accent = getDifficultyAccent(problem.difficulty);
              const best = bestByProblem.get(problem.id);

              return (
                <Link key={problem.id} to={`/problems/${problem.slug}`} className="group">
                  <Card className="card-hover h-full">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <div className={cn("flex size-10 items-center justify-center rounded-xl", accent.bg)}>
                          <Icon className={cn("size-5", accent.fg)} />
                        </div>
                        <DifficultyBadge difficulty={problem.difficulty} />
                      </div>
                      <CardTitle className="pt-1 text-base">{problem.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3">
                      <p className="text-sm text-muted-foreground">{problem.summary}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {problem.tags.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter className="justify-between border-t-0 bg-transparent pt-0">
                      {best !== undefined ? (
                        <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                          <Trophy className="size-3.5 text-success" /> Best: {best}/100
                        </span>
                      ) : (
                        <span />
                      )}
                      <span className="flex items-center gap-1 text-sm font-medium text-primary">
                        {best !== undefined ? "Try again" : "Start"} <ArrowRight className="size-3.5" />
                      </span>
                    </CardFooter>
                  </Card>
                </Link>
              );
            })}
      </div>
    </>
  );
}
