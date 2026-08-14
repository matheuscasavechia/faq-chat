# Atlas Helpdesk — FAQ Chatbot with Analytical Dashboard

A full stack platform where users ask support questions in their own words and get answers from a
registered FAQ knowledge base, while every interaction is persisted and turned into product
analytics for an administrative dashboard.

---

## Overview

**The chatbot** answers questions using only the knowledge base stored in PostgreSQL. A question is
normalized, looked up for an exact match, and otherwise compared against every registered question
with PostgreSQL trigram similarity. When the best candidate clears a configurable confidence
threshold the registered answer is returned; when it does not, the assistant says so instead of
guessing, and offers the closest questions as "did you mean" suggestions. There is no generative AI
in the matching path — it is deterministic, cheap and reproducible.

**The dashboard** answers the operational question "is the knowledge base doing its job?". Every
chatbot interaction (answered or not) is written to the `interactions` table, and the dashboard
aggregates that table in SQL: volume, answer rate, most asked questions, questions nobody could
answer, distribution per category and evolution over time, all filterable by period.

The two halves are connected: asking questions in the assistant moves the dashboard numbers.

---

## Features

### Chatbot

- Exact-match lookup on a normalized question, then indexed trigram similarity search.
- Configurable similarity threshold; below it the interaction is recorded as unanswered.
- Friendly fallback answer plus "did you mean" suggestions from near-miss candidates.
- Every interaction persisted with question, normalized question, matched FAQ, similarity score,
  answered flag, category and session id.
- Conversation history for the current browser session, kept in local React state.
- Explicit sending, loading, error and retry states; the failed question stays visible and can be
  retried without retyping.
- Duplicate submissions are impossible while a request is in flight (guarded in the ViewModel and
  reflected in the disabled send button).
- Starter questions and the covered-topics panel are loaded from the backend catalog, not hardcoded.
- Keyboard-first composer (Enter sends, Shift+Enter adds a line), labelled controls, visible focus.

### Dashboard

- KPI cards: total queries, answered, unanswered, answer rate (plus distinct sessions and average
  match confidence as supporting hints).
- Queries over time as a stacked area chart (answered vs unanswered), with gap-filled buckets.
- Queries by category as a horizontal bar chart with direct value labels.
- Most asked questions and unanswered questions as ranked lists with share meters.
- Period filter (7d / 30d / 90d / all time) shared as global client state.
- First-load skeletons, background-refresh state that keeps previous data on screen, empty state,
  error state with retry, and a degraded state that shows stale data when a refresh fails.
- Responsive from wide desktop down to mobile widths; charts and grids reflow instead of overflowing.

---

## Tech Stack

**Frontend** — React 19, TypeScript, Vite, React Router (lazy routes), TanStack React Query
(server state), Jotai (small amount of global client state), Recharts (charts), Zod (runtime
validation of API responses), CSS Modules with design tokens.

**Backend** — Node.js 20, Fastify 5, TypeScript, Prisma 6, PostgreSQL 16+ with `pg_trgm`, Zod
(request and environment validation), Pino (structured logging via Fastify).

**Infrastructure** — Docker, Docker Compose, nginx (serves the built SPA and proxies `/api`).

**Testing** — Vitest on both sides, React Testing Library + jsdom on the frontend,
`fastify.inject()` for HTTP-level backend tests, and a real-PostgreSQL integration suite.

**Tooling** — pnpm workspaces, ESLint 9 (type-checked rules), Prettier, strict TypeScript.

---

## Architecture

The guiding rule is **pragmatic** Clean Architecture: layers exist where they buy testability or
replaceability, and nowhere else. Business rules do not know about HTTP, SQL or React; the UI does
not know about endpoints or database shapes.

### Backend flow

```
HTTP request
  → route            (api/routes)          URL, method, per-route rate limit
  → controller       (controllers)         validate input (Zod), call use case, present response
  → use case         (useCases)            application workflow, orchestration
  → domain           (domain)              normalization, matching decision, metrics — pure
  → repository port  (repositories)        interfaces owned by the application
  → Prisma adapter   (infrastructure)      SQL, trigram search, aggregation
  → PostgreSQL
```

