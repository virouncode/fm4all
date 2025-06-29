import { roundEffectif } from "@/lib/utils/roundEffectif";
import { describe, expect, it } from "vitest";

describe("roundEffectif", () => {
  it("should round to the nearest inferior", () => {
    expect(roundEffectif(21)).toBe(20);
    expect(roundEffectif(29)).toBe(25);
  });
  it("should handle edge cases", () => {
    expect(roundEffectif(1)).toBe(1);
    expect(roundEffectif(5)).toBe(5);
    expect(roundEffectif(10)).toBe(10);
  });
});
