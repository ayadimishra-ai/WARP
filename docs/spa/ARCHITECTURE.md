# SPA Architecture

## What the SPA Is and Does

`ewizprocure_spa` is a React single-page application that serves as the buyer-facing frontend for the Snowkap / EwizGreen / EwizProcure procurement and ESG platform. It is the primary shell that authenticated users interact with.

Its responsibilities:

- **Authentication gateway** — handles login, registration, email verification, OTP, and SSO handoff. Persists session state (tokens, user profile, permissions) in `localStorage`.
- **Procurement workflows** — product catalogue browsing, purchase requests (PR), purchase orders (PO), RFQ lifecycle, buying windows, baskets, and wishlist.
- **ESG / sustainability** — ESG scoring dashboard, pre-deal and post-deal ESG reports, GHG activity data entry, goal setting, carbon emission factor management, and AI-assisted data extraction and verification.
- **Supplier on-boarding** — assessment forms (one-time and monthly questionnaires), assessment recommendations, locked assessments (Daimler variant), and AI statistics.
- **Document repository** — supplier document upload, duplicate, delete, and expiry management, backed by an embedded WARP iframe.
- **AI modules** — conversational AI chat (`ChatWithSnowkapAI`), AI-driven document upload, and bulk data upload workflows.
- **Admin / ops** — user and location management, supplier material and location master tables, data upload log summaries, supplier tracker, carbon / UOM conversion factor tables.
- **Dashboard** — GHG dashboard (OPS variant), PowerBI-based reports, logistic dashboards, health-and-safety dashboard, procurement dashboard.

The SPA itself contains no server-side logic. All data comes from three backend services and one search index (see API section below).

---

## Tech Stack

| Concern | Technology |
|---------|-----------|
| Language | JavaScript (no TypeScript) |
| Framework | React 16.8 (class components are dominant; a few functional components exist) |
| Build system | Custom CRA-derived webpack 4 (`scripts/start.js`, `scripts/build.js`) |
| Bundler config | `config/webpack.config.js` — standard CRA layout with minor modifications |
| State management | Redux 4 + redux-thunk (actions in `src/store/actions/`, reducers in `src/store/reducers/`) |
| Routing | react-router-dom v4 (`<Switch>` + `<Route>` in `src/App.js`), `src/history.js` for imperative navigation |
| HTTP client | axios 0.21 — a singleton `nextJSApiClient` is in `src/nextjs-api-client.js`; most containers make direct `axios.get/post` calls |
| UI library | Material-UI v3 (`@material-ui/core`, `@material-ui/icons`, `@material-ui/pickers`) |
| Charts | amCharts 4 & 5, Highcharts 7, PowerBI embedded (`powerbi-client-react`) |
| Auth tokens | JWT stored in `localStorage` under the keys `tokenId` (platform), `opsToken` (OPS), `warpToken` (WARP) |
| Search | Elasticsearch (direct browser calls via the `elasticsearch` npm client and raw axios requests to AWS OpenSearch) |
| Real-time | Firebase Firestore (buying-window commitments, collaboration chat, notifications) |
| reCAPTCHA | Visible (`react-google-recaptcha`) and invisible reCAPTCHA |
| Sanitisation | DOMPurify 3 is installed but not uniformly applied (see CHANGELOG notes) |
| Node runtime | 16.20.2 (pinned via Volta) |
| Package manager | npm (primary) — `package-lock.json` is present; yarn also has a lock file |

---

## Key Directories

