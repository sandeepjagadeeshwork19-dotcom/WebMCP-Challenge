# Demo video script — Neighbors Decide (target 2:50, hard cap 3:00)

Record in a WebMCP-capable agent browser (ChatGPT browser, or Chrome with WebMCP
enabled) at the deployed URL, 1280×720+, audio on. Do a full dry run first so
`Reset` leaves a clean start. Narration is ~155 wpm — trim, don't rush.

The look: a black-and-vermilion **ward gazette** — "NEIGHBORS DECIDE", docket
"NO. WD-12", a state line reading *Priorities set → Comparing directions → Draft
ready → Reviewed → Adopted*, and a right-hand **assistant's margin**.

---

## 0:00 – 0:18 · Hook

**Screen:** the loaded page — masthead, the disclosure line, the "7 assistant
tools connected" indicator, three direction cards below.

**Say:**
> In India, a ward's development money is meant to be decided *in the ward* —
> by residents, not an officer. Here it's a hypothetical ₹10 lakh and eight
> works that can't all be funded. An assistant can model every option and pencil
> a full draft — but it is not allowed to make the call.

## 0:18 – 0:33 · The tools, and what's missing

**Screen:** point to "7 assistant tools connected — read state, list works,
compare, simulate, propose, explain, request review." Then the command bar.

**Say:**
> Seven WebMCP tools on the page. Five read-only, two that change state — and
> **none that adopts the budget**. There is no finalise tool, on purpose.

## 0:33 – 0:55 · Priorities, then three modelled directions

**Screen:** in the left rail, click **Safety 3** and **Accessibility 3**. The
budget revision ticks; the state line moves to *Comparing directions*. The three
cards re-score.

**Type to the assistant:** `Call list_strategy_options and walk me through the three directions.`

**Say:**
> I tell the page what I value. The assistant scores three valid directions
> against that — and says plainly, the score won't decide this. Safety-and-access
> fits best, so I take it.

**Screen:** click **Choose DIRECTION A**. A **DRAFT RESOLUTION — WD-12** appears,
marked *valid*.

## 0:55 – 1:35 · The turn — a human choice stales the plan

**Screen:** scroll to **The eight candidate works**. On *Riverside play area
upgrade*, click **Protect**.

**Say:**
> Now the judgement the assistant can't make. The riverside play area is on my
> block, and it floods every monsoon. It isn't in the "efficient" plan — I
> protect it anyway.

**Screen:** the command bar shows a red **BUDGET REV 1 → N** chip; the state line
reads **Re-planning — draft stale**; a **STALE** stamp sits over the superseded
draft; the hero reads *PROTECTING PLAY AREA CHANGES THE PLAN — must now include
the play area — over the fund by ₹1,70,000 — the assistant must drop about
₹1,70,000 of other works.*

**Say:**
> The plan the assistant built is now stale. Protecting the play area pushes it
> over the fund — something has to give. That's the assistant's problem to solve,
> not mine.

**Type to the assistant:** `I protected the play area. Redraft around it.`

**Screen:** a fresh **DRAFT RESOLUTION** appears — *valid*, proposal rev 2, the
play area line carrying a **PROTECTED** badge, and a *"compared with where you
started"* strip: `+ play area · − road crossings`.

## 1:35 – 1:52 · The engine says no

**Type to the assistant:** `Propose funding both P-01 and P-08.`

**Screen:** the page shows a **Draft rejected** state — *"P-01 and P-08 cannot
both be funded; alternative designs for the same stretch of MG Road."*

**Say:**
> Ask for an impossible plan and the deterministic engine refuses it on the
> page, with the reason — the same check the assistant sees.

**Type to the assistant:** `Re-propose the valid redraft.`

## 1:52 – 2:35 · Review — the resident's alone

**Screen:** click **Review this resolution**. A black **REVIEW — RESOLUTION
WD-12 · this step is the resident's alone** band; the disclosure repeated; then
the notice: *"Only the resident can accept, revise, reject or adopt this
resolution. The assistant has no WebMCP tool for any of these steps — it cannot
reach past this point."* In the margin: *"I have stepped back. This step is
yours."*

**Say:**
> The assistant can request review — it can't grant it, accept it, or adopt it.
> Focus moves to the resident's controls. I accept the draft, I acknowledge this
> is a demonstration, and only then can I adopt.

**Screen:** click **Accept the draft** (Adopt still disabled) → tick the
acknowledgement checkbox (Adopt enables) → click **Adopt resolution WD-12**.

## 2:35 – 2:55 · The record, and the point

**Screen:** **RESOLUTION WD-12 — ADOPTED**, green band, *"local record · not
transmitted"*, *"Adopted by the resident … not by the assistant,"* the record ID,
the works, and the attribution: *human_finalisation — the assistant modelled
options, pencilled drafts and explained trade-offs; the resident set the
priorities, protected what mattered, reviewed, acknowledged and adopted. The
assistant was never able to.*

**Say:**
> A transparent local record — the assistant's arithmetic, the resident's
> decision. That's the pattern, and WebMCP is what makes it honest: one board,
> both parties reading it, and a boundary the agent can't route around.

**Screen:** click **Reset — run the demonstration again**.

---

## Shot-list checklist

- [ ] "7 assistant tools connected" line legible
- [ ] State line visible and advancing each beat
- [ ] Three direction cards, scores at your priorities, "the score won't decide this"
- [ ] Choose Direction A → DRAFT RESOLUTION — WD-12, *valid*
- [ ] **Protect** on the play area → red **BUDGET REV → chip** + **STALE stamp** on screen ≥ 2s  ← key frame
- [ ] Cost hero: "over the fund by ₹1,70,000 · drop about ₹1,70,000 of other works"
- [ ] Redraft: **PROTECTED** badge on the play-area line; "compared with where you started" strip
- [ ] Draft rejected state for P-01 + P-08, with the reason
- [ ] Review band + the "no WebMCP tool … cannot reach past this point" notice
- [ ] Adopt disabled → enabled only after Accept + acknowledgement
- [ ] RESOLUTION WD-12 — ADOPTED, human_finalisation attribution
- [ ] Reset returns to the start
