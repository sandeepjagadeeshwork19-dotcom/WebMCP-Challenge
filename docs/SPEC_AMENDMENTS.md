# Phase 3 amendments to PRODUCT_SPEC.md

`PRODUCT_SPEC.md` is preserved as the approved Phase 2 contract. Implementation
and the competition push introduced these deliberate, product-owner-directed
changes. Each is additive and none weakens an authority or safety guarantee.

## 1. Seventh WebMCP tool: `list_strategy_options` (read-only)

The spec fixes "exactly six" tools. A seventh **read-only** tool was added:

- `list_strategy_options` — returns three deterministically valid budget
  directions (`safety_access`, `climate_resilience`, `broad_coverage`), each with
  its allocation, totals, touched neighbourhoods, validity, and benefit scores
  computed both at the strategy's own priority lens and at the resident's current
  priorities.

It mutates nothing and dispatches nothing. The "no tool may set priorities,
lock, edit the allocation, accept, reject, finalise, or reset" rule is unchanged
— still exactly two state-changing tools (`propose_allocation`,
`request_allocation_review`), still no finalisation tool.

Rationale: it lets the agent open the conversation with a genuine analytical
contribution ("here are three directions and how they fit what you've said you
value") without touching the decision.

## 2. Application example directions

The shipped interface does not apply a strategy's lens priorities. The resident's
four weights remain exactly as set. A visible **Load example Direction** control
dispatches `app/loadDirectionDraft`, placing the direction's allocation into the
shared validator as an application-attributed example. This normal page action
is deliberately labelled as distinct from a WebMCP assistant proposal.

`list_strategy_options` remains read-only: it compares the same structured
directions at the resident's current priorities and never loads a draft.

## 3. State additions

- `disclosureAcknowledged: boolean` — the checked hypothetical-data
  acknowledgement required for finalisation (spec §6.4 requires the
  acknowledgement but did not name a field).
- `previousProposal: AgentProposal | null` — snapshot enabling
  `explain_tradeoffs({ compareWith: "previous_proposal" })`.
- `activitySequence: number` — monotonic id source for activity events.

## 4. Framing and localisation (India-centric)

The scenario is now an Indian **ward development fund** (gram sabha / ward
committee under the 73rd & 74th Constitutional Amendments; Kerala's People's Plan
as the real-world anchor). Concretely:

- Currency is hypothetical **Indian rupees** with lakh/crore digit grouping
  (`₹1,80,000`), via `src/domain/money.ts` (`inr`), used by `format.ts`,
  `validation.ts` and `reducer.ts`.
- **`FUND_LIMIT` is unchanged at `1_000_000`** — displayed as `₹10,00,000`
  (₹10 lakh). Every project cost, the `P-06` phase amounts (₹60k/90k/1.2L),
  dependency, incompatibility, benefit rating, funding rule and all validator
  logic are **byte-identical** to `demo-budget-v1`; `DATASET_VERSION` is retained.
- Project names, descriptions, localities and assumptions are re-skinned to
  ward-works vocabulary (storm-water drain, bus shelters, play area, PHC
  equipment, tree drive, study room, cycle track). Project IDs `P-01`…`P-08` and
  the constraint graph are unchanged.
- The mandatory hypothetical-data disclosure keeps its `"Hypothetical
  demonstration:"` opening and its meaning; wording now also names ward
  committees / gram sabhas / participatory-budgeting programmes as things this is
  *not* connected to.

## 5. Interface reorganisation and the "resolution + margin" concept

The spec's §12 page hierarchy (a scrolling stack of panels) was rebuilt as a
**staged decision board**, after two senior-design-director reviews:

- A persistent **command bar** (fund figures · revision stamp · a *whose-move*
  indicator) and a **state line** (`Priorities → Comparing → Draft → Reviewed →
  Adopted`, a non-locking indicator, not a wizard).
- A stable three-zone split: **left** = "you control this" (priorities,
  protected works, log); **centre** = the current stage (compare / draft / the
  turn / review / record); **right** = the **assistant's margin** with a live
  WebMCP trace. Every tool call shows its name, read/write mode, outcome and the
  revisions it observed. Ordinary page clicks never appear in that trace.
- **Review is an invoked mode**, not an always-mounted panel — no disabled
  finalise button or blocker list on load. The review notice states the precise
  boundary: no WebMCP tool accepts, rejects or adopts; general browser automation
  is outside that WebMCP tool surface.
- New action **`app/loadDirectionDraft`** (actor `system`): loading an example direction
  places that direction's plan as an application-attributed starting draft. It
  also serves as the §12.4 "Load example proposal" fallback when WebMCP is
  absent. It runs the same validator and revision machinery as
  `agent/proposeAllocation`; it never changes priorities, protections or the
  budget revision.
- Resident-facing verbs: **"Protect"** (spec "lock") and **"Adopt"** (spec
  "finalise"). Internal action names, `human_finalisation` attribution and the
  spec-facing docs keep the original terms.
- Visual language: a black-and-vermilion "ward gazette" — deliberately not the
  cream-and-serif "premium assistant" default. Contrast verified against WCAG
  2.2 AA (accent `#A82D1B` ≈ 6.1:1 on the newsprint ground).

## 6. Test tooling

The spec's Stage 9 names Playwright for the primary browser journey. The current
suite implements the equivalent coverage as a Vitest + Testing Library
integration test (`src/integration/__tests__/journey.test.tsx`). A real-browser
Playwright pass remains an open item before the MVP meets its own definition of
done.