```
spa/
├── public/                    Static assets, index.html
├── config/                    webpack.config.js, jest, devServer, env loader
├── scripts/                   start.js, build.js, test.js, generate-csp.js
└── src/
    ├── App.js                 Top-level router — all <Route> declarations live here
    ├── index.js               ReactDOM.render entry point, Redux <Provider> and <Router>
    ├── config.js              All URL getters (elasticServerUrl, getServiceUrl,
    │                          getNextJSServiceUrl, GetWARPUrl, GetGHGEstimationUrl,
    │                          getOPsPUrl, getAWSUrl, …) and credential helpers
    │                          (googleCaptcha, googleInvisibleCaptchaSiteKey, getToken).
    │                          Single source of truth for environment-specific endpoints.
    ├── history.js             Shared browser history instance (createBrowserHistory)
    ├── nextjs-api-client.js   Axios singleton pre-configured for the Next.js backend;
    │                          attaches Bearer token from localStorage on every request.
    ├── utility.js             BreadCrumb builder, getOPsUrl(), setLastNavigation(),
    │                          token decode helpers, Elasticsearch helpers.
    ├── sessionInvalidation.js Session expiry checks called during login flows.
    ├── rolecodes.js           User role string constants (BUYER, SUPPLIER, ADMIN, …)
    ├── pagekeys.js            Permission key constants for route guards
    ├── featurecodes.js        Feature-flag key constants
    │
    ├── hoc/
    │   └── PlatformSessionMonitor.js  HOC that wraps the entire app tree.
    │                                  Runs a 2-second interval that decodes and
    │                                  validates all three JWTs; forces logout on
    │                                  any expiry. Also refreshes the platform token
    │                                  automatically for unauthenticated users.
    │
    ├── store/
    │   ├── actions/           Redux action creators + thunks
    │   │   ├── login.js       Login / logout actions; writes all tokens to localStorage
    │   │   ├── master.js      Global master data (company info, settings)
    │   │   ├── initiateAssessment.js
    │   │   ├── monthlyActivityData.js
    │   │   └── …
    │   └── reducers/          Corresponding reducers (plain objects, no Immer)
    │
    ├── warp/
    │   ├── warp.service.js    WarpNavigator — imperative push() helpers that build
    │   │                      assessment / document-repository deep-link URLs and
    │   │                      call browserHistory.push().
    │   ├── warp.constant.js   FormTypes enum and other WARP-domain constants.
    │   └── warp.config.js     (if present) WARP-specific config overrides.
    │
    ├── ops/
    │   └── ops.service.js     OPsNavigatorOneTime / OPsNavigatorMonthly —
    │                          same pattern as WarpNavigator but for OPS routes.
    │                          Also exports CheckIsDaimlerCompany() (hardcoded org GUIDs).
    │
    ├── components/
    │   ├── Layout/
    │   │   ├── Layout.js      Root shell — Header, Body, Footer, IdleTimer,
    │   │   │                  and the newHandle() postMessage listener that handles
    │   │   │                  cross-iframe UI state from both WARP and OPS.
    │   │   ├── EnterpriseLayout.js
    │   │   └── DataUploadLogSummaryLayout.js
    │   ├── Header/
    │   │   └── HeaderButtons.js  Action buttons in the top bar; sends postMessages
    │   │                         to the WARP iframe (approve-entire-report) and
    │   │                         to the same window (warp-new-invitation-started-Report).
    │   ├── CustomRoutes/
    │   │   └── PrivateRoute.js   Route guard; reads Redux login state + localStorage
    │   │                         permissions to allow or redirect.
    │   ├── BulkUploadBtn&DownloadTemplateDropdown/
    │   │   └── BulkUploadDropdown.js  Sends postMessages to the GHG Estimation iframe
    │   │                              (bulk-page-refresh, ai-upload, manual-upload, …).
    │   └── …                  Charts, AccountOnboarding, Chatbot, Collaboration, etc.
    │
    ├── containers/
    │   ├── Login/
    │   │   └── SingleLogin.js     Login form; calls getToken() + login action.
    │   ├── Dashboard/
    │   │   ├── GHGDashboardOPs.js   Embeds GHG Estimation iframe; sends getparams message.
    │   │   └── …                    PowerBI, Ather, Chiratae, Logistic dashboards.
    │   ├── DocumentRepositoryPage.js  Large container; embeds a WARP iframe for the
    │   │                              document repository. Handles delete/duplicate/expired
    │   │                              popup flows via postMessage.
    │   ├── SupplierOnBoarding/
    │   │   ├── Assessments.js            WARP iframe — assessment listing
    │   │   ├── AssessmentDetails.js      WARP iframe — assessment form, 12+ postMessage
    │   │   │                             flows, resize listener, reCAPTCHA relay.
    │   │   ├── AssessmentListingOneTime.js   OPS iframe — one-time assessments listing
    │   │   ├── AssessmentListingMonthly.js   OPS iframe — monthly assessments listing
    │   │   ├── AssessmentsLock.js            Daimler-specific locked view
    │   │   ├── AssessmentRecommendDetails.js WARP iframe — recommendations
    │   │   ├── AIStatistics.js               WARP iframe — AI upload statistics
    │   │   └── …
    │   ├── OpsContainer/
    │   │   ├── GHGActivity.js                   GHG Estimation iframe
    │   │   ├── MonthlyActivityData.js            GHG Estimation iframe
    │   │   ├── EnergyGridManualEntryActivityData.js
    │   │   ├── CaptivePowerManualEntryActivityData.js
    │   │   ├── WasteManualEntryActivityData.js
    │   │   ├── FuelConsumptionManualEntryActivityData.js
    │   │   ├── GoalSetting.js
    │   │   ├── AIVerifyExtractedData.js
    │   │   ├── UserActivityMapping.js
    │   │   ├── SupplierMaterialMapping.js
    │   │   ├── DataUploadLogSummary.js
    │   │   └── supplier-*/                  Bulk-upload sub-containers
    │   └── AIModules/
    │       └── ChatWithSnowkapAI.js         WARP iframe — AI chat
    │
    ├── UI/                    Generic UI primitives (Button, Spinner, Popups, …)
    ├── google-invisible-recaptcha/
    │   └── RecaptchaProvider.js   Invisible reCAPTCHA context provider
    └── assets/                Images, icons, JS SVG icon components
```

