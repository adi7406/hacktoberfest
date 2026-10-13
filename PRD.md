# NyayaAccess --- Product Requirements Document (PRD)

**Version:** 1.0\
**Status:** Hackathon MVP\
**Target build time:** 3 hours\
**Product type:** AI-powered Indian legal information and navigation
assistant

------------------------------------------------------------------------

## 1. Product Overview

NyayaAccess helps people in India understand possible next steps when
they encounter common legal or administrative problems. Users describe
an issue in everyday language, answer relevant follow-up questions, and
receive a plain-language explanation supported by links to verified
official sources.

The product combines **retrieval-augmented generation (RAG)** with an
open-weight language model. It should retrieve relevant material from a
curated legal knowledge base before asking the model to explain it. It
must not present unsupported claims as law or pretend to replace a
qualified lawyer.

### Product vision

Make reliable legal information easier to understand and navigate,
especially for people who do not know which law, government service, or
complaint process may be relevant to their situation.

### Core value proposition

**Explain the issue. Show the sources. Suggest practical next steps.**

------------------------------------------------------------------------

## 2. Problem Statement

People often struggle to navigate legal information because official
documents can be difficult to understand, the relevant process may be
unclear, and online answers may be incomplete or unreliable.

NyayaAccess aims to reduce this friction by: - Letting users describe
problems in natural language. - Asking clarifying questions when
important details are missing. - Retrieving relevant information from a
small, curated collection of official sources. - Explaining retrieved
information in plain language. - Showing source links and practical next
steps. - Letting users revisit previous chats.

------------------------------------------------------------------------

## 3. Goals and Success Criteria

### Goals

1.  Provide a simple, accessible conversational interface.
2.  Demonstrate an actual open-weight model integration.
3.  Ground responses in retrieved source material rather than relying
    only on model memory.
4.  Display source links alongside legal explanations.
5.  Identify uncertainty and request missing context when necessary.
6.  Persist chat history for signed-in users.
7.  Deliver a working end-to-end demonstration within the hackathon.

### MVP success criteria

-   A user can submit a legal or grievance-related question from the
    frontend.
-   The backend retrieves relevant records from the curated knowledge
    base.
-   The configured LLM generates an answer based on the retrieved
    context.
-   The response displays the sources used, including clickable official
    URLs.
-   The assistant can ask a clarifying question when essential context
    is missing.
-   A signed-in user can reopen a previous conversation.
-   If no sufficiently relevant source is found, the assistant
    communicates that limitation instead of inventing legal information.
-   The application handles model/API errors gracefully.

------------------------------------------------------------------------

## 4. Target Users

### Primary users

People in India who need help understanding common consumer, rental,
employment, payment, or public-grievance issues.

### Secondary users

Students, first-time workers, tenants, and other people unfamiliar with
official complaint processes.

### User needs

-   Explain my situation in ordinary language.
-   Understand what information or documents may matter.
-   See where the guidance came from.
-   Learn reasonable next steps.
-   Continue the conversation without repeating everything.

------------------------------------------------------------------------

## 5. Scope

### MVP features

1.  Landing page explaining the product and its limitations.
2.  Legal category selection.
3.  Conversational problem description and follow-up questions.
4.  Retrieval from a curated JSON knowledge base.
5.  Open-weight LLM integration through a backend API.
6.  Plain-language guidance with source links.
7.  Practical next-step checklist where supported by the evidence.
8.  Chat history and conversation continuation for authenticated users.
9.  Clear uncertainty handling and legal-information disclaimer.
10. Responsive layout for desktop and mobile.

### Initial categories

The interface may display these eight categories, but the team should
only activate categories for which it has verified source records and
tested example questions.

1.  Unpaid wages and employment-related payment issues.
2.  Rental disputes and security deposits.
3.  Consumer complaints.
4.  Banking and digital-payment disputes.
5.  Online shopping and e-commerce complaints.
6.  Family and maintenance information.
7.  Cybercrime and online fraud.
8.  Government documents and public grievances.

**Hackathon constraint:** Prioritize consumer complaints, online
shopping, banking/payment issues, rental disputes, and unpaid wages.
Treat the other categories as optional until their sources and response
behavior have been validated. Do not show a category as fully supported
if its knowledge base is empty or unverified.

### Out of scope for the MVP

-   Providing legal representation or definitive legal advice.
-   Predicting court outcomes or guaranteeing success.
-   Automatically filing complaints, contacting authorities, or sending
    legal notices.
-   Processing payments or collecting case fees.
-   Uploading and analyzing large collections of personal legal
    documents.
