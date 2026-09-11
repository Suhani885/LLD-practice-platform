# LLD Practice Platform

A small practice experience for Low-Level Design: pick a problem (Parking Lot, Elevator, Vending Machine, ...),
design a solution, submit it, and get explainable feedback that combines deterministic checks with LLM reasoning.


## Stack

- **Frontend:** React + Vite + TypeScript + Tailwind CSS + shadcn/ui
- **Backend:** Node.js + Express + TypeScript
- **Database:** MongoDB (Atlas free tier)
- **AI feedback:** Groq API behind a pluggable `FeedbackProvider` interface (falls back to a rule-based mock without a key)
- **Testing:** Jest + Supertest (server), Vitest + Testing Library (client)

## Structure

```
lld-practice/
├── server/     # Express + TypeScript API
├── client/     # React + Vite + TypeScript frontend
├── docs/       # Research note, design note
└── README.md
```
