# FRONTEND_DESIGN.md — NyayaAccess
**Version:** 2.0  
**Design direction:** Modern Institutional Minimalism  
**Purpose:** Give the Antigravity agent an implementation-ready design system and UI quality checklist for NyayaAccess.

> **Source of design direction:** This specification adapts the supplied “Modern Institutional Minimalism for a Law & Justice Platform” prompt specifically for NyayaAccess. It preserves the institutional, Swiss-typographic, modern SaaS, and accessible-government design direction while removing irrelevant case-management features that NyayaAccess does not currently implement.

---

## 1. Mission and Design Principles

Design NyayaAccess as a trustworthy digital legal-information service with the usability of a modern SaaS product. It should feel calm, neutral, clear, accountable, privacy-conscious, and accessible—not like a generic chatbot with a justice-themed logo.

The interface must communicate:
1. Trust and credibility.
2. Neutrality and fairness.
3. Transparency about sources and uncertainty.
4. Privacy and security.
5. Accessibility and inclusion.
6. Professionalism without visual excess.

### Non-negotiable principles

- **Clarity over decoration:** every element should serve a clear purpose.
- **Trust through simplicity:** use restrained colors, consistent alignment, whitespace, subtle borders, and predictable navigation.
- **Neutrality:** never visually imply guilt, innocence, legal success, or which party is right.
- **Source transparency:** official sources must be easy to find next to the AI explanation.
- **Honest product state:** never style a feature as functional if its backend is not implemented.
- **Preserve functionality:** inspect the current repository before changing it; retain working routes, APIs, auth, and behavior.
- **No fake data in production UI:** do not replace real API integrations with hardcoded sample answers. Temporary design fixtures must be clearly identified and removed or isolated before demo.
- **No unnecessary dependencies:** reuse the current stack and existing component libraries.
- **No guaranteed perfection claim:** use the validation checklist in this file to catch visual and interaction bugs systematically.

### Avoid

- Excessive gradients or animations.
- Heavy shadows on every card.
- Excessive pill shapes or overly rounded cards.
- Glassmorphism, neon colors, futuristic effects, and decorative backgrounds.
- Random icons or mixed icon styles.
- Fake testimonials, statistics, certifications, government partnerships, or legal credentials.
- “100% accurate,” “guaranteed result,” or similar legal certainty claims.
- Hiding important legal disclaimers in tiny text.

---

## 2. First Step: Inspect Before Implementing

Before editing code, inspect the existing project and identify:
- React version and build tool.
- Existing routes and page components.
- Current styling method and theme tokens.
- Existing icon/UI libraries.
- API client and backend contract.
- Supabase authentication state, if implemented.
- Chat submission, streaming/loading behavior, and conversation history.
- Existing responsive layout and dependencies.

Then create a brief implementation plan and implement the changes. Do not stop after giving recommendations.

### Preserve existing functionality

- Do not rewrite the architecture just to match the example folder structure.
- Do not remove working features or routes.
- Do not change backend behavior to compensate for a purely visual issue.
- Keep request and response fields consistent with `API_SPECIFICATION.md`.
- Keep legal source metadata provided by the backend; never fabricate sources in the UI.
- If a feature is not implemented, show a clear unavailable state or omit it.
- If a change requires a new dependency, first check whether the existing stack already provides the needed functionality.

---

## 3. Design System and Tokens

Create a centralized design-token system using CSS variables or the project's existing theme system. Avoid scattered one-off colors, spacing, radii, and shadows.

### 3.1 Color palette

Use this palette as the default unless the project already has an established theme that should be preserved.

