import { PencilRuler } from "lucide-react";
import { useParams } from "react-router-dom";
import { ComingSoon } from "@/components/coming-soon";
import { PageHeader } from "@/components/layout/page-header";

export function AttemptPage() {
  const { attemptId } = useParams();

  return (
    <>
      <PageHeader title="Design attempt" description={`Attempt ${attemptId}`} />
      <ComingSoon
        icon={PencilRuler}
        title="Attempt builder coming next"
        description="The structured class/interface model builder plus rationale text area — the core practice UI — is built in the next step."
      />
    </>
  );
}
