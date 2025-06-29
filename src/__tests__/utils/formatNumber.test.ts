import { formatNumber } from "@/lib/utils/formatNumber";
import { describe, expect, it } from "vitest";

describe("formatNumber", () => {
  it("should format a number with French locale", () => {
    expect(formatNumber(1234567.89)).toBe("1\u202f234\u202f567,9");
  });

  it("should format a number with no decimal places", () => {
    expect(formatNumber(1234567)).toBe("1\u202f234\u202f567");
  });

  it("should format a small number", () => {
    expect(formatNumber(0.1234)).toBe("0,1");
  });

  it("should format a negative number", () => {
    expect(formatNumber(-1234567.89)).toBe("-1\u202f234\u202f567,9");
  });
});
