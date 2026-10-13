# TESTING_AND_QA.md

> **Project:** NyayaAccess  
> **Audience:** Antigravity coding agent and project team  
> **Purpose:** Define practical, repeatable tests for the hackathon MVP so core user flows work reliably and legal answers remain source-grounded.

---

## 1. Testing Objectives

The MVP is acceptable only when its primary user journey works end to end:

1. A user opens NyayaAccess and understands what it does and does not do.
2. The user submits a legal-information question.
3. The backend validates the request and retrieves relevant verified knowledge-base records.
4. The AI response is generated from the retrieved evidence, or the system safely admits that evidence is insufficient.
5. Any displayed citations refer to sources actually retrieved for that answer.
6. The user can view prior conversations if chat history is implemented.
7. Errors are shown clearly without exposing secrets, stack traces, or private data.

Prioritize **correctness, safety, and stability** over test coverage for every visual detail. Do not add complex testing infrastructure that cannot be run during the hackathon.

## 2. Agent Instructions

Before writing or changing tests:

1. Inspect the existing repository structure, package scripts, routes, components, environment configuration, and current tests.
2. Reuse the test framework already installed where possible.
3. Do not replace working application code merely to make tests easier.
4. Do not change existing API contracts without updating the API specification and frontend callers together.
5. Do not use live LLM calls or live third-party API calls in routine automated tests.
6. Mock external model calls at the service boundary and test retrieval/citation validation deterministically.
7. Never put real credentials, personal legal documents, or sensitive user data into test fixtures.
8. Keep tests fast, isolated, repeatable, and suitable for running before the demo.
9. If a test exposes a bug, fix the underlying cause rather than weakening the assertion.
10. Report which commands were run and which tests passed or failed. Never claim tests passed if they were not executed.

## 3. Testing Layers

### Layer A — Static and build checks

Run the checks supported by the existing project:

- Frontend production build.
- Backend syntax/import checks or startup check.
- Linting, if configured.
- Type checking, if TypeScript is used.
- JSON parsing and knowledge-base schema validation.

Do not add a new lint or type-check tool solely to satisfy this document if time is limited and no compatible setup exists.

### Layer B — Unit tests

Test small units independently:

- Request validation.
- Topic classification.
- Knowledge-base record validation.
- Retrieval filtering and ranking.
- Citation ID validation.
- Fallback response selection.
- Database query helpers, if implemented.
- UI components with important state transitions.

### Layer C — API integration tests

Test Express routes using an isolated test setup. Mock the LLM provider and external services so results are predictable. Where practical, use a dedicated test database rather than the development database.

### Layer D — End-to-end smoke tests

Manually or automatically test the complete critical user journey in a browser. Confirm that a question can be submitted, a response appears, sources are clickable, and errors are recoverable.

## 4. Critical Backend Test Cases

### 4.1 Request validation

| Test | Input/condition | Expected result |
|---|---|---|
| Empty question | Missing or whitespace-only message | Validation error; model is not called |
| Invalid body | Wrong JSON shape or missing required fields | Clear client error |
| Oversized question | Message exceeds configured limit | Rejected before model call |
| Unsupported content type | Non-JSON request where JSON is required | Clear client error |
| Malformed conversation ID | Invalid identifier format | Rejected safely |
| Unauthenticated history request | No valid session/token, if auth is required | `401` or the documented auth response |
| Cross-user history access | User requests another user's conversation | Denied; no data leakage |

Keep maximum input length configurable and documented. Do not silently truncate legal facts in a way that changes the user's meaning.

### 4.2 Knowledge-base validation

- JSON parses successfully.
- Every record has required fields.
- Record IDs are unique.
- Status and topic values belong to the allowed sets.
- URLs are valid HTTPS URLs unless a reviewed exception is documented.
- Dates use the documented format or are explicitly `null`.
- Missing source metadata is detected.
- Non-verified records are excluded from normal legal retrieval.

A schema-valid record is not automatically legally verified. Structural validation and human source review are separate requirements.

### 4.3 Retrieval

| Test | Setup | Expected result |
|---|---|---|
| Exact topic match | Query strongly matches a verified record | Relevant record is returned |
| Keyword overlap only | Query shares a generic word but asks a different issue | Irrelevant record is not treated as sufficient evidence |
| Draft record match | Only matching record is `draft` | No unverified legal evidence is returned |
| Jurisdiction mismatch | Record applies to a different known jurisdiction | Record is excluded or explicitly marked as non-applicable |
| Unknown location | Location affects applicability but is missing | Clarification is requested when necessary |
| No matching record | No relevant verified record exists | Insufficient-evidence path is used |
| Result limit | Many records match | Only a bounded, relevant set is returned |
| Stable output | Same query and same dataset | Same retrieval result, unless ranking intentionally includes a deterministic tie-breaker |

