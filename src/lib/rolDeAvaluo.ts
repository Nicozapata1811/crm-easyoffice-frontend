/** Rol de avalúo: the property tax roll number, expected as 0000-00. */

const ROL_PATTERN = /^\d{4}-\d{2}$/;

export function isValidRolDeAvaluo(value: string): boolean {
  return ROL_PATTERN.test(value.trim());
}
