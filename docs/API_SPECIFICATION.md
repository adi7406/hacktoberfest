# API_SPECIFICATION.md — NyayaAccess

**Version:** 1.0  
**Status:** Hackathon MVP  
**Base path:** `/api`

This document defines the HTTP contract between the React frontend and the Node.js/Express backend. Keep request and response shapes consistent with this specification. If implementation constraints require a change, update this document and the frontend/backend together.

---

## 1. API Conventions

- Use JSON request and response bodies unless otherwise stated.
- Set `Content-Type: application/json` for JSON requests.
- Use the `/api` prefix for application endpoints.
- Use the authenticated user's verified identity for private data operations; never trust a browser-supplied `user_id`.
- In production, require a valid Supabase session for conversation-history endpoints.
- The chat endpoint may support an explicitly configured demo mode, but demo mode must not expose shared private history.
- Use consistent error responses as defined below.
- Do not return API keys, stack traces, raw provider errors, hidden prompts, or sensitive internal details.

### Standard error format

```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Please enter a message and try again."
  }
}
```

Use an appropriate HTTP status:
- `400` — invalid input.
- `401` — authentication missing or invalid.
- `403` — authenticated user lacks permission.
- `404` — requested conversation not found or unavailable to that user.
- `413` — request body exceeds configured limit.
- `429` — application or provider rate limit reached.
- `500` — unexpected internal error.
- `502` — inference provider returned an unusable response.
- `503` — inference or a required dependency is unavailable.
- `504` — upstream inference timed out.

Do not reveal whether another user's private conversation exists. Return `404` for a conversation the requester cannot access.

---

## 2. Endpoint Summary

| Method | Endpoint | Authentication | Purpose |
|---|---|---|---|
| `GET` | `/api/health` | Public | Basic service health |
| `POST` | `/api/chat` | Required for persistent history; demo mode may be configured separately | Retrieve legal sources and generate a response |
| `POST` | `/api/conversations` | Required | Create a conversation |
| `GET` | `/api/conversations` | Required | List the current user's conversations |
| `GET` | `/api/conversations/:id` | Required | Fetch one conversation and its messages |
| `DELETE` | `/api/conversations/:id` | Required | Delete a conversation and its messages, if deletion is enabled |

If the team needs to reduce scope, conversation creation may happen automatically during the first chat request. Do not implement both flows differently; choose one consistent behavior.

---

## 3. `GET /api/health`

Checks whether the Express server is responding. This endpoint does not need to expose credentials, model configuration, or private infrastructure details.

### Success — `200 OK`

```json
{
  "status": "ok",
  "service": "nyaya-access-api"
}
```

The health endpoint should not return secret values or raw environment configuration.

---

## 4. `POST /api/chat`

Processes a user message, retrieves relevant legal knowledge records, generates a response when adequate evidence is available, and persists the messages if history is enabled.

### Request

```json
{
  "conversationId": "uuid-or-null",
  "message": "My landlord is refusing to return my security deposit.",
  "category": "rental_dispute"
}
```

Fields:

| Field | Type | Required | Rules |
|---|---|---|---|
| `conversationId` | string or `null` | No | Existing conversation must belong to the authenticated user |
| `message` | string | Yes | Trim whitespace; reject empty input and enforce a configured length limit |
| `category` | string or `null` | No | Must match a supported category ID, or be omitted |

Example category IDs:
- `unpaid_wages`
- `rental_dispute`
- `consumer_complaint`
- `banking_payment`
- `ecommerce`
- `family_maintenance`
- `cybercrime`
- `government_grievance`

Only categories with verified knowledge-base records should be treated as supported. Unknown or unimplemented categories must not cause the model to invent an answer.

### Successful response — `200 OK`

```json
{
  "conversationId": "conversation-uuid",
  "message": {
    "id": "assistant-message-uuid",
    "role": "assistant",
    "content": "Here is general information that may help...",
    "kind": "guidance",
    "createdAt": "2026-10-13T12:00:00.000Z"
  },
  "sources": [
    {
      "id": "verified-record-id",
      "title": "Official source title",
      "sectionOrTopic": "Verified section or topic",
      "sourceUrl": "https://official-source.example/",
      "jurisdiction": "India"
    }
  ],
  "needsClarification": false,
  "disclaimer": "This is general legal information, not a substitute for advice from a qualified lawyer."
}
```

The values above are illustrative. Never ship placeholder source titles, URLs, or legal records as real citations.

