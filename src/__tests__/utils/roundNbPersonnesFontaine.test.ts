import { roundNbPersonnesFontaine } from "@/lib/utils/roundNbPersonnesFontaine";
import { describe, expect, it } from "vitest";

describe("roundNbPersonnesFontaine", () => {
  it("should round to the nearest superior number of persons", () => {
    expect(roundNbPersonnesFontaine(1)).toBe(30);
    expect(roundNbPersonnesFontaine(31)).toBe(60);
    expect(roundNbPersonnesFontaine(61)).toBe(90);
    expect(roundNbPersonnesFontaine(91)).toBe(110);
  });
});
