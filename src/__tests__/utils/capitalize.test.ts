import { capitalize } from "@/lib/utils/capitalize";
import { describe, expect, it } from "vitest";

describe("capitalize", () => {
  it("should capitalize the lower case string", () => {
    expect(capitalize("hello world")).toBe("Hello World");
  });
  it("should capitalize the mixed case string", () => {
    expect(capitalize("hElLo wOrLd")).toBe("Hello World");
  });
  it("should capitalize the string with hyphens", () => {
    expect(capitalize("hello-world")).toBe("Hello-World");
  });
  it("should capitalize the uppercase strings", () => {
    expect(capitalize("HELLO WORLD")).toBe("Hello World");
  });
});
