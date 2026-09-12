import { Loader2, Lock, Mail, Sparkles, User } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";

function getPasswordStrength(pw: string): { level: number; label: string; color: string } {
  if (pw.length === 0) return { level: 0, label: "", color: "" };
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^a-zA-Z0-9]/.test(pw)) score++;

  if (score <= 1) return { level: 1, label: "Weak", color: "bg-destructive" };
  if (score <= 2) return { level: 2, label: "Fair", color: "bg-warning" };
  if (score <= 3) return { level: 3, label: "Good", color: "bg-info" };
  return { level: 4, label: "Strong", color: "bg-success" };
}

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const strength = useMemo(() => getPasswordStrength(password), [password]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await register({ name, email, password });
      toast.success("Account created!");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create your account.");
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
            <Sparkles className="size-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Create an account</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Track your attempts and see progress over time.
            </p>
          </div>
        </div>

        {/* Form fields */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Name
            </Label>
            <div className="auth-input-glow relative rounded-lg">
              <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/50" />
              <Input
                id="name"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ada Lovelace"
                className="pl-10 transition-shadow"
              />
            </div>
          </div>

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
                autoComplete="new-password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="pl-10 transition-shadow"
              />
            </div>
            {/* Password strength indicator */}
            {password.length > 0 && (
              <div className="flex items-center gap-2 pt-1">
                <div className="flex flex-1 gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`password-strength-bar flex-1 ${
                        i <= strength.level ? strength.color : "bg-muted"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">{strength.label}</span>
              </div>
            )}
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
            Create account
          </Button>

          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" />
            </div>
            <span className="relative bg-card/80 px-3 text-xs text-muted-foreground">
              Already registered?
            </span>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            <Link to="/login" className="font-medium text-primary transition-colors hover:text-primary/80 hover:underline">
              Log in instead →
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
