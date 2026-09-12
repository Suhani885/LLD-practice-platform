import { ArrowRight, BookOpen, History, ListChecks, Sparkles, Target, Trophy, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DifficultyBadge } from "@/components/difficulty-badge";
import { SubmissionStatusBadge } from "@/components/submission-status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { api, type Problem, type Submission } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { getDifficultyAccent, getProblemIcon } from "@/lib/problem-visuals";
import { cn } from "@/lib/utils";

function StatCard({
  icon: Icon,
  value,
  label,
  accent,
}: {
  icon: typeof Trophy;
  value: string | number;
  label: string;
  accent: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border bg-card/60 px-4 py-5 backdrop-blur-sm transition-transform hover:scale-[1.02]">
      <div className={cn("flex size-10 items-center justify-center rounded-xl", accent)}>
        <Icon className="size-5 text-inherit" />
      </div>
      <div className="text-2xl font-bold tabular-nums">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function FeaturedProblemCard({ problem, bestScore }: { problem: Problem; bestScore?: number }) {
  const Icon = getProblemIcon(problem.slug);
  const accent = getDifficultyAccent(problem.difficulty);

  return (
    <Link to={`/problems/${problem.slug}`} className="group">
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
          <p className="line-clamp-2 text-sm text-muted-foreground">{problem.summary}</p>
          <div className="flex flex-wrap gap-1.5">
            {problem.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
        <CardFooter className="justify-between border-t-0 bg-transparent pt-0">
          {bestScore !== undefined ? (
            <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
              <Trophy className="size-3.5 text-success" /> Best: {bestScore}/100
            </span>
          ) : (
            <span />
          )}
          <span className="flex items-center gap-1 text-sm font-medium text-primary">
            {bestScore !== undefined ? "Try again" : "Start"} <ArrowRight className="size-3.5" />
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-40 w-full rounded-2xl" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-8 w-48" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-52 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export function DashboardPage() {
  const { user } = useAuth();
  const [problems, setProblems] = useState<Problem[] | null>(null);
  const [submissions, setSubmissions] = useState<Submission[] | null>(null);

  useEffect(() => {
    api.listProblems().then(setProblems);
    api.listSubmissions().then(setSubmissions);
  }, []);

  if (problems === null || submissions === null) {
    return <DashboardSkeleton />;
  }

  const completed = submissions.filter((s) => s.status === "completed" && s.evaluation);
  const avgScore = completed.length
    ? Math.round(completed.reduce((sum, s) => sum + (s.evaluation?.overallScore ?? 0), 0) / completed.length)
    : null;

  const bestByProblem = new Map<string, number>();
  for (const s of completed) {
    const score = s.evaluation!.overallScore;
    bestByProblem.set(s.problemId, Math.max(bestByProblem.get(s.problemId) ?? 0, score));
  }

  // Featured problems: pick a mix of difficulties, limit to 3
  const featured = problems.slice(0, 3);

  // Recent activity: last 3 submissions
  const recent = submissions.slice(0, 5);

  const firstName = user?.name.split(" ")[0] ?? "there";

  // Count unique problems attempted
  const uniqueProblemsAttempted = new Set(submissions.map((s) => s.problemId)).size;

  return (
    <div className="flex flex-col gap-8">
      {/* Welcome hero */}
      <div className="animate-fade-in-up sticky top-16 z-10 -mx-4 bg-background px-6 py-6 sm:-mx-6 sm:px-10 lg:top-0 lg:-mx-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Hey, {firstName} 👋
            </h1>
            <p className="mt-1.5 max-w-lg text-sm text-muted-foreground sm:text-base">
              {completed.length === 0
                ? "Ready to sharpen your low-level design skills? Pick a problem and start designing."
                : `You've completed ${completed.length} evaluation${completed.length !== 1 ? "s" : ""} so far. Keep going!`}
            </p>
          </div>
          <Button render={<Link to="/problems" />} className="mt-3 shrink-0 sm:mt-0">
            <ListChecks className="size-4" />
            Browse All Problems
          </Button>
        </div>
      </div>

      {/* Stats strip */}
      <div className="animate-fade-in-up-delay-1 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={BookOpen} value={problems.length} label="Total Problems" accent="bg-primary/10 text-primary" />
        <StatCard icon={Target} value={uniqueProblemsAttempted} label="Attempted" accent="bg-info/10 text-info" />
        <StatCard icon={Zap} value={submissions.length} label="Submissions" accent="bg-warning/10 text-warning" />
        <StatCard icon={Trophy} value={avgScore ?? "–"} label="Avg. Score" accent="bg-success/10 text-success" />
      </div>

      {/* Featured problems */}
      <section className="animate-fade-in-up-delay-2">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="size-5 text-primary" />
            <h2 className="text-lg font-semibold tracking-tight">Featured Problems</h2>
          </div>
          <Link
            to="/problems"
            className="flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80"
          >
            View all <ArrowRight className="size-3.5" />
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((problem) => (
            <FeaturedProblemCard
              key={problem.id}
              problem={problem}
              bestScore={bestByProblem.get(problem.id)}
            />
          ))}
        </div>
      </section>

      {/* Recent activity */}
      {recent.length > 0 && (
        <section className="animate-fade-in-up-delay-3">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="size-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold tracking-tight">Recent Activity</h2>
            </div>
            <Link
              to="/history"
              className="flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80"
            >
              Full history <ArrowRight className="size-3.5" />
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            {recent.map((submission) => {
              const problem = problems.find((p) => p.id === submission.problemId);
              const Icon = problem ? getProblemIcon(problem.slug) : History;
              const accent = problem
                ? getDifficultyAccent(problem.difficulty)
                : { bg: "bg-muted", fg: "text-muted-foreground" };

              return (
                <Link key={submission.id} to={`/submissions/${submission.id}`}>
                  <Card className="card-hover">
                    <CardContent className="flex items-center gap-4 py-4">
                      <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", accent.bg)}>
                        <Icon className={cn("size-5", accent.fg)} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{problem?.title ?? "Unknown problem"}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(submission.createdAt)}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-4">
                        {submission.evaluation && (
                          <span className="text-sm font-medium tabular-nums">
                            {submission.evaluation.overallScore}/100
                          </span>
                        )}
                        <SubmissionStatusBadge status={submission.status} />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
