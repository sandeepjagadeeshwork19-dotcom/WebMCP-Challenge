# Participatory Budget Workspace — Product Specification

Status: Phase 2 planning draft for review  
Working title only: **Participatory Budget Workspace**  
Product code: not started

## 1. Product summary

Participatory Budget Workspace is a bounded, WebMCP-enabled demonstration in which one resident allocates a clearly hypothetical **$1 million neighbourhood-improvement fund** across exactly eight hypothetical capital projects.

The resident and agent work from the same visible application state. The agent can inspect priorities and allocations, simulate combinations, propose a valid plan, and explain opportunity costs. A deterministic application engine—not the agent—enforces costs, dependencies, incompatibilities, locks, and revision freshness. The resident owns the priorities and trade-offs and performs final commitment through the visible interface.

The final action records a hypothetical allocation for demonstration purposes. It does not vote, transfer money, direct public spending, or communicate with a government.

### Product thesis

> The agent models options and restructures valid plans. The resident owns the priorities, trade-offs and final allocation.

The agent is technically capable of proposing a complete allocation. Human ownership is an accountability and civic-legitimacy choice, not a claim that the agent is unable to calculate. WebMCP supplies structured access to the live state the resident sees; it does not supply a native, non-bypassable human-confirmation primitive. Human-only finalisation is enforced by the application design: no finalisation tool is registered.

## 2. Goals and success criteria

The MVP succeeds when a three-minute demonstration can show all of the following without hidden setup:

1. Eight understandable hypothetical projects compete for a fixed $1 million.
2. A resident expresses priorities and makes at least one visible value judgment.
3. An agent discovers narrow tools and reads the same revisioned state shown in the page.
4. The deterministic engine accepts valid combinations and explains invalid ones.
5. A human change makes an existing proposal stale.
6. The agent adapts without overriding the resident's locked selection.
7. The resident sees gains, losses, unallocated funds, and constraints before review.
8. Only the resident can finalise, through the visible interface.
9. Finalisation creates a transparent local demonstration record.
10. Reset restores the exact initial scenario.

## 3. Mandatory hypothetical-data disclosure

The following disclosure appears above the workspace and again in final review:

> **Hypothetical demonstration:** This workspace uses invented projects, costs, benefits, constraints, neighbourhoods and community-support indicators. It is not connected to, endorsed by or deployed for any government. Finalising records a demonstration choice only; it does not cast a vote or allocate real funds.

Every project detail view carries a compact `Hypothetical data` label. Exported or copied final records repeat the disclosure.

## 4. Scenario constants and rating language

- Fund limit: `$1,000,000`.
- Currency: hypothetical US dollars, displayed to the nearest `$10,000`.
- Dataset version: `demo-budget-v1`.
- Resident model: one local participant; no identity or account.
- Benefit ratings: `Low`, `Medium`, or `High`. They are illustrative judgments, not measured outcomes.
- Community support: `Moderate` or `High`, representing a fictional demonstration indicator rather than poll results.
- People served: rounded illustrative estimates, prefixed with `About`; overlaps mean project estimates must not be summed into a claim about unique residents.
- All projects are complete capital projects except the street-tree programme, whose phased minimum-funding rule is explicit.

## 5. Hypothetical project dataset

All entries below are invented for this demonstration.

### `P-01` — Safer pedestrian crossings

- **Description:** Raised crossings, curb extensions and brighter lighting at two busy Willow Avenue junctions.
- **Cost:** `$180,000`, complete project only.
- **Neighbourhood:** Northgate / Willow Avenue.
- **Category:** Pedestrian safety.
- **Estimated people served:** About 3,000 regular walkers and nearby residents.
- **Safety benefit:** High.
- **Accessibility benefit:** Medium.
- **Climate benefit:** Low.
- **Community support:** High.
- **Minimum viable funding:** Full `$180,000` or not selected.
- **Dependencies:** None.
- **Incompatibilities:** `P-08`; both are alternative designs for the same constrained Willow Avenue curb space during this funding cycle.
- **Hypothetical assumption:** Two junctions can be reconstructed within the stated amount; benefit ratings reflect slower vehicle turns and shorter crossing distances.

### `P-02` — Accessible bus stops

- **Description:** Rebuild six Market Corridor stops with raised boarding pads, seating, shelter and tactile wayfinding.
- **Cost:** `$150,000`, complete project only.
- **Neighbourhood:** Market Corridor.
- **Category:** Accessible transport.
- **Estimated people served:** About 1,500 regular riders.
- **Safety benefit:** Medium.
- **Accessibility benefit:** High.
- **Climate benefit:** Medium.
- **Community support:** High.
- **Minimum viable funding:** Full `$150,000` or not selected.
- **Dependencies:** None.
- **Incompatibilities:** None.
- **Hypothetical assumption:** Existing right-of-way is sufficient and six stops can be rebuilt without land acquisition.

