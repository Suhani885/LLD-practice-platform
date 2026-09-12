import { Blocks, Loader2, Lock, Mail } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const from = (location.state as { from?: Location })?.from?.pathname ?? "/dashboard";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login({ email, password });
      toast.success("Welcome back!");
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not log in.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="glass-card rounded-2xl p-1">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-6 sm:p-8">
        {/* Header */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10">
            <Blocks className="size-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Pick up where you left off.
            </p>
          </div>
        </div>

        {/* Form fields */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="email" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Email
            </Label>
            <div className="auth-input-glow relative rounded-lg">
              <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/50" />
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="pl-10 transition-shadow"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="password" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Password
            </Label>
            <div className="auth-input-glow relative rounded-lg">
              <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/50" />
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="pl-10 transition-shadow"
              />
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3">
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          </div>
        )}

        {/* Submit */}
        <div className="flex flex-col gap-4">
          <Button type="submit" className="h-11 w-full font-medium" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            Log in
          </Button>

          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" />
            </div>
            <span className="relative bg-card/80 px-3 text-xs text-muted-foreground">
              New here?
            </span>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            <Link to="/register" className="font-medium text-primary transition-colors hover:text-primary/80 hover:underline">
              Create an account →
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
