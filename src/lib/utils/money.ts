/**
 * Safely convert a Drizzle numeric string (or number) to a JavaScript number.
 * Uses Number() which handles the same formats as parseFloat but is stricter
 * (e.g. rejects trailing non-numeric chars). Safe for typical business amounts
 * under $1B — well within IEEE 754 double precision integer range (2^53).
 */
export function parseMoney(value: string | number): number {
  return Number(value);
}
