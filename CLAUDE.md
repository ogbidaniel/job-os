# Job OS — conventions for AI-assisted development

Job OS is a personal job-application management system (single user).
Long-term production-quality codebase; prefer maintainability over cleverness.

## Architecture rules (non-negotiable)

- **Strict TypeScript. Never use `any`.** Prefer precise types from
  `src/types/models.ts` (re-exported from the Amplify `Schema`).
- **Feature-based structure.** Feature code lives in
  `src/features/<feature>/{pages,api,hooks,types.ts}`. Promote code to
  `src/components/`, `src/lib/`, or `src/services/` only when a second
  feature needs it.
- **Business logic never lives in UI components.** Data flow is:
  UI component → feature hook (TanStack Query) → feature service
  (`src/features/<f>/api/`) → shared client (`src/lib/amplify-client.ts`).
- **UI never touches the Amplify client or `Schema` directly.** Only
  `src/lib/amplify-client.ts` calls `generateClient`; only it and
  `src/types/models.ts` import from `amplify/`.
- **Query keys come from `src/lib/query-keys.ts`** — no ad-hoc string keys.
- **Enum defaults live in services**, not the schema (Amplify enums cannot
  declare defaults): `Job.status` defaults to `"NEW"`, `Application.status`
  to `"SAVED"`, in their create services.
- **Schema enums are semi-frozen.** Changing enum values is a breaking
  Amplify schema change; think twice.
- **AI is provider-agnostic.** Cloud provider API keys must never reach
  browser code — cloud AI calls go through Amplify Functions exposed as
  custom queries (extract-job, extract-profile, score-fit), sharing
  `amplify/functions/shared/gemini.ts`; the frontend reaches them only via
  feature services. AI queries return JSON **strings**; the feature
  service parses and types them. Secrets come from `secret("...")` in the
  function resource, never from code or env files. Prompts are versioned
  in handler comments (job-extract.v3, profile-extract.v1, fit-score.v1)
  and must embed the anti-fabrication constraint (never invent experience,
  employers, dates, or skills; null/blank for missing info; verbatim
  copying — the ONLY AI-written fields are explicit summaries). The
  `src/services/ai/` browser abstraction is reserved for local providers
  (Ollama/LM Studio) and future settings-driven routing.
- **Job records are structured**: summary + responsibilities/
  requiredSkills/preferredSkills arrays + sourceSite + rawPosting (the
  original paste, kept for provenance and re-extraction). Legacy records
  may only have description/requirements — UI must degrade gracefully.
- **This is a single-user app and the user's profile is HARD-CODED** in
  `src/content/profile.ts` (details, experience, evidence, and the
  precompiled `PROFILE_CONTEXT` used by fit scoring). Edit facts there —
  do not rebuild profile CRUD. The Profile/Experience/Evidence models
  remain in the schema **dormant**: do NOT remove them (deletion
  protection will fail the deploy) and do not build UI on them.
- **Resume Studio**: one LaTeX resume per job category
  (`src/content/resume-categories.ts`), stored as `Resume` records keyed
  by label, seeded from `src/content/resume-template.ts`. PDFs compile
  via the `compile-latex` Lambda proxying latex.ytotech.com (JSON-string
  transport `{ pdfBase64 } | { error, log }`); Open-in-Overleaf is the
  no-infrastructure fallback. Iterate compile changes with
  `scripts/test-compile-latex.ts`.

## UI conventions

- Tailwind CSS v4 (CSS-first config in `src/index.css`; no tailwind.config).
- shadcn/ui components in `src/components/ui/` (CLI-managed — edit via
  `npx shadcn@latest add <component>`, avoid heavy manual rewrites).
- Layout primitives in `src/components/layout/`: `AppShell`, `SidebarNav`,
  `AppHeader`, `PageHeader`, `EmptyState`.
- Routing: React Router v7, library mode, single `react-router` package
  (`RouterProvider` imports from `"react-router/dom"`). Route table lives in
  `src/app/router.tsx`.
- Keep components small; favor composition.

## Backend

- AWS Amplify Gen 2: `amplify/` (auth = Cognito email login, data =
  AppSync/DynamoDB). Default auth mode is `userPool`; every model uses
  `allow.owner()`.
- Application is the hub entity: it owns all reference fields
  (`jobId`, `resumeId`, `coverLetterId`, `recruiterId`). No `hasOne`.
- No secondary indexes yet — ~700 owner-scoped records are fetched whole
  and filtered client-side.

## Workflow

- `npx ampx sandbox` (long-running watcher; needs AWS credentials) must run
  before the app builds: it generates the gitignored `amplify_outputs.json`
  that `src/main.tsx` imports. This is the #1 fresh-clone trap.
- `npm run dev` — Vite dev server. `npm run build` — `tsc && vite build`.
- `npm run lint` — zero warnings allowed (`--max-warnings 0`).
- Pushing `main` triggers the Amplify Hosting pipeline (backend deploy then
  frontend build). Work on branches; merge to `main` deliberately.
