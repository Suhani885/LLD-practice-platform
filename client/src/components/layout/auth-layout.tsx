import { Blocks, ClipboardCheck, PencilRuler, Sparkles } from "lucide-react";
import { Outlet } from "react-router-dom";
import { ThemeToggle } from "@/components/theme-toggle";

const STEPS = [
  { icon: PencilRuler, text: "Design a solution: classes, interfaces, relationships" },
  { icon: ClipboardCheck, text: "Submit it and watch it get evaluated" },
  { icon: Sparkles, text: "Get deterministic checks + AI feedback, then try again" },
];

export function AuthLayout() {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="bg-mesh relative hidden flex-col justify-between overflow-hidden border-r p-10 lg:flex">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Blocks className="size-4.5" />
          </div>
          <span className="font-semibold tracking-tight">LLD Practice</span>
        </div>

        <div className="max-w-md">
          <h1 className="text-3xl font-semibold tracking-tight text-balance">
            Practice Low-Level Design like it's a habit, not a one-off.
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Parking lots, elevators, vending machines - model them, submit, and see exactly where your design holds
            up and where it doesn't.
          </p>
          <ul className="mt-6 flex flex-col gap-3">
            {STEPS.map((step) => (
              <li key={step.text} className="flex items-center gap-3 text-sm">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border bg-card">
                  <step.icon className="size-4 text-primary" />
                </div>
                {step.text}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-muted-foreground">Built with a real evaluation pipeline - deterministic checks + AI feedback.</p>
      </div>

      <div className="flex flex-col">
        <header className="flex h-16 items-center justify-between px-6 lg:justify-end">
          <div className="flex items-center gap-2 lg:hidden">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Blocks className="size-4.5" />
            </div>
            <span className="font-semibold tracking-tight">LLD Practice</span>
          </div>
          <ThemeToggle />
        </header>
        <main className="flex flex-1 items-center justify-center p-4">
          <div className="w-full max-w-sm">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
