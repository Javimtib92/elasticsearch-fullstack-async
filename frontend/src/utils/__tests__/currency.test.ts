import { describe, expect, test } from "vitest";
import { formatToEur } from "../currency";

describe("formatToEur function", () => {
  test("should format number to EUR currency correctly", () => {
    expect(formatToEur(1000)).toBe("1000,00 €");
    expect(formatToEur(500.5)).toBe("500,50 €");
    expect(formatToEur(123456.789)).toBe("123.456,79 €");
  });

  test("should handle negative numbers correctly", () => {
    expect(formatToEur(-100)).toBe("-100,00 €");
    expect(formatToEur(-500.5)).toBe("-500,50 €");
    expect(formatToEur(-123456.789)).toBe("-123.456,79 €");
  });

  test("should handle zero correctly", () => {
    expect(formatToEur(0)).toBe("0,00 €");
  });
});
