# Plan: Power BI Secure Report Embedding

Add a reusable Power BI embed component (`src/components/PowerBIEmbed/`) and integrate it with the existing token generation API route at `api/environmental-dashboard/PowerBiTokenGeneration`. The existing backend infrastructure (Azure AD OAuth, token caching in DB, GraphQL-based settings) is already complete — the main work is the frontend embedding component using `powerbi-client-react`.

## Context: Existing Infrastructure

**Already built (no changes needed):**

- API route: `src/app/api/environmental-dashboard/PowerBiTokenGeneration/route.ts` — rate-limited POST, accepts `rname` header
- Service: `src/server/services/power-bi-token-generation.services.ts` — token generation with 10-min renewal buffer, DB caching
- Utils: `src/util/generateAccessToken.ts` (Azure AD OAuth2 client_credentials), `src/util/getReportDetails.ts` (lists reports), `src/util/ReportTokenData.ts` (embed token)
- GraphQL: queries for `Tbl_GlobalSettings` (Power BI config) and `Tbl_PowerBIReportDetails` (token cache)
- Types: `src/types/interface.types.ts` — `PowerBIResponse`, `ResponseValues`, `ReportValue`, etc.
- Config: Power BI settings stored in `Tbl_GlobalSettings` DB table, fetched at runtime via GraphQL

**Needs to be built:**

1. Frontend `PowerBIEmbed` reusable component
2. npm dependency: `powerbi-client-react` (and `powerbi-client` peer dep)
3. Custom hook for token fetching
4. Component types/props interface

## Steps

### Phase 1: Dependencies

1. Install `powerbi-client-react` and `powerbi-client` in `apps/web`
   - `pnpm --filter @snowkap/web add powerbi-client powerbi-client-react`

### Phase 2: Reusable Component — `src/components/PowerBIEmbed/`

2. Create `src/components/PowerBIEmbed/index.tsx` (main export)
   - "use client" directive (requires browser APIs)
   - Props interface: `reportName: string`, optional `height?: string`, `showBorder?: boolean`, `filters?: string`, `pageName?: string`
   - Calls internal hook to fetch token
   - Renders `PowerBIEmbed` from `powerbi-client-react` with:
     - `embedUrl`, `accessToken` (embed token), `id` (reportId)
     - `tokenType: models.TokenType.Embed`
     - `type: "report"`
     - `settings: { filterPaneEnabled: false, navContentPaneEnabled: false }`
   - Loading state: Mantine `Loader` or `Skeleton` component
   - Error state: Mantine `Alert` with error message
   - Auto-refreshes token before expiration using the `date1` (expiration) from API response

3. Create `src/components/PowerBIEmbed/usePowerBIToken.ts` — custom hook
   - Accepts `reportName: string`
   - Calls `POST /api/environmental-dashboard/PowerBiTokenGeneration` with `rname` header
   - Returns `{ data: ResponseValues | null, loading: boolean, error: string | null, refetch: () => void }`
   - Sets up auto-refresh interval based on token expiration (refresh 5 min before expiry)

4. Create `src/components/PowerBIEmbed/types.ts` — component-specific types
   - `PowerBIEmbedProps` interface
   - Re-export relevant types from `@/types/interface.types`

### Phase 3: Integration Verification

5. Verify component renders correctly at any page using:

   ```tsx
   <PowerBIEmbed reportName="MyReportName" height="600px" />
   ```

   - No page route needed since it's a reusable component
   - Example usage can be documented in the component file

## Relevant Files

**Existing (read-only references):**

- `src/app/api/environmental-dashboard/PowerBiTokenGeneration/route.ts` — existing API route (no changes)
- `src/server/services/power-bi-token-generation.services.ts` — token generation service (no changes)
- `src/types/interface.types.ts` — `PowerBIResponse`, `ResponseValues` types to import
- `src/util/generateAccessToken.ts` — reference for Azure AD flow understanding
- `src/util/getReportDetails.ts` — reference for report API structure
- `src/util/ReportTokenData.ts` — reference for embed token structure

**New files to create:**

- `src/components/PowerBIEmbed/index.tsx` — main component
- `src/components/PowerBIEmbed/usePowerBIToken.ts` — token fetch hook
- `src/components/PowerBIEmbed/types.ts` — component types

**Modified:**

- `apps/web/package.json` — add `powerbi-client`, `powerbi-client-react` dependencies

## Verification

1. `pnpm --filter @snowkap/web build` — confirm no TypeScript compilation errors
2. `pnpm lint` — confirm no lint errors in new files
3. Manual verification: Import `<PowerBIEmbed reportName="..." />` in any existing page (e.g., dashboard), confirm:
   - Loading spinner appears
   - API call fires to `/api/environmental-dashboard/PowerBiTokenGeneration`
   - Report renders (requires valid Power BI config in DB)
   - Error state shows meaningful message if API fails
4. Check browser Network tab: confirm token is fetched, embed URL is used
5. Wait for token to approach expiry — verify auto-refresh fires

## Decisions

- **Build on existing backend** — reuse existing API route, utilities, DB-stored settings (per user choice)
- **Reusable component** — placed in `src/components/PowerBIEmbed/` for use from any page (per user choice)
- **No new env vars** — Power BI config stays in `Tbl_GlobalSettings` DB table, consistent with existing pattern
- **powerbi-client-react** — official Microsoft React wrapper for Power BI JS SDK, handles embed lifecycle
- **Token auto-refresh** — component handles token refresh preemptively, using expiration from API response

## Further Considerations

1. **Row-Level Security (RLS):** Current implementation uses `accessLevel: "View"` without RLS identity. If per-user data filtering is needed later, the `ReportTokenData` utility would need to include `identities` in the token request payload. _Recommend: skip for now, add when needed._
2. **SSR concern:** `powerbi-client-react` requires browser APIs (DOM). The component must be `"use client"` and may need dynamic import with `{ ssr: false }` if imported from a server component page.
