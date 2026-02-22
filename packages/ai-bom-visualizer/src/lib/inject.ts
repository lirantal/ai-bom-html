export const PLACEHOLDER_TOKEN = '{{{PLACEHOLDER_JSON_TOKEN}}}'

/**
 * Escape </script> in JSON so the HTML parser does not close the script tag early.
 */
function escapeScriptContent (s: string): string {
  return s.replace(/<\/script/gi, '\\u003c/script')
}

/**
 * Replace the placeholder token in the template HTML with the BOM JSON string.
 * Only replaces the token inside the <script id="bom-data"> tag (the template
 * also contains the token as a string literal in the bundled JS).
 * Escapes any </script in the JSON so the HTML remains valid.
 */
export function injectBomIntoHtml (htmlTemplate: string, bomJson: string): string {
  const safe = escapeScriptContent(bomJson)
  const scriptTagPattern = new RegExp(
    `(id="bom-data">)${escapeRegex(PLACEHOLDER_TOKEN)}(</script>)`,
    'i'
  )
  return htmlTemplate.replace(scriptTagPattern, `$1${safe}$2`)
}

function escapeRegex (s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