---

## Iframe / postMessage Communication Architecture

The SPA acts as a **host shell** that embeds three separate applications as iframes. Each application runs on a different origin. Cross-frame communication uses `window.postMessage`.

### The Three Embedded Applications

| Name | Origin helper | Typical URL (live) | Role |
|------|--------------|-------------------|------|
| **WARP** | `GetWARPUrl()` | `https://jpbupa9zp2.ap-south-1.awsapprunner.com/` | Assessment forms, document repository, recommendations, AI chat, AI statistics |
| **OPS** | `getOPsPUrl()` | `https://d3tknfyzn57sx1.cloudfront.net/` | One-time and monthly assessment listings |
| **GHG Estimation** | `GetGHGEstimationUrl()` | `https://rpgvnj3rgw.ap-south-1.awsapprunner.com/` | GHG activity data, goal setting, AI data extraction, bulk upload, dashboards |

### Message Flow: Host → Iframe

Containers call `iframeElement.contentWindow.postMessage(payload, targetOrigin)` to instruct the embedded app. After the QA pass, the target origin is computed as:

```js
const WARP_Link = GetWARPUrl();
// Used as:
WARP_Link ? new URL(WARP_Link).origin : "*"

const GHGEstimate_Link = GetGHGEstimationUrl();
// Used as:
GHGEstimate_Link ? new URL(GHGEstimate_Link).origin : "*"
```

Common host-to-iframe message types:

- `callApi` — triggers an API call inside the GHG iframe
- `confirm-file-delete`, `confirm-delete-form-entry-true` — confirm deletion inside GHG iframe
- `manual-entry-confirm-cancel` — cancel a manual entry dialog
- `snowkap-isRefreshPage`, `warp-invitation-form-start` — WARP iframe lifecycle events
- `reCaptchaValidation` — forwards reCAPTCHA token from the host to the WARP iframe
- `warp-approve-entire-report` — triggers report approval inside WARP
- `PARENT_CLICK_OUTSIDE` — tells the iframe that the user clicked outside a dropdown
- `getparams` — requests URL parameters from the GHG dashboard iframe
- Bulk-upload events: `bulk-page-refresh`, `manual-upload`, `ai-upload`, `ai-upload-pop-up-closed`

### Message Flow: Iframe → Host

The SPA registers `window.addEventListener("message", handler)` listeners in multiple containers and in `Layout.js`. After the QA pass, the two most sensitive handlers validate the sender origin:

**`Layout.js` — `newHandle`**
```js
const allowedOrigins = [GetWARPUrl(), getOPsPUrl()]
  .map(url => { try { return new URL(url).origin; } catch(e) { return null; } })
  .filter(Boolean);
if (allowedOrigins.length > 0 && !allowedOrigins.includes(event.origin)) return;
```

**`AssessmentDetails.js` — `handleMessage`**
```js
const allowedOrigins = [WARP_Link ? new URL(WARP_Link).origin : null].filter(Boolean);
if (allowedOrigins.length > 0 && !allowedOrigins.includes(event.origin)) return;
```

Common iframe-to-host message types (decoded from JSON string payloads):

- `ops-content-resize` — iframe reports its scroll height so the host can resize the `<iframe>` element
- `ops-check-localStorage-access` — iframe checks third-party cookie / storage access
- `ops-invitation-list-respond` / `ops-invitation-list-respond-Monthly` — user selected an assessment; host navigates
- `ops-new-invitation-started` / `ops-new-invitation-finished` — assessment request lifecycle
- `ops-invitation-list-view` — view an assessment
- `SETUP_CLICK_LISTENER` — iframe requests the host to forward outside-click events
- `snowkap-isRefreshPage` — request a page reload
- `warp-new-invitation-started-Report` — report generation started
- `ai-verify-discard-clicked`, `ai-verify-extracted-data-close` — AI verification dialog events
- `DeleteMeterConfirmed` — user confirmed meter deletion in GHG iframe

### LocalStorage Token Bridge

Before an iframe loads, the host writes the access token for that service into `localStorage`:

