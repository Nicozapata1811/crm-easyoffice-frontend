/**
 * Chilean RUT validation.
 *
 * Client side only, for immediate feedback. The backend validates again and
 * its answer is the authoritative one. This checks the identifier's internal
 * consistency; it does not verify the RUT against any registry, and no such
 * integration exists.
 */

const RUT_PATTERN = /^(\d{7,8})-([\dkK])$/;
const MODULUS = 11;
const MIN_FACTOR = 2;
const MAX_FACTOR = 7;

/** Return the check digit for the numeric part of a RUT. */
export function computeCheckDigit(numero: string): string {
  let total = 0;
  let factor = MIN_FACTOR;

  for (const digit of [...numero].reverse()) {
    total += Number(digit) * factor;
    factor = factor === MAX_FACTOR ? MIN_FACTOR : factor + 1;
  }

  const remainder = MODULUS - (total % MODULUS);
  if (remainder === MODULUS) return "0";
  if (remainder === MODULUS - 1) return "K";
  return String(remainder);
}

/** Strip dots and spaces, and upper-case a trailing K. */
export function normalizeRut(value: string): string {
  return value.replace(/[.\s]/g, "").toUpperCase();
}

/** Whether a RUT is well formed and its check digit is correct. */
export function isValidRut(value: string): boolean {
  const match = RUT_PATTERN.exec(normalizeRut(value));
  if (!match) return false;

  const [, numero, checkDigit] = match;
  return checkDigit.toUpperCase() === computeCheckDigit(numero);
}

/** Display form with thousands dots, for example 12.345.678-5. */
export function formatearRut(value: string): string {
  const match = RUT_PATTERN.exec(normalizeRut(value));
  if (!match) return value;

  const [, numero, checkDigit] = match;
  return `${numero.replace(/\B(?=(\d{3})+$)/g, ".")}-${checkDigit.toUpperCase()}`;
}
