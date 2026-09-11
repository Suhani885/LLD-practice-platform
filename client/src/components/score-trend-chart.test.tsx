import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ScoreTrendChart } from "./score-trend-chart";

describe("ScoreTrendChart", () => {
  it("summarizes the trend accessibly for screen readers", () => {
    render(
      <ScoreTrendChart
        points={[
          { date: "Jan 1", score: 40 },
          { date: "Jan 2", score: 55 },
          { date: "Jan 3", score: 70 },
          { date: "Jan 4", score: 85 },
        ]}
      />,
    );

    expect(screen.getByRole("img", { name: /from 40 to 85/i })).toBeInTheDocument();
    expect(screen.getByText("Latest: 85")).toBeInTheDocument();
  });

  it("renders one point per data point", () => {
    const { container } = render(
      <ScoreTrendChart
        points={[
          { date: "Jan 1", score: 10 },
          { date: "Jan 2", score: 20 },
          { date: "Jan 3", score: 30 },
        ]}
      />,
    );

    expect(container.querySelectorAll("circle")).toHaveLength(3);
  });
});