### `kind` values

- `guidance` — a source-backed explanation.
- `clarification` — the assistant needs more facts before giving meaningful guidance.
- `insufficient_evidence` — no adequate source was retrieved.
- `service_unavailable` should normally be represented as an HTTP error, not a successful assistant answer.

### Clarification response example

```json
{
  "conversationId": "conversation-uuid",
  "message": {
    "id": "assistant-message-uuid",
    "role": "assistant",
    "content": "Which state is the property in? The applicable rules or process may depend on the location.",
    "kind": "clarification",
    "createdAt": "2026-10-13T12:00:00.000Z"
  },
  "sources": [],
  "needsClarification": true,
  "disclaimer": "This is general legal information, not a substitute for advice from a qualified lawyer."
}
```

Only ask a clarification when it is relevant. Do not use clarification as a reason to collect unnecessary personal details.

### Insufficient evidence response example

```json
{
  "conversationId": "conversation-uuid",
  "message": {
    "id": "assistant-message-uuid",
    "role": "assistant",
    "content": "I could not find sufficiently relevant verified information in the current knowledge base to answer reliably. Please consult an appropriate official resource or a qualified legal professional.",
    "kind": "insufficient_evidence",
    "createdAt": "2026-10-13T12:00:00.000Z"
  },
  "sources": [],
  "needsClarification": false,
  "disclaimer": "This is general legal information, not a substitute for advice from a qualified lawyer."
}
```

When retrieval has no adequate evidence, do not ask the LLM to answer from memory.

### Behavior

1. Validate the request and authenticate the user when persistence is enabled.
2. If a conversation ID is provided, verify ownership before reading or writing to it.
3. Save the user's message if persistence is enabled.
4. Retrieve relevant records from the curated legal knowledge base.
5. If important context is missing, return a clarification where appropriate.
6. If no adequate source is available, return `insufficient_evidence`.
7. Otherwise, call the configured eligible open-weight model with the question and retrieved context.
8. Validate the model output and attach source metadata from retrieved records only.
9. Save the assistant response if persistence is enabled.
10. Return the response.

Do not accept client-provided source objects as authoritative. The server must construct source metadata from the records it actually retrieved.

### Common errors

- `400 INVALID_REQUEST` — message is empty or malformed.
- `401 UNAUTHENTICATED` — a required session is missing or invalid.
- `404 CONVERSATION_NOT_FOUND` — conversation is not available to the requester.
- `413 MESSAGE_TOO_LARGE` — message exceeds the configured limit.
- `429 RATE_LIMITED` — request limit reached.
- `502 INFERENCE_BAD_RESPONSE` — provider response cannot be used.
- `503 INFERENCE_UNAVAILABLE` — provider is unavailable or credits/access are exhausted.
- `504 INFERENCE_TIMEOUT` — inference timed out.

---

## 5. `POST /api/conversations`

Creates an empty conversation for the authenticated user. This endpoint is optional if `POST /api/chat` creates a conversation automatically.

### Request

```json
{
  "title": "Rental deposit question"
}
```

`title` is optional. If omitted, generate a short title from the first message when it becomes available, or use a neutral default such as `New conversation`.

### Success — `201 Created`

```json
{
  "conversation": {
    "id": "conversation-uuid",
    "title": "New conversation",
    "createdAt": "2026-10-13T12:00:00.000Z",
    "updatedAt": "2026-10-13T12:00:00.000Z"
  }
}
```

The server derives `user_id` from the authenticated session. Do not accept it as a trusted request field.

---

## 6. `GET /api/conversations`

Returns the current user's conversation list, newest first.

### Success — `200 OK`

```json
{
  "conversations": [
    {
      "id": "conversation-uuid",
      "title": "Rental deposit question",
      "createdAt": "2026-10-13T12:00:00.000Z",
      "updatedAt": "2026-10-13T12:05:00.000Z"
    }
  ]
}
```

Rules:
- Return only conversations owned by the authenticated user.
- Do not include full message bodies in the list response.
- Add pagination only if needed; for the MVP, a reasonable maximum result count is sufficient.

---

## 7. `GET /api/conversations/:id`

Returns a conversation and its messages if the authenticated user owns it.

### Success — `200 OK`

