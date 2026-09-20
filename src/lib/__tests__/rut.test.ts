/** Every RUT here is synthetic. No real identifier belongs in this repository. */

import { describe, expect, it } from "vitest";

import { computeCheckDigit, isValidRut, normalizeRut } from "../rut";

describe("computeCheckDigit", () => {
  it.each([
    ["11111111", "1"],
    ["11111112", "K"],
    ["11111117", "0"],
    ["12345678", "5"],
  ])("computes %s -> %s", (numero, expected) => {
    expect(computeCheckDigit(numero)).toBe(expected);
  });
});

describe("isValidRut", () => {
  it.each(["11111111-1", "11111112-K", "11111112-k", "11.111.111-1"])(
    "accepts %s",
    (rut) => {
      expect(isValidRut(rut)).toBe(true);
    },
  );

  it.each(["11111111-2", "12345678-K", "111111111", "11111111-X", ""])(
    "rejects %s",
    (rut) => {
      expect(isValidRut(rut)).toBe(false);
    },
  );
});

describe("normalizeRut", () => {
  it("strips dots and upper-cases the check digit", () => {
    expect(normalizeRut("11.111.112-k")).toBe("11111112-K");
  });
});
