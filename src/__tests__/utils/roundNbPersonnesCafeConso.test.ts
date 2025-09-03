import { roundNbPersonnesCafeConso } from "@/lib/utils/roundNbPersonnesCafeConso";
import { describe, expect, it } from "vitest";

describe("roundNbPersonnesCafeConso", () => {
  it("should round to the nearest inferior number of people for coffee consumption", () => {
    expect(roundNbPersonnesCafeConso(4)).toBe(1);
    expect(roundNbPersonnesCafeConso(9)).toBe(5);
    expect(roundNbPersonnesCafeConso(19)).toBe(10);
    expect(roundNbPersonnesCafeConso(299)).toBe(250);
  });
});
