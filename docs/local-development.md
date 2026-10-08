# Local development — Job OS

Written for developers joining the Job OS team.

Every developer runs their **own private copy of the backend** (an Amplify
"sandbox") against their own local frontend. Nothing you do locally can
affect the deployed app or anyone else's work.

> **Read this first if you've seen the tools report:** Job OS already has a
> backend. It is not Postgres and there is no Docker container to run — it
> is AWS Cognito (accounts) + AppSync (GraphQL API) + DynamoDB (database),
> defined as TypeScript in `amplify/`. You do not install or administer any
> of it; `ampx sandbox` creates your own copy from that code.

---

## 1. Prerequisites

| Tool | Version | Notes |
|---|---|---|
| Node.js | 20.20+ (LTS 24 recommended) | `node --version` |
| npm | 10.8+ | ships with Node |
| AWS CLI v2 | any | needed once, to store your credentials |
| Git | any | |

You will be given an **AWS access key ID and secret access key** for your
own IAM user. Treat them like a password: never commit them, never paste
them into Slack, Jira, or a pull request.

## 2. Configure AWS credentials (once)

```bash
aws configure
# AWS Access Key ID:     <from the team lead>
# AWS Secret Access Key: <from the team lead>
# Default region name:   us-east-1
# Default output format:  json
```

Verify:

```bash
aws sts get-caller-identity
```

It should print your own IAM user ARN.

## 3. Install dependencies

```bash
git clone https://github.com/ogbidaniel/job-os.git
cd job-os
npm install
```

## 4. Set your sandbox secrets (once)

The backend's AI functions read API keys from AWS Secrets, and
**a missing secret fails the deploy** — so all three must exist before
your first sandbox start, even if you only have one real key.

```bash
npx ampx sandbox secret set GEMINI_API_KEY   # your own free key, see below
npx ampx sandbox secret set OPENAI_API_KEY   # enter: none
npx ampx sandbox secret set INVITE_CODE      # enter: none
```

- **GEMINI_API_KEY** — create your own free key at
  [Google AI Studio](https://aistudio.google.com/apikey). Use your own, not
  a shared one: the free tier is per-account and generous, and a shared key
  means one person's quota blocks everyone.
- **OPENAI_API_KEY** — enter `none` unless you are specifically working on
  the OpenAI fallback path. The provider chain treats `none` as
  "not configured" and skips it.
- **INVITE_CODE** — enter `none`. This leaves self-signup **open in your
  sandbox** so you can register an account and log in. Production requires
  a real code.

These are stored per-developer in AWS Parameter Store. They are not shared
and not in the repo.

## 5. Start the backend, then the frontend

In one terminal — leave it running:

```bash
npx ampx sandbox
```

First run takes a few minutes (it creates your Cognito pool, AppSync API
and DynamoDB tables). It then **watches `amplify/`** and redeploys on save.
It also generates `amplify_outputs.json`, which is gitignored and which the
frontend imports.

> `npm run dev` fails with a missing `amplify_outputs.json` until the
> sandbox has started at least once. This is the single most common
> first-day problem.

In a second terminal:

```bash
npm run dev
```

Open the printed URL, click **Create Account**, register with any email
(leave the invite code blank), and confirm the emailed code. That account
exists only in your sandbox.

## 6. Testing your changes

There is no shared staging step — verify locally before opening a PR.

```bash
npm run build     # tsc + vite; must pass
npm run lint      # must report zero warnings
```

**Frontend changes** — `npm run dev` hot-reloads. Exercise the screen you
changed, including its empty, loading and error states.

**Backend changes** (`amplify/`) — the running sandbox redeploys on save;
watch that terminal for the deploy to finish before retesting.

**Data** — your tables start empty, and the app is useless without data, so
add a job through the UI (**Jobs → Add job**, paste any real posting and
click *Extract with AI*).

**The GraphQL API directly** — every model is owner-scoped, so a request
needs your Cognito JWT. The quickest path is the **AppSync console**
(AWS Console → AppSync → your sandbox API → Queries), which signs requests
as a logged-in user for you. If you prefer Postman, grab a token in the
browser devtools console on the running app:

```js
(await (await import('aws-amplify/auth')).fetchAuthSession()).tokens.idToken.toString()
```

and send it as the `Authorization` header to the `url` in
`amplify_outputs.json`. Note the API is **GraphQL**, so it is one POST
endpoint with a query body — not REST paths per resource.

**Lambda handlers** without a redeploy — run them directly:

```bash
npx tsx scripts/test-extract-job.ts      # AI provider chain
npx tsx scripts/test-compile-latex.ts    # LaTeX to PDF
```

These need the relevant key in your shell environment, e.g.
`GEMINI_API_KEY=... npx tsx scripts/test-extract-job.ts`.

## 7. Cleaning up

```bash
npx ampx sandbox delete
```

Please do this when you finish a work session or drop off the project —
idle sandboxes leave tables in the shared AWS account. Deletion protection
is deliberately **off** for sandboxes so this always works; it is on for
real deployments.

## 8. Branching

`main` deploys automatically to production, so never push to it directly.
Branch, open a pull request, and get a review:

```bash
git switch -c milestone-7-my-feature
```

## Architecture rules

Read `CLAUDE.md` before your first pull request. The ones that cause the
most review comments:

- **Never use `any`.** Types come from `src/types/models.ts`.
- **UI never touches the Amplify client.** The data flow is
  UI → feature hook (`hooks/`) → feature service (`api/`) →
  `src/lib/amplify-client.ts`. Only that last file calls `generateClient`.
- **Query keys come from `src/lib/query-keys.ts`** — no ad-hoc strings.
- **Cloud AI keys never reach browser code.** AI calls go through Amplify
  functions exposed as custom queries.
- Feature code lives in `src/features/<feature>/{pages,components,hooks,api,lib}`.
