# Demo video script — Neighbors Decide (target 2:50, hard cap 3:00)

Record in a WebMCP-capable agent browser (ChatGPT browser or Chrome with WebMCP
enabled) at the deployed URL. 1280×720+, audio on. Do one dry run of the whole
path first so `Reset demo` leaves you at a clean start.

Narration is written to ~155 wpm. Trim, don't rush.

---

## 0:00 – 0:18 · Hook

**Screen:** the loaded page — teal header, disclosure visible, eight project
cards below.

**Say:**
> In India, the gram sabha and the ward committee decide how local development
> money is spent — that's the 73rd and 74th Amendments, and it's how Kerala's
> People's Plan has run for decades. This is a hypothetical version of one ward's
> cycle — one resident, a ten-lakh-rupee fund, eight works — and an AI assistant
> that can model every option but is not allowed to make the call.

## 0:18 – 0:35 · The tools register

**Screen:** point at the status pill ("Agent tools registered"), then briefly at
the agent panel / devtools tools list showing the seven tool names.

**Say:**
> The page exposes seven WebMCP tools on `document.modelContext`. Five are
> read-only. Two change state. **None of them commits the budget** — there is no
> finalise tool, on purpose.

## 0:35 – 1:00 · Agent lays out directions

**Type to the agent:**
`Call list_strategy_options and walk me through the three directions.`

**Screen:** agent's reply; then click **"Adopt these priorities"** on *Safety &
access first*. Budget revision ticks to 1.

**Say:**
> It calls `list_strategy_options` and gets three valid directions, each scored
> against what I've said I care about. I pick safety and access. That's a human
> action — the budget revision moves.

## 1:00 – 1:20 · Agent proposes

**Type to the agent:**
`Simulate a plan you'd recommend, then propose it.`

**Screen:** the Agent Proposal panel fills in — revision 1, **Status: Valid**,
rationale, six line items, ₹9,90,000 · ₹10,000 remaining, green "satisfies every
rule".

**Say:**
> It simulates against the live revision, then stores a proposal — bound to that
> revision, validated by the same engine the page uses. The panel shows exactly
> why it holds.

## 1:20 – 1:55 · The money shot: a human change stales it

**Screen:** scroll to projects. Click **Fund P-03** (riverside play area) → an inline
message appears: *requires P-04 at full funding*. Click **Lock P-03**. Cut to the
Agent Proposal panel — now an **amber STALE banner**: "revision 1 → 3 … must
re-read and propose again".

**Say:**
> Now the value judgment. I fund the play area and lock it. The engine tells me
> it needs the storm-water drain first — the ground floods every monsoon — and it
> won't fix that for me. The agent's plan? Instantly stale. The budget moved
> underneath it.

**Type to the agent:**
`I locked the play area. Re-read the state and propose a revised plan.`

**Screen:** new proposal — revision 2, Valid, keeps P-03 locked, includes P-04,
trims the tree phase. Scroll to the trade-off block.

**Say:**
> It re-reads, and re-proposes around my lock — keeps the play area and its
> drain, trims the tree drive, drops the road crossings. The comparison spells
> out exactly what changed and what it cost.

## 1:55 – 2:12 · The engine says no

**Type to the agent:**
`Simulate funding both P-01 and P-08.`

**Screen:** agent's result showing `valid: false` with the incompatibility issue;
nothing on the page changes.

**Say:**
> Ask for an impossible plan — the road crossings and the cycle track share the same
> road — and the engine refuses with the same structured reason the UI would
> show. No trial-and-error clicking.

## 2:12 – 2:40 · Human-only review and finalise

**Type to the agent:**
`Request review of your proposal.`

**Screen:** focus jumps to the Human Review region. Point at the text "Only the
resident can accept, modify, reject or finalise." Click **Accept proposal**, tick
the **hypothetical-data acknowledgement**, then **Finalise allocation**.

**Say:**
> The agent can request review — it can't grant it. Focus moves to the
> resident's controls. I accept, I acknowledge this is hypothetical, and I
> finalise. The agent never touches this step.

## 2:40 – 2:55 · The record, and the point

**Screen:** the Final Allocation Record — revisions, validation, `human_finalisation`
attribution, Copy button. Then click **Reset demo → Confirm**.

**Say:**
> A transparent local record — every revision, the validation, and a human
> signature. The agent modelled the options. The resident owned the decision.
> That's the pattern, and WebMCP is what makes it honest.

---

## Shot list checklist

- [ ] Status pill "Agent tools registered" legible
- [ ] Seven tool names visible once
- [ ] "Adopt these priorities" → budget revision 0→1
- [ ] Proposal panel: Status **Valid**, ₹9,90,000
- [ ] Play-area → storm-water-drain dependency message on the card
- [ ] **Amber STALE banner** clearly on screen ≥ 2s  ← the key frame
- [ ] Revised proposal keeps P-03; trade-off block visible
- [ ] `valid: false` incompatibility result, page unchanged
- [ ] Human Review "only the resident can…" line
- [ ] Finalise disabled → enabled after the checkbox
- [ ] Final record with `human_finalisation`
- [ ] Reset returns to ₹10,00,000 / revision 0