- **Controllers** are 5–15 lines: parse, execute, present. No SQL, no Prisma, no domain rules.
- **Use cases** own the workflow (`AskQuestionUseCase` normalizes → looks up → decides → records).
- **The domain** is pure and dependency-free: `normalizeQuestion`, `resolveFaqMatch` (threshold and
  suggestion rules), `resolveAnalyticsPeriodRange`, `calculateAnswerRate`. All unit tested with no
  database and no framework.
- **Repository ports** (`FaqRepository`, `InteractionRepository`, `AnalyticsRepository`, …) are
  declared next to the application code that consumes them and implemented in `infrastructure/`.
  This is the hexagonal seam: the tests swap in in-memory implementations and exercise the _real_
  HTTP stack, use cases and domain without a database.
- **Composition root** (`composition/`) wires Prisma adapters into use cases into controllers.
  Dependency injection is plain constructor injection — no container library.
- **Presenters** (`controllers/presenters`) convert use-case output into response DTOs, so database
  internals never leak into the API contract.

There is no `BaseController`, no generic repository, no event bus and no CQRS: nothing in the
requirements justifies them.

### Frontend flow

```
Layout.tsx        View — receives ready-to-render props, renders markup, calls callbacks
   ↑
Controller.tsx    thin binding between the ViewModel hook and the View
   ↑
hooks/use*.ts     ViewModel — local UI state, mutations/queries, derived values, error text
   ↑
api/*.ts          typed service: HTTP call + Zod validation + mapper to application model
   ↑
api/client.ts     one HTTP client: base URL, headers, timeout, cancellation, error normalization
```

- `Layout.tsx` files never import the HTTP client, never know an endpoint URL, and never manage
  server state. They receive `messages`, `isSending`, `errorMessage`, `onSubmit`, `onRetry`, …
- `Controller.tsx` files are 5–10 lines: call the hook(s), spread the result into the Layout.
- ViewModel hooks (`useChat`, `useDashboardAnalytics`, `useKnowledgeBase`, `useAnalyticsPeriod`) hold
  UI state, coordinate TanStack Query, and normalize errors into user-facing strings.
- **Component contract**: components with behaviour get `index.ts`, `Controller.tsx`, `Layout.tsx`,
  `styles.ts`, `types.ts` and `hooks/`. Purely presentational primitives (`Button`, `Card`, `Badge`,
  `StateMessage`, chart layouts) deliberately ship without a `Controller.tsx` — there is no
  ViewModel to bind, and adding one would be architecture as decoration.
- **Mapping**: raw API DTOs are validated by Zod and mapped into application models
  (`ChatAnswer`, `DashboardAnalytics`) in `api/mappers/`. Chart-ready values (bucket labels derived
  from granularity, shares, KPI text) are prepared in mappers and ViewModels, never in JSX.

### Why this shape

