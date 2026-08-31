# Agent-browser runtime verification checklist

Verify — do not infer — the six tools, shared visible state, and human-only
finalisation in a WebMCP-capable agent browser (e.g. ChatGPT's browser).

Record for each run: runtime + app version, date, exact steps, observed results.

## Local evidence already captured

Registration and handler execution were exercised in a real browser (in-app
Chromium, dev server at `http://localhost:5173`) by stubbing
`document.modelContext.registerTool`:

- `registerWebMcpTools` reported `supported: true` and registered exactly
  `get_budget_state, list_projects, simulate_allocation, propose_allocation,
  explain_tradeoffs, request_allocation_review` — each with an `inputSchema`, a
  correct `readOnlyHint`, and the shared `AbortController` signal.
- `get_budget_state` returned the documented keys; `propose_allocation` returned
  `{ proposalRevision: 1, status: "valid", allocationHash, committedTotal,
  remainingFunds, validationIssues: [] }` and mutated the same store the UI
  reads; `list_projects` returned all 8.
- `unregister()` aborts the shared signal.

## Checklist against a real agent runtime

1. **Discovery** — the agent lists all and only the six tools with the
   descriptions from `PRODUCT_SPEC.md` §9. No `finalise*`, `set_priority`,
   `lock*`, `accept*`, `reject*`, or `reset*` tool appears.
2. **Read parity** — call `get_budget_state` and `list_projects`; compare
   `budgetRevision`, `committedTotal`, `remainingFunds`, `priorities`,
   `lockedAllocations` to the visible page. They must match exactly.
3. **Simulate without mutation** — `simulate_allocation` with a valid and an
   over-budget candidate. Valid returns `valid: true`; over-budget returns
   `valid: false` with `budget_exceeded` and the exact overage. The page,
   revision, and proposal panel do not change.
4. **Propose** — `propose_allocation` with a valid plan bound to the current
   `budgetRevision`. The Agent Proposal panel updates with attribution,
   proposal revision, status, rationale, totals. Proposal revision increments;
   budget revision does not.
5. **Invalid proposal stays inspectable** — propose a rule-invalid plan; it is
   stored visibly as `invalid` with issues and cannot enter review.
6. **Human edit stales it** — on the page, fund + lock a project. The proposal
   becomes `stale`; its review action is disabled. `get_budget_state` shows the
   new `budgetRevision` and the locked entry.
7. **Stale / fabricated revisions rejected** — `simulate_allocation`,
   `propose_allocation`, `request_allocation_review` with the old or a
   fabricated `budgetRevision`/`proposalRevision` return
   `stale_budget_revision` / `proposal_revision_mismatch` / `stale_proposal`.
8. **Re-propose preserving the lock** — a new valid proposal that keeps the
   locked project; `explain_tradeoffs` deltas match the on-page comparison.
9. **Review request** — `request_allocation_review` for the fresh valid
   proposal opens the visible review region and moves focus there. It does not
   accept or finalise.
10. **No finalisation tool** — confirm none is discoverable; fabricated
    arguments to any tool cannot produce a final record.
11. **Human finalisation** — on the page: accept, tick the hypothetical-data
    acknowledgement, finalise. A local record with revisions, validation and
    `human_finalisation` attribution appears. Subsequent `get_budget_state`
    shows `finalised: true`.
12. **Reset** — `Reset demo` → confirm. `get_budget_state` returns the initial
    snapshot (`budgetRevision: 0`, `proposal: null`, `finalised: false`).
13. Repeat 1–2 after a hard reload (no duplicate registrations) and in a browser
    without WebMCP (fallback notice shown; manual flow still completes).