| Token | Hex | Intended use |
|---|---|---|
| `--color-primary-navy` | `#142B4A` | Brand, main headings, navigation |
| `--color-primary-blue` | `#2457A7` | Primary actions, links, interactive elements |
| `--color-dark-navy` | `#0D1B2A` | High-emphasis text and dark surfaces |
| `--color-soft-blue` | `#EAF1FB` | Selected navigation and information highlights |
| `--color-page` | `#F8FAFC` | Application background |
| `--color-surface` | `#FFFFFF` | Cards, dialogs, inputs, chat panels |
| `--color-text-primary` | `#172033` | Main text and headings |
| `--color-text-secondary` | `#475569` | Body descriptions and supporting text |
| `--color-text-muted` | `#64748B` | Metadata and secondary labels |
| `--color-border` | `#E2E8F0` | Card borders, dividers, input borders |
| `--color-border-strong` | `#CBD5E1` | Stronger boundaries and focus context |
| `--color-surface-muted` | `#F1F5F9` | Secondary surfaces |
| `--color-success` | `#16803D` | Success status |
| `--color-success-bg` | `#ECFDF3` | Success background |
| `--color-warning` | `#A15C07` | Cautions and pending states |
| `--color-warning-bg` | `#FFF7E6` | Warning background |
| `--color-error` | `#B42318` | Errors and destructive actions |
| `--color-error-bg` | `#FEF3F2` | Error background |
| `--color-info` | `#2457A7` | Informational messages |
| `--color-info-bg` | `#EFF6FF` | Informational background |
| `--color-accent-gold` | `#C5A45D` | Small decorative or branding accents only |

### Color rules

- White and off-white should dominate.
- Navy establishes institutional credibility; blue indicates actionable interaction.
- Use gold sparingly. Never use gold as the main action color or as a substitute for readable contrast.
- Semantic colors must retain consistent meanings.
- Never communicate status through color alone; pair color with text/icon/shape.
- Check text and control contrast rather than assuming a palette is automatically accessible.
- Do not introduce unrelated colors without a documented reason.

### 3.2 Typography

Preferred fonts:
- **Headings:** Manrope.
- **Body and UI:** Inter.

Use reliable system fallbacks if remote font loading fails. Inspect the current app before adding fonts; avoid adding dependencies solely for typography if an equivalent setup already exists.

Suggested desktop hierarchy:

| Element | Starting size | Weight |
|---|---:|---:|
| Landing hero heading | 48–60 px | 700 |
| Page heading | 30–36 px | 700 |
| Section heading | 22–28 px | 600 |
| Card heading | 17–20 px | 600 |
| Body text | 15–16 px | 400 |
| Supporting text | 13–14 px | 400 |
| Form label | 14 px | 500 |
| Metadata | 12–13 px | 400–500 |

These are starting values, not rigid rules. Scale headings down on smaller screens.

Typography rules:
- Use sentence case for most headings and controls.
- Avoid unnecessary uppercase labels.
- Keep long legal explanations comfortable to read, with adequate line height and a controlled text width.
- Use clear hierarchy for AI explanation, source title, source metadata, and disclaimers.
- Never make source links or legal disclaimers tiny.
- Allow long words, titles, and URLs to wrap instead of overflowing.

### 3.3 Layout and spacing

Use Swiss/international typographic principles: structured alignment, consistent grid, meaningful whitespace, and clear hierarchy.

- Maximum desktop content width: approximately `1200–1280px`.
- Desktop horizontal padding: `32–48px`.
- Tablet padding: approximately `24px`.
- Mobile padding: `16–20px`.
- Use a 4px-based spacing scale: `4, 8, 12, 16, 24, 32, 48, 64px`.
- Align headings with the content they describe.
- Keep form labels, inputs, source cards, and section edges aligned.
- Avoid arbitrary one-off gaps.
- Do not compress legal text into dense, hard-to-scan panels.

### 3.4 Borders, radii, and shadows

Use restrained surfaces:
- Small controls: approximately `6px` radius.
- Inputs and buttons: `8px`.
- Cards: `10–12px`.
- Dialogs: `12–16px`.
- Prefer 1px neutral borders over heavy shadows.
- Use subtle elevation only for overlays, menus, and dialogs.
- Avoid prominent shadows on every card.

