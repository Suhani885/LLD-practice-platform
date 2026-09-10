import { CompassIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function NotFoundPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 p-4 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-muted">
        <CompassIcon className="size-7 text-muted-foreground" />
      </div>
      <div>
        <h1 className="text-xl font-semibold">Page not found</h1>
        <p className="mt-1 text-sm text-muted-foreground">The page you're looking for doesn't exist.</p>
      </div>
      <Button render={<Link to="/problems" />}>Back to problems</Button>
    </div>
  );
}
