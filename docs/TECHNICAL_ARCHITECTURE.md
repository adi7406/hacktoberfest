# TECHNICAL_ARCHITECTURE.md — NyayaAccess

**Version:** 1.0  
**Status:** Hackathon MVP  
**Primary goal:** A small, reliable, source-grounded legal information assistant built in approximately three hours.

---

## 1. Architecture Overview

NyayaAccess uses a React frontend, a Node.js/Express API, a curated JSON legal knowledge base, an open-weight LLM accessed through DigitalOcean Inference when available, and Supabase PostgreSQL for authenticated chat history.

The backend is responsible for retrieval, inference, source metadata, validation, and persistence. The frontend must never call the inference provider directly or hold server-side secrets.

```text
┌──────────────────────────────┐
│       React Frontend         │
│ Landing • Chat • History     │
└──────────────┬───────────────┘
               │ HTTPS / JSON
               ▼
┌──────────────────────────────┐
│      Node.js + Express       │
│ Routes • Validation • Auth   │
└───────┬───────────────┬──────┘
        │               │
        ▼               ▼
┌─────────────────┐  ┌─────────────────────┐
│ Legal Retrieval │  │ Supabase PostgreSQL │
│ legalData.json  │  │ Conversations       │
└────────┬────────┘  │ Messages / RLS      │
         │           └─────────────────────┘
         ▼
┌──────────────────────────────┐
│  DigitalOcean Inference API  │
│  Configured open-weight LLM  │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│ Answer + retrieved sources   │
│ returned to React frontend   │
└──────────────────────────────┘
```

## 2. Technology Stack

| Layer | Technology | Responsibility |
|---|---|---|
| Frontend | React | User interface and chat experience |
| Styling | Existing project styling setup (Tailwind CSS if already selected) | Responsive layout and components |
| Backend | Node.js + Express | API endpoints, validation, orchestration |
| Knowledge base | JSON file | Curated legal source records |
| Retrieval | JavaScript keyword/category matching for MVP | Find relevant records before inference |
| LLM | Eligible open-weight model via DigitalOcean Inference | Explain retrieved material in plain language |
| Persistence | Supabase PostgreSQL | Authenticated conversations and messages |
| Authentication | Supabase Auth, if persistent personal history is enabled | Establish user identity |
| Deployment | Choose only if needed for the demo | Host frontend/backend |

Do not add a vector database, ORM, multi-agent framework, or separate microservices for the MVP. The retrieval service should be modular so semantic retrieval can be introduced later if justified.

## 3. Repository Structure

```text
nyaya-access/
├── PRD.md
├── AGENTS.md
├── TECHNICAL_ARCHITECTURE.md
├── API_SPECIFICATION.md
├── DATABASE.md
├── AI_IMPLEMENTATION.md
├── FRONTEND_DESIGN.md
├── LEGAL_KNOWLEDGE_BASE.md
├── README.md
├── .env.example
├── .gitignore
├── client/
│   ├── package.json
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── hooks/
│       ├── services/
│       └── App.jsx
└── server/
    ├── package.json
    ├── data/
    │   └── legalData.json
    ├── routes/
    ├── controllers/
    ├── middleware/
    ├── services/
    │   ├── legalSearchService.js
    │   ├── llmService.js
    │   └── conversationService.js
    ├── config/
    │   └── supabase.js
    └── server.js
```

This is the target structure, not a requirement to create every file immediately. Inspect the existing repository first and preserve working code.

## 4. Request and Response Flow

### 4.1 New user message

1. React submits a message to `POST /api/chat`.
2. Express validates the request and authenticates the user if authentication is enabled.
3. The backend loads relevant prior conversation context, if authorized and needed.
4. The retrieval service searches `legalData.json` for relevant records.
5. If no sufficiently relevant source is found, the backend returns a safe fallback without asking the LLM to invent an answer.
6. Otherwise, the LLM service sends the user's question, limited conversation context, and retrieved records to DigitalOcean Inference.
7. The backend validates the model output and attaches source metadata from the retrieved records.
8. User and assistant messages are persisted in Supabase if persistence is enabled.
9. The backend returns the answer and sources to React.
10. React renders the answer, source cards, and follow-up input.

### 4.2 Retrieval-first principle

Legal retrieval happens **before** model generation. The LLM is used to explain retrieved evidence, not as the sole authority for legal facts. The server, not the model, controls which source URLs are returned.

### 4.3 Conversation context

Only send the minimum relevant recent history to the model. Treat past conversation messages as user-provided context, not as authoritative legal sources. Retrieved verified records remain the source of legal claims.

## 5. Service Responsibilities

### Frontend
- Collect the user's question and optional category.
- Display messages, clarifying questions, loading/error states, and source links.
- Send requests to the Express API.
- Display only conversations authorized for the signed-in user.

### Express routes/controllers
- Define HTTP endpoints.
- Validate payloads and authentication.
- Call the retrieval and LLM services.
- Return consistent JSON responses and suitable HTTP status codes.
- Avoid embedding business logic directly in route definitions.