### 3.5 Icons

- Reuse the icon library already installed.
- If no library exists and icons are genuinely needed, use one consistent lightweight line-icon library such as Lucide.
- Do not mix icon families.
- Do not use an icon without an accessible name for icon-only controls.
- Icons supplement labels; they do not replace necessary text.

---

## 4. NyayaAccess Page and Layout Specifications

NyayaAccess is a legal information assistant, not a court case-management dashboard. Implement the pages in `FRONTEND_STRUCTURE.md`; do not add irrelevant tables, case tracking, filing forms, or dashboard metrics.

### 4.1 Landing page (`/`)

**Purpose:** Explain the product quickly and let users begin.

Recommended structure:
1. Header with NyayaAccess wordmark, a “How it works” link, and a primary **Get Legal Help** action.
2. Hero headline, e.g. **“Understand your options. Find the right next step.”**
3. Short supporting copy explaining that the assistant provides general information with links to official sources.
4. Primary CTA: **Get Legal Help**.
5. Category shortcuts, limited to categories with verified records and tested behavior.
6. Three-step “How it works” section: Describe the issue → Review source-backed information → Explore possible next steps.
7. Transparency section explaining source links, limitations, and uncertainty.
8. Footer with About/How it works and the legal-information disclaimer.

Requirements:
- Use a restrained, editorial layout with generous whitespace.
- Do not invent user counts, success rates, legal endorsements, government partnerships, or testimonials.
- Do not claim every legal category is supported if its knowledge base has not been verified.
- Category cards must be actual links/buttons with working behavior, not decorative cards.
- If no category is selected, the user must still be able to describe their problem.
- Do not use generic justice imagery as a substitute for a coherent visual identity.

### 4.2 Legal chat page (`/chat` and `/chat/:conversationId`)

This is the core product experience. Prioritize clarity, stable layout, and source transparency.

#### Desktop layout

- A left sidebar for brand, **New Chat**, supported category shortcuts, and recent conversations when history is available.
- A main conversation region with a clear page/conversation heading.
- Message transcript with a readable maximum width.
- Message composer anchored at the bottom of the conversation panel without covering content.
- Source cards directly beneath the assistant answer they support.
- A visible but unobtrusive legal-information disclaimer.

The sidebar should have a stable width and should not cause horizontal overflow. The conversation region should use `min-width: 0` where needed so long content cannot force the layout wider than the viewport.

#### Mobile layout

- Use a collapsible sidebar/drawer or a clear compact navigation control.
- The chat transcript takes the available width.
- The composer remains visible and usable when the on-screen keyboard opens.
- Source cards stack vertically.
- No horizontal page scrolling.
- Do not use fixed positioning that hides the final message or send button.
- Respect mobile safe-area insets where relevant.

#### Welcome state

- Show a concise welcome message and a few example questions.
- Examples should invite the user to ask a question; they must not present unverified legal claims as facts.
- Make the input usable immediately.
- Category selection is optional.

#### Messages

- Use clearly distinguishable but restrained styling for user and assistant messages.
- Do not make message bubbles excessively rounded or too narrow.
- Keep paragraphs, lists, and source links readable.
- Preserve whitespace and list formatting.
- Never render arbitrary HTML returned by the model.
- If Markdown is supported, use a safe renderer and allow only necessary elements; sanitize or disable raw HTML.

#### Composer

- Visible label or accessible name for the input.
- Clear send button with disabled/loading state.
- Enter-to-send behavior must not prevent multiline entry unexpectedly. Define a consistent behavior, such as Enter sends and Shift+Enter inserts a newline, and communicate it if needed.
- Prevent duplicate submissions while a request is pending.
- Preserve the user's text when the request fails.
- Do not clear input until the request is accepted according to the chosen interaction model.
- The send button must not be obscured by the viewport or mobile keyboard.

### 4.3 Assistant answer and source presentation

Within each assistant response, present content in a clear hierarchy:

1. **What this may mean** — plain-language explanation.
2. **Possible next steps** — a short checklist only when supported.
3. **Sources** — source cards from the backend response.
4. **What is uncertain** — missing facts or jurisdiction limits when relevant.

Do not force these headings if the backend returns a clarification or insufficient-evidence response. Render the response according to `message.kind`.

#### Source card

Display only fields actually returned by the backend, such as:
- Verified source title.
- Verified section/topic, if available.
- Jurisdiction.
- “Open official source” link.

Rules:
- Do not generate or infer source URLs in the frontend.
- Validate URLs before rendering; allow HTTPS links to the curated official source records.
- Open external links in a new tab only when appropriate and include `rel="noopener noreferrer"`.
- Handle long source titles and missing optional fields gracefully.
- If `sources` is empty, do not render empty or fake citation cards.
- Do not label a source “official” unless the backend's curated record has been verified as official.

### 4.4 Clarification state

When the assistant asks a follow-up question:
- Visually distinguish it as a normal assistant message with a clear question.
- Keep the input active so the user can answer naturally.
- Do not show an error icon or warning treatment unless there is an actual error.
- Do not force the user to re-enter the original question.

### 4.5 Insufficient-evidence state

When the backend indicates that the knowledge base does not support a reliable answer:
- State the limitation clearly and respectfully.
- Do not show fake sources or a successful-answer status.
- Keep the conversation available for another question.
- If relevant, show a verified official resource supplied by the backend; otherwise do not invent a referral link.

### 4.6 Chat history (`/history`)

- Show the current user's conversation list only when authenticated history is implemented.
- Use a simple list with conversation title and last-updated time.
- Clearly highlight the selected conversation.
- Provide a **New Chat** action.
- Include loading, empty, and recoverable error states.
- If deletion is implemented, use a confirmation step for deletion.
- Never imply that history is private if the implementation uses shared demo state.
- On account change/sign-out, clear user-specific client state so a prior user's conversations do not remain visible.

### 4.7 About / How it works

Keep this concise:
- Explain that answers use a curated collection of legal sources.
- Explain that AI summaries may be incomplete.
- Explain that users should check linked official sources.
- State that NyayaAccess provides general legal information, not legal advice or representation.
- Do not claim automated legal verification beyond what the implementation actually performs.

---

## 5. Interaction and State Design

Every asynchronous operation needs an intentional UI state. Never leave a control looking active if it cannot be used.

### 5.1 Required states

For chat:
- Initial/welcome.
- Sending/loading.
- Guidance response.
- Clarification response.
- Insufficient evidence.
- Network/server error.
- Inference timeout/rate limit.
- Empty input validation.

For history:
- Loading.
- Loaded list.
- Empty list.
- Failed request.
- Unauthorized/session expired.

For navigation:
- Default.
- Hover.
- Keyboard focus.
- Active/selected.
- Disabled where relevant.

### 5.2 Loading behavior

- Show an accessible progress/typing indicator while the request is pending.
- Keep the layout stable; avoid large content jumps.
- Do not append duplicate messages from repeated clicks.
- Use `aria-live` or an equivalent accessible announcement for status changes.
- Never show a fake answer while waiting for a real model response.

### 5.3 Error behavior

- Use a concise message and a clear recovery action.
- Preserve unsent or failed user input.
- Do not expose stack traces, provider errors, internal prompts, or secrets.
- Distinguish “could not connect” from “no relevant legal source found”; these are different states.
- Retry must not create duplicate messages or duplicate conversations.
- If a conversation save fails, communicate the persistence problem rather than implying it was saved.

### 5.4 Toasts and dialogs

- Use toasts only for short transient confirmations.
- Keep important errors inline near the affected component.
- Dialogs must have a clear title, accessible name, keyboard handling, and focus behavior.
- Avoid dialogs for ordinary actions that can be handled inline.

---

## 6. Responsive Behavior