-   Exhaustive coverage of every Indian law, state, or jurisdiction.
-   Fine-tuning a model.
-   A complex vector database or multi-agent architecture unless time
    and verified data justify it.
-   Claiming that a source or provision is current without verification.

------------------------------------------------------------------------

## 6. User Flow

1.  The user opens the landing page.
2.  The user selects **Get Legal Help**.
3.  The user selects a category or describes the problem directly.
4.  The assistant identifies missing information and asks a concise
    follow-up question if needed.
5.  The backend retrieves relevant records from the legal knowledge
    base.
6.  The configured open-weight model generates a response grounded in
    those records.
7.  The interface displays:
    -   A plain-language explanation.
    -   Important assumptions or missing details.
    -   Suggested next steps, when supported.
    -   Official source links.
    -   A brief legal-information disclaimer.
8.  The user can ask a follow-up question.
9.  The conversation is saved to the user's history, if signed in.

If retrieval returns no relevant evidence, the assistant should explain
that it cannot provide a well-supported answer and suggest consulting an
appropriate official resource or qualified professional.

------------------------------------------------------------------------

## 7. Frontend Requirements

### 7.1 Landing page

-   Product name and concise value proposition.
-   Primary **Get Legal Help** action.
-   Category shortcuts.
-   Short explanation of how source-backed answers work.
-   Visible legal-information disclaimer.
-   Responsive layout.

### 7.2 Legal chat page

-   Sidebar with new chat, category shortcuts, and conversation history.
-   Main conversation panel with user and assistant messages.
-   Text input and send button.
-   Loading and error states.
-   Follow-up question support.
-   Source cards or links attached to the relevant response.
-   Clear distinction between retrieved source material and AI-generated
    explanation.

### 7.3 Guidance presentation

Display: - **What this may mean:** plain-language explanation. - **What
to do next:** concise checklist, only where supported. - **Sources:**
official source title, relevant section or page when verified, and
link. - **What is uncertain:** missing facts or jurisdictional
limitations, when applicable.

The results should appear in the conversation rather than requiring a
separate page.

### 7.4 Chat history

-   List the user's previous conversations.
-   Open a selected conversation.
-   Start a new conversation.
-   Show an empty state when no conversations exist.

### 7.5 About / How it works

-   Explain retrieval-grounded AI at a high level.
-   Explain that the product provides general legal information, not
    legal representation.
-   Explain that answers may be incomplete and sources should be
    checked.

------------------------------------------------------------------------

## 8. AI and Retrieval Requirements

### 8.1 Model integration

-   Call the LLM only from the backend.
-   Keep API keys in environment variables; never expose them in browser
    code.
-   Use a supported open-weight model available to the team's inference
    account.
-   DigitalOcean Serverless Inference may be used if account access,
    model availability, rate limits, credits, and model license are
    confirmed.
-   Keep the model identifier and API configuration replaceable through
    environment variables.
-   Validate that the selected model's license satisfies the hackathon's
    open-source/open-weight requirement.

### 8.2 Knowledge base

Use a small curated JSON file for the MVP. Each record should contain
fields such as:

``` json
{
  "id": "consumer-example-001",
  "title": "Official source title",
  "category": "consumer_complaint",
  "jurisdiction": "India",
  "section_or_topic": "Verified section or topic",
  "text": "Short verified extract or faithful summary",
  "source_url": "https://official-source.example/",
  "last_verified_at": "YYYY-MM-DD"
}
```

This is a schema example only. Replace placeholder values with verified
information before demoing the category.

### 8.3 Source quality

-   Prefer official legislation portals, regulators, and government
    grievance services.
-   Record the source URL and date checked.
-   Verify the relevant provision, amendments, commencement status, and
    jurisdiction before including legal text.
-   Do not invent sections, deadlines, entitlements, or procedural
    requirements.
-   Clearly distinguish direct quotations, summaries, and model
    explanations.
-   Keep the knowledge base small enough for the team to verify within
    the available time.

Potential starting points include: - India Code:
https://www.indiacode.nic.in/ - National Consumer Helpline:
https://consumerhelpline.gov.in/ - Reserve Bank of India:
https://www.rbi.org.in/ - National Cyber Crime Reporting Portal:
https://cybercrime.gov.in/ - CPGRAMS: https://pgportal.gov.in/

Use each source only for topics it actually supports.

### 8.4 Retrieval behavior

-   Start with transparent keyword/category matching to reduce
    implementation time.
-   Return the best-matching records and their source metadata.
-   Do not pass irrelevant records to the model just to force an answer.
-   If matching confidence is low or no relevant record is found, return
    a safe fallback.
