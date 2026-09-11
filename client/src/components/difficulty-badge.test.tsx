import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DifficultyBadge } from "./difficulty-badge";

describe("DifficultyBadge", () => {
  it("renders the human-readable label for each difficulty", () => {
    const { rerender } = render(<DifficultyBadge difficulty="easy" />);
    expect(screen.getByText("Easy")).toBeInTheDocument();

    rerender(<DifficultyBadge difficulty="medium" />);
    expect(screen.getByText("Medium")).toBeInTheDocument();

    rerender(<DifficultyBadge difficulty="hard" />);
    expect(screen.getByText("Hard")).toBeInTheDocument();
  });
});