The expensive parts of this problem are the matching rule and the analytics aggregation. Both are
isolated: the matching decision is a pure function, the aggregation lives behind one port. That is
what makes the interesting behaviour testable in milliseconds and replaceable later (see
[Scalability](#scalability)). Everything else stays deliberately flat.

---

## State Management

| State                                         | Owner                      | Why                                                                                                                                                 |
| --------------------------------------------- | -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Dashboard analytics, FAQ catalog, categories  | **TanStack Query**         | Server-derived, cacheable, needs background refresh, retries and cancellation.                                                                      |
| Ask-question request                          | **TanStack `useMutation`** | It is a server operation with pending/error state and a retry path.                                                                                 |
| Current conversation (messages, input, error) | **local React state**      | It is ephemeral UI state for this session, not a server cache. Query cache semantics (keys, staleness, refetching) would be wrong for a transcript. |
| Selected analytics period                     | **Jotai atom** (persisted) | Shared between the filter component and the data hook, and worth keeping across route changes.                                                      |
| Chat session id                               | **Jotai atom**             | Session metadata read by the chat hook; kept in one place.                                                                                          |
| Theme                                         | **React Context**          | Cross-cutting UI preference, one provider, no server involvement.                                                                                   |

The distinction that matters: **TanStack Query manages the server operation; React manages the
conversation UI.** There is no global store holding the transcript, and nothing that belongs to
TanStack Query is duplicated into Jotai.

### TanStack Query configuration (deliberate, not default)

- `staleTime: 60s`, `gcTime: 5min` — analytics do not change every second.
- `retry`: transient failures only (network/timeout/5xx) with exponential backoff; a 400 or 404 is
  never retried, because retrying a validation error is pointless.
- `refetchOnWindowFocus` and `refetchOnReconnect` enabled — a dashboard left open should catch up.
- `placeholderData: keepPreviousData` on the dashboard query, so switching period shows the previous
  numbers dimmed with a "refreshing…" note instead of `data → blank → spinner → data`.
- Query keys are centralized in `constants/queryKeys.ts`; the period is part of the key, so each
  period is cached independently.
- Requests receive TanStack Query's `AbortSignal`, so superseded requests are actually cancelled.
- No polling and no WebSockets: nothing here requires push updates.

---

## FAQ Matching Strategy

```
raw question
  → normalizeQuestion()                     Unicode NFD, strip diacritics, lowercase,
                                            drop apostrophes, punctuation → space, collapse spaces
  → exact lookup on faqs.normalized_question (unique index)      → similarity 1.0, strategy "exact"
  → else: indexed trigram KNN search, top N+1 candidates
  → domain decides (resolveFaqMatch):
       best ≥ FAQ_SIMILARITY_THRESHOLD  → answered, strategy "similarity"
       otherwise                        → unanswered + fallback answer
       remaining candidates ≥ FAQ_SUGGESTION_THRESHOLD → "did you mean" suggestions
  → interaction persisted either way
```

**The search runs in PostgreSQL, never in Node.** The repository issues one statement:

```sql
SELECT f.id, …, 1 - (f.normalized_question <-> $1) AS similarity_score
FROM faqs f
INNER JOIN categories c ON c.id = f.category_id
WHERE f.active = true
ORDER BY f.normalized_question <-> $1
LIMIT $2
```

`<->` is the `pg_trgm` trigram distance operator, and the index is **GiST**
(`gist_trgm_ops`) rather than GIN precisely because GiST supports the KNN (`ORDER BY … <-> …`)
access path — so the database returns the N nearest questions using the index instead of scanning
and scoring every row. `1 - distance` is exactly `similarity()`, so a single ordered statement
yields both ranking and score. The integration suite asserts the query plan actually uses
`faqs_normalized_question_trgm_idx`.

Two thresholds, both environment variables, no magic numbers in the code:

- `FAQ_SIMILARITY_THRESHOLD` (default **0.30**) — minimum confidence to answer.
- `FAQ_SUGGESTION_THRESHOLD` (default **0.15**) — minimum confidence to _suggest_. Startup
  validation rejects a suggestion threshold above the answer threshold.

**Why 0.30, and what it costs.** The default was calibrated by measuring the seeded knowledge base
rather than guessed. Comparing `similarity`, `word_similarity` and `strict_word_similarity` over a
set of paraphrases and out-of-scope questions, plain `similarity` separated them best: genuine
paraphrases worth answering scored ≥ 0.30 ("how long will my parcel take to arrive" → _How long does
delivery take?_, 0.300; "i forgot the password of my account what do i do" → 0.569; "is two factor
authentication available" → 0.600), while out-of-scope questions peaked at 0.262. The
`word_similarity` variants scored one out-of-scope question at 0.393, above paraphrases we want to
accept, so they would trade precision for nothing.

The honest limitation: trigram matching is lexical. Questions whose wording shares no stem with the
registered question — "can i change the card used for billing" vs _How do I update my credit card?_ —
stay below the threshold, and shared boilerplate ("can i change the …") can outrank the right answer.
Rather than lowering the threshold until false positives appear, those cases land in the
**suggestions** channel: the assistant admits it has no confident answer and offers the nearest
questions as one-click chips, which in practice puts the right FAQ in front of the user anyway.
Closing that gap properly needs semantics (embeddings), which is listed under future work.

---

## Analytics Strategy

Every call to `POST /chat/query` writes one row to `interactions`, answered or not. Nothing is
recomputed from logs and nothing is faked in the frontend.

All five dashboard datasets are aggregated **in PostgreSQL**, in parallel, per request:

- **Overview** — one statement with `COUNT(*) FILTER (WHERE answered)`, `COUNT(DISTINCT session_id)`
  and `AVG(similarity_score) FILTER (WHERE answered)`.
- **Top questions** — `interactions` joined to `faqs`, grouped by FAQ, ordered by volume.
- **Unanswered questions** — grouped by `normalized_question` (so phrasing variants collapse into one
  row) with a representative original phrasing and the last time it was asked.
- **Category distribution** — grouped by the denormalized `category_id` on the interaction.
- **Timeline** — `generate_series` over the period joined against interactions, so **empty buckets
  come back as zeros** instead of holes in the chart. Bucket width follows the period: day for ≤ 31
  days, week for ≤ 120, month beyond that. Buckets are computed in UTC (`AT TIME ZONE 'UTC'`) so
  results do not depend on the server's timezone.

The API returns the whole dashboard in **one** request (`GET /analytics/dashboard?period=30d`) to
avoid five round trips for one screen. Ratios (answer rate, shares) are derived in the domain layer
from the counted values, so the maths is unit tested without a database.

---

## API

Base path: `/api/v1`.

| Method | Path                                            | Purpose                                                                                               |
| ------ | ----------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `GET`  | `/health`                                       | Liveness plus a real database probe. Returns 503 when the database is down.                           |
| `POST` | `/chat/query`                                   | Ask a question. Body: `{ question: string (3–500), sessionId?: string }`. Rate limited.               |
| `GET`  | `/analytics/dashboard?period=7d\|30d\|90d\|all` | Whole dashboard payload: overview, topQuestions, unansweredQuestions, categoryDistribution, timeline. |
| `GET`  | `/faqs?page=&pageSize=&category=&search=`       | Paginated knowledge base (max `pageSize` 100).                                                        |
| `GET`  | `/categories`                                   | Categories with their number of active FAQs.                                                          |

Success envelope: `{ "data": … }`, plus `{ "meta": { "pagination": … } }` on collections.

Chat response (an unanswered question is a **200 with a valid domain result**, not a 404 or 500):

```json
{
  "data": {
    "interactionId": "…",
    "question": "how do i reset the password",
    "answered": true,
    "answer": "Select Forgot password on the sign-in screen…",
    "similarity": 0.72,
    "matchStrategy": "similarity",
    "matchedFaq": {
      "id": "…",
      "question": "How do I reset my password?",
      "category": { "id": "…", "name": "Password", "slug": "password" }
    },
    "suggestions": [{ "faqId": "…", "question": "…", "similarity": 0.41 }],
    "createdAt": "2026-08-12T02:50:51.378Z"
  }
}
```

Error envelope — one shape for every failure, easy for the frontend to branch on:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request body is invalid.",
    "details": [{ "field": "question", "message": "question must have at least 3 characters" }],
    "requestId": "req-b"
  }
}
```

---

## Error Handling

- **Validation** — Zod schemas for body, query params and environment variables. Failures become
  `ValidationError` with a per-field `details` array. Backend validation is authoritative; the
  frontend validates only to improve UX.
- **Typed application errors** — `ValidationError` (400), `NotFoundError` (404), `DomainError` (422),
  `InfrastructureError` (503), each carrying an HTTP status and a stable machine-readable `code`.
- **One central handler** (`middlewares/errorHandler.ts`) maps application errors, stray `ZodError`s,
  Fastify errors, rate-limit rejections and unknown failures into the single error envelope. There
  are no repetitive `try/catch` blocks in controllers, and nothing is silently swallowed.
- **Prisma leaks nowhere** — Prisma errors are translated (`P1xxx` → 503, unique/foreign-key → 400)
  in the infrastructure layer, so the HTTP layer never inspects driver error codes.
- **No internals to clients** — stack traces are logged, never serialized; unexpected failures return
  a generic message plus the `requestId` for correlation.
- **Frontend** — `ApiError` normalizes network/timeout/cancel/validation/server/contract cases and
  exposes `isRetryable`, which drives both the retry policy and the message the user reads. Responses
  that do not match the expected schema fail loudly as a contract error instead of rendering
  `undefined`.

---

## Security

Pragmatic protections appropriate for a challenge without authentication:

- Zod validation on every input, with length caps on questions and session ids.
- `@fastify/helmet` security headers; CORS restricted to an explicit origin allowlist.
- 32 KB body limit; rate limiting on the chat endpoint (`CHAT_RATE_LIMIT_*`, default 30/min/IP).
- SQL injection ruled out structurally: Prisma query builder, and parameterized `Prisma.sql`
  templates for the raw analytics/similarity statements. The only interpolated value anywhere is a
  granularity keyword from a validated enum, cast to `text` as a bound parameter.
- Database constraints as a second line of defence: uniqueness, foreign keys, and CHECKs
  (non-blank questions, similarity within `[0,1]`, "answered implies a matched FAQ").
- Environment variables validated at startup — the process refuses to boot misconfigured.
- No secrets in the repository; `.env.example` files document every variable.
- Structured logs with request id, method, route, status and duration; no user secrets logged.

Authentication is intentionally absent — the challenge does not require it, and fake auth would add
surface without value.

---

## Docker Setup

```bash
git clone <repository>
cd faq-chatbot-dashboard
docker compose up --build
```

- **Frontend** → http://localhost:8080 (nginx serving the built SPA, proxying `/api` to the backend)
- **Backend** → http://localhost:3333/api/v1
- **PostgreSQL** → localhost:5432

No extra commands are needed. The backend container waits for the database healthcheck, then applies
migrations (`RUN_MIGRATIONS_ON_START`) and seeds (`SEED_ON_START`) before serving. The seed is
idempotent: FAQs are upserted, and historical interactions are only generated when the table is
empty, so restarting never overwrites data produced by the evaluator.

Stop and wipe: `docker compose down -v`.

---

## Running Locally

Prerequisites: Node.js 20+, pnpm 9+, and a PostgreSQL 14+ instance with permission to create the
`pg_trgm` extension.

```bash
pnpm install

cp backend/.env.example backend/.env       # point DATABASE_URL at your PostgreSQL
cp frontend/.env.example frontend/.env

pnpm --filter backend prisma:migrate       # creates schema, extension and indexes
pnpm --filter backend prisma:seed          # 9 categories, 40 FAQs, ~950 historical interactions

pnpm dev                                   # backend :3333 and frontend :5173 together
```

The quickest way to get a database without installing PostgreSQL is
`docker compose up -d postgres`, then run the two Prisma commands above.

### Scripts

Root: `dev`, `build`, `lint`, `test`, `typecheck`, `verify` (typecheck + lint + test + build),
`format`, `prisma:migrate`, `prisma:seed`, `docker:up`, `docker:down`.

Backend: `dev`, `build`, `start`, `lint`, `test`, `typecheck`, `prisma:migrate`, `prisma:deploy`,
`prisma:seed`, `prisma:generate`, `prisma:studio`.

Frontend: `dev`, `build`, `preview`, `lint`, `test`, `typecheck`.

---

## Running Tests

```bash
pnpm test                    # everything
pnpm --filter backend test   # domain, use cases, HTTP
pnpm --filter frontend test  # components, pages, mappers, HTTP client
```

**Backend (61 tests)** — question normalization; exact match; similar match; threshold boundary;
unanswered behaviour; suggestion rules; the domain-rule rejection of a question with no searchable content; interaction recording (answered and unanswered); analytics
period resolution and metrics; environment validation; and HTTP-level tests through
`fastify.inject()` covering success payloads, validation errors, the error envelope, rate limiting,
health degradation and unknown routes. The HTTP tests run against in-memory repositories, so the
whole request pipeline is exercised without a database.

**Real PostgreSQL suite (8 of those tests)** — `tests/integration/postgres.integration.test.ts`
verifies what only a database can: that `pg_trgm` is enabled and the GiST trigram index exists, that
a differently worded question resolves to the right FAQ through the index (asserted via `EXPLAIN`),
that unanswered questions persist correctly, that the dashboard aggregation returns correct counts
and gap-filled timeline buckets, and that the CHECK constraints reject an inconsistent interaction.
It is skipped unless a database is provided:

```bash
TEST_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/faq_chatbot_test \
  pnpm --filter backend test
```

**Frontend (32 tests)** — chat welcome state, starter questions loaded from the backend, send-button
guards, sending state, answered rendering, unanswered/fallback rendering, error state with a working
retry, single-request-per-submit guarantee, suggestion chips; dashboard loading skeletons, data
rendering, empty state, error state with retry, keep-previous-data on period change, and the shared
period filter driving the request; plus API mappers, the conversation service and the HTTP client's
error normalization.

## Type Checking

```bash
pnpm typecheck
```

Strict TypeScript everywhere (`strict`, `noUncheckedIndexedAccess`, `noUnusedLocals`,
`noImplicitOverride`, …). No `any`, no `@ts-ignore`, no `@ts-nocheck`.

## Building

```bash
pnpm build                    # backend → backend/dist, frontend → frontend/dist
pnpm --filter backend start   # run the compiled API
```

## Database

Three ordered migrations, each with one reason to exist:

1. `enable_pg_trgm` — `CREATE EXTENSION IF NOT EXISTS pg_trgm`.
2. `init` — `categories`, `faqs`, `interactions`, relations and B-tree indexes.
3. `faq_trigram_index_and_constraints` — the GiST trigram index and the CHECK constraints.

```
categories 1─┬─* faqs 1──* interactions
             └─* interactions            (denormalized category for fast analytics grouping)
```

Indexes are chosen for the queries that exist: unique `normalized_question` (exact match), GiST
trigram (similarity), `interactions(created_at)` and `(answered, created_at)` and
`(category_id, created_at)` (period-filtered aggregation), `normalized_question` (unanswered
grouping). Timestamps are `timestamptz` so bucketing is timezone-independent.

The GiST trigram index is declared in `schema.prisma` (`type: Gist`, `ops: raw("gist_trgm_ops")`),
not only in SQL, so `prisma migrate dev` will not try to drop it later. `prisma migrate diff` against
a migrated database reports no drift.

`pnpm --filter backend prisma:seed` is idempotent, as described in [Docker Setup](#docker-setup).

---

## Performance Decisions

**Backend**

- Similarity search is one indexed KNN statement returning `N+1` rows — never "load all FAQs and
  score in Node".
- An exact match short-circuits before the similarity query: the common case costs one indexed
  lookup.
- Analytics are five aggregate statements executed with `Promise.all`, all filtered by indexed
  `created_at` ranges. No N+1: the answered-question ranking joins `faqs` and `categories` in SQL
  instead of fetching per row.
- Payloads stay focused — explicit `select`s, no `SELECT *`, no unused relations serialized.
- Collections are paginated with a hard `pageSize` ceiling.
- Prisma's connection pool is reused via a single client; the process shuts down gracefully on
  SIGINT/SIGTERM.

**Frontend**

- Route-level code splitting: Recharts (~406 KB raw) ships in its own chunk loaded only on
  `/dashboard`.
- `keepPreviousData` avoids a blank dashboard on period changes; the refreshing state is a subtle
  opacity change rather than a layout swap, so nothing jumps.
- `React.memo` on components that re-render on every keystroke or list update (`MessageBubble`,
  `KpiCard`, chart layouts) and `useCallback`/`useMemo` on the values passed into them — applied
  where there is a measurable re-render to avoid, not everywhere by reflex.
- Message state updates are immutable and targeted, so React re-renders one bubble, not the list.
- One `useEffect` in the entire application (scrolling to the newest message). Everything else is
  derived state, event handlers or query state.
- Requests are cancellable through `AbortSignal`, and the HTTP client enforces a timeout.

---

## Tradeoffs

Deliberately **not** implemented, and why:

- **Authentication / multi-tenancy** — not required; would add surface without demonstrating anything
  the challenge asks for. The dashboard is intentionally open.
- **Semantic / vector search and LLM fallback** — the challenge asks for deterministic matching. This
  is the main functional limitation (see the honesty note in [FAQ Matching](#faq-matching-strategy)).
- **Redis, queues, WebSockets, SSE** — no requirement justifies them; analytics tolerate a 60s
  staleness window, and the chatbot is request/response.
- **FAQ administration (CRUD) UI** — the knowledge base is managed through the seed and the read-only
  API; authoring screens are a separate feature.
- **Docker Compose was not executed in this environment** — Docker is unavailable on the machine used
  to build this project, so the Compose stack is written and reviewed but unverified end to end. It
  was mitigated by validating everything Compose would do against a real PostgreSQL 18 instance:
  migrations, extension, indexes, seed, the compiled `dist` server, the seed entrypoint path, the
  full HTTP surface, and `pnpm install --frozen-lockfile`.
- **Timeline buckets are UTC** — correct and deterministic, but a user in UTC-3 sees days that start
  at 21:00 local. Per-viewer timezone bucketing would need the offset in the request.
- **`similarity_score` stores the best candidate score even when unanswered** — useful for tuning the
  threshold from real data, at the cost of a column that means "confidence of the best miss".
- **Coverage was not chased.** Tests target the matching rule, the analytics aggregation, the request
  pipeline and every UI state; trivial getters and presentational wrappers are untested on purpose.

---

## Scalability

The architecture is built so the following are additions, not rewrites.

**Search** — the matching strategy is one port (`FaqRepository.findMostSimilar`) plus one pure
decision function. Evolution path:

```
pg_trgm trigram (now)
  → + PostgreSQL full-text search for stemming, combined score
  → + pgvector embeddings for semantic matches, trigram as the lexical signal
  → dedicated search service (OpenSearch) if the corpus outgrows PostgreSQL
```

Each step is a new adapter behind the same interface; `AskQuestionUseCase` and the threshold rules do
not change. An LLM fallback for unanswered questions would slot in as a second strategy behind the
same port, with the interaction record already carrying everything needed to evaluate it.

**Analytics** — aggregation lives behind `AnalyticsRepository`:

```
direct aggregation (now, correct to the second)
  → cache the dashboard response (Redis, short TTL) when read volume grows
  → materialized views / rollup tables refreshed periodically for large ranges
  → nightly ETL into a warehouse when history outgrows the operational database
```

Only the adapter changes; the use case and the API contract stay put.

**Write volume** — interactions are append-only, so `interactions` partitioned by month and a
background writer (queue) would absorb bursts without touching the domain.

**Horizontal scaling** — the API is stateless (no sessions, no in-memory state), so it scales
horizontally behind a load balancer today. The only shared state is PostgreSQL; rate limiting would
move to a Redis store to be accurate across replicas.

**Observability** — Pino already emits structured logs with request ids; OpenTelemetry tracing and a
metrics endpoint are additive.

---

## Future Improvements

1. **Semantic search with pgvector** — close the "billing" vs "credit card" gap; keep trigram as the
   lexical signal and combine scores.
2. **Threshold tuning from real data** — the persisted `similarity_score` on every interaction is
   already the dataset needed to pick the threshold by precision/recall instead of by inspection.
3. **Feedback loop** — a thumbs up/down on each answer, giving a real quality metric beyond
   answer rate, and a promotion flow that turns frequent unanswered questions into FAQs.
4. **FAQ administration** — authenticated CRUD for the knowledge base, with the unanswered-questions
   panel as the work queue.
5. **Dashboard depth** — comparison against the previous period, CSV export, drill-down from a
   category into its questions.
6. **Automated pipeline** — CI running `pnpm verify` plus the PostgreSQL integration suite in a
   service container, and Playwright smoke tests over the Compose stack.
