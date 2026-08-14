# AI Usage

**Tool used:** Claude (Anthropic) via Claude Code, as a pair-programming assistant throughout the
project — scaffolding, drafting layers, writing tests and reviewing my own decisions.

## Where AI clearly accelerated the work

The repetitive, well-specified parts. The `Layout / Controller / styles / types / hooks` structure
repeats across every component, and the seed dataset needed 40 realistic FAQs across 9 categories
with plausible answers. Both are work where the shape is already decided and typing it out is the
only cost. Generating those from a precise description, then reviewing them, saved a few hours that
went into the parts that actually needed judgement: the matching strategy and the SQL aggregation.

## Where AI was wrong and I corrected it

Two corrections worth naming.

**The similarity threshold.** The first implementation used `0.35`, a plausible-looking default that
neither the assistant nor I had any evidence for. Running real paraphrases against the seeded
knowledge base showed it silently rejected good matches — _"how long will my parcel take to arrive"_
scored 0.300 against _"How long does delivery take?"_ and fell through to the fallback answer. I
measured `similarity`, `word_similarity` and `strict_word_similarity` across a set of paraphrases and
out-of-scope questions, found that plain `similarity` separated them best (out-of-scope peaked at
0.262), and set the default to `0.30` with the measurement written down in the README. The lesson is
in the README too, including the cases trigram matching still cannot solve.

**The index type.** The first schema used a GIN trigram index, which is the answer you get by
default for `pg_trgm`. GIN cannot serve `ORDER BY column <-> $1`, so the KNN query I wanted would not
have used it. I switched to GiST (`gist_trgm_ops`), and added an integration test that runs `EXPLAIN`
and asserts the plan actually hits `faqs_normalized_question_trgm_idx` — because "there is an index"
and "the query uses the index" are different claims.

A third, smaller one: an error-state condition read `errorMessage !== null && isInitialLoading`,
which never fires in TanStack Query v5 (a failed query is no longer pending). The dashboard would
have shown "showing the last data we loaded" with no data behind it. A test caught it; the fix was to
branch on whether data exists rather than on a loading flag.

## A prompt style I am happy with

Asking for a measurement instead of an opinion. Rather than _"is 0.35 a good threshold?"_ — which
invites a confident guess — I asked for a script that scored a list of paraphrases and out-of-scope
questions against the real seeded database with five candidate metrics, printed as a table, and then
made the call from the numbers. The same style applied to the index question: don't argue about GIN
vs GiST, run `EXPLAIN` and read the plan. AI is fast at building the instrument; the instrument is
what settles the question.

## Review and validation

Every AI-assisted line was reviewed and I own all of it. Concretely: the project typechecks under
strict TypeScript with no `any` or suppressions, passes ESLint with type-checked rules, and passes 93
tests — including 8 that run against a real PostgreSQL instance covering the extension, the index
plan, trigram matching, unanswered handling, dashboard aggregation and timeline gap-filling. Beyond
the automated checks I ran the compiled server against a live database and exercised the API by hand
(exact matches, paraphrases, out-of-scope questions, validation errors, rate limiting, security
headers) to confirm the behaviour matches what the code claims. The one thing I could not verify is
the Docker Compose stack — no Docker on this machine — and the README says so rather than implying it
was tested.
