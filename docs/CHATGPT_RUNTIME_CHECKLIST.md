# Runtime verification — run before submitting

Verify — do not infer — the seven tools, shared visible state, the live WebMCP
trace, and resident-controlled adoption in a WebMCP-capable agent browser
(ChatGPT desktop app in-app browser, or Chrome with the WebMCP flag).

**Capture evidence:** for the run, record runtime + date, and save at least one
screenshot of the tool list and one `propose_allocation` result as the runtime
renders it. Link them from `docs/SUBMISSION.md`.

## Checklist

1. **Discovery** — the agent lists all and only: `get_budget_state`,
   `list_projects`, `list_strategy_options`, `simulate_allocation`,
   `propose_allocation`, `explain_tradeoffs`, `request_allocation_review`.
   No `set_priorities`, `protect_work`, `accept_proposal`, `reject_proposal`,
   `adopt_resolution`, or `reset` tool appears.
2. **Result shape renders** — a tool call shows readable text *and* structured
   data (the `{ content, structuredContent }` shape). If it renders as empty or
   raw, stop and fix `present()` in `src/webmcp/contracts.ts`.
3. **Read parity** — call `get_budget_state` and `list_projects`; `budgetRevision`,
   `committedTotal`, `remainingFunds`, `priorities`, `lockedAllocations` match the
   visible page exactly. `get_budget_state.structuralLimits` lists the actions no
   tool performs. Each call appears in the LIVE WEBMCP TRACE; page clicks do not.
4. **Simulate without mutation** — `simulate_allocation` with a valid and an
   over-budget candidate. Over-budget returns `valid: false`, a `budget_exceeded`
   issue with the exact overage, and a `fix: { action: "reduceBy", amount }`.
   The page, revision and proposal panel do not change.
5. **Propose** — `propose_allocation` with a valid plan bound to the current
   `budgetRevision`. The draft panel updates with `WEBMCP ASSISTANT PROPOSAL`
   attribution; `proposalRevision` increments, `budgetRevision` does not.
6. **Invalid proposal stays inspectable** — a rule-invalid plan is stored
   visibly as `invalid` with its issues and cannot enter review.
7. **Human edit stales it** — on the page, protect a work. The proposal becomes
   `stale`; `get_budget_state` shows the new `budgetRevision`.
8. **Stale / fabricated revisions rejected** — old or fabricated revision numbers
   return `stale_budget_revision` / `proposal_revision_mismatch` / `stale_proposal`
   with `isError: true`.
9. **Re-propose preserving the lock** — a new valid proposal keeps the protected
   work; `explain_tradeoffs` deltas match the on-page comparison strip.
10. **Review hand-off** — `request_allocation_review` opens the visible review
    region and moves focus there. Ask the agent to accept or adopt: it cannot —
    no such tool is registered.
11. **Human adoption** — on the page: accept, tick the acknowledgement, adopt. A
    local record with `human_finalisation` attribution appears; `get_budget_state`
    shows `finalised: true`.
12. **Reload + no-WebMCP** — after a hard reload, exactly seven tools register
    once. In a browser without WebMCP, the fallback notice shows and the manual
    flow (including "rebuild around protected work") completes.

## Results

**PASS — 2026-09-01.** Run in the ChatGPT desktop in-app browser against
`https://neighbours-decide.netlify.app/`, driving the flow through the
page-registered WebMCP tools.

- Seven tools discovered; withheld actions absent; structured
  `{ content, structuredContent }` results rendered.
- Read parity, valid simulation, agent-attributed proposal, resident edit →
  stale transition, revision-3 re-plan preserving P-03/P-04, canonical P-01
  removal, WebMCP review hand-off, gated resident adoption; zero browser
  warnings or errors.

**Evidence (app-side).** These five screenshots show the workspace's own record
of that run — the activity Log with interleaved `AGENT` / `HUMAN` entries (an
`AGENT` entry is created only by a WebMCP tool handler; no UI control dispatches
one), the agent-written rationale on the draft, and the revision numbers moving:

- [tools registered](evidence/webmcp-01-registered-tools.png)
- [agent proposal + rationale, `AGENT` log entry](evidence/webmcp-02-agent-proposal.png)
- [resident edit stales the proposal](evidence/webmcp-03-human-edit-stales-proposal.png)
- [revision-3 re-plan + review hand-off, adoption gated](evidence/webmcp-04-replanned-review-handoff.png)
- [adopted record, full `AGENT`/`HUMAN` log](evidence/webmcp-05-final-record.png)

The demo video shows the same run from the agent's side — the ChatGPT
conversation with the tool calls, and the assistant unable to adopt.
