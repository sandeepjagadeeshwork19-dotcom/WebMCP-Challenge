# Neighbors Decide — WebMCP Challenge submission

**Tagline:** A participatory-budgeting workspace where a browser agent models the
options and the resident keeps the decision — with the human-only boundary
enforced by *which WebMCP tools exist*, not by a popup.

> **Hypothetical demonstration.** Every ward project, cost, benefit, locality and
> community-support figure is invented for this demo. It is not connected to,
> endorsed by, or deployed for any government, ward committee, gram sabha or
> participatory-budgeting programme. Finalising records a local demonstration
> choice only — it does not cast a vote in a ward sabha or move real money.

---

## The problem

India already puts local development planning in residents' hands. The **73rd and
74th Constitutional Amendments (1992)** vest it in the **gram sabha** and the
**ward committee** — direct citizen assemblies. **Kerala's People's Plan
Campaign** has devolved a large share of plan funds to local bodies, decided in
these assemblies, since the 1990s — one of the largest participatory-budgeting
efforts anywhere. Cities like **Pune** and **Bengaluru** have run ward-level
participatory budgeting too.

Deciding a ward's works is genuinely hard: a fixed fund, constraints that
interact (one work needs another first; two can't share the same road; the tree
drive comes in phases), and trade-offs that are value judgments, not arithmetic.

An AI assistant could obviously help a resident navigate that. But it's exactly
where "the agent is capable, so let it decide" breaks — the legitimacy of a ward
allocation comes from residents owning it. This project is a working answer to
*how you let an agent assist that decision without letting it make one*, built on
WebMCP. The usual patterns don't get there:

- **A chatbot that writes you a budget** — nothing is validated, nothing is tied
  to what you see, you can't tell what changed.
- **An agent clicking the DOM** — brittle, leaves half-finished states, infers
  meaning from layout.
- **A static calculator** — can't restructure a plan or explain opportunity cost
  against *your* stated priorities.
- **A fully autonomous allocator** — works, but no human accountability.

## What it does

One resident allocates a hypothetical **₹10,00,000** ward development fund across
exactly **eight** local works. A deterministic engine — not the agent — enforces every rule.
The resident sets priorities, funds and **locks** projects, and is the only actor
who can accept or finalise. The agent can read the exact on-page state, simulate
combinations, store a revision-bound proposal beside the resident's choices, and
explain the trade-offs. When the resident changes anything, the agent's proposal
goes **stale** and it must re-read and re-propose.

The demo ends with the resident acknowledging the hypothetical disclosure and
finalising through a visible control, producing a transparent, copyable local
record with full attribution — then a one-click reset.

## How WebMCP is used  *(judging: WebMCP Leverage)*

Seven narrow tools are registered on `document.modelContext` (five read-only, two
state-changing, none that commits a decision), each doing something
the DOM cannot do cleanly:

| Tool | Mode | Why it's a tool, not a click |
| --- | --- | --- |
| `get_budget_state` | read | Returns canonical revisions, amounts, statuses — no scraping formatted text |
| `list_projects` | read | Structured benefits and constraint relationships, layout-independent |
| `list_strategy_options` | read | Three valid budget directions, each scored against the resident's *current* priorities — the agent's opening analytical move |
| `simulate_allocation` | read | Calls the real validator, returns *every* constraint issue at once — no trial clicks |
| `propose_allocation` | write | One atomic op binds a proposal to a budget revision, validates it, preserves agent attribution |
| `explain_tradeoffs` | read | Canonical added/removed/funding/benefit deltas + opportunity costs — not "subtract the displayed numbers" |
| `request_allocation_review` | write | Atomic transition proves the reviewed proposal is the exact validated revision the agent asked for |

**Deliberately not registered:** any tool to set priorities, lock projects, edit
the allocation, accept, reject, finalise, or reset.

Key properties that make this non-trivial:

- **Shared state, not a copy.** The React UI and every tool handler hold the same
  store instance and call the same `validateAllocation`. A tool read and the page
  can never show different revisions or totals.
- **Revision binding.** `budgetRevision` moves only on a human edit and instantly
  stales any active proposal; `proposalRevision` moves only when the agent
  proposes. Stale or fabricated revisions are rejected with structured errors
  (`stale_budget_revision`, `proposal_revision_mismatch`, `stale_proposal`).
- **Invalid proposals stay inspectable.** A rule-breaking proposal is stored
  visibly with `status: "invalid"` and its issue list, rather than vanishing.
- **The authority boundary is structural.** WebMCP has no native
  human-confirmation primitive. Rather than fake one, the app simply never
  registers a finalisation tool — the agent *cannot* commit, and the README says
  so plainly.

## How humans and agents collaborate  *(judging: Execution / UX)*

Every fact the agent returns is the same fact on the page, so a resident can
follow the agent's reasoning in the UI in real time:

