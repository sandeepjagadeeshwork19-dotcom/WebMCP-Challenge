# Neighbors Decide — Ward Participatory-Budgeting Workspace

**Live demo:** https://sandeepjagadeeshwork19-dotcom.github.io/WebMCP-Challenge/
&nbsp;·&nbsp; **Video:** https://youtu.be/99Zj8M8DXXY
&nbsp;·&nbsp; open it in ChatGPT's browser or Chrome with WebMCP enabled to drive
it with an agent; it also works fully as a manual workspace.

A bounded, **WebMCP-enabled demonstration** in which one resident allocates a
hypothetical **₹10,00,000** ward development fund across exactly eight hypothetical
local works. A browser agent can inspect state, model directions, propose a valid
draft, and explain trade-offs. A deterministic engine — not the agent — enforces
every constraint. Adoption is reserved for the visible resident interface
(`human/finalise` internally); there is no WebMCP tool for it. This is a WebMCP
authority boundary, not a restriction on general-purpose browser automation.

The framing is motivated by participatory budgeting in India — the gram sabha and
ward committee, Kerala's People's Plan Campaign, Pune's ward budgets — but the
workspace is not affiliated with any of them.

> **Hypothetical demonstration:** This workspace uses invented ward projects,
> costs, benefits, constraints, localities and community-support indicators. It
> is not connected to, endorsed by or affiliated with any government body, ward
> committee, gram sabha or participatory-budgeting programme. Adopting records a
> demonstration choice only; it does not cast a vote in a ward sabha or allocate
> real funds.

## Setup

```bash
npm install
npm run dev        # http://localhost:5173
```

Requires Node 20+. (`pnpm` works too.)

## Commands

```bash
npm test          # Vitest unit / component / integration suite
npm run lint      # ESLint
npm run build     # tsc -b && vite build  ->  dist/
npm run preview   # serve the production build
```

## Architecture

```
src/
  domain/      Pure, framework-free engine (no DOM, no globals)
    projects.ts     Immutable 8-work dataset, demo-budget-v1, ₹10,00,000 limit
    validation.ts   The single allocation validator (stable issue order)
    tradeoffs.ts    Benefit scoring + canonical trade-off comparison
    strategies.ts   Three canonical "directions" + describeStrategy view-model
    money.ts        Indian (lakh/crore) currency rendering
    finalRecord.ts  Local-only transparent adopted record
  state/       One in-memory revisioned store
    reducer.ts      (state, action) -> state; the only creator of actor labels
    actions.ts      human/* · agent/* · app/* actions; actor derived from prefix
    selectors.ts    Derived views + selectStage / selectTurn (the flow model)
    store.tsx       createStore + React bindings (useSyncExternalStore)
  webmcp/      WebMCP adapter
    contracts.ts    The seven tool definitions + JSON Schemas
    handlers.ts     Handlers that read/write the *same* store as the UI
    trace.ts        Per-store visible trace; observes calls without changing budget state
    register.ts     document.modelContext.registerTool(tool, { signal })
  components/  Accessible React UI — a "ward gazette":
    Masthead · CommandBar (fund · status · whose-move indicator)
    NextActionDock (the single honest next step) · LeftRail (you control this)
    AssistantMargin + live WebMCP call trace + the withheld-tools list
    CompareDirections · ResolutionSheet · TheTurn · ReviewMode · AdoptedRecord
    ScheduleOfWorks (the 8 works; protect any)
```

**Key design guarantees**

- The manual UI and every WebMCP handler call the same `validateAllocation`
  and dispatch into the same store instance — displayed values and tool output
  cannot diverge.
- `human/*` actions alone change priorities, protections, manual allocations,
  acceptance and adoption. A human budget change increments `budgetRevision`
  once and makes any active proposal `stale`.
- `agent/proposeAllocation` (and `app/loadDirectionDraft`, which loads a clearly
  labelled application example or provides the WebMCP-absent fallback) increments
  `proposalRevision` only, never `budgetRevision`. A rule-invalid candidate is
  stored visibly with `status: "invalid"` so the failure stays inspectable.
- Finalisation is a visible human action that re-checks freshness, allocation
  hash, review completion, fresh validation, and the checked hypothetical-data
  acknowledgement. **There is no WebMCP finalisation tool.**

## WebMCP tools

