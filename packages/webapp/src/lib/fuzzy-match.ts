/**
 * Substring match: returns true if `query` appears as a contiguous substring
 * in `text`. Case-insensitive. Empty query matches everything.
 */
export function fuzzyMatch(query: string, text: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const t = text.toLowerCase();
  return t.includes(q);
}

/**
 * Returns true if the query appears as a contiguous substring in any of the given strings.
 */
export function fuzzyMatchAny(query: string, texts: string[]): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return texts.some(text => fuzzyMatch(query, text));
}
