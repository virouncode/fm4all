import { roundNbAlarmes } from "@/lib/utils/roundAlarmes";
import { describe, expect, it } from "vitest";

describe("roundNbAlarmes", () => {
  it("should round to the nearest inferior", () => {
    expect(roundNbAlarmes(23)).toBe(20);
    expect(roundNbAlarmes(29)).toBe(20);
  });
  it("should handle edge cases", () => {
    expect(roundNbAlarmes(1)).toBe(1);
  });
});