1. Agent calls `list_strategy_options`, walks the resident through three valid
   directions and how each scores on what they've said they value; the resident
   adopts one with a visible "Adopt these priorities" control (or sets weights by
   hand) → budget revision advances.
2. Agent reads that revision, simulates, proposes a valid ₹9,90,000 plan — the
   page shows *why* it's valid.
3. Resident funds and locks the riverside play area — their block, where the
   ground floods every monsoon → the page explains the required storm-water
   drain; the proposal turns visibly stale.
4. Agent re-reads, re-proposes preserving the lock; a side-by-side comparison
   shows exactly what was gained, reduced, and given up.
5. Agent requests review — focus moves to a region that states only the resident
   can accept, modify, reject, or finalise.
6. Resident acknowledges the disclosure and finalises. Local record + reset.

When `document.modelContext` is absent, the page shows an honest fallback notice
and **every** manual flow still works — no hidden data, no false "tools
registered" claim.

## Implementation  *(judging: Execution)*

- **Stack:** React 19 + TypeScript + Vite. No backend, no external API, no
  embedded LLM, no auth, no persistence.
- **`src/domain/`** — a pure, framework-free engine: the immutable 8-project
  dataset, the single allocation validator (stable spec issue order), benefit
  scoring and canonical trade-off comparison, an order-independent allocation
  hash, and the local final record. No DOM, no browser globals.
- **`src/state/`** — one revisioned reducer/store. `human/*` vs `agent/*` actions;
  actor labels are derived from the action, never accepted from tool input.
  Finalisation re-checks freshness, allocation hash, review completion, fresh
  validation, and the checked acknowledgement.
- **`src/webmcp/`** — tool contracts + JSON Schemas (all `additionalProperties:
  false`), handlers over the shared store, `registerTool(tool, { signal })`
  registration, and a feature-detecting React hook.
- **`src/components/`** — an accessible workspace: semantic headings, fieldsets,
  tables, full keyboard operation, a polite live region, status conveyed by icon
  + text (never colour alone).
- **Tests:** 62 Vitest / Testing Library tests — validator constraints and
  boundaries, revision/staleness/attribution, the tool contract and absence
  of a finalisation tool, handler behaviour, registration in supported and
  unsupported environments, key UI behaviour, and the full primary journey end to
  end. `pnpm test`, `pnpm lint`, and `pnpm build` all pass from a clean install.

WebMCP registration and handler execution were exercised in a real Chromium
browser (see `docs/CHATGPT_RUNTIME_CHECKLIST.md`): exactly the seven tools register with
the shared abort signal and correct `readOnlyHint`, and handlers return the
documented narrow shapes.

## Why it matters  *(judging: Potential Impact)*

This build is intentionally hypothetical, so the impact claim is about the
**audience and the pattern**, not this app helping residents tomorrow:

- **The audience is real and large.** Gram sabhas and ward committees across
  India already decide local works; Kerala alone runs this at the scale of
  millions of participants. As AI assistants reach these residents, "let the
  agent draft the ward budget" will be the obvious, wrong shortcut — it hollows
  out exactly the local ownership the 73rd/74th Amendments were meant to create.
  This shows the alternative: the agent models every option, the resident owns
  the call, and the software is built so it *can't* be otherwise.
- **The pattern transfers.** Clinical, legal and financial-planning tools face
  the same bind — the agent is capable enough to decide, but shouldn't. "Agent
  models and restructures options; the human owns priorities and commitment" is a
  reusable design, and WebMCP is what makes it honest: the collaboration runs on
  the *same visible, validated state*, and the boundary is enforced by the tool
  surface — not a confirmation dialog the agent could route around.

## What's novel  *(judging: Creativity & Ambition)*

- Enforcing a human-only action by **omitting the tool**, and being explicit that
  WebMCP itself does not secure the boundary.
- **Revision-bound proposals with automatic staleness** — the agent adapts to a
  moving human decision instead of returning one static answer.
- Storing **invalid proposals as first-class, inspectable objects** so a failed
  plan is a learning artifact, not an error toast.

## Compatibility

- `document.modelContext` per the WebMCP spec and Chrome's imperative-API docs
  (verified 2026-08-31; `navigator.modelContext` deprecated in Chrome 150).
- Static SPA — deployable to any static HTTPS host.
- Graceful, fully-functional fallback when WebMCP is unavailable.

## What's next

Public deployment, a recorded walkthrough, an optional print view of the final
record, and adapting the dataset/rules to a real ward participatory-budget cycle
(a Kerala panchayat or a Pune prabhag) behind a clearly labelled pilot.

## Links

- **Repo:** _(GitHub URL — add on push)_
- **Live demo:** _(deployed URL — add on deploy)_
- **Demo video:** _(YouTube URL — add on upload)_
- **Runtime checklist:** `docs/CHATGPT_RUNTIME_CHECKLIST.md`
- **Demo script:** `PRODUCT_SPEC.md` §13 (minute-by-minute)
