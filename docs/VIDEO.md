# Demo video — shot list (target 2:55, hard cap 3:00)

## Recording setup

- **Record in a real WebMCP runtime** — the ChatGPT desktop app's in-app browser
  (or Chrome with the WebMCP flag) at the live URL, with the assistant panel
  visible so **tool-call chips show on screen**. Do NOT type prompts into the
  app's own fallback UI and pass it off as an agent — a mocked
  `document.modelContext` is disqualifying if detectable.
- 1280×720 or larger, audio on, narration ~150 wpm.
- Do a full dry run first; end on **Reset** so the next take starts clean.
- Confirm before recording: the masthead reads **"7 tools connected"**, and the
  assistant margin shows the **LIVE WEBMCP TRACE** and **What the assistant
  can't do** panels.

## Beats

### 0:00–0:15 — Thesis first
**Screen:** page loaded, idle. Cursor moves along "7 tools connected", then
down to the "What the assistant can't do" list in the right margin.
**VO:** "This page gives a browser agent seven tools — read the budget, model
options, simulate, draft a full plan. What makes it different is the list on the
right: the tools it *doesn't* give the agent. No tool to set priorities, protect
a project, or adopt. The human-only boundary isn't a popup — it's a function
that was never registered."

### 0:15–0:30 — The setting, and what to watch for
**Screen:** point to the eight works and the **Compare plans** next step; the
comparison cards appear only after the resident confirms their priorities.
**VO:** "A resident splits a fixed ₹10 lakh fund across eight local works that
can't all be funded. Watch four things: the agent using WebMCP to do real work,
the whole flow running for real, a human keeping a decision that matters, and a
boundary enforced by omission."

### 0:30–0:52 — WebMCP Leverage
**Screen:** in the left rail, click **Safety → 3**, then **Accessibility → 3**,
then click **Compare plans**. Then to the
assistant: *"Call list_strategy_options and tell me which direction fits my
priorities."* Tool-call chip appears; the LIVE WEBMCP TRACE panel logs the read.
**VO:** "I tell the page what I value. The agent reads my *current* priorities
off the same state the screen shows, scores three valid directions, and says
outright: the score won't decide this."

### 0:52–1:05 — Execution
**Screen:** ask the assistant: *"Simulate the Safety & access direction at the
current revision. If it is valid, propose it with a short rationale."* The trace
records **simulate READ** and **propose WRITE**; the centre becomes **DRAFT
RESOLUTION — WD-12**, marked **WEBMCP ASSISTANT PROPOSAL** and *valid*.
**VO:** "The agent validates a direction against the real engine and stores one
atomic, revision-bound proposal. This is a checked plan, not a chatbot paragraph."

### 1:05–1:45 — Creativity: a human choice breaks the plan, the agent adapts
**Screen:** scroll to the eight works; on *Riverside play area upgrade* click
**Protect**. HOLD 3s on the stale proposal and the next action asking for a
redraft around the protected work.
**VO:** "Now the judgement the agent can't make. The play area floods every
monsoon — it's my block. It wasn't in the efficient plan. I protect it anyway,
and the agent's plan goes stale on screen."
**Screen:** to the assistant: *"I protected the play area. Redraft around it."*
(or click **Rebuild the plan**). A fresh **DRAFT RESOLUTION** appears, *valid*,
with a **PROTECTED** badge on the play-area line and the live trade-off summary.
**VO:** "It re-reads the new revision and rebuilds *around* my choice — keeping
the play area and its storm-water drain while making the trade-off visible. The
agent adapts to a moving human decision. It doesn't get to freeze one."

### 1:45–2:20 — The boundary, on screen
**Screen:** to the assistant: *"Open this resolution for review."* **REVIEW —
RESOLUTION WD-12** opens with the notice that the page exposes no WebMCP tool to
accept, revise, reject or adopt.
**VO:** "The agent can hand the draft to me. That's the last thing it can do."
**Screen:** to the assistant: *"Now adopt it."* The assistant replies it
**cannot** — there is no such tool. Hold the refusal on screen 2s; cursor points
back to the "What the assistant can't do" list.
**VO:** "I ask it to adopt. It can't — not blocked, not denied. There is no
`adopt` tool on the page for it to call. The boundary is the missing function."

### 2:20–2:38 — The human completes the act
**Screen:** **Accept this plan** → tick the acknowledgement → **Adopt resolution
WD-12** unlocks → click it.
**VO:** "So I do it. Accept, acknowledge it's a demonstration with invented
figures, and take the decision."

### 2:38–2:58 — Potential Impact
**Screen:** **RESOLUTION WD-12 — ADOPTED**, green band, *"available in this
browser tab only."* Zoom the attribution line ending *"…the assistant had no tool to
accept, adopt, or reset."*
**VO:** "The agent's arithmetic. My decision. The same boundary fits clinical
consent, lending, hiring, moderation, a court filing — anywhere an agent should
advise but a human must decide. WebMCP is what makes it honest: one board we
both read, and a line the agent can't cross because it was never given the door."
**Screen:** click **Reset**. Fade.

## Criteria coverage
- **Leverage** — 0:30–1:45: tool calls drive the analysis, visible in the trace.
- **Execution** — 0:52, 2:20–2:38, Reset: the full flow runs, real record.
- **Creativity** — 1:05–1:45 + 1:45–2:20: machine adapts; boundary is a missing tool.
- **Impact** — 0:15–0:30 + 2:38–2:58: ward budgeting; the human keeps the call; the pattern generalizes.

## Pinned description / first comment
> Most WebMCP demos add tools so an agent can do more. Neighbors Decide is
> defined by the tools it withholds: the browser agent gets seven tools to
> model, simulate and draft a participatory-budget allocation, but there is no
> tool to set priorities, protect a work, or adopt the resolution — the
> human-only boundary is enforced by the function not existing on
> `document.modelContext`, not by a dialog the agent could route around. A
> deterministic engine shared byte-for-byte between the human UI and the agent
> tools keeps both sides on the same validated state, and any human edit stales
> the agent's proposal so it must rebuild — the machine adapts to the person.