### `P-03` — Riverside playground renovation

- **Description:** Replace worn equipment with an inclusive play structure, shaded seating and a safer resilient surface.
- **Cost:** `$210,000`, complete project only.
- **Neighbourhood:** Riverside.
- **Category:** Parks and play.
- **Estimated people served:** About 900 children and caregivers.
- **Safety benefit:** Medium.
- **Accessibility benefit:** High.
- **Climate benefit:** Low.
- **Community support:** High.
- **Minimum viable funding:** Full `$210,000` or not selected.
- **Dependencies:** Requires `P-04` at full funding because the playground site currently floods after heavy rain.
- **Incompatibilities:** None.
- **Hypothetical assumption:** The amount replaces one compact play area; drainage must be fixed first so the new surface is durable and safely accessible.

### `P-04` — Riverside flood-drainage improvements

- **Description:** Enlarge two storm inlets and add a planted drainage basin beside Riverside Park.
- **Cost:** `$240,000`, complete project only.
- **Neighbourhood:** Riverside.
- **Category:** Flood resilience.
- **Estimated people served:** About 2,500 nearby residents and park users.
- **Safety benefit:** High.
- **Accessibility benefit:** Medium.
- **Climate benefit:** High.
- **Community support:** High.
- **Minimum viable funding:** Full `$240,000` or not selected.
- **Dependencies:** None.
- **Incompatibilities:** None.
- **Hypothetical assumption:** The defined work addresses routine surface flooding but is not represented as complete watershed protection.

### `P-05` — Community health-centre equipment

- **Description:** Equip two examination rooms and add an accessible diagnostic station at the Central Health Centre.
- **Cost:** `$160,000`, complete project only.
- **Neighbourhood:** Central.
- **Category:** Community health.
- **Estimated people served:** About 4,000 patients each year.
- **Safety benefit:** Medium.
- **Accessibility benefit:** High.
- **Climate benefit:** Low.
- **Community support:** High.
- **Minimum viable funding:** Full `$160,000` or not selected.
- **Dependencies:** None.
- **Incompatibilities:** None.
- **Hypothetical assumption:** The building, staffing and operating budget already exist; only durable equipment is part of this capital exercise.

### `P-06` — Street-tree programme

- **Description:** Plant shade trees with soil cells and two years of establishment care on heat-exposed residential blocks.
- **Cost:** Up to `$120,000`.
- **Neighbourhood:** Neighbourhood-wide, prioritising Southbank blocks.
- **Category:** Urban greening.
- **Estimated people served:** About 2,000 residents at full funding; lower phases cover fewer blocks.
- **Safety benefit:** Low.
- **Accessibility benefit:** Low.
- **Climate benefit:** High.
- **Community support:** Moderate.
- **Minimum viable funding:** `$60,000`; allowed allocations are exactly `$60,000`, `$90,000`, or `$120,000`.
- **Dependencies:** None.
- **Incompatibilities:** None.
- **Hypothetical assumption:** Each `$30,000` above the minimum adds one additional block group; partial funding below `$60,000` would not cover establishment care and is invalid.

### `P-07` — Public-library study space

- **Description:** Convert an underused room into a quiet, accessible study space with durable furniture, power and task lighting.
- **Cost:** `$140,000`, complete project only.
- **Neighbourhood:** West End.
- **Category:** Learning and public space.
- **Estimated people served:** About 1,200 regular learners and library users.
- **Safety benefit:** Low.
- **Accessibility benefit:** Medium.
- **Climate benefit:** Low.
- **Community support:** Moderate.
- **Minimum viable funding:** Full `$140,000` or not selected.
- **Dependencies:** None.
- **Incompatibilities:** None.
- **Hypothetical assumption:** Structural work is unnecessary; the amount covers fit-out and accessible furnishings only.

### `P-08` — Protected cycling connection

- **Description:** Build a protected one-kilometre cycling link along Willow Avenue between Northgate and the Market Corridor.
- **Cost:** `$260,000`, complete project only.
- **Neighbourhood:** Northgate / Willow Avenue.
- **Category:** Active transport.
- **Estimated people served:** About 2,000 regular riders and corridor users.
- **Safety benefit:** High.
- **Accessibility benefit:** Medium.
- **Climate benefit:** High.
- **Community support:** Moderate.
- **Minimum viable funding:** Full `$260,000` or not selected.
- **Dependencies:** None.
- **Incompatibilities:** `P-01`; it is the alternative corridor design for the same curb space and construction window.
- **Hypothetical assumption:** The amount covers the protected link only, not a network-wide route.