-   Keep retrieval logic in a separate service so it can later be
    replaced with embeddings or a vector database.

### 8.5 Answer-generation rules

The system prompt should instruct the model to: - Use the supplied
retrieved context as the basis for legal claims. - Cite source record
IDs or URLs for substantive claims. - Avoid inventing laws, sections,
deadlines, or procedures. - Ask for missing facts when those facts could
materially change the answer. - State when the available evidence is
insufficient. - Avoid guaranteeing an outcome or presenting itself as a
lawyer. - Keep the answer clear, concise, and accessible. - Suggest
urgent official channels for immediate safety or financial-fraud
concerns when supported by verified information.

------------------------------------------------------------------------

## 9. Backend Requirements

Use **Node.js and Express**.

Suggested endpoints:

  --------------------------------------------------------------------------
  Method                  Endpoint                   Purpose
  ----------------------- -------------------------- -----------------------
  `POST`                  `/api/chat`                Process a message,
                                                     retrieve sources,
                                                     generate a response,
                                                     and persist messages

  `GET`                   `/api/conversations`       List the authenticated
                                                     user's conversations

  `GET`                   `/api/conversations/:id`   Retrieve messages for
                                                     one authorized
                                                     conversation

  `POST`                  `/api/conversations`       Create a conversation
                                                     if not created
                                                     automatically

  `GET`                   `/api/health`              Check whether the
                                                     server is running
  --------------------------------------------------------------------------

The backend must: - Validate request bodies. - Authenticate users before
accessing private chat history. - Verify conversation ownership on every
read or write. - Handle inference timeouts, rate limits, and provider
errors. - Avoid logging full legal conversations or secrets
unnecessarily. - Return source metadata with the assistant's answer. -
Never trust a user ID supplied by the browser as proof of identity.

------------------------------------------------------------------------

## 10. Data Storage and Privacy

### Legal knowledge

-   Store initial curated records in `server/data/legalData.json`.
-   Treat the repository's knowledge base as read-only at runtime for
    the MVP.

### Chat history

Use Supabase PostgreSQL for persistent conversations and messages.

Suggested tables:

**conversations** - `id` - `user_id` - `title` - `created_at` -
`updated_at`

**messages** - `id` - `conversation_id` - `role` (`user` or
`assistant`) - `content` - `sources` (JSON/JSONB, optional) -
`created_at`

Requirements: - Enable authentication for persistent personal history. -
Configure Row Level Security (RLS) and policies so users can access only
their own conversations and messages. - Derive identity from a verified
session/token; never rely on a client-supplied `user_id`. - Keep
Supabase service-role keys on the server only. - Collect only the
information needed for the feature. - Tell users not to submit
passwords, bank credentials, identity numbers, or unnecessary sensitive
details. - Provide a way to start a fresh conversation; deletion can be
added if time permits.

If authentication cannot be completed within the hackathon, use a
clearly labeled demo mode rather than exposing shared chat history
between users.

------------------------------------------------------------------------

## 11. Safety, Trust, and Limitations

NyayaAccess is an informational navigation tool, not a substitute for a
qualified lawyer.

The product must: - Show a persistent disclaimer that information is
general and may not cover every fact or jurisdiction. - Never guarantee
legal outcomes. - Avoid presenting unsupported claims as established
law. - Provide source links for substantive legal guidance. - Admit when
relevant verified sources are unavailable. - Ask for jurisdiction where
state-specific law or procedure may matter. - Avoid collecting
unnecessary personal or confidential information. - Handle urgent safety
and fraud scenarios conservatively and direct users to relevant verified
official channels. - Avoid claiming that all listed categories are fully
supported when their sources have not been reviewed.

------------------------------------------------------------------------

## 12. Non-Functional Requirements

-   **Usability:** A first-time user can submit a question without
    knowing legal terminology.
-   **Responsiveness:** Core pages work on mobile and desktop.
-   **Performance:** Show a loading indicator while retrieval and
    inference run; set request timeouts.
-   **Reliability:** Handle empty input, no-source results, invalid
    requests, and provider failures.
-   **Security:** Protect API keys, authenticate private history access,
    validate inputs, and enforce database policies.
-   **Maintainability:** Keep routes, controllers, retrieval, inference,
    and database access in separate modules.
-   **Transparency:** Show source links and uncertainty alongside
    answers.

------------------------------------------------------------------------

## 13. Suggested Technical Architecture

