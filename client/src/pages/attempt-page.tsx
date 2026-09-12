import { ArrowLeft, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { DesignModelBuilder } from "@/components/design-model/design-model-builder";
import { api, emptyDesignModel, type Attempt, type DesignModel, type Problem } from "@/lib/api";

export function AttemptPage() {
  const { attemptId = "" } = useParams();
  const navigate = useNavigate();

  const [attempt, setAttempt] = useState<Attempt | null | undefined>(undefined);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [designModel, setDesignModel] = useState<DesignModel>(emptyDesignModel());
  const [rationale, setRationale] = useState("");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const isFirstLoad = useRef(true);

  useEffect(() => {
    api.getAttempt(attemptId).then((a) => {
      setAttempt(a);
      if (a) {
        setDesignModel(a.designModel);
        setRationale(a.rationale);
        api.getProblem(a.problemId).then(setProblem);
      }
    });
  }, [attemptId]);

  useEffect(() => {
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      return;
    }
    if (!attempt || attempt.status !== "in_progress") return;

    setSaveState("saving");
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        await api.saveAttemptDraft(attemptId, { designModel, rationale });
        setSaveState("saved");
      } catch {
        setSaveState("error");
      }
    }, 700);

    return () => clearTimeout(saveTimer.current);
  }, [designModel, rationale]);

  async function handleSubmit() {
    setIsSubmitting(true);
    try {
      const submission = await api.submitAttempt(attemptId);
      toast.success("Submitted for evaluation");
      navigate(`/submissions/${submission.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not submit your attempt.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (attempt === undefined) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (attempt === null) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
          <h2 className="text-lg font-medium">Attempt not found</h2>
          <Button render={<Link to="/problems" />}>Back to problems</Button>
        </CardContent>
      </Card>
    );
  }

  if (attempt.status === "submitted") {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
          <h2 className="text-lg font-medium">This attempt was already submitted</h2>
          <p className="max-w-sm text-sm text-muted-foreground">
            Check your history to see the feedback, or start a fresh attempt from the problem page.
          </p>
          <Button render={<Link to="/history" />}>Go to history</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {problem && (
        <Link
          to={`/problems/${problem.slug}`}
          className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> {problem.title}
        </Link>
      )}

      <PageHeader
        title="Design your solution"
        description={
          saveState === "saving"
            ? "Saving…"
            : saveState === "saved"
              ? "Draft saved"
              : saveState === "error"
                ? "Couldn't save your draft — check your connection"
                : undefined
        }
        actions={
          <Button onClick={handleSubmit} disabled={isSubmitting || designModel.entities.length === 0}>
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            Submit for feedback
          </Button>
        }
      />

      {problem && (
        <Alert className="mb-4">
          <AlertTitle>{problem.title} — requirements</AlertTitle>
          <AlertDescription>
            <ul className="mt-1 flex flex-col gap-1">
              {problem.requirements.map((req, i) => (
                <li key={i}>• {req}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-4">
        <DesignModelBuilder value={designModel} onChange={setDesignModel} />

        <Card>
          <CardHeader>
            <CardTitle>Rationale</CardTitle>
          </CardHeader>
          <CardContent>
            <Label htmlFor="rationale" className="sr-only">
              Rationale
            </Label>
            <Textarea
              id="rationale"
              rows={6}
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
              placeholder="Explain the trade-offs in your design: why this split of responsibilities, what alternative you considered, and why you rejected it."
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
