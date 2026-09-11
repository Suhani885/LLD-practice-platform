import { History, Target, Trophy, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ComingSoon } from "@/components/coming-soon";
import { PageHeader } from "@/components/layout/page-header";
import { ScoreTrendChart } from "@/components/score-trend-chart";
import { SubmissionStatusBadge } from "@/components/submission-status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api, type Problem, type Submission } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { getDifficultyAccent, getProblemIcon } from "@/lib/problem-visuals";
import { cn } from "@/lib/utils";

interface Row {
  submission: Submission;
  problem: Problem | null;
}

const MIN_POINTS_FOR_CHART = 4;

export function HistoryPage() {
  const [rows, setRows] = useState<Row[] | null>(null);

  useEffect(() => {
    api.listSubmissions().then(async (submissions) => {
      const problems = await Promise.all(submissions.map((s) => api.getProblem(s.problemId)));
      setRows(submissions.map((submission, i) => ({ submission, problem: problems[i] })));
    });
  }, []);

  const completed = rows?.filter((r) => r.submission.status === "completed" && r.submission.evaluation) ?? [];
  const scores = completed.map((r) => r.submission.evaluation!.overallScore);
  const bestScore = scores.length ? Math.max(...scores) : null;
  const latestScore = completed[0]?.submission.evaluation?.overallScore ?? null;
  const trendPoints = [...completed]
    .reverse()
    .map((r) => ({ date: formatDate(r.submission.createdAt).split(",")[0], score: r.submission.evaluation!.overallScore }));

  return (
    <>
      <PageHeader title="History" description="Every attempt you've submitted, with its score over time." />

      {rows === null && (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      )}

      {rows?.length === 0 && (
        <ComingSoon
          icon={History}
          title="No attempts yet"
          description="Once you submit a design, it'll show up here with its score so you can track improvement over time."
        />
      )}

      {rows && rows.length > 0 && (
        <div className="flex flex-col gap-4">
          {trendPoints.length >= MIN_POINTS_FOR_CHART ? (
            <Card>
              <CardHeader>
                <CardTitle>Score trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ScoreTrendChart points={trendPoints} />
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              <Card>
                <CardContent className="py-5 text-center">
                  <Zap className="mx-auto size-4 text-info" />
                  <div className="mt-1.5 text-xl font-semibold tabular-nums">{rows.length}</div>
                  <div className="text-xs text-muted-foreground">Attempts</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="py-5 text-center">
                  <Trophy className="mx-auto size-4 text-success" />
                  <div className="mt-1.5 text-xl font-semibold tabular-nums">{bestScore ?? "–"}</div>
                  <div className="text-xs text-muted-foreground">Best score</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="py-5 text-center">
                  <Target className="mx-auto size-4 text-primary" />
                  <div className="mt-1.5 text-xl font-semibold tabular-nums">{latestScore ?? "–"}</div>
                  <div className="text-xs text-muted-foreground">Latest score</div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="flex flex-col gap-2">
            {rows.map(({ submission, problem }) => {
              const Icon = problem ? getProblemIcon(problem.slug) : History;
              const accent = problem ? getDifficultyAccent(problem.difficulty) : { bg: "bg-muted", fg: "text-muted-foreground" };

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
                          <span className="text-sm font-medium tabular-nums">{submission.evaluation.overallScore}/100</span>
                        )}
                        <SubmissionStatusBadge status={submission.status} />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