Registered on `document.modelContext`
(<https://webmachinelearning.github.io/webmcp/>). Seven tools — **five read-only,
two state-changing, none that commits a decision**:

| Tool | Mode | Purpose |
| --- | --- | --- |
| `get_budget_state` | read-only | Canonical snapshot: priorities, locks, allocation + its validity, proposal summary, revisions, `structuralLimits` |
| `list_projects` | read-only | The eight works with costs, benefit ratings, the numeric `scoringModel`, funding rules, dependencies |
| `list_strategy_options` | read-only | Three valid budget directions, scored against the resident's current priorities |
| `simulate_allocation` | read-only | Validate a candidate against the current revision; each issue carries a machine-readable `fix` |
| `propose_allocation` | state-changing | Store an agent-attributed proposal after deterministic validation |
| `explain_tradeoffs` | read-only | Canonical added/removed/funding/benefit deltas + opportunity costs |
| `request_allocation_review` | state-changing | Open the visible resident review; does **not** accept or finalise |

There is intentionally **no tool** — not a disabled one, an absent one — for
`set_priorities`, `protect_work`, `accept_proposal`, `reject_proposal`,
`adopt_resolution`, or `reset`. Those are the resident's, through visible page
controls. The withheld list is shown in the app's assistant margin so the
omission reads as a design choice, and `get_budget_state.structuralLimits`
reports it to the agent.

## Where this pattern generalizes

The scenario is a vehicle. The pattern — *an agent does the preparatory work; the
act of deciding stays human and attributable; both read the same validated
state; the boundary is a tool that was never registered* — fits clinical
informed consent, legal filing, lending decisions, hiring, and content
moderation. In each, "enforced by omission" beats a confirmation dialog: no
rubber-stamping, no injection target, and a decision record with a human author
by construction. See [`docs/SUBMISSION.md`](docs/SUBMISSION.md).

## WebMCP compatibility notes

Verified against the WebMCP spec IDL and Chrome's imperative-API docs
(<https://developer.chrome.com/docs/ai/webmcp/imperative-api>) on 2026-08-31.

- Registers against whichever the runtime provides — `navigator.modelContext`
  (Chrome's early-preview build) or `document.modelContext` (the editor's draft
  and ChatGPT's in-app browser). `getModelContext()` prefers `navigator`.
- Each tool is registered with `await modelContext.registerTool(tool, { signal })`
  using a shared `AbortController`; aborting the signal unregisters every tool.
- A tool definition carries `name`, optional `title`, `description`, optional
  JSON Schema `inputSchema`, `async execute(input, { signal })`, and WebMCP
  `annotations` — `readOnlyHint`, plus `untrustedContentHint` on the tools whose
  results echo resident- or agent-authored text.
- Tool callbacks return the MCP result shape:
  `{ content: [{ type: "text", text }], structuredContent }`, with
  `isError: true` for structured errors (`{ error: { code, message } }`). Rule
  violations come back as `valid: false` / `status: "invalid"` inside
  `structuredContent`, not as errors — an invalid proposal is still stored and
  inspectable.
- WebMCP's `requestUserInteraction()` hands one moment back to the human. This
  project goes further: the decision-recording function is never registered, so
  there is no code path — confirmed or not — by which the agent commits.
- **Scope of the boundary.** This governs the *structured tool surface* an
  MCP-style agent negotiates with the page. It is not a privilege boundary: a
  computer-use agent driving the raw DOM could still click the resident's
  buttons. Sandboxing the agent from the page is a separate, unsolved,
  spec-level concern. What omission buys is that a *cooperative* agent has no
  function to call, and the decision record has a human author by construction.
- When no model context is present the page shows *"No assistant in this
  browser — you can still do everything by hand"* and every manual flow remains
  fully functional.

## Deployment

Static SPA — any static HTTPS host works. Assets use relative URLs
(`base: "./"`), so the build runs unchanged at a bare domain or a project
subpath.

`main` deploys to GitHub Pages via
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) (build with
`pnpm build`, publish `dist/`). To deploy anywhere else:

```bash
npm run build
# then serve ./dist  (e.g. `netlify deploy --prod --dir=dist`)
```

No backend, API keys, external data calls, authentication or persistence. The
final allocation record lives only in the browser tab and is copyable as JSON.
`Reset demo` restores the exact initial scenario and increments the reset
version.

## Verifying in an agent browser

See [`docs/CHATGPT_RUNTIME_CHECKLIST.md`](docs/CHATGPT_RUNTIME_CHECKLIST.md).