```json
{
  "conversation": {
    "id": "conversation-uuid",
    "title": "Rental deposit question",
    "createdAt": "2026-10-13T12:00:00.000Z",
    "updatedAt": "2026-10-13T12:05:00.000Z"
  },
  "messages": [
    {
      "id": "user-message-uuid",
      "role": "user",
      "content": "My landlord is refusing to return my security deposit.",
      "sources": [],
      "createdAt": "2026-10-13T12:00:00.000Z"
    },
    {
      "id": "assistant-message-uuid",
      "role": "assistant",
      "content": "Here is general information that may help...",
      "sources": [
        {
          "id": "verified-record-id",
          "title": "Official source title",
          "sectionOrTopic": "Verified section or topic",
          "sourceUrl": "https://official-source.example/",
          "jurisdiction": "India"
        }
      ],
      "createdAt": "2026-10-13T12:00:02.000Z"
    }
  ]
}
```

Return `404 CONVERSATION_NOT_FOUND` if the conversation does not exist or the user cannot access it.

---

## 8. `DELETE /api/conversations/:id`

Optional MVP endpoint. Deletes the authenticated user's conversation and associated messages if deletion is enabled.

### Success — `200 OK`

```json
{
  "success": true
}
```

Use a database transaction or appropriate cascading foreign-key behavior so a conversation cannot be left with orphaned messages. Verify ownership before deletion.

If time is limited, omit this endpoint from the UI and API until the core chat flow is working.

---

## 9. Source Object Contract

Every source returned to the frontend must come from a knowledge-base record retrieved by the backend.

```json
{
  "id": "verified-record-id",
  "title": "Official source title",
  "sectionOrTopic": "Verified section or topic",
  "sourceUrl": "https://official-source.example/",
  "jurisdiction": "India"
}
```

Requirements:
- `id` identifies the knowledge-base record.
- `title` is the record's verified source title.
- `sectionOrTopic` must not claim a section number unless verified.
- `sourceUrl` must point to the source recorded in the knowledge base.
- `jurisdiction` indicates the relevant scope.
- Never fabricate a source URL or cite a source the backend did not retrieve.
- Validate that URLs use HTTPS and approved source records before rendering links.
- Open external links safely, using appropriate browser protections such as `rel="noopener noreferrer"` when opening a new tab.

---

## 10. Authentication Contract

When Supabase Auth is enabled:
- The frontend sends the user's valid access token using `Authorization: Bearer <token>`.
- The backend verifies the token with a trusted Supabase mechanism.
- The backend derives the user ID from the verified identity.
- Conversation operations check both server-side ownership and database RLS.
- Never trust a user ID in the request body or query string.
- Never send a Supabase service-role key to the frontend.

If authentication is not ready during the hackathon, use a clearly restricted demo mode. Do not use a shared global conversation list as a substitute for user isolation.

---

## 11. Input Validation and Limits

Choose and document practical limits in implementation, for example:
- `message`: non-empty after trimming; maximum 4,000 characters.
- `title`: maximum 120 characters.
- `category`: one of the supported category identifiers or `null`.
- `conversationId`: a valid identifier or `null`.

These are recommended starting limits, not legal or provider limits. Adjust them based on the actual application and inference constraints.

Also:
- Set a request-body size limit in Express.
- Reject malformed JSON.
- Rate-limit public or expensive inference endpoints appropriately.
- Avoid storing unbounded conversation history in each inference request.

---

## 12. Frontend Integration Rules

- Keep API calls in a frontend service module rather than scattering `fetch` calls across components.
- Show loading states while requests are in progress.
- Disable duplicate submission while a message is being sent.
- Display a helpful error message for timeouts, rate limits, and unavailable inference.
- Render source cards from the response's `sources` array.
- Do not assume that `sources` is non-empty.
- Treat model output as untrusted text; do not render arbitrary HTML from the model.
- Keep the disclaimer visible in the chat experience.
- Refresh or update conversation history after successful message submission.

---

## 13. Acceptance Tests

The API contract is accepted when:

1. `GET /api/health` returns a successful health response.
2. A valid supported question returns an assistant message and source metadata.
3. A question with no adequate retrieved evidence returns `kind: "insufficient_evidence"` and no fabricated sources.
4. An empty message returns `400`.
5. An unauthenticated history request returns `401` when authentication is required.
6. A user cannot read, modify, or delete another user's conversation.
7. Inference timeout and rate-limit errors produce safe, consistent error responses.
8. The frontend can render a response with zero sources.
9. API keys and internal stack traces never appear in responses.
10. The actual frontend and backend use the same request and response fields documented here.
