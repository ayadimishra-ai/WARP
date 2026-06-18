# AI Processing Completed — API Reference

## Endpoint

```
POST /api/AI/ai-processing-completed
```

---

## Authentication

Every request must include the shared service token in the header.

| Header | Value |
|--------|-------|
| `x-ai-services-authorization` | Shared secret from `AI_SERVICES_AUTHORIZATION` env variable |

Missing or incorrect token returns `401 Unauthorized`.

---

## Request

**Content-Type:** `application/json`

**Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `processingIds` | `string[]` | Yes | One or more record IDs from any of the three curation tables (AIBulkDocumentProcessing, WebCuration, OPSToIQCuration). A single call may mix IDs from different tables. |

**Example:**
```json
{
  "processingIds": [
    "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "7cb12a91-1234-4abc-9def-0f1e2d3c4b5a"
  ]
}
```

---

## Response

**Success `200`**
```json
{
  "data": [
    {
      "result": {
        "accepted": ["recipient@example.com"],
        "rejected": [],
        "response": "250 Message accepted"
      },
      "type": "Process Document"
    }
  ],
  "error": null
}
```

**Response Schema:**
- `data`: Array of email send results. Each item contains:
  - `result`: Email delivery result object
    - `accepted`: Array of successfully delivered email addresses
    - `rejected`: Array of rejected email addresses
    - `response`: SMTP server response message
  - `type`: Type of email sent (e.g., "Process Document")
- `error`: `null` on success, error message string on failure

**Processing failed / service error `400`**
```json
{
  "data": null,
  "error": "error description"
}
```

**Unauthorized `401`**
```json
{
  "data": null,
  "error": "Unauthorized"
}
```

**Method not allowed `405`**
```json
{
  "data": null,
  "error": "Method Not Allowed"
}
```

---

## Rate Limit

60 requests per minute per IP. Exceeding returns `429 Too Many Requests`.

---

## Migration from Legacy Endpoints

This endpoint replaces both legacy callbacks. Update integration as follows:

| Legacy | New |
|--------|-----|
| `POST /api/AI/web-curation-for-processing` | `POST /api/AI/ai-processing-completed` |
| `POST /api/AI/document-processing-completed` | `POST /api/AI/ai-processing-completed` |

**Breaking change for WebCuration:** The legacy endpoint accepted `FormInvitation` IDs. The new endpoint requires the `WebCuration` table record ID instead.

| Curation type | ID to send |
|---------------|-----------|
| Document processing | `AIBulkDocumentProcessing.id` |
| Web curation | `WebCuration.id` ← **changed** |
| OPS-to-IQ | `OPSToIQCuration.id` |

---

## cURL

```bash
curl --location 'https://<host>/api/AI/ai-processing-completed' \
  --header 'Content-Type: application/json' \
  --header 'x-ai-services-authorization: <token>' \
  --data '{
    "processingIds": ["<processing-record-id>"]
  }'
```
