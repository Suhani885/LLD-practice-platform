import { CheckCircle2, Loader2, TrendingUp, XCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { PageHeader } from "@/components/layout/page-header";
import { SubmissionStatusBadge } from "@/components/submission-status-badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { api, type Problem, type Submission } from "@/lib/api";
import { scoreTone } from "@/lib/format";

const POLL_MS = 1200;

const SCORE_COLOR: Record<ReturnType<typeof scoreTone>, string> = {
  success: "text-success",
  warning: "text-warning",
  destructive: "text-destructive",
};

export function SubmissionPage() {
  const { submissionId = "" } = useParams();
  const [submission, setSubmission] = useState<Submission | null | undefined>(undefined);
  const [problem, setProblem] = useState<Problem | null>(null);
  const pollTimer = useRef<ReturnType<typeof setInterval>>(undefined);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const s = await api.getSubmission(submissionId);
      if (cancelled) return;
      setSubmission(s);
      if (s && !problem) api.getProblem(s.problemId).then((p) => !cancelled && setProblem(p));
      if (!s || s.status === "completed" || s.status === "failed") {
        clearInterval(pollTimer.current);
      }
    }

    load();
    pollTimer.current = setInterval(load, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(pollTimer.current);
    };
  }, [submissionId]);

  if (submission === undefined) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (submission === null) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
          <h2 className="text-lg font-medium">Submission not found</h2>
          <Button render={<Link to="/problems" />}>Back to problems</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <PageHeader
        title={problem ? problem.title : "Feedback"}
        description="Deterministic checks and AI feedback on your design."
        actions={<SubmissionStatusBadge status={submission.status} />}
      />

      {(submission.status === "pending" || submission.status === "evaluating") && (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {submission.status === "pending" ? "Queued for evaluation…" : "Evaluating your design…"}
            </p>
          </CardContent>
        </Card>
      )}

      {submission.status === "failed" && (
        <Alert variant="destructive">
          <AlertTitle>Evaluation failed</AlertTitle>
          <AlertDescription>
            {submission.errorMessage ?? "Something went wrong while evaluating this submission."}
            <div className="mt-3">
              <Button size="sm" render={<Link to="/problems" />}>
                Try another attempt
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {submission.status === "completed" && submission.evaluation && (
        <div className="flex flex-col gap-4">
          <Card>
            <CardContent className="flex items-center gap-6 py-6">
              <div className="text-center">
                <div className={`text-4xl font-semibold ${SCORE_COLOR[scoreTone(submission.evaluation.overallScore)]}`}>
                  {submission.evaluation.overallScore}
                </div>
                <div className="text-xs text-muted-foreground">Overall score</div>
              </div>
              <div className="flex-1">
                <Progress value={submission.evaluation.overallScore} className="h-2" />
                <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                  <span>Deterministic: {submission.evaluation.deterministic.score}</span>
                  <span>AI feedback: {submission.evaluation.llm?.score ?? "—"}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Structural checklist</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {submission.evaluation.deterministic.checks.map((check) => (
                <div key={check.id} className="flex items-start gap-2.5">
                  {check.passed ? (
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
                  ) : (
                    <XCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
                  )}
                  <div>
                    <p className="text-sm font-medium">{check.label}</p>
                    <p className="text-xs text-muted-foreground">{check.detail}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {submission.evaluation.llm && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="size-4" /> AI feedback
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <p className="text-sm text-muted-foreground">{submission.evaluation.llm.summary}</p>

                <div>
                  <p className="mb-1.5 text-sm font-medium">Strengths</p>
                  <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
                    {submission.evaluation.llm.strengths.map((s, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-success">•</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="mb-1.5 text-sm font-medium">Room to improve</p>
                  <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
                    {submission.evaluation.llm.improvements.map((s, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-warning">•</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          {problem && (
            <Button variant="outline" render={<Link to={`/problems/${problem.slug}`} />} className="self-start">
              Try this problem again
            </Button>
          )}
        </div>
      )}
    </>
  );
}