### `legalSearchService.js`
- Read and search the curated JSON records.
- Match by category, keywords, title, topic, and text.
- Return relevant records with their IDs and source metadata.
- Use a configurable relevance threshold.
- Return no-source status when matching is inadequate.

### `llmService.js`
- Call DigitalOcean Inference from the server.
- Build a prompt from the user's question and retrieved records.
- Use configurable model and endpoint settings.
- Handle timeout, rate-limit, provider, and malformed-output errors.
- Return generated text; do not invent or rewrite source URLs.

### `conversationService.js`
- Create and retrieve conversations.
- Persist messages in Supabase.
- Enforce authenticated ownership in conjunction with database RLS and server checks.
- Keep persistence optional for a clearly labeled demo mode if authentication is not ready.

### `config/supabase.js`
- Initialize the appropriate Supabase client.
- Read configuration from environment variables.
- Never expose service-role credentials to the browser.

## 6. Environment Configuration

Use `.env.example` to document the variables actually required by the implementation. Possible variables include:

```dotenv
PORT=5000
CLIENT_ORIGIN=http://localhost:5173

DIGITALOCEAN_INFERENCE_API_KEY=
DIGITALOCEAN_INFERENCE_BASE_URL=
DIGITALOCEAN_INFERENCE_MODEL=

SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Confirm the exact endpoint, authentication header, model identifier, and account access using current DigitalOcean documentation and the team's account. Do not assume that an example base URL or model ID is valid.

The service-role key must be server-only. If the server uses only the user's Supabase access token and an appropriately configured client, avoid introducing the service-role key unless required. Never put server-only secrets in variables prefixed with `VITE_`.

## 7. Security and Privacy Boundaries

- Use HTTPS in deployed environments.
- Restrict CORS to the expected frontend origin(s).
- Validate message length and request shapes.
- Add reasonable request timeouts and rate-limit handling.
- Never trust a client-supplied user ID.
- Verify ownership of each conversation operation.
- Enable Supabase RLS and test cross-user access denial.
- Avoid logging legal chat content and credentials unnecessarily.
- Do not store secrets in the repository.
- Tell users not to submit passwords, bank credentials, or unnecessary identity details.
- Do not treat user-supplied text or retrieved web content as instructions to override system safety rules.

## 8. Error Handling

Use consistent errors, for example:

```json
{
  "error": {
    "code": "INFERENCE_UNAVAILABLE",
    "message": "The assistant is temporarily unavailable. Please try again."
  }
}
```

Handle at least:
- Empty or invalid messages.
- Missing or invalid authentication.
- Conversation not found or not owned by the user.
- No relevant legal records.
- Inference timeout or provider outage.
- Rate limit or exhausted credits.
- Database failure.
- Malformed model response.

Do not return stack traces, internal prompts, API keys, or raw provider errors to the frontend.

## 9. Performance and Reliability

- Keep the curated knowledge base small and verified.
- Limit the number and length of retrieved records.
- Limit conversation history sent to inference.
- Display a loading state while waiting.
- Use bounded timeouts and actionable error messages.
- Avoid repeated inference calls for the same request unless needed.
- Do not make a request to the LLM when retrieval has no adequate evidence.
- If a mock response is used for a demo fallback, label it clearly and never represent it as live model output.

## 10. Development and Test Order

Build in this order:

1. Create a minimal React chat UI and Express health endpoint.
2. Implement `POST /api/chat` with request validation.
3. Add a small set of verified legal records and keyword retrieval.
4. Verify the no-relevant-source response.
5. Integrate the configured open-weight model through DigitalOcean Inference.
6. Return source metadata alongside the model answer.
7. Test frontend-to-backend-to-model end to end.
8. Add Supabase authentication and chat persistence if time permits.
9. Test RLS, failure states, and build commands.
10. Document setup and limitations in `README.md`.

## 11. Architecture Decisions

| Decision | MVP choice | Reason |
|---|---|---|
| Backend language | JavaScript / Node.js | Fast integration with React and the team's existing skills |
| Legal data store | JSON file | Simple, transparent, and fast to verify |
| Retrieval | Keyword/category matching | Lower setup cost; replaceable service boundary |
| LLM hosting | DigitalOcean Inference if accessible | Avoid managing GPU infrastructure |
| Chat storage | Supabase PostgreSQL | Managed relational persistence |
| Vector database | Not included initially | Unnecessary for a small curated knowledge base |
| Agent framework | Not included initially | One retrieval-and-generation pipeline is sufficient |
| Microservices | Single Express API | Easier to build and debug in a short hackathon |

## 12. Definition of Done

The architecture is implemented when:
- React can send a question to Express.
- Express retrieves relevant records from the JSON knowledge base.
- A configured eligible open-weight model generates an answer using retrieved context.
- The response includes source metadata controlled by the backend.
- No-source and inference-error states work.
- Secrets remain server-side.
- Chat history, if enabled, is protected by authentication and RLS.
- Setup steps and environment variables are documented.
