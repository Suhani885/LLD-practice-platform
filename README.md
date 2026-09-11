# LLD Practice Platform

A small practice experience for Low-Level Design: pick a problem (Parking Lot, Elevator, Vending Machine),
design a solution (classes, interfaces, relationships, and a written rationale), submit it, and get explainable
feedback that combines deterministic structural checks with LLM reasoning. Past attempts are kept so practice
compounds instead of being one-off.

**Practice loop:** Choose problem → Design → Submit → Get feedback → Review → Try again

## Stack

| Layer | Choice |
|---|---|
| Frontend | React 19 + Vite + TypeScript + Tailwind CSS v4 + shadcn/ui (Base UI) |
| Backend | Node.js + Express + TypeScript |
| Database | MongoDB (Atlas free tier), via Mongoose |
| Auth | JWT in an httpOnly cookie, bcrypt password hashing |
| AI feedback | Groq API behind a `FeedbackProvider` interface, falls back to a deterministic mock provider when no API key is set |
| Async evaluation | In-process job queue (`pending → evaluating → completed/failed`), no external broker |

## Architecture

- `client/` — React app. Every page talks to the backend through a single `ApiClient` interface
  (`client/src/lib/api/client.ts`); `HttpApiClient` is the live implementation, `MockApiClient` is a
  fully-functional in-browser fallback used during frontend development before the backend existed.
- `server/` — Express API.
  - `domain/` — framework-agnostic business logic: `StructuralEvaluator` (deterministic checks) and
    `FeedbackProvider` (`GroqProvider` / `MockProvider`), composed by `EvaluationPipeline`. If the LLM call
    fails, the pipeline degrades gracefully to a deterministic-only result instead of failing the submission.
  - `models/` — Mongoose schemas (`User`, `Problem`, `Attempt`, `Submission`). `EvaluationResult` is embedded
    in `Submission` rather than its own collection, since it has no identity or lifecycle independent of the
    submission it belongs to.
  - `jobs/EvaluationQueue.ts` — the in-process async runner that drives a submission through the pipeline.
  - `services/`, `controllers/`, `routes/` — thin layers wiring HTTP to the domain/data layer.

## Project structure

```
lld-practice/
├── client/     # React + Vite + TypeScript frontend
├── server/     # Express + TypeScript API
└── README.md
```

## Getting started

### Prerequisites

- Node.js 20+
- A free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) cluster (M0 tier)
- Optional: a [Groq](https://console.groq.com) API key for real AI feedback (the app runs fine without one)

### 1. Install

```bash
npm install
```

This installs both `client` and `server` workspaces from the root.

### 2. Configure the server

```bash
cp server/.env.example server/.env
```

Fill in `server/.env`:

- `MONGODB_URI` — your Atlas connection string. Make sure it includes a database name before the `?`
  (e.g. `.../lld-practice?retryWrites=true...`) — if you omit it, Mongo silently uses a database named `test`.
- `JWT_SECRET` — any long random string.
- `GROQ_API_KEY` / `GROQ_MODEL` — optional. Leave `GROQ_API_KEY` empty to use the mock feedback provider.

The client also has a `client/.env.example` (`VITE_API_URL`), but its default (`http://localhost:4000/api`)
works out of the box for local dev — you only need a `client/.env` if you're pointing at a different backend URL.

### 3. Seed the database

```bash
npm run seed
```

Upserts the 3 practice problems (safe to re-run).

### 4. Run it

In two terminals:

```bash
npm run dev:server   # http://localhost:4000
npm run dev:client   # http://localhost:5173
```

Open http://localhost:5173, register an account, and start practicing.

## Testing

```bash
npm run test:server   # Jest + Supertest: 34 tests (domain unit tests + full API integration tests)
npm run test:client   # Vitest + Testing Library: 15 tests
```

Server tests run against an in-memory MongoDB (`mongodb-memory-server`) — never your real Atlas cluster — and
force `GROQ_API_KEY` to empty before any module loads, so they always exercise the deterministic mock feedback
provider: fast, free, and reproducible, with no risk of quietly burning real API quota during CI. Coverage
includes the evaluation pipeline's failure-degradation path (LLM call throws → result still completes using the
deterministic score alone) and authorization edge cases (one user cannot read or act on another user's
attempts/submissions).


