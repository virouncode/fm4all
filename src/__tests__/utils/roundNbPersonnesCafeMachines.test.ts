import { roundNbPersonnesCafeMachines } from "@/lib/utils/roundNbPersonnesCafeMachines";
import { describe, expect, it } from "vitest";

describe("roundNbPersonnesCafeMachines", () => {
  it("should round to the nearest superior number of persons", () => {
    expect(roundNbPersonnesCafeMachines(11)).toBe(20);
    expect(roundNbPersonnesCafeMachines(1)).toBe(10);
    expect(roundNbPersonnesCafeMachines(141)).toBe(150);
  });
});
