/**
 * Strip dangerous HTML / script content from a user-supplied string.
 *
 * Use this for Excel-uploaded template data where strict validation already
 * rejects most malicious patterns AND some legitimate values may contain
 * stray `<` or `>` characters (e.g. fuel type names like
 * `Industrial gas-oil <0.10% sulfur>`).
 *
 * Why not DOMPurify here?
 *   DOMPurify in default config HTML-encodes any stray `<` / `>` to `&lt;` /
 *   `&gt;`, which corrupts master-data values whose `value` field is matched
 *   downstream during emission calculations. It also keeps "safe" HTML
 *   (`<b>`, `<div>`, `<a>`, `<img>`) which is still unwanted code in this
 *   tabular-data context.
 *
 * What this function strips:
 *   - `<script>...</script>` and `<style>...</style>` blocks (with content)
 *   - HTML comments and CDATA / processing instructions
 *   - Any HTML-tag-shaped substring that begins with a letter (e.g. `<div>`,
 *     `<svg/onload=...>`, `<img src=x>`). Sequences like `<0.10%>` start with
 *     a digit and are kept as-is.
 *   - Inline event-handler attributes (`onclick=`, `onerror=`, …)
 *   - `javascript:`, `vbscript:`, `data:text/html` URI schemes (anywhere)
 *
 * What this function preserves:
 *   - All plain text characters (no HTML-encoding of `<`, `>`, `&`, quotes)
 *   - Master-data values containing `<`, `>`, `(`, `)`
 *   - Numeric, alphanumeric, and ordinary free-text content
 */
export const stripScriptContent = (input: unknown): string => {
  if (input === null || input === undefined) return "";
  let result = String(input);

  result = result.replace(/<script\b[\s\S]*?<\/script\s*>/gi, "");
  result = result.replace(/<script\b[^>]*\/?>/gi, "");
  result = result.replace(/<style\b[\s\S]*?<\/style\s*>/gi, "");
  result = result.replace(/<style\b[^>]*\/?>/gi, "");

  result = result.replace(/<!--[\s\S]*?-->/g, "");
  result = result.replace(/<!\[CDATA\[[\s\S]*?\]\]>/g, "");
  result = result.replace(/<\?[\s\S]*?\?>/g, "");

  result = result.replace(/<\/?[a-zA-Z][^>]*>/g, "");

  result = result.replace(/\son\w+\s*=\s*"[^"]*"/gi, "");
  result = result.replace(/\son\w+\s*=\s*'[^']*'/gi, "");
  result = result.replace(/\son\w+\s*=\s*[^\s>]+/gi, "");

  result = result.replace(/javascript\s*:/gi, "");
  result = result.replace(/vbscript\s*:/gi, "");
  result = result.replace(/data\s*:\s*text\/html/gi, "");

  return result.trim();
};

/**
 * Strip script content and return `null` for empty/whitespace results.
 * Convenience wrapper for optional fields that should land in the DB as
 * `NULL` instead of an empty string.
 */
export const stripScriptContentOrNull = (input: unknown): string | null => {
  const stripped = stripScriptContent(input);
  return stripped === "" ? null : stripped;
};
