import { describe, expect, it } from "vitest";
import { scoreTone } from "./format";

describe("scoreTone", () => {
  it("returns success at and above 70", () => {
    expect(scoreTone(70)).toBe("success");
    expect(scoreTone(100)).toBe("success");
  });

  it("returns warning between 40 and 69", () => {
    expect(scoreTone(40)).toBe("warning");
    expect(scoreTone(69)).toBe("warning");
  });

  it("returns destructive below 40", () => {
    expect(scoreTone(39)).toBe("destructive");
    expect(scoreTone(0)).toBe("destructive");
  });
});
