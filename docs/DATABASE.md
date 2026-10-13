# DATABASE.md — NyayaAccess

**Version:** 1.0  
**Database:** Supabase PostgreSQL  
**Scope:** Persistent conversations and chat messages for the hackathon MVP

---

## 1. Purpose and Design Decisions

NyayaAccess uses Supabase PostgreSQL to persist authenticated users' conversations and messages.

The curated legal knowledge base remains in `server/data/legalData.json` for the MVP. Do not store legal records in PostgreSQL unless the project owner explicitly changes the architecture.

### Principles

- Store only data required for conversation history.
- Keep users' conversations private to their authenticated account.
- Enforce Row Level Security (RLS) in Supabase, not only in frontend code.
- Never trust a `user_id` supplied by the browser.
- Keep server-only credentials out of frontend code.
- Avoid collecting unnecessary personal or sensitive information.

If authentication cannot be completed in the hackathon, use a clearly limited demo mode without shared persistent history between users.

---

## 2. Entity Relationship

```text
auth.users
    |
    | 1-to-many
    v
conversations
    |
    | 1-to-many
    v
messages
```

- A Supabase Auth user can own multiple conversations.
- A conversation belongs to exactly one user.
- A conversation contains multiple messages.
- Deleting a conversation should delete its messages.

---

## 3. Tables

### 3.1 `conversations`

| Column | Type | Rules | Purpose |
|---|---|---|---|
| `id` | `uuid` | Primary key, default `gen_random_uuid()` | Conversation identifier |
| `user_id` | `uuid` | Required, references `auth.users(id)` | Owner |
| `title` | `text` | Required, default `New conversation`, maximum 120 characters enforced by application | Display title |
| `created_at` | `timestamptz` | Required, default `now()` | Creation timestamp |
| `updated_at` | `timestamptz` | Required, default `now()` | Last activity timestamp |

Recommended indexes:
- Index on `user_id`.
- Index on `(user_id, updated_at DESC)` for listing a user's most recent conversations.

### 3.2 `messages`

| Column | Type | Rules | Purpose |
|---|---|---|---|
| `id` | `uuid` | Primary key, default `gen_random_uuid()` | Message identifier |
| `conversation_id` | `uuid` | Required, references `conversations(id)` with `ON DELETE CASCADE` | Parent conversation |
| `role` | `text` | Required, restricted to `user` or `assistant` | Message sender |
| `content` | `text` | Required, non-empty after application validation | Message body |
| `sources` | `jsonb` | Required, default `[]` | Verified source metadata for assistant messages |
| `created_at` | `timestamptz` | Required, default `now()` | Creation timestamp |

Recommended index:
- Index on `(conversation_id, created_at ASC)` for loading messages in order.

For the MVP, do not store hidden prompts, provider credentials, raw provider responses, or unnecessary user profile data in message records.

---

## 4. Suggested SQL Schema

Review and run this SQL in the Supabase SQL Editor. Test it in the intended project before using it in a demo.

```sql
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'New conversation'
    check (char_length(title) <= 120),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists conversations_user_updated_idx
  on public.conversations (user_id, updated_at desc);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null
    references public.conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null check (char_length(content) > 0),
  sources jsonb not null default '[]'::jsonb
    check (jsonb_typeof(sources) = 'array'),
  created_at timestamptz not null default now()
);

create index if not exists messages_conversation_created_idx
  on public.messages (conversation_id, created_at asc);

alter table public.conversations enable row level security;
alter table public.messages enable row level security;

create policy "Users can read their own conversations"
on public.conversations for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can create their own conversations"
on public.conversations for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their own conversations"
on public.conversations for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete their own conversations"
on public.conversations for delete
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can read messages in their own conversations"
on public.messages for select
to authenticated
using (
  exists (
    select 1
    from public.conversations c
    where c.id = messages.conversation_id
      and c.user_id = (select auth.uid())
  )
);

create policy "Users can insert messages in their own conversations"
on public.messages for insert
to authenticated
with check (
  exists (
    select 1
    from public.conversations c
    where c.id = messages.conversation_id
      and c.user_id = (select auth.uid())
  )
);

create policy "Users can delete messages in their own conversations"
on public.messages for delete
to authenticated
using (
  exists (
    select 1
    from public.conversations c
    where c.id = messages.conversation_id
      and c.user_id = (select auth.uid())
  )
);
```

### Important implementation note

