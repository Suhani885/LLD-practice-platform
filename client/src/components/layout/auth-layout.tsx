import { Blocks, Braces, ClipboardCheck, Code2, Layers, PencilRuler, Sparkles } from "lucide-react";
import { Outlet } from "react-router-dom";
import { ThemeToggle } from "@/components/theme-toggle";

const STEPS = [
  { icon: PencilRuler, text: "Design a solution: classes, interfaces, relationships", number: 1 },
  { icon: ClipboardCheck, text: "Submit it and watch it get evaluated", number: 2 },
  { icon: Sparkles, text: "Get deterministic checks + AI feedback, then try again", number: 3 },
];

const FLOATING_ICONS = [
  { icon: Code2, className: "absolute top-[18%] left-[8%] animate-float opacity-[0.12]", size: "size-10" },
  { icon: Braces, className: "absolute top-[35%] right-[10%] animate-float-delayed opacity-[0.1]", size: "size-8" },
  { icon: Layers, className: "absolute bottom-[25%] left-[15%] animate-float-slow opacity-[0.08]", size: "size-12" },
  { icon: Blocks, className: "absolute bottom-[40%] right-[20%] animate-float opacity-[0.06]", size: "size-9" },
];

export function AuthLayout() {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      {/* Left panel — enhanced */}
      <div className="auth-gradient-bg relative hidden flex-col justify-between overflow-hidden border-r p-10 lg:flex">
        {/* Floating icons */}
        {FLOATING_ICONS.map(({ icon: Icon, className, size }, i) => (
          <div key={i} className={className}>
            <Icon className={`${size} text-primary`} />
          </div>
        ))}

        {/* Decorative gradient orbs */}
        <div className="absolute -top-20 -right-20 size-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 size-64 rounded-full bg-info/5 blur-3xl" />

        {/* Logo */}
        <div className="relative flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <Blocks className="size-5" />
          </div>
          <span className="text-lg font-semibold tracking-tight">LLD Practice</span>
        </div>

        {/* Main copy */}
        <div className="relative max-w-md">
          <h1 className="text-3xl font-bold tracking-tight text-balance leading-tight sm:text-4xl">
            Practice Low-Level Design like it's a habit, not a one-off.
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Parking lots, elevators, vending machines — model them, submit, and see exactly where your design holds
            up and where it doesn't.
          </p>

          {/* Step indicators */}
          <div className="mt-8 flex flex-col gap-4">
            {STEPS.map((step) => (
              <div key={step.text} className="group flex items-start gap-4">
                <div className="relative flex size-10 shrink-0 items-center justify-center">
                  <div className="absolute inset-0 rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20" />
                  <span className="relative text-sm font-bold text-primary">{step.number}</span>
                </div>
                <div className="pt-1.5">
                  <p className="text-sm font-medium leading-snug">{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="relative text-xs text-muted-foreground/70">
          Built with a real evaluation pipeline — deterministic checks + AI feedback.
        </p>
      </div>

      {/* Right panel — form */}
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
          <div className="w-full max-w-sm animate-fade-in-up">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
