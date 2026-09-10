import { ListChecks } from "lucide-react";
import { ComingSoon } from "@/components/coming-soon";
import { PageHeader } from "@/components/layout/page-header";

export function ProblemsPage() {
  return (
    <>
      <PageHeader title="Problems" description="Pick a problem to start (or resume) an attempt." />
      <ComingSoon
        icon={ListChecks}
        title="Problem list coming next"
        description="This will list the practice problems (Parking Lot, Elevator, Vending Machine) as cards you can start an attempt from — built in the next step."
      />
    </>
  );
}