These policies are a starting point, not a substitute for testing. If the backend uses a Supabase service-role client, RLS can be bypassed by that privileged credential. The backend must independently verify the authenticated user's identity and conversation ownership before every operation. Never expose the service-role key to the browser.

The example does not add a user-facing update policy for messages because chat messages should normally be append-only in this MVP. Add stricter constraints or additional policies if the implementation permits message editing.

---

## 5. Authentication and Access Control

Use Supabase Auth if persistent, user-specific chat history is part of the shipped experience.

### Required behavior

1. The user signs in through the configured Supabase Auth flow.
2. The frontend obtains a valid session/access token.
3. Protected API requests send the token in the `Authorization: Bearer <token>` header.
4. The backend verifies the token using a trusted Supabase-supported mechanism.
5. The backend derives the user ID from the verified identity.
6. Each conversation read/write verifies ownership.
7. RLS provides an additional database-level protection layer.

Never:
- Accept a browser-supplied `user_id` as proof of identity.
- Use a service-role key in frontend code.
- Allow a conversation ID alone to authorize access.
- Return another user's messages in history results.

---

## 6. Message Persistence Flow

For a new user message:

1. Verify authentication.
2. Create a conversation if no valid conversation ID was supplied.
3. If a conversation ID was supplied, verify it belongs to the current user.
4. Validate and save the user message.
5. Retrieve relevant legal records.
6. Generate a response only when sufficient source evidence exists.
7. Save the assistant message and the server-derived source metadata.
8. Update the conversation's `updated_at`.
9. Return the message and sources to the frontend.

If generation fails after the user message has been stored, handle the partial state gracefully. Do not silently save a fabricated assistant response. The frontend should show that the response failed and let the user retry.

### Updating `updated_at`

Update `conversations.updated_at` whenever a message is successfully added. This can be done in the backend service or with a database trigger. For the MVP, choose one approach and use it consistently.

---

## 7. Source Metadata

The `messages.sources` field stores an array of source objects returned by the backend, for example:

```json
[
  {
    "id": "verified-record-id",
    "title": "Official source title",
    "sectionOrTopic": "Verified section or topic",
    "sourceUrl": "https://official-source.example/",
    "jurisdiction": "India"
  }
]
```

This is a format example only. Use actual source records verified for the knowledge base.

Requirements:
- Only persist sources the server retrieved and validated.
- Do not treat model-generated URLs as verified citations.
- Store an empty array for user messages or assistant responses without source-backed guidance.
- Validate and safely render external links.

---

## 8. Data Minimization and Privacy

- Tell users not to enter passwords, bank PINs, OTPs, full payment credentials, or unnecessary identity information.
- Do not ask for sensitive details unless essential to a supported flow.
- Avoid logging full conversation text by default.
- Restrict database access to the minimum required.
- Use HTTPS for deployed environments.
- Configure appropriate account deletion and retention behavior if the project goes beyond a demo.
- Do not put real personal legal cases into public test fixtures or the public repository.

Chat history may contain sensitive information even when the product does not explicitly request it. Treat stored messages as private user data.

---

## 9. Environment Variables

Use `.env.example` to document the actual variables required by the backend. Common examples include:

```dotenv
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Only include and use the service-role key if the backend architecture requires it. It must remain server-side and should be protected as a privileged secret. Never prefix server-only secrets with `VITE_`.

The frontend may use a public Supabase URL and publishable/anon key according to Supabase's recommended client setup, but access must still be constrained by authentication and RLS.

---

## 10. Acceptance Tests

Before considering chat persistence complete, test:

1. An authenticated user can create and list their own conversations.
2. A conversation can be reopened with messages in chronological order.
3. A user cannot read another user's conversation by changing its ID.
4. A user cannot insert a message into another user's conversation.
5. Deleting a conversation removes its messages through cascade behavior.
6. Unauthenticated users cannot access private history.
7. RLS is enabled on both tables.
8. The backend does not trust a client-supplied `user_id`.
9. The service-role key is absent from frontend bundles and committed files.
10. Assistant source metadata is taken from verified backend records.
11. Empty messages and invalid roles are rejected.
12. Failed inference does not create a false claim that a response was generated successfully.

---

## 11. MVP Decision

For the three-hour hackathon, implement the schema and RLS only after the basic retrieval-and-inference flow is working. If authentication takes too long, demonstrate the legal chat without persistent personal history rather than weakening access controls.

**Priority order:** source-backed responses first, secure persistence second, optional deletion and additional database refinements afterward.
