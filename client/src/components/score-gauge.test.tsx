import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ScoreGauge } from "./score-gauge";

describe("ScoreGauge", () => {
  it("displays the score and describes it accessibly", () => {
    render(<ScoreGauge score={72} label="overall" />);

    expect(screen.getByText("72")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "overall: 72 out of 100" })).toBeInTheDocument();
  });

  it("clamps out-of-range scores instead of rendering an invalid value", () => {
    render(<ScoreGauge score={140} />);
    expect(screen.getByText("100")).toBeInTheDocument();

    render(<ScoreGauge score={-20} />);
    expect(screen.getByText("0")).toBeInTheDocument();
  });
});
