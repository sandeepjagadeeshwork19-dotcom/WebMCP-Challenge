# Neighbors Decide — Ward Participatory-Budgeting Workspace

**Live demo:** https://neighbours-decide.netlify.app
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
pnpm install
pnpm dev        # http://localhost:5173
```

Requires Node 20+ and pnpm 9+.

## Commands

```bash
pnpm test       # Vitest unit / component / integration suite
pnpm lint       # ESLint
pnpm build      # tsc -b && vite build  ->  dist/
pnpm preview    # serve the production build
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
    Masthead · CommandBar (fund · revisions · whose-move indicator)
    StateLine (Priorities → Compare → Draft → Review → Adopt)
    LeftRail (you control this) · AssistantMargin + live WebMCP call trace
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
| `get_budget_state` | read-only | Canonical snapshot: priorities, locks, allocation, proposal summary, revisions |
| `list_projects` | read-only | The eight projects with costs, benefits, funding rules, dependencies |
| `list_strategy_options` | read-only | Three valid budget directions, scored against the resident's current priorities |
| `simulate_allocation` | read-only | Validate a candidate against the current revision without mutation |
| `propose_allocation` | state-changing | Store an agent-attributed proposal after deterministic validation |
| `explain_tradeoffs` | read-only | Canonical added/removed/funding/benefit deltas + opportunity costs |
| `request_allocation_review` | state-changing | Open the visible resident review; does **not** accept or finalise |

There is intentionally **no tool** for setting priorities, locking, manual
editing, accepting, rejecting, finalising, or resetting. `PRODUCT_SPEC.md`
specified six tools; the read-only `list_strategy_options` was added in Phase 3 —
see [`docs/SPEC_AMENDMENTS.md`](docs/SPEC_AMENDMENTS.md).

## WebMCP compatibility notes

Verified against the WebMCP spec IDL and Chrome's imperative-API docs
(<https://developer.chrome.com/docs/ai/webmcp/imperative-api>) on 2026-08-31.

- Uses `document.modelContext` (`navigator.modelContext` is deprecated as of
  Chrome 150).
- Each tool is registered with `await document.modelContext.registerTool(tool, { signal })`
  (which resolves to `undefined`) using a shared `AbortController`; aborting the
  signal unregisters every tool.
- A tool definition carries `name`, optional `title`, `description`, optional
  JSON Schema `inputSchema`, `async execute(input, { signal })`, and optional
  `annotations` (`readOnlyHint`).
- Tool callbacks return plain JSON-serializable values (the spec serializes the
  result via `JSON.stringify`; no MCP-style `content` wrapper). Rule violations
  are returned as `valid: false` / `status: "invalid"`; transport problems are
  returned as `{ error: { code, message } }`.
- No nonstandard confirmation API (`requestUserInput` / `requestUserInteraction`)
  is used or assumed. WebMCP does not provide a native, non-bypassable
  human-confirmation primitive. This application exposes no WebMCP finalisation
  tool; general browser automation remains outside that tool boundary.
- When `document.modelContext` is absent the page shows
  *"Agent tools are unavailable in this browser; the full manual workspace still
  works"* and every manual flow remains fully functional.

## Deployment

Static SPA — any static HTTPS host works.

```bash
pnpm build
# deploy ./dist  (e.g. Netlify: `netlify deploy --prod --dir=dist`)
```

No backend, API keys, external data calls, authentication or persistence. The
final allocation record lives only in the browser tab and is copyable as JSON.
`Reset demo` restores the exact initial scenario and increments the reset
version.

## Verifying in an agent browser

See [`docs/CHATGPT_RUNTIME_CHECKLIST.md`](docs/CHATGPT_RUNTIME_CHECKLIST.md).
