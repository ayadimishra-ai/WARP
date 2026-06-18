# QA: v1/platform Routes — Addresses, User, EmailSubscribed (7 files)

**Files covered:**
- `v1/platform/company/addresses/delete-address.ts`
- `v1/platform/company/addresses/save-address.ts`
- `v1/platform/company/addresses/update-address.ts`
- `v1/platform/user/UpdateResetPasswordFlag.ts`
- `v1/platform/user/index.ts`
- `v1/platform/emailsubscribed/index.ts`

**Status:** CRITICAL issues found  
**Reviewer:** Claude Code  
**Date:** 2026-06-18

---

## Shared Issues

### [CRITICAL-1] No authentication on all 6 routes

None of the 6 routes verifies a JWT or session. Any caller can:
- Create, update, or delete company addresses for any `companyId`
- Reset the password flag for any user ID
- Create or update any user record
- Update email subscription status for any user

---

## File-Specific Issues

### `delete-address.ts`

#### [HIGH-1] Yup validation schema commented out — no input validation

```typescript
// const AddressBodySchema = yup.array().of(...)
// const input = await AddressBodySchema.validate(req.body);
```

The validation schema is commented out. `req.body` is passed directly to `deleteAddresses()` with no validation.

#### [HIGH-2] `req.body[0].id` crashes if body is not array or is empty

```typescript
const input = req.body[0].id;
```

If the request body is not an array, or the array is empty, `req.body[0]` is `undefined` and `.id` throws `TypeError`.

#### [MEDIUM-1] `error || "Internal Server Error"` — full Error object to client

```typescript
res.status(500).json({ error: error || "Internal Server Error" });
```

#### [LOW-1] Handler name `deleteaddresshandler` — not camelCase

Should be `deleteAddressHandler`.

---

### `save-address.ts`

Well-structured (uses `ApiErrorGuard`, `ApiMethodGuard`, Yup validation). Only gap is authentication (CRITICAL-1 above).

---

### `update-address.ts`

Well-structured (uses `ApiErrorGuard`, `ApiMethodGuard`, Yup validation). Only gap is authentication (CRITICAL-1 above).

---

### `UpdateResetPasswordFlag.ts`

#### [HIGH-3] Schema validation error message mismatch — copy-paste error

```typescript
const AddressBodySchema = yup.object().shape({
  id: yup.string().required("IsResetPassword is Required"),
});
```

The Yup schema validates the `id` field but the error message says `"IsResetPassword is Required"`. This is a copy-paste error from the address schema. If validation fails, the client receives a confusing error about a field that doesn't exist in the request.

#### [LOW-2] Mixed naming: `UpdateResetPasswordhandler` (PascalCase function, lowercase 'h')

Should be `updateResetPasswordHandler`.

---

### `v1/platform/user/index.ts`

#### [MEDIUM-2] Missing body returns HTTP 405 instead of 400

```typescript
if (!req.body) {
  res.status(405).send({ error: { message: "Request body is required." } });
}
```

Missing body is a client error (400 Bad Request), not a method error (405 Method Not Allowed).

#### [MEDIUM-3] `error || "Internal Server Error"` — full Error object to client

---

### `v1/platform/emailsubscribed/index.ts`

#### [MEDIUM-4] `choosemethod` imported but never used

```typescript
const { choosemethod } = encryptionDecryption();
```

`choosemethod` is destructured from the `encryptionDecryption()` hook but never called in the handler. The entire import of `encryptionDecryption` is dead code.

#### [MEDIUM-5] Missing body returns HTTP 405 instead of 400

Same pattern as user/index.ts.

#### [MEDIUM-6] `error || "Internal Server Error"` — full Error object to client

---

## Summary Table

| ID | Severity | File | Issue |
|---|---|---|---|
| CRITICAL-1 | Critical | All 6 | No authentication |
| HIGH-1 | High | delete-address.ts | Yup validation schema commented out |
| HIGH-2 | High | delete-address.ts | `req.body[0].id` crashes if body not array |
| HIGH-3 | High | UpdateResetPasswordFlag.ts | Schema error message references wrong field |
| MEDIUM-1 | Medium | delete-address.ts | Full Error object to client |
| MEDIUM-2 | Medium | user/index.ts | Missing body returns 405 instead of 400 |
| MEDIUM-3 | Medium | user/index.ts | Full Error object to client |
| MEDIUM-4 | Medium | emailsubscribed/index.ts | `choosemethod` imported but unused |
| MEDIUM-5 | Medium | emailsubscribed/index.ts | Missing body returns 405 instead of 400 |
| MEDIUM-6 | Medium | emailsubscribed/index.ts | Full Error object to client |
| LOW-1 | Low | delete-address.ts | `deleteaddresshandler` not camelCase |
| LOW-2 | Low | UpdateResetPasswordFlag.ts | `UpdateResetPasswordhandler` — lowercase 'h' |