### 4.4 LLM grounding and safety

Mock the LLM service in automated tests. Test the wrapper and output validation separately from the provider itself.

- The model receives retrieved records and source metadata, not only the user's question.
- The prompt explicitly prohibits invented law and citations.
- The model response cannot cite an ID that was not retrieved.
- Invalid structured output is rejected or safely recovered.
- An empty model response becomes a controlled error/fallback.
- Provider timeout and rate-limit responses are handled.
- Provider credentials are never returned to the client.
- A prompt asking the model to invent a statute does not bypass citation validation.
- Retrieved source text containing instructions is treated as data, not as a higher-priority instruction.
- The system does not claim that a complaint was filed or that a legal outcome is guaranteed.

**Important:** Prompt wording alone is not enough. Citation allowlisting, record filtering, output validation, and error handling must be enforced in backend code.

### 4.5 Citation integrity

Implement a validator that checks each cited source ID against the exact set of records retrieved for that response.

Test:
- Valid retrieved ID → accepted.
- Known database ID that was not retrieved → rejected.
- Unknown ID → rejected.
- Missing source ID for a material legal claim → claim is removed, marked uncertain, or response is regenerated safely.
- Duplicate source IDs → deduplicated.
- Invalid URL → source is not rendered as a clickable official source.
- Source metadata missing → do not fabricate a title or authority.

Do not silently attach a citation to a claim it does not support.

### 4.6 Database and chat history

If Supabase/PostgreSQL chat history is implemented:

- A conversation can be created and retrieved by its authorized owner.
- Messages retain the intended order.
- Empty or invalid messages are rejected.
- Database failures return a controlled error.
- Access policies prevent users from reading or modifying other users' data.
- A user with no conversations sees a useful empty state.
- A failed save is not falsely presented as successful persistence.
- Deleting a conversation, if supported, removes or hides it according to the documented behavior.
- Test data is isolated and removed after tests.

Never run destructive tests against production data.

## 5. Frontend UI and Interaction Tests

### Core journey

- [ ] Landing page loads without console errors.
- [ ] Primary call-to-action leads to the intended chat/start flow.
- [ ] User can type and submit a question.
- [ ] Enter/submit behavior is consistent and does not accidentally submit during multiline entry if multiline is supported.
- [ ] Submit is disabled or protected while a request is in progress.
- [ ] Loading state is visible and understandable.
- [ ] Assistant response renders without breaking the layout.
- [ ] Source cards display title and authority accurately.
- [ ] Source links open the expected official page in a safe manner.
- [ ] Clarifying questions are displayed clearly.
- [ ] Insufficient-evidence responses do not look like confident legal conclusions.
- [ ] API errors are recoverable and do not erase existing messages.
- [ ] Long questions, long answers, and long source titles wrap without horizontal overflow.
- [ ] Refresh and navigation behavior are sensible for the implemented persistence model.

### UI states to cover

For every major asynchronous component, verify:
- Initial state.
- Loading state.
- Success state.
- Empty state.
- Validation error.
- Network/server error.
- Retry behavior where applicable.

Do not show a blank screen when an API call fails.

## 6. Accessibility and Responsive QA

Use the design tokens and responsive requirements in `FRONTEND_DESIGN.md`.

### Accessibility checks

- [ ] All controls are keyboard reachable.
- [ ] Focus indicators are visible.
- [ ] Inputs have programmatic labels.
- [ ] Buttons have meaningful accessible names.
- [ ] Errors are associated with the relevant field.
- [ ] Status updates are announced appropriately where practical.
- [ ] Color is not the only way to communicate status.
- [ ] Text and controls meet the project's WCAG 2.2 AA contrast target.
- [ ] Dialogs, if present, support keyboard use and correct focus handling.
- [ ] Reduced-motion preference is respected.
- [ ] Page structure uses semantic headings, landmarks, and buttons/links appropriately.

### Viewport checks

Test at these widths:

- `1440px` — large desktop.
- `1280px` — standard desktop.
- `1024px` — small desktop/tablet landscape.
- `768px` — tablet.
- `390px` — common mobile width.
- `320px` — narrow mobile width.

