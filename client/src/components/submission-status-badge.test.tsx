import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SubmissionStatusBadge } from "./submission-status-badge";

describe("SubmissionStatusBadge", () => {
  it("labels every status so it never conveys meaning by color alone", () => {
    const { rerender } = render(<SubmissionStatusBadge status="pending" />);
    expect(screen.getByText("Pending")).toBeInTheDocument();

    rerender(<SubmissionStatusBadge status="evaluating" />);
    expect(screen.getByText("Evaluating")).toBeInTheDocument();

    rerender(<SubmissionStatusBadge status="completed" />);
    expect(screen.getByText("Completed")).toBeInTheDocument();

    rerender(<SubmissionStatusBadge status="failed" />);
    expect(screen.getByText("Failed")).toBeInTheDocument();
  });
});
