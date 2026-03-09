/**
 * Sanitize user input for use in PostgREST ilike filters.
 * Escapes SQL wildcard characters to prevent pattern injection.
 */
export function sanitizeSearchInput(input: string): string {
  return input
    .trim()
    .replace(/\\/g, '\\\\')  // escape backslash first
    .replace(/%/g, '\\%')     // escape % wildcard
    .replace(/_/g, '\\_');    // escape _ wildcard
}