Test at representative viewport widths:
- `1440px` desktop.
- `1280px` laptop.
- `1024px` tablet landscape.
- `768px` tablet portrait.
- `390px` mobile.
- `320px` narrow mobile.

Adapt layouts rather than shrinking desktop components.

Verify:
- Navigation/sidebar.
- Chat transcript and composer.
- Long assistant answers.
- Source cards and long URLs.
- Buttons and form controls.
- Loading and error states.
- History list.
- Dialogs/drawers.
- Footer and disclaimer.

Avoid horizontal scrolling except for content that genuinely needs it. Never hide critical legal information on mobile to simplify the design.

Use CSS grid/flexbox with `min-width: 0`, `max-width: 100%`, `overflow-wrap: anywhere` for long untrusted strings, and responsive breakpoints where appropriate. Do not apply `overflow: hidden` globally as a quick fix because it may clip menus, focus rings, or content.

---

## 7. Accessibility Requirements

Target WCAG 2.2 Level AA where applicable.

Implement:
- Semantic HTML and logical heading order.
- Keyboard-accessible navigation and controls.
- Visible focus indicators.
- Accessible labels for all form fields.
- Accessible names for icon-only buttons.
- Sufficient text and control contrast.
- Error text associated with the relevant input.
- Screen-reader announcements for loading and new assistant responses.
- Appropriate focus management for dialogs and mobile navigation.
- Descriptive link text; avoid “click here.”
- Reduced-motion support.
- Browser zoom support and responsive reflow.
- Touch targets that are comfortable to use on mobile.
- Status text/icons in addition to color.

Do not remove native focus outlines unless replacing them with a clearly visible focus treatment. Automated accessibility tools are useful but do not prove full accessibility.

---

## 8. Motion and Feedback

Use subtle, purposeful motion only:
- Hover/focus transitions.
- Dropdown or drawer appearance.
- Small loading indicators.
- Toast transitions.
- Duration around `150–200ms` for ordinary interactions.

Avoid parallax, constant background animations, long entrance animations, and motion that delays essential content. Respect `prefers-reduced-motion`.

All important actions must remain understandable and usable with motion disabled.

---

## 9. Component and Styling Architecture

Use the current project's component conventions. Prefer reusable components for:
- Buttons and icon buttons.
- Inputs and form fields.
- Cards and source cards.
- Alerts and disclaimers.
- Message bubbles and chat transcript.
- Loading, error, and empty states.
- Sidebar/navigation.
- Dialogs/drawers.

Keep the design tokens centralized. Do not create duplicate button or input styles in multiple files. Avoid giant components with unrelated responsibilities, but do not over-abstract simple UI in the three-hour MVP.

### Suggested design-token implementation

Use CSS variables or the current theme mechanism. Example only:

```css
:root {
  --color-primary-navy: #142B4A;
  --color-primary-blue: #2457A7;
  --color-dark-navy: #0D1B2A;
  --color-soft-blue: #EAF1FB;

  --color-page: #F8FAFC;
  --color-surface: #FFFFFF;
  --color-surface-muted: #F1F5F9;
  --color-text-primary: #172033;
  --color-text-secondary: #475569;
  --color-text-muted: #64748B;
  --color-border: #E2E8F0;
  --color-border-strong: #CBD5E1;

  --color-success: #16803D;
  --color-success-bg: #ECFDF3;
  --color-warning: #A15C07;
  --color-warning-bg: #FFF7E6;
  --color-error: #B42318;
  --color-error-bg: #FEF3F2;
  --color-info: #2457A7;
  --color-info-bg: #EFF6FF;
  --color-accent-gold: #C5A45D;

  --radius-control: 8px;
  --radius-card: 12px;
  --radius-dialog: 16px;

  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;
  --space-12: 48px;
  --space-16: 64px;
}
```

If these tokens conflict with an existing working theme, migrate deliberately rather than creating two competing systems.

---

## 10. Data and Security Rules for the UI

