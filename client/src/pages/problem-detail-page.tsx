import { FileText } from "lucide-react";
import { useParams } from "react-router-dom";
import { ComingSoon } from "@/components/coming-soon";
import { PageHeader } from "@/components/layout/page-header";

export function ProblemDetailPage() {
  const { problemSlug } = useParams();

  return (
    <>
      <PageHeader title="Problem detail" description={`Requirements and constraints for "${problemSlug}".`} />
      <ComingSoon
        icon={FileText}
        title="Problem detail coming next"
        description="Full requirements, constraints, and a 'Start attempt' action will be built here in the next step."
      />
    </>
  );
}