## 6. Deterministic allocation rules

The same pure validation engine is used by manual UI actions and all WebMCP tools.

### 6.1 Allocation representation

An allocation is an array of unique `{ projectId, amount }` entries. A project is selected when its amount is greater than zero. Amounts are integer dollars.

### 6.2 Validation order

Validation returns every applicable issue in this stable order so the interface and tools explain the same result:

1. **Shape:** known project IDs, unique entries, integer amounts and no unknown fields.
2. **Non-negative amount:** no amount may be below zero.
3. **Funding rule:** complete projects must equal their stated cost; `P-06` must be `$60,000`, `$90,000`, or `$120,000`.
4. **Lock preservation:** every locked project must appear at its locked amount.
5. **Dependencies:** selecting `P-03` requires `P-04` at `$240,000`.
6. **Incompatibilities:** `P-01` and `P-08` cannot both be selected.
7. **Fund limit:** total committed cost cannot exceed `$1,000,000`.
8. **Revision freshness:** simulations and proposals must reference the current `budgetRevision`; review must also reference the current `proposalRevision`.

Zero-amount entries are rejected rather than silently treated as removal. Removal is represented by omitting the project. The engine never rounds, repairs, adds dependencies or drops projects implicitly.

### 6.3 Proposal freshness

- A proposal stores the `budgetRevision` it was evaluated against.
- Human changes to priorities, locked projects, or manual allocations increment `budgetRevision` exactly once per committed UI action.
- Any active proposal bound to the prior revision becomes `stale` immediately.
- Agent reads, simulations and explanations do not increment the budget revision.
- Creating a proposal increments `proposalRevision`, not `budgetRevision`.
- A stale proposal remains visible for comparison but cannot enter review.
- A new proposal must preserve all current locked project IDs and amounts.

### 6.4 Finalisation rule

Only a visible human action may finalise. It requires:

- an active proposal with status `accepted`;
- an open review completed by the resident;
- an unchanged budget revision, proposal revision and allocation hash since acceptance;
- a fresh successful validation result; and
- an explicit checked acknowledgement of the hypothetical-data disclosure.

Finalisation creates a local transparent record. There is no WebMCP finalisation tool and no claim that WebMCP itself secures this boundary.

## 7. Benefit and trade-off calculations

The engine reports, but does not pretend to resolve, value judgments.

- Ratings map only for comparison: `Low = 1`, `Medium = 2`, `High = 3`.
- Resident priority controls set an importance weight of `0` (not prioritised), `1` (consider), `2` (important), or `3` (most important) for safety, accessibility, climate and community support.
- A proposal's directional priority score is the sum of `project rating × resident weight` across selected projects. `P-06` contributes 50%, 75% or 100% of its rating at `$60,000`, `$90,000` or `$120,000`.
- The score is labelled `Illustrative comparison`, never `best plan` or `public value`.
- Trade-offs list projects added, removed or funding-adjusted; cost and unallocated-fund changes; directional rating changes; dependency/incompatibility effects; and explicit opportunity costs.
- People-served estimates are shown per project and never summed into unique population coverage because estimates may overlap.

## 8. Human and agent authority matrix

| Capability | Agent | Human | Application engine |
| --- | --- | --- | --- |
| Read projects and current budget state | May | May | Supplies canonical state |
| Read resident priorities | May | May | Stores values and revision |
| Set or change priorities | May not | May | Validates range and increments revision |
| Simulate allocations | May | May through manual feedback | Validates without mutation |
| Propose a complete allocation | May | May manually | Validates and stores agent attribution |
| Explain gains, losses and opportunity costs | May | May inspect | Computes canonical comparison facts |
| Revise after human change | May | May request or edit | Enforces current revision |
| Lock or unlock projects | May not | May | Stores exact locked amount and increments revision |
| Select or remove projects manually | May not through tools | May | Validates and increments revision |
| Request valid proposal review | May | May open directly | Allows only fresh valid proposal |
| Accept, reject or modify a proposal | May not | May | Records human attribution |
| Override constraints or source data | May not | May not | Rejects operation |
| Finalise allocation | May not | May through visible UI only | Revalidates and writes record |
| Reset demonstration | May not | May | Restores initial state and increments reset version |

Agent and human events use separate immutable actor labels. Neither actor can relabel an event.

## 9. WebMCP tool surface