``` text
React Frontend
      |
      v
Node.js + Express API
      |
      +-------------------------+
      |                         |
      v                         v
Legal Retrieval Service   Supabase Auth / PostgreSQL
      |
      v
Curated legalData.json
      |
      v
Open-weight LLM Inference API
      |
      v
Answer + Source Metadata
      |
      v
React Chat Interface
```

Suggested project structure:

``` text
nyaya-access/
├── client/
│   └── src/
│       ├── components/
│       ├── pages/
│       └── services/
├── server/
│   ├── data/
│   │   └── legalData.json
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   │   ├── legalSearchService.js
│   │   └── llmService.js
│   ├── config/
│   │   └── supabase.js
│   └── server.js
├── .env.example
├── .gitignore
└── README.md
```

------------------------------------------------------------------------

## 14. Three-Hour Build Plan

### 0--30 minutes: Foundation

-   Create the repository and frontend/backend skeleton.
-   Agree on the API response shape.
-   Add a small number of verified knowledge-base records.
-   Configure environment variables.

### 30--90 minutes: Parallel implementation

-   Frontend: landing page and chat interface.
-   Backend: chat endpoint and keyword retrieval.
-   AI/data: model API integration, prompt, and source records.

### 90--135 minutes: End-to-end integration

-   Connect frontend to backend.
-   Return source links with responses.
-   Implement safe fallback behavior for missing sources.
-   Test representative queries.

### 135--160 minutes: Persistence

-   Add Supabase chat history and access controls if authentication is
    ready.
-   Otherwise, use a clearly limited demo mode.

### 160--180 minutes: Demo readiness

-   Test the main scenarios and failure cases.
-   Check that citations open the expected official sources.
-   Remove secrets from the repository.
-   Prepare a short demonstration and README.

**Priority rule:** A reliable source-backed chat flow is more important
than eight superficially implemented categories or extra UI pages.

------------------------------------------------------------------------

## 15. Testing and Acceptance Scenarios

Before the demo, test at least these cases:

1.  **Supported question:** A consumer asks about a defective product;
    the answer includes relevant verified sources.
2.  **Missing context:** A rental question lacks a state or important
    facts; the assistant asks a relevant follow-up question.
3.  **No relevant source:** An unsupported legal question receives an
    honest limitation message, not a fabricated answer.
4.  **Follow-up:** A user asks a second question and the assistant uses
    the conversation context appropriately.
5.  **Source validation:** Every displayed source link points to the
    intended official page.
6.  **Inference failure:** A timeout or rate-limit response produces a
    useful error state.
7.  **History isolation:** One authenticated user cannot read another
    user's conversations.
8.  **Input validation:** Empty or excessively long messages are handled
    safely.
9.  **Secret handling:** API keys do not appear in frontend code or
    committed files.
10. **License compliance:** The chosen model and project dependencies
    satisfy the hackathon's licensing rules.

------------------------------------------------------------------------

## 16. Risks and Mitigations

  -----------------------------------------------------------------------
  Risk                                Mitigation
  ----------------------------------- -----------------------------------
  Model hallucinates legal            Retrieve verified context, require
  information                         citations, and use a no-evidence
                                      fallback

  Legal source is outdated or         Record verification dates and check
  inapplicable                        jurisdiction, amendments, and
                                      commencement status

  Inference credits or access are     Test access early and keep the
  unavailable                         inference client configurable

  Rate limits or latency disrupt the  Use concise prompts, handle errors,
  demo                                and prepare a clearly labeled mock
                                      response only for demo fallback

  Too many categories dilute quality  Launch only categories with
                                      verified records and tested flows

  Chat data is exposed                Use authentication, RLS, ownership
                                      checks, and server-only secrets

  Generated code is incomplete        Test the full
                                      frontend-to-backend-to-model flow
                                      early
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## 17. Definition of Done

The MVP is ready to demonstrate when:

-   The React interface can submit a question.
-   The Express backend retrieves relevant knowledge-base records.
-   An eligible open-weight model generates a grounded answer.
-   The response displays official source links.
-   The assistant handles missing evidence without inventing legal
    claims.
-   Chat history works securely, or the demo clearly explains that
    persistence is limited.
-   At least three representative scenarios pass end-to-end tests.
-   The repository includes a README, setup instructions,
    environment-variable example, and an appropriate open-source
    license.
-   No secrets or real users' sensitive legal information are committed
    to the repository.

------------------------------------------------------------------------

## 18. Final Product Principle

**NyayaAccess should optimize for trustworthy navigation, not
confident-sounding answers.** A smaller set of verified, source-backed
workflows is preferable to broad legal coverage that cannot be
substantiated.
