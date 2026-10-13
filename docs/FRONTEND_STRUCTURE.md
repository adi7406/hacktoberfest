# FRONTEND_STRUCTURE.md — NyayaAccess

**Version:** 1.0  
**Purpose:** Define the frontend pages, routes, component hierarchy, state, and API integration boundaries. Visual styling is specified separately in `FRONTEND_DESIGN.md`.

---

## 1. Frontend Objective

Build the NyayaAccess frontend as a React application. Users should be able to start a legal-information chat, ask follow-up questions, view source-backed guidance, and reopen previous conversations when authenticated chat history is enabled.

Keep this document focused on **what the frontend contains and how it behaves**. Use `FRONTEND_DESIGN.md` for colors, typography, spacing, visual styling, and responsive presentation.

## 2. Technology and Boundaries

- Use React and the project's existing build setup.
- Use the styling framework already configured in the repository; do not add another framework without a clear need.
- Keep API calls in a dedicated service module.
- The frontend communicates with the Node.js/Express backend using the contracts in `API_SPECIFICATION.md`.
- The frontend must never call DigitalOcean Inference directly.
- Do not store inference API keys or Supabase service-role keys in frontend code.
- If Supabase Auth is enabled, use the signed-in session for protected requests.
- The frontend must not decide which legal sources are authoritative; it renders source metadata returned by the backend.

Before creating files, inspect the existing repository and adapt this structure to the code already present.

---

## 3. Application Routes

Use React Router if routing is already installed or is appropriate for the existing project. For a very small MVP, conditional page rendering may be used instead, but navigation behavior must remain consistent.

| Route | Page | Purpose | Access |
|---|---|---|---|
| `/` | Landing Page | Introduce NyayaAccess and let users start a chat | Public |
| `/chat` | Legal Chat | Start a new conversation or describe a legal problem | Public or authenticated, depending on chosen MVP mode |
| `/chat/:conversationId` | Conversation | Open a specific conversation and continue it | Must verify ownership when history is enabled |
| `/history` | Chat History | List and reopen the current user's previous conversations | Authenticated when persistent history is enabled |
| `*` | Not Found | Show a basic not-found state | Public |

If authentication screens are implemented, add `/login` and `/signup`. Do not add these routes unless the project actually implements Supabase Auth.

The landing page may navigate directly to `/chat` after the user clicks **Get Legal Help**.

---

## 4. Page Responsibilities

### 4.1 Landing Page

**Responsibilities**
- Explain the purpose of NyayaAccess.
- Provide a **Get Legal Help** action.
- Display shortcuts for categories that have verified knowledge-base records.
- Allow a user to start without selecting a category.
- Explain that the tool provides general legal information, not legal representation.

**Interactions**
- Clicking **Get Legal Help** navigates to `/chat`.
- Clicking a supported category navigates to `/chat` with that category selected.
- Unsupported categories must be hidden or clearly marked as unavailable.

### 4.2 Legal Chat Page

This is the primary application experience.

**Responsibilities**
- Display the current conversation.
- Allow the user to enter and submit a question.
- Show user and assistant messages in chronological order.
- Display assistant response type: guidance, clarification, or insufficient evidence.
- Display source cards from the backend response.
- Preserve the user's text if a request fails.
- Provide a way to start a new conversation.
- Show the legal-information disclaimer.

**Interactions**
- Submit a message to `POST /api/chat`.
- Send `conversationId` when continuing an existing conversation.
- Send a selected category when available.
- Append the response returned by the backend.
- Allow follow-up questions in the same conversation.
- Show a loading indicator and prevent duplicate submissions while a request is in progress.
- Show a recoverable error when the backend or inference service fails.

**Initial state**
- Show a welcome message and a few example questions.
- The examples must be phrased as prompts to ask, not as claims about the law.
- The input must work even if the user has not selected a category.

### 4.3 Conversation Route

`/chat/:conversationId` loads an existing conversation.

**Responsibilities**
- Request the conversation from `GET /api/conversations/:id`.
- Display messages in chronological order.
- Allow the user to continue the conversation.
- Handle loading, not-found, permission, and network-error states.

**Security**
- Never assume that possession of a conversation ID grants access.
- The backend must authenticate the request and verify ownership.
- If the conversation is unavailable to the current user, show a generic unavailable/not-found state.

### 4.4 Chat History Page

**Responsibilities**
- Fetch the current user's conversation list from `GET /api/conversations`.
- Display each conversation's title and last-updated time.
- Navigate to `/chat/:conversationId` when a conversation is selected.
- Provide a **New Chat** action.
- Show an empty state when no conversations exist.

