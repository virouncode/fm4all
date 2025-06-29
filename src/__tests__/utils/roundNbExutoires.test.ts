import { roundNbExutoires } from "@/lib/utils/roundNbExutoires";
import { describe, expect, it } from "vitest";

describe("roundNbExutoires", () => {
  it("should round to the nearest inferior", () => {
    expect(roundNbExutoires(9)).toBe(1);
    expect(roundNbExutoires(28)).toBe(10);
    expect(roundNbExutoires(59)).toBe(29);
  });
});
