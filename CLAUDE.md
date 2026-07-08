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
- **AI is provider-agnostic.** All AI work goes through `src/services/ai/`
  (`AiProvider` interface). The rest of the app never knows which provider
  is active. Cloud provider API keys must never reach browser code — cloud
  calls go through an Amplify Function proxy (later milestone). Prompts are
  versioned in `src/services/ai/prompts/` and must embed the
  anti-fabrication constraint (never invent experience, employers, dates,
  or skills).

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