All object schemas reject unknown properties. Project arrays allow at most eight unique IDs. Text inputs are trimmed and length-bounded. Tool outputs use the same identifiers, revisions, validation codes and calculated totals shown in the UI.

### Shared schema fragments

```ts
type ProjectId =
  | "P-01" | "P-02" | "P-03" | "P-04"
  | "P-05" | "P-06" | "P-07" | "P-08";

type Allocation = {
  projectId: ProjectId;
  amount: number; // integer, 0 < amount <= 260000
};

type ValidationIssue = {
  code:
    | "unknown_project"
    | "duplicate_project"
    | "invalid_amount"
    | "funding_rule"
    | "locked_selection_changed"
    | "missing_dependency"
    | "incompatible_projects"
    | "budget_exceeded";
  projectIds: ProjectId[];
  message: string;
};
```

### 9.1 `get_budget_state`

- **Discovery description:** `Read the current hypothetical budget, resident priorities, locks, manual allocation, proposal summary and revision numbers.`
- **Purpose:** Give the agent a concise canonical snapshot before simulation or proposal.
- **Mode:** Read-only; no side effects.
- **Input:** `{ includeRecentActivity?: boolean }`, with the optional flag defaulting to `false`.
- **Output:** `{ datasetVersion, fundLimit, budgetRevision, priorities, lockedAllocations, manualAllocations, committedTotal, remainingFunds, proposal: { proposalRevision, status, basedOnBudgetRevision } | null, reviewStatus, finalised, recentActivity? }`.
- **State read:** All current state except full project definitions and full final record details.
- **State changed:** None.
- **Validation:** Boolean only; unknown keys rejected.
- **Errors:** `invalid_input`, `state_unavailable`.
- **Visible change:** None; an agent-read activity event may appear only if the product elects to log reads. MVP recommendation: do not log routine reads to avoid noise.
- **Why not DOM:** The tool returns canonical revisions, amounts and statuses without scraping formatted text or inferring control state.

### 9.2 `list_projects`

- **Discovery description:** `List the eight hypothetical projects with costs, benefits, funding rules, dependencies and incompatibilities.`
- **Purpose:** Provide authoritative project data and constraints.
- **Mode:** Read-only; no side effects.
- **Input:** `{ projectIds?: ProjectId[] }`; omitted means all eight.
- **Output:** `{ datasetVersion, projects: Project[] }`, preserving the stable project order.
- **State read:** Immutable dataset only.
- **State changed:** None.
- **Validation:** At most eight unique known IDs; unknown keys rejected.
- **Errors:** `invalid_input`, `unknown_project`, `duplicate_project`.
- **Visible change:** None.
- **Why not DOM:** Structured benefits and constraint relationships remain unambiguous and independent of responsive layout.

### 9.3 `simulate_allocation`

- **Discovery description:** `Validate a hypothetical allocation against the current revision without changing application state.`
- **Purpose:** Let the agent test complete combinations before proposing one.
- **Mode:** Read-only; no state changes or activity event.
- **Input:** `{ budgetRevision: integer, allocations: Allocation[] }`.
- **Output:** `{ valid, budgetRevision, committedTotal, remainingFunds, selectedProjectIds, validationIssues, benefitSummary, comparedWithCurrent: TradeoffSummary }`.
- **State read:** Current revision, priorities, locks, manual allocation and immutable dataset.
- **State changed:** None.
- **Validation:** Exact revision; zero to eight unique allocations; integer bounded amounts; all deterministic rules.
- **Errors:** `invalid_input`, `stale_budget_revision`, `unknown_project`, `duplicate_project`. Constraint failures are returned as `valid: false`, not transport failures.
- **Visible change:** None; the agent can explain the returned result conversationally.
- **Why not DOM:** The tool calls the canonical validator and returns every constraint issue, avoiding trial clicks and partial UI state.

### 9.4 `propose_allocation`

- **Discovery description:** `Store an agent-attributed allocation proposal for the current budget revision after deterministic validation.`
- **Purpose:** Place a complete candidate beside the resident's current allocation.
- **Mode:** State-changing.
- **Input:** `{ budgetRevision: integer, allocations: Allocation[], rationale: string }`, with rationale length `1–600` characters.
- **Output:** `{ proposalRevision, status: "valid" | "invalid", basedOnBudgetRevision, committedTotal, remainingFunds, validationIssues, allocationHash }`.
- **State read:** Dataset, current revision, priorities, locks and manual allocation.
- **State changed:** Replaces the active agent proposal, increments `proposalRevision`, stores validation result and rationale, and adds an `agent` activity event. It does not change priorities, locks or manual allocation.
- **Validation:** Exact current budget revision; complete input schema; deterministic allocation rules; all locked allocations preserved exactly.
- **Errors:** `invalid_input`, `stale_budget_revision`, `unknown_project`, `duplicate_project`. A rule-invalid candidate is stored visibly with `status: "invalid"` and returned normally with issues so the failure is inspectable.
- **Visible change:** Agent Proposal panel updates with attribution, revision, totals, rationale and constraint messages.
- **Why not DOM:** A single atomic operation binds the proposal to a revision, validates it and preserves attribution; DOM clicking could leave an unexplained partial allocation.

