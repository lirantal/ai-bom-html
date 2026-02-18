/**
 * Fuzzy match: returns true if every character of `query` appears in `text`
 * in order (subsequence match). Case-insensitive. Empty query matches everything.
 */
export function fuzzyMatch(query: string, text: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const t = text.toLowerCase();
  let j = 0;
  for (let i = 0; i < t.length && j < q.length; i++) {
    if (t[i] === q[j]) j++;
  }
  return j === q.length;
}

/**
 * Returns true if the query fuzzy-matches any of the given strings.
 */
export function fuzzyMatchAny(query: string, texts: string[]): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return texts.some(text => fuzzyMatch(query, text));
}
