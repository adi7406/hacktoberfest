# ENVIRONMENT_SETUP.md

> **Project:** NyayaAccess  
> **Audience:** Antigravity coding agent and project team  
> **Purpose:** Make local development reproducible and prevent configuration errors, leaked secrets, and mismatched frontend/backend settings.

---

## 1. Instructions to the Coding Agent

Before changing setup files:

1. Inspect the repository root, `client/`, `server/`, package manifests, scripts, existing `.env` files, and `.gitignore`.
2. Preserve the project's existing structure and package manager. Do not assume the folders or scripts below already exist.
3. Reuse existing environment-variable names when they are already part of the codebase. Do not rename them without updating every reference and the relevant documentation.
4. Do not print, expose, commit, or copy secret values into source code, frontend variables, screenshots, logs, or documentation.
5. Do not overwrite a real `.env` file. If a variable is missing, explain which key is required and let the developer provide its value.
6. Do not invent API keys, project URLs, database passwords, or provider endpoints.
7. Keep all provider credentials on the server. Never prefix secrets with `VITE_`, `NEXT_PUBLIC_`, or another frontend-exposed variable prefix.
8. If a feature is not implemented, label its environment variables optional rather than adding unnecessary setup.
9. After setup changes, run the checks that exist in the repository and report the actual result.

## 2. Prerequisites

Confirm the installed versions before troubleshooting. Use versions compatible with the project's existing dependencies.

- Node.js LTS
- npm, if the repository uses npm
- Git
- A code editor/terminal
- A Supabase project, only if database persistence is implemented
- A DigitalOcean inference credential and supported endpoint/model, only if that provider is configured
- Any other provider account explicitly required by the existing code

Useful checks:

```bash
node --version
npm --version
git --version
```

Do not upgrade Node.js or replace package dependencies solely because a newer version exists. Follow the project's `engines` field and lockfile when present.

## 3. Inspect the Project First

Before giving commands, determine whether the repository uses:
- one root package or separate frontend/backend packages;
- JavaScript or TypeScript;
- npm, pnpm, or yarn;
- Vite, Next.js, or another frontend tool;
- CommonJS or ES modules on the backend;
- a local JSON knowledge base, Supabase, or both;
- a direct DigitalOcean inference endpoint or a compatible SDK/client.

Use the package scripts that actually exist. The example commands in this document are templates, not proof that a script exists.

## 4. Environment Files

Typical layout, if it matches the current repository:

```text
project-root/
├── client/
│   ├── .env.example
│   └── ...
├── server/
│   ├── .env.example
│   └── ...
├── .gitignore
└── ...
```

The actual project may use a root `.env.example` instead. Avoid duplicating the same variable across multiple files unless the application deliberately requires it.

### Rules

- `.env` contains local secrets and must not be committed.
- `.env.example` contains variable names and safe placeholders only.
- Do not put real credentials in `.env.example`.
- Keep frontend-public configuration separate from backend secrets.
- Ensure `.env`, `.env.*` secret variants, and local credential files are covered by `.gitignore`, while allowing the checked-in example files.
- Never commit service-role keys or database passwords.
- Do not place server secrets in React source code, browser storage, or a frontend build.
- If a secret has already been committed, removing it from the latest commit is not enough; rotate/revoke it.

Example `.gitignore` entries, to merge with the existing file rather than blindly overwrite it:

```gitignore
node_modules/
.env
.env.*
!.env.example
!.env.*.example
dist/
coverage/
```

Review these patterns against the existing repository before applying them. Do not accidentally ignore required non-secret configuration files.

## 5. Environment Variables

The exact variable names must match the code. The following is a suggested inventory, not a claim that all variables are already implemented.

### Backend

| Variable | Required when | Description |
|---|---|---|
| `PORT` | Express server needs a configured port | Port to listen on; use the platform-provided value when hosted |
| `NODE_ENV` | Recommended | `development`, `test`, or `production` |
| `CLIENT_ORIGIN` | CORS allowlist is configured | Exact frontend origin, including scheme and port for local development |
| `SUPABASE_URL` | Supabase integration is implemented | Project URL from Supabase project settings |
| `SUPABASE_ANON_KEY` | Backend client uses the anon/publishable key | Public project key; still configure access policies and server-side authorization |
| `SUPABASE_SERVICE_ROLE_KEY` | Only if a trusted server operation truly requires elevated access | Highly privileged secret; server-side only, least-privilege use, never exposed to the browser |
| `DIGITALOCEAN_INFERENCE_URL` | Only if using a configured DigitalOcean inference endpoint | Exact endpoint from the provider's current dashboard/docs |
| `DIGITALOCEAN_INFERENCE_API_KEY` | Only if the endpoint requires an API key | Secret credential; server-side only |
| `DIGITALOCEAN_MODEL` | Only if model selection is configured by environment | Exact supported model identifier from the provider |
| `LLM_TIMEOUT_MS` | Recommended if request timeout is configurable | Maximum wait for an inference request |
| `MAX_MESSAGE_LENGTH` | If request validation uses configuration | Maximum accepted user-message length |
| `SESSION_SECRET` | Only if the chosen session/auth mechanism requires it | High-entropy secret generated for this application |

