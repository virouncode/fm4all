import { roundSurface } from "@/lib/utils/roundSurface";
import { describe, expect, it } from "vitest";

describe("roundSurface", () => {
  it("should round to the nearest inferior", () => {
    expect(roundSurface(99)).toBe(50);
    expect(roundSurface(399)).toBe(350);
    expect(roundSurface(2999)).toBe(2500);
  });
});
