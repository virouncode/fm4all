import { isValidSIRET } from "@/lib/utils/isValidSIRET";
import { describe, expect, it } from "vitest";

describe("isValidSIRET", () => {
  it("should return true for a valid SIRET", () => {
    expect(isValidSIRET("92324501300019")).toBe(true);
  });
  it("should return true for a valid SIRET, even with spaces", () => {
    expect(isValidSIRET("923   24501  300 0  1 9")).toBe(true);
  });
  it("should return false for a 14-digit invalid SIRET", () => {
    expect(isValidSIRET("12345678912345")).toBe(false);
  });
  it("should return false for a SIRET with non-digit characters", () => {
    expect(isValidSIRET("9232450130001A")).toBe(false);
  });
});