```
localStorage.opsToken   — OPS service JWT (fetched from /warp/GetOPsAuthToken)
localStorage.warpToken  — WARP JWT
localStorage.tokenId    — Platform JWT (the primary session token)
```

The embedded apps read these tokens directly. Some containers also verify third-party cookie / `localStorage` access via a hidden `<iframe src="<origin>/test">` that posts `ops-check-localStorage-access` back.

---

## Auth Flow

```
1. User lands on "/" (SingleLogin)
2. Login form submits credentials → POST /api/auth (Next.js backend) via axios
3. Backend returns { tokenId, expires_in, IsAuthentic: "true", userType, permissions, … }
4. Redux login action stores all fields in localStorage:
     localStorage.tokenId       — platform JWT
     localStorage.IsAuthentic   — "true"
     localStorage.userType      — JSON array of role strings
     localStorage.permissions   — JSON array of permission objects
     localStorage.companyGuid   — company UUID
     localStorage.emailId       — user email
5. App.js checks IsAuthentic === "true" → redirects to /home (Dashboard)
6. PlatformSessionMonitor HOC starts a 2-second interval that:
   a. Reads tokenId, opsToken, warpToken from localStorage
   b. Decodes each JWT (decodePlatformToken / decodeOpAccessToken / decodeWarpAccessToken)
   c. If any token is expired → shows "Session Expired" popup → localStorage.clear() → redirect to "/"
   d. For unauthenticated routes, auto-refreshes the platform token via getTokenAsync()
7. Protected routes use <PrivateRoute> which checks Redux login state and localStorage.permissions
   using getUserPermision(permissions, pageKey); redirects to /not-found if the user lacks the key.
8. The Next.js API client (nextjs-api-client.js) attaches "Authorization: Bearer <tokenId>"
   to every request via an axios request interceptor.
9. Direct axios calls in containers manually construct the Authorization header from localStorage.tokenId.
10. On 401 responses, containers redirect to /logout which clears localStorage.
```

Token storage model: all tokens are stored as plain strings in `localStorage` — not in `sessionStorage` or HTTP-only cookies. Expiry is enforced by the client-side `PlatformSessionMonitor` interval, not by automatic cookie expiry.

---

## API Backends

| Backend | Base URL getter | Used for |
|---------|----------------|---------|
| .NET microservice | `getServiceUrl()` → `https://livems.snowkap.com/api/` | Login, auth tokens, most CRUD operations |
| Next.js app runner | `getNextJSServiceUrl()` → `https://smppthkqwy.ap-south-1.awsapprunner.com/api/` | Newer API routes (document AI, RARA, platform management) |
| AWS OpenSearch | `elasticServerUrl()` → AWS ES endpoint | Product listing, dashboard analytics, language resources |
| AWS S3 / CloudFront | `getAWSUrl()` → CloudFront domain | Static assets, document storage |

All base URLs are hardcoded in `src/config.js`. There is no environment variable switching at runtime — switching environments requires a code change or a rebuild with different source.

---

## Build Process

```
npm run start   → node scripts/start.js
                  Loads .env via dotenv-expand, runs webpack-dev-server with HMR.
                  CRA env vars (REACT_APP_*) are injected at build time via DefinePlugin.

npm run build   → node scripts/build.js
                  Production webpack build; outputs to build/.
                  Minification via terser, CSS extraction via mini-css-extract-plugin.

npm run generatecsp → node scripts/generate-csp.js
                      Post-build script that computes Content-Security-Policy hash values
                      for inline scripts/styles and writes them into public/index.html.

npm run test    → node scripts/test.js (Jest + jsdom)
                  Test files match src/**/__tests__/**/*.js or src/**/*.test.js.
                  No test files exist at the time of this writing.
```

### Environment Variables

CRA injects only `REACT_APP_*` prefixed variables. Any `process.env.*` reference without that prefix is `undefined` at runtime (a source of the bugs fixed in this pass). Key variables:

| Variable | Purpose |
|----------|---------|
| `REACT_APP_CLIENT_ID` | Service account username for token endpoint |
| `REACT_APP_CLIENT_SECRET` | Service account password (committed in `.env` — should be rotated) |
| `REACT_APP_FREIGHT_CLIENT_SECRET` | Freight service secret (same concern) |
| `REACT_APP_RECAPTCHA_SITE_KEY` | Visible reCAPTCHA site key (added in QA pass; falls back to hardcoded value) |
| `REACT_APP_RECAPTCHA_INVISIBLE_SITE_KEY` | Invisible reCAPTCHA site key (same) |

Node version is pinned to 16.20.2 via Volta (`volta` field in `package.json`).
