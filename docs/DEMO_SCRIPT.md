# Demo video script — Neighbors Decide (target 2:50, hard cap 3:00)

Record in a WebMCP-capable agent browser (ChatGPT browser, or Chrome with WebMCP
enabled) at the deployed URL, 1280×720+, audio on. Do a full dry run first so
`Reset` leaves a clean start. Narration is ~155 wpm — trim, don't rush.

The look: a black-and-vermilion **ward gazette** — "NEIGHBORS DECIDE", the
resident-journey rail, and a right-hand **assistant's margin**.

---

## 0:00 – 0:18 · Hook

**Screen:** the loaded page — masthead, fund status, the disclosure line, the
"7 tools connected" indicator, resident priorities and the eight works.

**Say:**
> In India, a ward's development money is meant to be decided *in the ward* —
> by residents, not an officer. Here it's a hypothetical ₹10 lakh and eight
> works that can't all be funded. An assistant can model every option and pencil
> a full draft — but it is not allowed to make the call.

## 0:18 – 0:33 · The tools, and what's missing

**Screen:** point to "7 tools connected — read state, list works,
compare, simulate, propose, explain, request review," then the empty **LIVE
WEBMCP TRACE** in the right margin.

**Say:**
> Seven WebMCP tools on the page. Five read-only, two that change state — and
> **none that adopts the budget**. The trace proves which actions actually use
> WebMCP; ordinary page clicks never appear there.

## 0:33 – 0:55 · Priorities, then three modelled directions

**Screen:** in the left rail, click **Safety 3** and **Accessibility 3**, then
click **Compare plans**. The budget revision ticks, the three cards appear and
score against those priorities.

**Type to the assistant:** `Call list_strategy_options and walk me through the three directions.`

**Say:**
> I tell the page what I value. The assistant scores three valid directions
> against that — and the trace records the read at this exact budget revision.

**Type to the assistant:** `Simulate the Safety & access direction at the current revision. If it is valid, propose it with a short rationale.`

**Screen:** the trace adds **simulate READ** and **propose WRITE**. A **DRAFT
RESOLUTION — WD-12** appears, marked **WEBMCP ASSISTANT PROPOSAL** and *valid*.

## 0:55 – 1:35 · The turn — a human choice stales the plan

**Screen:** scroll to **The eight works**. On *Riverside play area
upgrade*, click **Protect**.

**Say:**
> Now the judgement the assistant can't make. The riverside play area is on my
> block, and it floods every monsoon. It isn't in the "efficient" plan — I
> protect it anyway.

**Screen:** the status changes to **needs redraft** and the resident-facing text
explains that the draft must be rebuilt around the protected play area.

**Say:**
> The WebMCP proposal is now stale. It must be rebuilt around my protected work
> and re-checked against every funding rule. That's a modelling job; choosing the
> protected work was mine.

**Type to the assistant:** `I protected the play area. Redraft around it.`

**Screen:** a fresh **DRAFT RESOLUTION** appears — *valid*, proposal rev 2, the
play area line carrying a **PROTECTED** badge. Point to the live trade-off
summary and describe the actual added and removed works shown in this run.

## 1:35 – 1:52 · The engine says no

**Type to the assistant:** `Propose funding both P-01 and P-08.`

**Screen:** the page shows a **Draft rejected** state — *"P-01 and P-08 cannot
both be funded; alternative designs for the same stretch of MG Road."*

**Say:**
> Ask for an impossible plan and the deterministic engine refuses it on the
> page, with the reason — the same check the assistant sees.

**Type to the assistant:** `Re-propose the valid redraft.`

## 1:52 – 2:35 · Review — the resident's alone

**Type to the assistant:** `Request resident review of this valid proposal.`

**Screen:** the trace adds **request review WRITE**. **REVIEW — RESOLUTION
WD-12** opens with the explicit notice that the assistant cannot accept or adopt
the plan and the resident controls are the next step.

**Say:**
> The assistant requested this review through WebMCP. That tool surface ends
> here. I accept this plan, acknowledge this is a demonstration, and adopt with
> the visible resident controls.

**Screen:** click **Accept this plan** (Adopt still disabled) → tick the
acknowledgement checkbox (Adopt enables) → click **Adopt resolution WD-12**.

## 2:35 – 2:55 · The record, and the point

**Screen:** **RESOLUTION WD-12 — ADOPTED**, green band, *"available in this
browser tab only"*, the record ID,
the works, and the attribution: *human_finalisation — the assistant modelled
options through WebMCP; the resident set priorities, protected what mattered,
reviewed, acknowledged and adopted.*

**Say:**
> A transparent local record — the assistant's arithmetic, the resident's
> decision. The live trace shows the collaboration on one validated state, and
> the WebMCP surface grants no adoption capability.

**Screen:** click **Reset — run the demonstration again**.

---

## Shot-list checklist

- [ ] "7 tools connected" line legible
- [ ] Empty live trace before the first tool call; read/write events appear as the assistant works
- [ ] Resident-journey rail visible and advancing each beat
- [ ] Three direction cards, scores at your priorities, "the score won't decide this"
- [ ] `simulate` → `propose` in trace; draft labelled **WEBMCP ASSISTANT PROPOSAL**
- [ ] **Protect** on the play area → proposal marked stale and a clear replan prompt on screen ≥ 2s  ← key frame
- [ ] Replan copy explains that every protected work must be kept in the next valid plan
- [ ] Redraft: **PROTECTED** badge on the play-area line and the live trade-off summary
- [ ] Draft rejected state for P-01 + P-08, with the reason
- [ ] `request review` in trace + precise WebMCP/general-browser boundary notice
- [ ] Adopt disabled → enabled only after Accept + acknowledgement
- [ ] RESOLUTION WD-12 — ADOPTED, human_finalisation attribution
- [ ] Reset returns to the start