### 9.5 `explain_tradeoffs`

- **Discovery description:** `Compare the active proposal with the resident's current allocation or the previous proposal using canonical project facts.`
- **Purpose:** Produce structured gains, losses and opportunity costs without inventing benefit data.
- **Mode:** Read-only; no side effects.
- **Input:** `{ proposalRevision: integer, compareWith: "manual_allocation" | "previous_proposal" }`.
- **Output:** `{ proposalRevision, proposalStatus, added, removed, fundingChanged, costDelta, remainingFundsDelta, benefitDeltas, opportunityCosts, caveats }`.
- **State read:** Requested proposal snapshot, comparison snapshot, priorities and dataset.
- **State changed:** None.
- **Validation:** Proposal revision must exist; comparison snapshot must exist. Stale proposals may be explained but are labelled stale.
- **Errors:** `invalid_input`, `no_active_proposal`, `proposal_revision_mismatch`, `comparison_unavailable`.
- **Visible change:** None by itself; the same structured comparison is rendered automatically in the proposal panel.
- **Why not DOM:** The tool returns canonical deltas and caveats rather than asking the agent to subtract displayed values or infer removed cards.

### 9.6 `request_allocation_review`

- **Discovery description:** `Open visible resident review for the current fresh, valid proposal; this does not accept or finalise it.`
- **Purpose:** Hand a valid proposal back to the resident at a clear authority boundary.
- **Mode:** State-changing, but not a finalisation action.
- **Input:** `{ budgetRevision: integer, proposalRevision: integer }`.
- **Output:** `{ reviewStatus: "open", proposalStatus: "under_review", budgetRevision, proposalRevision, allocationHash }`.
- **State read:** Current revisions, proposal, validation result and allocation hash.
- **State changed:** Sets proposal to `under_review`, opens review state and adds an `agent` activity event.
- **Validation:** Both revisions exact; proposal exists; status is `valid`; validation is still successful; allocation hash unchanged.
- **Errors:** `invalid_input`, `stale_budget_revision`, `no_active_proposal`, `proposal_revision_mismatch`, `proposal_not_valid`, `stale_proposal`, `review_already_open`.
- **Visible change:** Focus moves to the human review region, which clearly states that only the resident can accept, modify, reject or finalise.
- **Why not DOM:** The atomic transition proves the reviewed proposal is the validated revision the agent requested, rather than whichever card happens to be visible after a sequence of clicks.

There is intentionally no WebMCP tool for setting priorities, locking projects, editing the manual allocation, accepting/rejecting review, finalising, or resetting.

## 10. State model

```ts
type ProposalStatus =
  | "none"
  | "draft"
  | "invalid"
  | "valid"
  | "stale"
  | "under_review"
  | "rejected"
  | "accepted"
  | "finalised";

type ReviewStatus = "none" | "open" | "rejected" | "accepted" | "completed";

type AppState = {
  datasetVersion: "demo-budget-v1";
  fundLimit: 1_000_000;
  budgetRevision: number;
  residentPriorities: {
    safety: 0 | 1 | 2 | 3;
    accessibility: 0 | 1 | 2 | 3;
    climate: 0 | 1 | 2 | 3;
    communitySupport: 0 | 1 | 2 | 3;
  };
  lockedAllocations: Allocation[];
  manualAllocations: Allocation[];
  agentProposal: {
    allocations: Allocation[];
    rationale: string;
    basedOnBudgetRevision: number;
    allocationHash: string;
    previousProposalRevision: number | null;
  } | null;
  proposalRevision: number;
  proposalStatus: ProposalStatus;
  constraintValidation: {
    valid: boolean;
    issues: ValidationIssue[];
    validatedBudgetRevision: number;
    allocationHash: string;
  } | null;
  reviewStatus: ReviewStatus;
  finalAllocationRecord: FinalAllocationRecord | null;
  activityHistory: ActivityEvent[];
  demoResetVersion: number;
};
```

### State invariants

