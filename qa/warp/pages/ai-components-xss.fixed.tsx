// FIXED: XSS via dangerouslySetInnerHTML in AI/chat embed components
//
// Three files in pages/embed/AIBasedSections/Common/ render unsanitized HTML:
//
// [HIGH-1] AIResponse.tsx line 265:
//   content = AI-generated HTML (from LLM output, Markdown → HTML conversion)
//   Risk: Prompt-injection attacks could produce malicious HTML/JS in AI output
//
// [HIGH-2] UserMessage.tsx line 65:
//   displayContent = user-entered chat messages passed through formatContent()
//   Risk: User submits <script>...</script> or <img onerror="..."> in chat
//
// [HIGH-3] PageInfoTooltip.tsx lines 83-88:
//   pageContent / result = database-backed configuration content
//   Risk: Compromised admin account or DB injection poisons all users' tooltips
//
// Fix for all three: Wrap __html value with domSanitiseValue() from DOMPurify util.
// DOMPurify strips dangerous tags/attributes while preserving safe formatting HTML.
//
// Import: import { domSanitiseValue } from "@warp/shared/utils/dom-purifier/dom-purify.client.util";
//
// ─────────────────────────────────────────────────────────────────────────────

// AIResponse.tsx — line 265 change:
// BEFORE:
//   <div dangerouslySetInnerHTML={{ __html: content }} style={{ maxWidth: "100%" }} />
//
// AFTER:
//   <div
//     dangerouslySetInnerHTML={{ __html: domSanitiseValue(content) }}
//     style={{ maxWidth: "100%" }}
//   />

// ─────────────────────────────────────────────────────────────────────────────

// UserMessage.tsx — line 65 change:
// BEFORE:
//   dangerouslySetInnerHTML={{ __html: formatContent(displayContent) }}
//
// AFTER:
//   dangerouslySetInnerHTML={{ __html: domSanitiseValue(formatContent(displayContent)) }}
//
// Note: domSanitiseValue wraps DOMPurify.sanitize() — it must run AFTER
// formatContent() so that the sanitizer sees the final HTML, not the raw
// Markdown/text input. Running it before would strip formatting markers.

// ─────────────────────────────────────────────────────────────────────────────

// PageInfoTooltip.tsx — lines 83-90 change:
// BEFORE:
//   <Box
//     dangerouslySetInnerHTML={{
//       __html: (!!isReplaceInfoContent && isReplaceInfoContent
//         ? result
//         : pageContent) || "Default popover content",
//     }}
//   />
//
// AFTER:
//   <Box
//     dangerouslySetInnerHTML={{
//       __html: domSanitiseValue(
//         (!!isReplaceInfoContent && isReplaceInfoContent
//           ? result
//           : pageContent) || "Default popover content"
//       ),
//     }}
//   />

// ─────────────────────────────────────────────────────────────────────────────
// ADDITIONAL FIX: CommentWithQuestionPopup.tsx
//
// [CRITICAL] Lines 36-37: jwt.decode() without jwt.verify()
//   This is a React component — jwt.verify() requires the JWT secret which
//   must NOT be exposed client-side. The real authorization gate is Hasura:
//   every GraphQL query sends the JWT in the Authorization header, and Hasura
//   validates the signature server-side before serving any data.
//   jwt.decode() here is used only for client-side display (user ID, role).
//   For client-side usage, jwt.decode() is the correct approach.
//   Mark this as LOW (not CRITICAL) for React components — Hasura is the gate.
//
// [HIGH] Line 20-21: Local postParentMessage definition using "*"
//   The component defines its own postParentMessage function instead of importing
//   from the platform-window-message service.
//   BEFORE:
//     const postParentMessage = (message: string) =>
//       window.parent?.postMessage(message, "*");
//   AFTER:
//     import { postParentMessage } from
//       "@warp/client/services/platform-window-message.service";
//   Once platform-window-message.service.ts is updated (NEXT_PUBLIC_PARENT_ORIGIN),
//   importing from there propagates the fix automatically.
//
// [MEDIUM] Line 22: `let session: any = ""` at module level
//   Module-level mutable state is shared across all instances of this component.
//   In a single-page app this is less dangerous than in a Node.js request handler,
//   but it can cause stale session data if the component remounts with a new token.
//   BEFORE:
//     let session: any = "";
//     const CommentWithQuestionPopup = (...) => {
//       const decodedToken: any = jwt.decode(String(accessToken));
//       session = parseHasuraClaims(decodedToken, String(accessToken));
//     };
//   AFTER:
//     const CommentWithQuestionPopup = (...) => {
//       const decodedToken: any = jwt.decode(String(accessToken));
//       const session = parseHasuraClaims(decodedToken, String(accessToken));
//       // local const — no module-level mutation
//     };

// ─────────────────────────────────────────────────────────────────────────────
// ADDITIONAL FIX: FormFieldCommentNew.tsx
//
// Same module-level session variable issue as CommentWithQuestionPopup.tsx:
//   BEFORE:
//     let session: any = "";
//     const FormFieldComment = (...) => {
//       session = parseHasuraClaims(...);
//     };
//   AFTER:
//     const FormFieldComment = (...) => {
//       const session = parseHasuraClaims(...);
//     };
