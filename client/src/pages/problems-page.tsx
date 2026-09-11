import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DifficultyBadge } from "@/components/difficulty-badge";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api, type Problem } from "@/lib/api";

function ProblemCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-24" />
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

  useEffect(() => {
    api.listProblems().then(setProblems);
  }, []);

  return (
    <>
      <PageHeader title="Problems" description="Pick a problem to start (or resume) an attempt." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {problems === null
          ? Array.from({ length: 3 }).map((_, i) => <ProblemCardSkeleton key={i} />)
          : problems.map((problem) => (
              <Link key={problem.id} to={`/problems/${problem.slug}`} className="group">
                <Card className="h-full transition-colors group-hover:border-primary/40">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base">{problem.title}</CardTitle>
                      <DifficultyBadge difficulty={problem.difficulty} />
                    </div>
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
                  <CardFooter className="justify-end bg-transparent border-t-0 pt-0">
                    <span className="flex items-center gap-1 text-sm font-medium text-primary">
                      View problem <ArrowRight className="size-3.5" />
                    </span>
                  </CardFooter>
                </Card>
              </Link>
            ))}
      </div>
    </>
  );
}