- `lockedAllocations` is a subset of `manualAllocations`, at the same amounts.
- Only human UI events can change priorities, locks or manual allocations.
- Every human-owned budget change increments `budgetRevision` once and stales any active proposal based on an earlier revision.
- `proposalRevision` increases only when an agent proposal is stored.
- `under_review` and `accepted` require a valid constraint result whose revision and hash match the proposal.
- `finalAllocationRecord` is immutable until reset.
- Activity events are append-only until reset and carry `{ id, sequence, actor, action, summary, budgetRevision, proposalRevision, timestamp }`.
- Actor is one of `human`, `agent`, or `system`; only the reducer creates it.
- Reset restores priorities, locks, manual allocation, proposal, review and final record to their initial values, clears prior activity, increments `demoResetVersion`, and creates one new human-attributed reset event.

### Proposal transitions

| From | To | Initiator | Condition / effect |
| --- | --- | --- | --- |
| `none`, `invalid`, `stale`, `rejected`, `valid` | `draft` | Agent via `propose_allocation` | Candidate is stored against the exact current budget revision. |
| `draft` | `invalid` | Application | Deterministic validation returns one or more issues; proposal remains visible but cannot enter review. |
| `draft` | `valid` | Application | Validation succeeds; proposal is eligible for review. |
| `valid`, `under_review`, `accepted` | `stale` | Application after human edit | Priority, lock or manual allocation changes; review closes if open. |
| `valid` | `under_review` | Agent request or human review button | Current revisions/hash match and validation still succeeds. |
| `under_review` | `rejected` | Human UI | Proposal retained for history; review closes. |
| `under_review` | `accepted` | Human UI | Resident accepts the unchanged proposal; no final record yet. |
| `under_review` | `stale` | Human UI plus application | Resident modifies allocation or priorities instead of accepting. |
| `accepted` | `finalised` | Human UI only | Disclosure acknowledged and final validation/revision/hash checks pass. |
| Any non-final state | `none` | Human reset | Full initial state restored with new reset version. |
| `finalised` | `none` | Human reset | Final record cleared as part of complete demo reset. |

`draft` is an internal atomic transition and need not animate or remain visible. There is no transition from `invalid` or `stale` directly to review, and no agent-initiated transition to `accepted` or `finalised`.

### Final allocation record

The record contains:

- deterministic local record ID using reset version and final sequence;
- creation timestamp;
- dataset version and hypothetical disclosure;
- fund limit, committed total and unallocated amount;
- final project allocations and applied dependencies;
- resident-priority snapshot;
- locked-project snapshot;
- source proposal revision and budget revision;
- full successful validation summary;
- actor label `human_finalisation`.

It is displayed and copyable locally. It is not transmitted or persisted to a backend.

## 11. Primary user journey

1. The resident opens the workspace and sees the hypothetical-data disclosure and `$1,000,000` available.
2. The resident sets safety and accessibility to `Most important`; this is a human action and increments the budget revision.
3. The agent calls `get_budget_state` and `list_projects` and sees the same revision, priorities and project facts displayed on the page.
4. The agent calls `simulate_allocation` for one or more sensible combinations. Invalid combinations receive explicit constraint issues without changing state.
5. The agent calls `propose_allocation` with a valid plan, for example `P-01`, `P-02`, `P-04`, `P-05`, `P-06` at `$120,000`, and `P-07` for a `$990,000` total.
6. The resident makes a value judgment: manually selects `P-03` at `$210,000` and locks it. The page explains that `P-04` is required. The transaction increments the budget revision.
7. The existing agent proposal becomes visibly `stale`; its review action is disabled.
8. The agent calls `get_budget_state` again and observes the new revision, locked `P-03`, and its dependency.
9. The agent simulates and proposes a revised `$990,000` plan containing locked `P-03`, required `P-04`, `P-02`, `P-05`, `P-07`, and `P-06` at `$90,000`.
10. The interface and `explain_tradeoffs` show that the revised plan adds the playground, preserves drainage, reduces the tree phase, and gives up the pedestrian-crossing project while retaining strong accessibility investments.
11. The agent calls `request_allocation_review`; the application revalidates and opens the visible review region.
12. The resident reviews allocations, constraints, trade-offs and the hypothetical disclosure, then accepts and finalises using human-only controls.
13. The application creates a transparent local allocation record with revisions, validation and human attribution.
14. The resident uses Reset Demo; the original priorities, allocations, locks, proposal, history and final record are restored deterministically.

The agent never needs to make an intentionally foolish mistake. The demonstration shows useful option modelling, an authentic human value judgment and competent revision-aware adaptation.

## 12. Minimum coherent interface