Include only variables actually referenced by this repository.

### Frontend

For Vite, only variables with the configured public prefix (commonly `VITE_`) are exposed to browser code. For Next.js, variables with `NEXT_PUBLIC_` are public. Follow the actual frontend framework.

Potential public configuration:

| Variable | Required when | Description |
|---|---|---|
| `VITE_API_BASE_URL` | Vite frontend calls a separate backend | Backend base URL, e.g. local API origin; must contain no secret |
| `NEXT_PUBLIC_API_BASE_URL` | Next.js frontend calls a separate backend | Public backend base URL; use only if the project uses Next.js |

Do not define both frontend API variables unless the repository intentionally supports both frameworks. Never expose `DIGITALOCEAN_INFERENCE_API_KEY`, database passwords, service-role keys, or session secrets through frontend environment variables.

## 6. Create `.env.example` Files

After inspecting the repository, create only the example file(s) appropriate to the actual structure.

Example backend template:

```dotenv
NODE_ENV=development
PORT=5000
CLIENT_ORIGIN=http://localhost:5173

# Add only if implemented:
# SUPABASE_URL=
# SUPABASE_ANON_KEY=
# DIGITALOCEAN_INFERENCE_URL=
# DIGITALOCEAN_INFERENCE_API_KEY=
# DIGITALOCEAN_MODEL=
# LLM_TIMEOUT_MS=30000
```

Example Vite frontend template:

```dotenv
VITE_API_BASE_URL=http://localhost:5000
```

These are examples. If the frontend uses a different port, framework, or API proxy, adjust the values to the actual application. Do not add unused variables to the real `.env`.

## 7. Local Setup Workflow

### Step 1 — Clone or open the repository

If the repository is already open in Antigravity, do not clone it again. Otherwise, use the project's actual repository URL:

```bash
git clone <YOUR_REPOSITORY_URL>
cd <YOUR_PROJECT_DIRECTORY>
```

Replace placeholders yourself; never invent a repository URL.

### Step 2 — Install dependencies

Use the package manager indicated by the lockfile:

```bash
npm install
```

If the project uses `npm ci` and has a valid lockfile, prefer `npm ci` for a clean, reproducible install. Use `pnpm install` or `yarn install` if those are the project's established package managers. Do not create multiple lockfiles.

### Step 3 — Configure environment variables

- Copy the appropriate `.env.example` to `.env`.
- Enter credentials from the relevant provider dashboard.
- Do not paste secret values into chat, source files, or frontend configuration.
- Verify the frontend API base URL matches the actual backend address.
- Verify CORS allows the exact local frontend origin.

Example:

```bash
# Run from the relevant folder; adjust paths for the actual project
cp server/.env.example server/.env
cp client/.env.example client/.env
```

On Windows PowerShell, equivalent copying can be done with:

```powershell
Copy-Item server/.env.example server/.env
Copy-Item client/.env.example client/.env
```

Only run the commands for directories that exist. If the project uses a root environment file, copy that one instead.

### Step 4 — Start the backend

Inspect `server/package.json` and use its actual development script. Common examples include:

```bash
cd server
npm run dev
```

If there is no `dev` script, do not assume it exists. Check the package scripts and use the documented command.

Confirm that:
- the server starts without import/configuration errors;
- the expected port is listening;
- a documented health endpoint responds, if one exists;
- secrets are not printed to the console.

### Step 5 — Start the frontend

In a separate terminal, inspect the frontend package scripts. A common Vite command is:

```bash
cd client
npm run dev
```

Open the local URL printed by the development server. Do not assume the port if it is already occupied.

### Step 6 — Verify the complete flow

- Open the frontend.
- Submit a harmless test question.
- Confirm the frontend sends the request to the intended backend.
- Confirm the backend retrieves only verified knowledge-base records.
- Confirm the configured LLM provider responds, if integration is enabled.
- Confirm displayed citations correspond to retrieved source IDs.
- Confirm an unsupported question returns the safe fallback.
- Confirm no API key appears in browser devtools, network payloads, or client bundles.

## 8. Supabase Configuration

Only perform this section if persistent data storage has been implemented.

1. Open the correct Supabase project.
2. Copy the project URL and required key from its settings.
3. Put the values in the server-side `.env`.
4. Confirm the backend uses the intended key and client configuration.
5. Configure row-level security (RLS) and authorization for user-owned data.
6. Test with separate users to ensure one user cannot read another user's conversations.
7. Use a separate test project or isolated test schema for automated tests where practical.

### Key handling

