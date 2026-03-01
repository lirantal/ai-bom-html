/**
 * Some CLI tools (e.g. Snyk) write spinner/progress text to stdout before the
 * actual JSON payload. Extract the outermost JSON object so the parser isn't
 * tripped up by leading or trailing non-JSON content.
 */
export function extractJson (raw: string): string {
  const start = raw.indexOf('{')
  const end = raw.lastIndexOf('}')
  if (start === -1 || end === -1 || end <= start) {
    return raw.trim()
  }
  return raw.substring(start, end + 1)
}