### 12.1 Page hierarchy

1. **Scenario header:** working title, one-sentence task and persistent hypothetical-data disclosure.
2. **Budget summary:** fund limit, committed total, remaining funds, current revision and validation status.
3. **Resident priorities:** four labelled 0–3 controls with plain-language descriptions; explicitly marked `Resident controls`.
4. **Project comparison:** accessible cards on small screens and a comparison table on wide screens, showing cost, neighbourhood, benefits, support and constraints.
5. **Current allocation:** manual selections, amounts, lock controls and inline deterministic messages.
6. **Agent proposal:** attribution, proposal/budget revisions, status, rationale, allocations and remaining funds.
7. **Trade-off comparison:** added, removed and adjusted projects; benefit-direction deltas; opportunity-cost sentences; caveats.
8. **Activity history:** chronological actor-labelled events with human, agent and system visually and textually distinguished.
9. **Human review:** visible-only accept, modify, reject, disclosure acknowledgement and finalise controls. Finalise is disabled until every precondition holds.
10. **Final record:** immutable summary with copy action and repeated demonstration disclaimer.
11. **Reset:** persistent but separated destructive-looking control with a confirmation step; restores initial demo state only.

### 12.2 Constraint communication

- Budget overage reports exact amount over.
- Missing dependency names both projects and required amount.
- Incompatibility names both alternatives and explains the shared corridor.
- Lock conflict states the locked amount and does not silently fix it.
- Stale proposal states the old and current budget revisions and directs the agent to re-read state.
- Messages use icons plus text, never colour alone.

### 12.3 Accessibility and responsive requirements

- Semantic headings, tables, fieldsets, labels and buttons.
- Full keyboard operation and visible focus.
- Priority values announced by name, not colour or position alone.
- Constraint and stale-state changes announced through a polite live region; finalisation errors use assertive announcement.
- Review focus moves only after an explicit human action or `request_allocation_review` and can return to its trigger.
- Desktop uses side-by-side current/proposal comparison; small screens use ordered stacked sections without hiding data.
- Meet WCAG 2.2 AA colour contrast and target-size expectations.
- No decorative animation or complex design system in MVP.

### 12.4 Unsupported-WebMCP fallback

The page detects WebMCP support without treating absence as an error. When unsupported:

- show `Agent tools are unavailable in this browser; the full manual workspace still works`;
- keep all resident priority, selection, locking, validation, review, finalisation and reset flows functional;
- hide no project or constraint information;
- provide a `Load example proposal` manual demonstration action only if clearly attributed to the application, not an agent;
- never claim tool registration succeeded.

## 13. Provisional under-three-minute demonstration

| Time | Demonstration beat |
| --- | --- |
| `0:00–0:15` | Show the hypothetical disclosure, eight competing projects and fixed `$1 million`; state that this is a capital-allocation exercise, not a real municipal budget. |
| `0:15–0:30` | Resident marks safety and accessibility most important. Agent discovers `get_budget_state`, `list_projects` and the four action-oriented analysis/proposal tools. |
| `0:30–0:55` | Agent reads the live revision, simulates combinations and proposes a valid `$990,000` allocation. The page shows why it is valid. |
| `0:55–1:15` | Resident selects and locks the personally important Riverside playground. The proposal immediately becomes stale because the budget revision changed. |
| `1:15–1:40` | Agent re-reads state and proposes a revised plan that preserves the lock and required drainage project. |
| `1:40–2:05` | Side-by-side comparison shows the added playground, reduced tree phase, removed crossing project and retained accessibility investments. |
| `2:05–2:25` | Briefly simulate an over-budget or incompatible combination; the deterministic engine rejects it with the same structured reason shown in the UI. This is a rule demonstration, not agent incompetence. |
| `2:25–2:45` | Agent requests review. Resident sees human-only controls, acknowledges the hypothetical disclosure and finalises. |
| `2:45–2:55` | Show the accountable record with revisions, validation and human attribution; mention complete reset. |

### Why this demonstration is materially better

- **Versus a chatbot returning a text budget:** the plan is revision-bound, validated against canonical data and visible beside the resident's live choices.
- **Versus an agent clicking the DOM:** tools exchange project IDs, amounts, constraints and revisions atomically instead of inferring meaning from presentation or leaving partial clicks.
- **Versus a static calculator:** the agent can generate and restructure complete plans and explain opportunity costs in response to resident values.
- **Versus a completely autonomous allocator:** priorities, locks, acceptance and final commitment remain visibly attributable to the resident, preserving civic accountability without understating agent capability.

## 14. MVP scope

### Must include

