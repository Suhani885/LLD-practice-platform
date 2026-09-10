import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "@/components/layout/app-shell";
import { AuthLayout } from "@/components/layout/auth-layout";
import { ProtectedRoute } from "@/components/protected-route";
import { AttemptPage } from "@/pages/attempt-page";
import { HistoryPage } from "@/pages/history-page";
import { LoginPage } from "@/pages/login-page";
import { NotFoundPage } from "@/pages/not-found-page";
import { ProblemDetailPage } from "@/pages/problem-detail-page";
import { ProblemsPage } from "@/pages/problems-page";
import { RegisterPage } from "@/pages/register-page";
import { SubmissionPage } from "@/pages/submission-page";

function App() {
  return (
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
  );
}

export default App;
