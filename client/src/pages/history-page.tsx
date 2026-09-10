import { History } from "lucide-react";
import { ComingSoon } from "@/components/coming-soon";
import { PageHeader } from "@/components/layout/page-header";

export function HistoryPage() {
  return (
    <>
      <PageHeader title="History" description="Every attempt you've submitted, with its score over time." />
      <ComingSoon
        icon={History}
        title="Attempt history coming next"
        description="A list of past submissions per problem, so you can see whether your designs are actually improving — built in the next step."
      />
    </>
  );
}
