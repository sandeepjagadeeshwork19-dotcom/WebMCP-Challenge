# Neighbors Decide — Participatory Budget Workspace

A bounded, **WebMCP-enabled demonstration** in which one resident allocates a
hypothetical **$1,000,000** neighbourhood-improvement fund across exactly eight
hypothetical capital projects. A browser agent can inspect state, simulate
combinations, propose a valid plan, and explain trade-offs. A deterministic
engine — not the agent — enforces every constraint, and **only the resident can
finalise**, through the visible interface.

> **Hypothetical demonstration:** This workspace uses invented projects, costs,
> benefits, constraints, neighbourhoods and community-support indicators. It is
> not connected to, endorsed by or deployed for any government. Finalising
> records a demonstration choice only; it does not cast a vote or allocate real
> funds.

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
    projects.ts     Immutable 8-project dataset, demo-budget-v1, $1,000,000 limit
    validation.ts   The single allocation validator (stable issue order)
    tradeoffs.ts    Benefit scoring + canonical trade-off comparison
    hash.ts         Order-independent allocation hash
    finalRecord.ts  Local-only transparent final record
  state/       One in-memory revisioned store
    reducer.ts      (state, action) -> state; the only creator of actor labels
    actions.ts      human/* vs agent/* actions; actor derived from prefix
    store.tsx       createStore + React bindings (useSyncExternalStore)
    selectors.ts    Derived views shared by UI and read tools
  webmcp/      WebMCP adapter
    contracts.ts    The seven tool definitions + JSON Schemas
    handlers.ts     Handlers that read/write the *same* store as the UI
    register.ts     document.modelContext.registerTool(tool, { signal })
    useWebMcp.ts    Feature-detect + register for the app lifetime
  components/  Accessible React UI
```

**Key design guarantees**

- The manual UI and every WebMCP handler call the same `validateAllocation`
  and dispatch into the same store instance — displayed values and tool output
  cannot diverge.
- `human/*` actions alone change priorities, locks, manual allocations,
  acceptance and finalisation. A human budget change increments `budgetRevision`
  once and makes any active proposal `stale`.
- `agent/proposeAllocation` increments `proposalRevision` only, never
  `budgetRevision`. A rule-invalid candidate is stored visibly with
  `status: "invalid"` so the failure stays inspectable.
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
  human-confirmation primitive; the human-only finalisation boundary is enforced
  purely by this application registering no finalisation tool.
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