- Treat model output, user input, conversation titles, and source text as untrusted content.
- Render text safely; never use raw HTML injection for model responses.
- Validate URLs before rendering links.
- Do not place provider secrets or service-role credentials in frontend code.
- Do not log or display unnecessary personal legal information.
- Never trust a conversation ID as authorization; the backend must enforce ownership.
- Clear user-specific cached state on sign-out or account switch.
- Do not display another user's conversation in any loading/error fallback.
- Do not expose internal prompts, retrieval scores, environment values, or raw provider errors to the user.

---

## 11. UI Quality and Bug-Prevention Protocol

The agent must not consider the UI complete merely because the development server starts.

### Before implementation
1. Inspect the current application, dependencies, routes, styles, and API contracts.
2. Identify reusable components and working functionality.
3. Write a concise plan of affected files.
4. Avoid changing backend/API behavior for a design-only task.

### During implementation
1. Make changes in small, coherent steps.
2. Keep API data types/field names consistent with `API_SPECIFICATION.md`.
3. Reuse design tokens rather than inventing per-component colors.
4. Handle loading, empty, error, and success states for every async view.
5. Do not use mock data as a silent fallback for failed real requests.
6. Avoid unstable layout changes when messages arrive.
7. Keep controls keyboard accessible.
8. Check the browser console after each major integration step.

### After implementation
Run the project's actual available checks, such as:
- Production build.
- Linter.
- Existing unit/component tests.
- Type checking, if configured.
- Automated accessibility checks, if installed.

Do not claim a check passed unless it was run. If a command is unavailable, report that rather than inventing a result.

### Manual visual regression checklist

Inspect the application at minimum at `1440px`, `768px`, `390px`, and `320px` widths.

Check:
- No unexpected horizontal overflow.
- No overlapping header/sidebar/chat composer.
- No clipped text, cards, menus, or focus rings.
- Long URLs and legal source titles wrap correctly.
- The last chat message is not hidden behind the composer.
- Mobile keyboard does not make the send button inaccessible.
- Loading and error states do not shift the whole layout excessively.
- Empty source arrays render cleanly.
- Missing optional source fields do not crash components.
- Long conversations remain scrollable and usable.
- Refreshing a conversation route behaves correctly.
- Navigation and back behavior work.
- No React key warnings or uncontrolled/controlled input warnings.
- No uncaught exceptions or failed API requests in the console.
- No broken assets or missing fonts that make text unreadable.
- No secrets or internal error details are visible in the browser.

If browser automation or screenshot tooling is available, capture representative screenshots and fix visible defects before finishing.

### Interaction tests

At minimum verify:
1. Start a new chat.
2. Submit a valid message.
3. Prevent empty submission.
4. Show loading while waiting.
5. Render a real backend response.
6. Render a clarification response.
7. Render an insufficient-evidence response without fake citations.
8. Render a provider/network error and preserve the user's text.
9. Open a source link safely.
10. Open a saved conversation when authentication/history is enabled.
11. Handle expired authentication or inaccessible conversation.
12. Use the interface with keyboard-only navigation.

---

## 12. Definition of Done

The frontend is ready for the hackathon demo when:
- The existing project architecture and working features are preserved.
- The landing page leads to a functional chat.
- The chat uses the real backend API according to `API_SPECIFICATION.md`.
- Guidance, clarification, insufficient-evidence, loading, and error states all render correctly.
- Sources are taken only from backend-returned verified records.
- No fake legal claims, sources, testimonials, or metrics are displayed.
- Chat history is user-isolated if enabled.
- The interface follows the institutional-minimalist design system.
- Keyboard navigation and responsive layouts are usable.
- The build and available checks pass, or any unrun/failed checks are explicitly documented.
- The README describes any incomplete features or setup requirements.

**Final principle:** Make NyayaAccess feel like a trustworthy public-interest legal information service: clear, restrained, transparent, accessible, and stable. Functional correctness and honest source presentation take precedence over visual effects.
