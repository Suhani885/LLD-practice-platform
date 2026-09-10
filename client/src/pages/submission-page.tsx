import { Sparkles } from "lucide-react";
import { useParams } from "react-router-dom";
import { ComingSoon } from "@/components/coming-soon";
import { PageHeader } from "@/components/layout/page-header";

export function SubmissionPage() {
  const { submissionId } = useParams();

  return (
    <>
      <PageHeader title="Feedback" description={`Submission ${submissionId}`} />
      <ComingSoon
        icon={Sparkles}
        title="Feedback view coming next"
        description="Live evaluation status plus the deterministic checklist and AI feedback report are built in the next step."
      />
    </>
  );
}
