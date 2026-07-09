# Job OS

A personal job-application management system — the single source of truth for
every application in a high-volume job search (~700 applications over 5
months).

Job OS is **not** a job board, **not** an ATS, and it never applies to jobs
automatically. It organizes the applications *you* make: saved jobs, tailored
resume and cover letter text, recruiter contacts, and pipeline status.

## Core workflow

Save Job → Import Job Info (paste URL or description) → Review → Generate
Resume Draft (AI, later milestone) → Edit → Export text → Generate Cover
Letter → Apply externally → Record Application → Track status.

The Resume/Cover Letter workspaces store **text only** — you paste exported
text into your own Word template and produce the final PDF yourself.

## Stack

React 18 · TypeScript (strict) · Vite · Tailwind CSS v4 · shadcn/ui ·
React Router v7 · TanStack Query · AWS Amplify Gen 2 (Cognito auth,
AppSync/DynamoDB data) · provider-agnostic AI layer (later milestone).

## Getting started

Prerequisites: Node ≥ 20.20, npm ≥ 10.8, AWS credentials configured
(`aws configure` or SSO) for the sandbox, and a Gemini API key
(aistudio.google.com/apikey) for AI job extraction.

Set the Gemini key as an Amplify secret (never in code or .env):

```bash
# local sandbox (prompts for the value)
npx ampx sandbox secret set GEMINI_API_KEY

# production: Amplify Console → job-os app → Secrets → add GEMINI_API_KEY
```

```bash
npm install

# 1. Start the Amplify sandbox (long-running watcher, own terminal).
#    REQUIRED before the first build: it generates the gitignored
#    amplify_outputs.json that src/main.tsx imports.
npx ampx sandbox

# 2. In another terminal:
npm run dev
```

> **Fresh-clone trap:** `npm run build` fails with a missing
> `amplify_outputs.json` until `npx ampx sandbox` (or the hosting pipeline)
> has run once.

Scripts: `npm run dev` · `npm run build` (`tsc && vite build`) ·
`npm run lint` (zero warnings allowed) · `npm run preview`.

## Project structure

```
amplify/            # Gen 2 backend: auth (Cognito email), data (owner-scoped models)
src/
  app/              # wiring: providers (Authenticator + Query), router, App
  components/
    ui/             # shadcn/ui components (CLI-managed)
    layout/         # AppShell, SidebarNav, AppHeader, PageHeader, EmptyState
  features/         # feature modules: pages/, api/ (services), hooks/, types.ts
    dashboard/ applications/ jobs/ resumes/ cover-letters/ recruiters/ settings/
  services/ai/      # provider-agnostic AI layer (types reserved; impl later)
  lib/              # amplify-client (single Data client), query-client, query-keys
  types/models.ts   # entity types re-exported from the Amplify Schema
```

Architecture rules live in [CLAUDE.md](CLAUDE.md) — most importantly:
UI → hook → feature service → shared client; UI never touches the Amplify
client; business logic never lives in components.

## Data model

`Application` is the hub entity. It references `Job`, `Resume`,
`CoverLetter`, and `Recruiter` (all reference fields live on Application, so
jobs, master documents, and recruiters exist independently and are reusable).
All models are `allow.owner()` with Cognito user-pool auth.

Pipeline statuses: SAVED → DRAFTING → APPLIED → INTERVIEWING → OFFER, with
REJECTED / WITHDRAWN / GHOSTED as terminal states.

## Deployment

Amplify Hosting deploys from `main` via `amplify.yml` (backend
`ampx pipeline-deploy`, then frontend build). One console-side setting is
required for client-side routing: a rewrite rule
`</^[^.]+$/>` → `/index.html` (type `404-200`) so deep links like
`/applications/123` resolve.
