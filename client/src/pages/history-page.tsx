import { History } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ComingSoon } from "@/components/coming-soon";
import { PageHeader } from "@/components/layout/page-header";
import { SubmissionStatusBadge } from "@/components/submission-status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api, type Problem, type Submission } from "@/lib/api";
import { formatDate } from "@/lib/format";

interface Row {
  submission: Submission;
  problem: Problem | null;
}

export function HistoryPage() {
  const [rows, setRows] = useState<Row[] | null>(null);

  useEffect(() => {
    api.listSubmissions().then(async (submissions) => {
      const problems = await Promise.all(submissions.map((s) => api.getProblem(s.problemId)));
      setRows(submissions.map((submission, i) => ({ submission, problem: problems[i] })));
    });
  }, []);

  return (
    <>
      <PageHeader title="History" description="Every attempt you've submitted, with its score over time." />

      {rows === null && (
        <div className="flex flex-col gap-2">
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
        <div className="flex flex-col gap-2">
          {rows.map(({ submission, problem }) => (
            <Link key={submission.id} to={`/submissions/${submission.id}`}>
              <Card className="transition-colors hover:border-primary/40">
                <CardContent className="flex items-center justify-between gap-4 py-4">
                  <div>
                    <p className="font-medium">{problem?.title ?? "Unknown problem"}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(submission.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    {submission.evaluation && (
                      <span className="text-sm font-medium">{submission.evaluation.overallScore}/100</span>
                    )}
                    <SubmissionStatusBadge status={submission.status} />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
