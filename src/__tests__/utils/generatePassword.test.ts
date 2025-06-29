import { generatePassword } from "@/lib/utils/generatePassword";
import { describe, expect, it } from "vitest";

describe("generatePassword", () => {
  it("should generate a password with 8 letters and numbers followed by a special character", () => {
    const password = generatePassword();
    expect(password).toMatch(/^[a-zA-Z0-9]{8}[!?@&]$/);
  });

  it("should contain at least one special character", () => {
    const password = generatePassword();
    expect(password).toMatch(/[!?@&]/);
  });

  it("should be exactly 9 characters long", () => {
    const password = generatePassword();
    expect(password.length).toBe(9);
  });
});