- A publishable/anon key is not a substitute for database access control.
- A service-role key bypasses normal RLS protections and must remain server-side.
- Do not put a service-role key in a `VITE_` or `NEXT_PUBLIC_` variable.
- Do not commit database passwords or connection strings.
- Do not run destructive schema or data tests against production.

If the project stores no user data in Supabase yet, skip database setup rather than adding an unused dependency.

## 9. DigitalOcean Inference Configuration

Only perform this section after the team confirms that the selected DigitalOcean inference product, endpoint, model, credentials, and account limits are available.

1. Check the provider's current official documentation/dashboard for the exact endpoint URL and authentication method.
2. Confirm the chosen model is available to the account and suitable for the task.
3. Store credentials in the backend environment only.
4. Use the endpoint and model identifier exactly as documented by the provider.
5. Set a request timeout and handle provider errors.
6. Avoid logging authorization headers, API keys, or full sensitive user prompts.
7. Test with a harmless prompt and verify the response format before connecting it to the chat UI.
8. Handle authentication errors, rate limits, timeouts, unavailable models, and malformed responses.
9. If the provider's API is OpenAI-compatible, use that compatibility only after verifying the actual base URL, endpoint path, and required fields. Do not assume compatibility.

Do not invent a model name, endpoint URL, free-tier allowance, credit amount, or rate limit. Those details can change and must be checked against current provider documentation.

## 10. CORS and Local Network Access

For local development:
- Configure the backend allowlist with the actual frontend origin, such as `http://localhost:5173` for a typical Vite setup.
- `http://127.0.0.1:5173` and `http://localhost:5173` are different origins.
- A LAN address such as `http://192.168.x.x:5173` is also a different origin.
- Allow only origins needed for development; avoid wildcard origins when credentials are enabled.
- Do not use CORS as a substitute for authentication or authorization.

If a CORS error occurs, compare the exact browser origin with the backend's configured allowlist. Restart the backend after changing server environment variables.

## 11. Troubleshooting

| Symptom | Checks |
|---|---|
| `npm` or `node` command not found | Install Node.js and reopen the terminal; verify PATH and versions |
| `npm install` fails | Check package manager/lockfile consistency, Node compatibility, network, and permissions |
| Missing environment variable | Compare the error with `.env.example`; confirm file location and that the application loads it |
| Environment changes have no effect | Restart the relevant dev server; verify which directory's `.env` is loaded |
| `ECONNREFUSED` | Confirm server/database is running, host and port are correct, and network access is permitted |
| CORS error | Match the exact frontend origin to the backend allowlist; check scheme, hostname, and port |
| `401` or `403` from inference | Check credential presence, permissions, endpoint, and provider-specific authentication format |
| `404` from inference | Verify the current base URL, endpoint path, and model identifier against official provider documentation |
| Rate-limit response | Respect provider limits, surface a recoverable message, and avoid uncontrolled automatic retries |
| Model response has unexpected shape | Inspect a redacted response sample and validate it at the service boundary |
| Supabase permission error | Check the configured key, RLS policies, authenticated user context, and ownership rules |
| Frontend calls the wrong backend | Inspect the effective public API base URL and browser network request |
| Port already in use | Stop the conflicting process or use the port supported by the app's configuration |
| Works locally but not in another environment | Compare environment variables, CORS origins, runtime version, and provider configuration without exposing secrets |

Never fix a configuration error by hardcoding a secret or disabling all security checks.

## 12. Secret-Safety Checklist

Before committing or sharing the repository:

- [ ] `.env` files are ignored by Git.
- [ ] `.env.example` files contain placeholders only.
- [ ] No provider key or database password is present in frontend source.
- [ ] No service-role key is exposed to the browser.
- [ ] No secrets appear in logs, screenshots, issue reports, or test fixtures.
- [ ] No real legal conversation or identifying user data is committed.
- [ ] Previously exposed credentials have been rotated.
- [ ] Required environment variables are documented without publishing their values.

Useful check:

```bash
git status --short
git check-ignore server/.env
```

These commands are examples; adjust paths to the actual repository. Do not paste secret-bearing file contents into logs or public issue trackers.

## 13. Definition of Done

Local environment setup is complete when:

- [ ] The documented runtime and package manager match the repository.
- [ ] A new developer can identify the correct install and start commands.
- [ ] Example environment files match the actual code.
- [ ] Required configuration is validated at startup with clear, non-secret error messages.
- [ ] Frontend and backend origins are aligned.
- [ ] The app starts without missing-module or missing-variable errors.
- [ ] The main user flow works with the configured services.
- [ ] Unavailable AI/database services fail gracefully.
- [ ] No credentials are exposed in the frontend or committed to Git.
- [ ] The agent reports the actual commands run and any unresolved setup issues.

**Setup principle:** Reproducible configuration, explicit validation, and server-side secret handling are more important than making the application appear to start successfully.
