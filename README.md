# NyayaAccess

**NyayaAccess** is an Indian legal-information and public-service navigation assistant built for hackathons and public empowerment. It helps citizens describe issues in plain language, retrieves verified official government guidelines, explains processes in simple terms, and links directly to official dispute resolution portals.

> **Disclaimer:** NyayaAccess provides general public legal information grounded in verified official sources. It is not a law firm, lawyer, court, or government authority, and does not provide formal legal representation.

---

## Architecture Overview

- **Frontend (`client/`)**: Built with React and Vite following the **Modern Institutional Minimalism** design system.
- **Backend API (`server/`)**: Built with Node.js and Express, implementing input validation, deterministic legal source retrieval, and server-side LLM orchestration.
- **Legal Knowledge Base (`server/data/legalData.json`)**: Curated and verified records covering:
  - **Consumer Complaints**: National Consumer Helpline (1915 / consumerhelpline.gov.in) and e-Daakhil.
  - **Cybercrime & Financial Fraud**: Citizen Financial Cyber Fraud Reporting System (Helpline 1930 / cybercrime.gov.in).
  - **Public Grievances**: Centralised Public Grievance Redress and Monitoring System (CPGRAMS / pgportal.gov.in).
- **Inference Service**: Configurable DigitalOcean Inference integration (OpenAI-compatible) with strict source grounding and automated deterministic fallback for local/offline demo mode.
- **Persistence**: Supabase PostgreSQL support for authenticated conversation history, with graceful memory-backed demo mode fallback.

---

## Quick Start

### 1. Prerequisites
- Node.js (v18+)
- npm (v9+)

### 2. Setup Environment
Copy the example environment template:
```bash
cp .env.example .env
```
*(Optionally add your `DIGITALOCEAN_INFERENCE_API_KEY` or `SUPABASE_URL` in `.env` if using live external providers).*

### 3. Install Dependencies
```bash
# Server dependencies
cd server && npm install && cd ..

# Client dependencies
cd client && npm install && cd ..
```

### 4. Run Tests
```bash
npm test
```

### 5. Start Development Servers
In separate terminals:

```bash
# Start backend API (runs on port 5000)
npm run server:dev

# Start frontend application (runs on http://localhost:5173)
npm run client:dev
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check & knowledge base summary |
| `POST` | `/api/chat` | Send message, retrieve verified sources & get guidance |
| `GET` | `/api/conversations` | List user consultations |
| `GET` | `/api/conversations/:id` | Fetch specific consultation & message transcript |
| `DELETE` | `/api/conversations/:id` | Delete consultation |
