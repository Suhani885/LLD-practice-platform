import { ArrowLeft, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { DifficultyBadge } from "@/components/difficulty-badge";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api, type Problem } from "@/lib/api";

export function ProblemDetailPage() {
  const { problemSlug = "" } = useParams();
  const navigate = useNavigate();
  const [problem, setProblem] = useState<Problem | null | undefined>(undefined);
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    setProblem(undefined);
    api.getProblem(problemSlug).then(setProblem);
  }, [problemSlug]);

  async function handleStart() {
    if (!problem) return;
    setIsStarting(true);
    try {
      const attempt = await api.startAttempt(problem.id);
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

  return (
    <>
      <Link to="/problems" className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Back to problems
      </Link>

      <PageHeader
        title={problem.title}
        actions={
          <Button onClick={handleStart} disabled={isStarting}>
            {isStarting && <Loader2 className="size-4 animate-spin" />}
            Start attempt
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <DifficultyBadge difficulty={problem.difficulty} />
        {problem.tags.map((tag) => (
          <Badge key={tag} variant="secondary">
            {tag}
          </Badge>
        ))}
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