- One hypothetical `$1 million` scenario and exactly eight projects.
- Deterministic validation for budget, amounts, funding rules, dependencies, incompatibilities, locks and revisions.
- Resident priorities, manual selection and human project locking.
- Agent simulations, proposals, revisions and stale-state handling.
- Canonical trade-off comparison.
- Six WebMCP tools defined in this document.
- Human-only review and finalisation.
- Human/agent/system activity attribution.
- Transparent local final record.
- Complete deterministic reset.
- Fully functional manual fallback.
- Automated unit, integration and end-to-end tests.
- Public static deployment.

### Explicitly excluded

- Real government data, endorsement or deployment.
- Voting, multiple residents or real-time collaboration.
- Authentication, accounts or persistent backend.
- Payments or actual fund allocation.
- External APIs or an LLM API inside the application.
- Maps unless later proven essential; they are not required by this specification.
- Notifications, multilingual support or complex analytics.
- Final submission copy or video production during implementation.

## 15. Test strategy

### Automated domain tests

- Total at or below `$1,000,000` passes; `$1` over fails with exact overage.
- Negative, zero, fractional, unknown and duplicate allocation inputs fail.
- Complete projects reject partial amounts.
- `P-06` accepts `$60,000`, `$90,000`, `$120,000` and rejects other amounts.
- `P-03` without full `P-04` fails; both at full funding pass.
- `P-01` plus `P-08` fails with an incompatibility issue.
- Locked project removal or amount change fails; exact preservation passes.
- Benefit/trade-off calculations correctly identify additions, removals, funding changes and directional deltas.
- People-served estimates are not summed into a unique-resident total.

### Automated state and workflow tests

- Human priority, lock and manual allocation actions increment budget revision once.
- Agent reads and simulations do not increment revision.
- Valid proposal creation increments proposal revision and stores agent attribution.
- Invalid proposal is visible as invalid and cannot enter review.
- A human-owned edit marks valid, under-review or accepted proposals stale.
- Current valid proposal can enter review; stale, invalid or mismatched revisions cannot.
- Agent/tool actions cannot dispatch priority, lock, accept, reject, finalise or reset events.
- Human accept does not finalise.
- Human finalisation revalidates revision/hash and creates the record.
- Activity actor attribution cannot be supplied or changed by tool input.
- Reset restores initial values, clears prior record/history and increments reset version.

### Automated WebMCP contract tests

- Exactly six tools register when the supported API is present; no finalisation tool exists.
- Input schemas reject unknown keys, oversized rationale, duplicate IDs and out-of-range amounts.
- Each tool returns the documented narrow shape and structured errors.
- Read-only tools do not mutate state.
- State-changing tool results match the proposal/review state rendered by the interface.
- Tool handlers and manual controls call the same validator and store.
- Unsupported WebMCP leaves the manual workflow usable and shows accurate fallback text.

### Automated component and end-to-end tests

- Visible totals, remaining funds, locks, constraints, revisions and proposal status match store state.
- The primary journey completes from initial load through stale proposal, re-proposal, review, human finalisation and reset.
- Keyboard-only resident journey works.
- Review controls remain absent from the WebMCP tool surface and finalise remains disabled until eligible.

### Manual tests inside ChatGPT's browser

- Confirm all six tools are discovered with their expected descriptions and schemas.
- Call read tools and compare returned revision, totals, priorities and locks to the visible page.
- Simulate without visible or state mutation.
- Create a proposal and confirm the same proposal revision/status appears visibly.
- Change and lock a project through the page; confirm the tool-observed revision changes and old proposal becomes stale.
- Attempt review with old/fabricated revisions and confirm rejection.
- Request review for a current valid proposal and confirm only the visible review opens.
- Confirm no finalisation tool is exposed and ordinary fabricated tool arguments cannot finalise.
- Finalise manually and confirm the record and human activity attribution.
- Reset and confirm both visible and tool-returned state match the initial fixture.
- Repeat the manual journey in a browser without WebMCP support.

## 16. Open decisions for review

The following choices require product-owner approval before implementation:

1. Approve the eight hypothetical projects, costs, single partial-funding rule, dependency and corridor incompatibility.
2. Approve the 0–3 resident-priority control and illustrative weighted comparison, including the explicit warning that it is not an objective optimum.
3. Approve whether invalid agent proposals should remain visibly inspectable (recommended) or be rejected without replacing the current proposal.
4. Approve the recommended frontend stack and public static host listed in `IMPLEMENTATION_PLAN.md`.
5. Approve whether the final local record needs a print-friendly view in MVP; copyable on-screen output is the recommended minimum.