**Optional behavior**
- Add deletion only if `DELETE /api/conversations/:id` is implemented and tested.
- Confirm before deleting a conversation.
- Refresh the list after deletion.

If authenticated persistence is not ready, do not present a shared server-side history as private history. Either omit this page for demo mode or clearly explain that history is session-local.

### 4.5 Not Found Page

- Display a simple message that the requested page could not be found.
- Provide a link or button to return to the landing page.

---

## 5. Component Hierarchy

Suggested structure:

```text
src/
├── app/
│   ├── App.jsx
│   └── routes.jsx                 # If routing is used
├── pages/
│   ├── LandingPage.jsx
│   ├── ChatPage.jsx
│   ├── ConversationPage.jsx       # Can reuse ChatPage
│   ├── HistoryPage.jsx
│   └── NotFoundPage.jsx
├── components/
│   ├── layout/
│   │   ├── AppHeader.jsx
│   │   ├── AppSidebar.jsx
│   │   └── PageLayout.jsx
│   ├── chat/
│   │   ├── ChatTranscript.jsx
│   │   ├── ChatMessage.jsx
│   │   ├── ChatInput.jsx
│   │   ├── TypingIndicator.jsx
│   │   ├── GuidanceContent.jsx
│   │   └── SourceList.jsx
│   ├── history/
│   │   └── ConversationList.jsx
│   ├── legal/
│   │   ├── CategoryCard.jsx
│   │   └── LegalDisclaimer.jsx
│   └── common/
│       ├── LoadingState.jsx
│       ├── ErrorState.jsx
│       └── EmptyState.jsx
├── services/
│   ├── api.js
│   ├── chatService.js
│   └── conversationService.js
├── hooks/
│   ├── useChat.js
│   └── useConversations.js
├── context/                       # Only if shared auth/session state needs it
├── utils/
│   └── formatDate.js
└── main.jsx
```

This is a target organization, not a requirement to create every file before implementation. For the three-hour MVP, avoid unnecessary abstractions. `ConversationPage.jsx` may reuse the same chat component as `ChatPage.jsx`.

---

## 6. Component Contracts

### `ChatInput`
**Inputs:** `value`, `onChange`, `onSubmit`, `disabled`  
**Responsibilities:** Capture a question, prevent empty submissions, support Enter/keyboard interaction, and preserve text on failure.

### `ChatTranscript`
**Inputs:** `messages`, `isLoading`  
**Responsibilities:** Render messages in chronological order, keep the latest response visible where appropriate, and show a loading indicator.

### `ChatMessage`
**Inputs:** `role`, `content`, `kind`, `sources`, `createdAt`  
**Responsibilities:** Render a user or assistant message. For assistant responses, distinguish guidance, clarification, and insufficient evidence.

Do not render model output as arbitrary HTML. Render it as text or use a safe Markdown renderer if Markdown support is intentionally implemented.

### `GuidanceContent`
**Inputs:** response content and optional structured sections  
**Responsibilities:** Display the assistant's explanation and next-step checklist when supplied. Do not invent missing content.

### `SourceList` / `SourceCard`
**Inputs:** `sources` array returned by the backend  
**Responsibilities:** Display verified source title, section/topic when available, jurisdiction, and official-source link.

If `sources` is empty, show no citation cards. Never generate citation URLs in the frontend.

### `ConversationList`
**Inputs:** conversations, loading state, selected conversation ID, selection callback  
**Responsibilities:** List available conversations and notify the page when one is selected.

### `LegalDisclaimer`
**Responsibilities:** Display a readable, persistent notice that NyayaAccess provides general legal information, not legal advice or representation.

### `LoadingState`, `ErrorState`, `EmptyState`
Reusable components for asynchronous operations. Each should accept concise user-facing text and, when appropriate, a retry callback.

---

## 7. Frontend API Service

Use a shared API client in `services/api.js` or an equivalent module.

Responsibilities:
- Read the backend base URL from a public frontend configuration variable.
- Set JSON headers for JSON requests.
- Attach the current Supabase access token to protected requests when authentication is enabled.
- Parse successful responses and standardized API errors.
- Avoid exposing server secrets.
- Handle non-JSON or network failures without crashing the UI.

Example public configuration:

```dotenv
VITE_API_BASE_URL=http://localhost:5000/api
```

This is a frontend API base URL, not a secret. Never put the DigitalOcean inference key or Supabase service-role key in a `VITE_` variable.

### `chatService.js`

Expose functions such as:
- `sendMessage({ conversationId, message, category })`

