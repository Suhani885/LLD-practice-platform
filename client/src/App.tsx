import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "@/components/layout/app-shell";
import { AuthLayout } from "@/components/layout/auth-layout";
import { PageLoading } from "@/components/page-loading";
import { ProtectedRoute } from "@/components/protected-route";

const ProblemsPage = lazy(() => import("@/pages/problems-page").then((m) => ({ default: m.ProblemsPage })));
const ProblemDetailPage = lazy(() => import("@/pages/problem-detail-page").then((m) => ({ default: m.ProblemDetailPage })));
const AttemptPage = lazy(() => import("@/pages/attempt-page").then((m) => ({ default: m.AttemptPage })));
const SubmissionPage = lazy(() => import("@/pages/submission-page").then((m) => ({ default: m.SubmissionPage })));
const HistoryPage = lazy(() => import("@/pages/history-page").then((m) => ({ default: m.HistoryPage })));
const LoginPage = lazy(() => import("@/pages/login-page").then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import("@/pages/register-page").then((m) => ({ default: m.RegisterPage })));
const NotFoundPage = lazy(() => import("@/pages/not-found-page").then((m) => ({ default: m.NotFoundPage })));

function App() {
  return (
    <Suspense fallback={<PageLoading />}>
      <Routes>
        <Route path="/" element={<Navigate to="/problems" replace />} />

        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path="/problems" element={<ProblemsPage />} />
            <Route path="/problems/:problemSlug" element={<ProblemDetailPage />} />
            <Route path="/attempts/:attemptId" element={<AttemptPage />} />
            <Route path="/submissions/:submissionId" element={<SubmissionPage />} />
            <Route path="/history" element={<HistoryPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}

export default App;