At each width, check:
- No unintended horizontal scrolling.
- Navigation remains usable.
- Message composer remains visible and usable.
- Source cards and long text wrap correctly.
- Buttons do not overlap.
- Dialogs and menus fit within the viewport.
- Sticky/fixed elements do not cover important content.

## 7. Security and Privacy Tests

- [ ] Secrets are loaded server-side and are not exposed in frontend build output.
- [ ] `.env` files are ignored by Git and no real secret is committed.
- [ ] Client input is validated server-side.
- [ ] User-provided text is rendered as text, not unsafe HTML.
- [ ] External links are validated and rendered safely.
- [ ] Rate limiting or equivalent abuse controls exist on expensive AI endpoints where feasible.
- [ ] API errors do not reveal stack traces, environment variables, SQL, or provider responses containing secrets.
- [ ] Logs do not contain API keys, tokens, or unnecessary raw legal conversations.
- [ ] Authenticated database access enforces per-user authorization.
- [ ] CORS permits only the intended frontend origins for the current environment.
- [ ] User input and retrieved content cannot override server-side safety rules.
- [ ] No test fixture contains real personal identifiers or real legal documents.

Do not rely on CORS as authentication. Do not expose the Supabase service-role key in the frontend.

## 8. Performance and Resilience

For a short hackathon, measure the critical path rather than building a full load-testing suite.

Check:
- UI gives immediate feedback after submit.
- The request has a timeout.
- A model timeout does not leave the interface loading forever.
- Repeated clicks do not accidentally create duplicate requests.
- A rate-limit response is explained clearly.
- Large messages are rejected or handled according to the documented limit.
- Database failure does not crash the entire server.
- The application remains usable after a failed request.
- Logs make debugging possible without leaking sensitive content.

If a live model is slow, show a clear loading state and a recoverable timeout. Never return fabricated legal advice as a fallback for an unavailable model.

## 9. Manual Demo Script

Run this sequence before presenting the prototype:

1. Open the app at desktop width.
2. Confirm the product disclaimer and supported-scope wording are visible.
3. Submit a consumer-grievance question that matches a verified test record.
4. Confirm the response includes a relevant official source.
5. Open the source and check that it is the expected official page.
6. Ask a follow-up question that requires clarification.
7. Confirm the assistant asks a focused question rather than guessing.
8. Ask an unsupported or highly specific legal question.
9. Confirm the assistant acknowledges that verified evidence is insufficient.
10. Simulate or trigger a backend/model failure.
11. Confirm a readable error appears and the user can retry.
12. If chat history is implemented, refresh and confirm persistence; verify another user cannot access the conversation.
13. Resize to mobile width and repeat the question submission/source inspection flow.
14. Check browser console and server logs for unexpected errors or leaked secrets.

Use a stable, non-sensitive sample scenario. Do not use a real person's identifiable legal problem in a public demo.

## 10. Suggested Commands

First inspect `package.json` files and use the commands that actually exist. Typical examples may include:

```bash
# From the repository root, if configured
npm test
npm run build

# If client and server have separate package files
cd client
npm test
npm run build

cd ../server
npm test
```

These are examples, not a guarantee that these scripts exist. Do not report a command as successful unless it was actually run. If no automated test script exists, add a small, appropriate test setup or clearly report which checks were performed manually.

## 11. Bug-Fix Workflow

When a bug is found:

1. Reproduce it with clear steps.
2. Identify the affected layer: UI, API, retrieval, model integration, database, or configuration.
3. Add or update a regression test when practical.
4. Fix the root cause with the smallest safe change.
5. Run the focused test.
6. Run the relevant build and regression checks.
7. Inspect the browser console and server logs.
8. Update documentation if behavior or an API contract changed.
9. Report the fix and any remaining limitations honestly.

Do not hide failures by catching every exception and returning a success-shaped response.

## 12. Release Gate / Definition of Done

The hackathon build is ready for demo only when:

- [ ] Frontend production build succeeds.
- [ ] Backend starts with documented environment variables.
- [ ] Core chat flow works end to end.
- [ ] Retrieval excludes unverified legal records.
- [ ] Citation IDs are validated against retrieved sources.
- [ ] Unsupported questions fail safely.
- [ ] Provider/database failures produce controlled, recoverable errors.
- [ ] No known critical authorization or secret-exposure issue remains.
- [ ] Main UI flows work at desktop and mobile widths.
- [ ] Keyboard navigation and visible focus have been checked.
- [ ] The manual demo script has been completed.
- [ ] The team knows which features are real, which are mocked in tests, and which limitations remain.

**Quality principle:** Never trade legal-source integrity or user-data protection for a smoother-looking demo.