It should call `POST /api/chat` and return the response using the field names in `API_SPECIFICATION.md`.

### `conversationService.js`

Expose functions such as:
- `listConversations()`
- `getConversation(conversationId)`
- `createConversation(title)` if explicit creation is used
- `deleteConversation(conversationId)` only if deletion is implemented

Do not duplicate endpoint logic inside React components.

---

## 8. State Management

Use local React state and custom hooks for the MVP. Do not add Redux or another global state library unless the existing project already uses one.

### Chat state

Track:
- `conversationId`
- `messages`
- `selectedCategory`
- `inputValue`
- `isLoading`
- `error`

### Conversation history state

Track:
- `conversations`
- `isLoading`
- `error`
- `selectedConversationId`

### Authentication state

If Supabase Auth is enabled, use the supported Supabase client/session mechanism. Do not create a parallel, insecure authentication system.

### State rules

- Disable duplicate submissions during an in-flight request.
- Keep the submitted user message visible if the request fails.
- Do not append a fabricated assistant response when inference fails.
- Update history after a conversation is created or a message is saved.
- Clear chat state only when starting a genuinely new conversation.

---

## 9. API Contracts Used by the Frontend

Follow `API_SPECIFICATION.md` as the authoritative API contract.

### Send a message

`POST /api/chat`

Request:

```json
{
  "conversationId": null,
  "message": "My online order arrived damaged. What options might I have?",
  "category": "ecommerce"
}
```

Response fields used by the frontend:
- `conversationId`
- `message.id`
- `message.role`
- `message.content`
- `message.kind`
- `message.createdAt`
- `sources`
- `needsClarification`
- `disclaimer`

### List conversations

`GET /api/conversations`

Read the `conversations` array. Show only records returned by the authorized backend response.

### Load a conversation

`GET /api/conversations/:id`

Read `conversation` and `messages`. Display messages in chronological order.

The JSON above is illustrative. Use the actual field names and schemas in `API_SPECIFICATION.md` consistently across frontend and backend.

---

## 10. Response Rendering Rules

The UI must handle these response types:

- **`guidance`:** Show the explanation and any returned sources.
- **`clarification`:** Make the question easy to identify and allow the user to answer in the same chat.
- **`insufficient_evidence`:** Explain that the current knowledge base does not contain enough verified information. Do not display fake sources.
- **API/provider error:** Show an error state with retry behavior; do not render it as successful legal guidance.

Use source metadata returned by the backend. The model must not control the source list or arbitrary external links displayed by the frontend.

---

## 11. Authentication and Privacy Behavior

If authenticated chat history is implemented:

- Use the signed-in session for protected requests.
- Clear or refresh user-specific UI state when the user signs out.
- Do not show cached conversations from a previous user after an account switch.
- Treat conversation IDs as identifiers, not authorization credentials.
- Handle `401`, `403`, and `404` responses without leaking another user's data.
- Do not persist sensitive details in browser storage unnecessarily.

If the MVP uses demo mode without authentication, avoid server-side shared history. Clearly limit the experience to session-local history or omit history persistence.

---

## 12. Build Order

Implement the frontend in this order:

1. Inspect the existing repository and confirm React setup.
2. Add the app shell and landing page.
3. Build the chat page with local sample messages for layout testing only.
4. Implement the API client and connect `POST /api/chat`.
5. Render real response types and source metadata.
6. Add loading, error, and insufficient-evidence states.
7. Add history routes and API integration if authenticated persistence is ready.
8. Test mobile/desktop layouts and keyboard behavior.
9. Remove or clearly label any temporary mock data before the final demo.

Do not spend time polishing a mocked chat while the real API integration remains untested.

---

## 13. Acceptance Checklist

- [ ] Landing page can navigate to a new chat.
- [ ] User can ask a question without selecting a category.
- [ ] Supported categories are based on the actual verified knowledge base.
- [ ] Chat requests match `API_SPECIFICATION.md`.
- [ ] The UI renders guidance, clarification, and insufficient-evidence responses.
- [ ] Source cards are rendered only from backend-returned source records.
- [ ] Errors preserve user input and provide a retry path.
- [ ] Conversation history is private when authentication is enabled.
- [ ] No provider or service-role secrets are exposed to the browser.
- [ ] No arbitrary HTML from model output is executed.
- [ ] The app is keyboard usable and responsive.
- [ ] The frontend build completes successfully.

**Boundary:** This file defines frontend structure and behavior. Refer to `FRONTEND_DESIGN.md` for visual styling, color tokens, typography, spacing, and responsive design details.
