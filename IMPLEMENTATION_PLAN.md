# Participatory Budget Workspace — Implementation Plan

Status: Phase 2 planning draft for review  
Scope: solo-builder hackathon MVP  
Implementation: not started

## 1. Planning basis

The workspace is not a Git repository and currently contains only historical artifacts from a rejected recall experiment plus these Phase 2 documents. No application stack, package manifest, tests or deployment configuration exists. Recall-specific fixtures, scripts, terminology and data models are out of scope and must remain untouched.

Recommended implementation baseline, pending approval:

- React + TypeScript + Vite for a static client application.
- A framework-independent pure domain module for validation and comparisons.
- One in-memory reducer/store as the only mutable state source.
- Vitest and Testing Library for unit/component tests.
- Playwright for the primary browser journey and fallback checks.
- A static public host selected before Stage 12; no backend.

Paths below assume this baseline and may be renamed only when the stack decision is approved. Do not introduce a service layer, database, authentication abstraction or design system for future scale.

## 2. Delivery principles

1. Make the primary manual journey work before WebMCP registration.
2. Make the deterministic engine the single authority for UI and tool handlers.
3. Keep human-owned and agent-owned actions distinct at the event/reducer boundary.
4. Bind proposals to revisions and hashes rather than relying on conversational intent.
5. Register no tool that can set priorities, lock projects, accept/reject review, finalise or reset.
6. Keep unsupported-WebMCP manual behavior first-class.
7. Defer visual polish until the complete journey and runtime behavior are proven.
8. Stop a stage when its acceptance criteria fail; fix the foundation before building dependent behavior.

## 3. Vertical implementation stages

### Stage 1 — Repository and application foundation

**Objective**

Create the smallest testable static TypeScript application without touching historical recall artifacts.

**Expected files/components**

- `.gitignore`
- `package.json`, lockfile, `tsconfig*.json`
- `vite.config.ts`, `vitest.config.ts`
- `index.html`
- `src/main.tsx`, `src/App.tsx`, `src/styles.css`
- `src/test/setup.ts`
- `README.md` with hypothetical-demo scope and commands

**Acceptance criteria**

- Directory is initialised as a Git repository only if the product owner approves doing so.
- Development server renders a plain scenario shell and disclosure.
- Typecheck, lint, unit-test runner and production build commands exist.
- No recall artifact is imported, moved, reformatted or deleted.
- No external runtime or backend dependency is introduced.

**Tests to run**

- Install reproducibility with the approved package manager.
- `typecheck`, `lint`, empty/smoke `test`, and production `build`.
- Render smoke test for the disclosure.

**Dependencies**

- Approval of frontend stack, package manager and Git initialisation.

**Stop condition**

- Stop if the chosen runtime cannot produce a clean deterministic build or if setup would require modifying the historical spike.

### Stage 2 — Hypothetical dataset and deterministic rules

**Objective**

Encode exactly the approved eight-project fixture and the complete pure validation/comparison engine.

**Expected files/components**

- `src/domain/types.ts`
- `src/domain/projects.ts`
- `src/domain/validation.ts`
- `src/domain/tradeoffs.ts`
- `src/domain/hash.ts`
- `src/domain/__tests__/validation.test.ts`
- `src/domain/__tests__/tradeoffs.test.ts`

**Acceptance criteria**

- Dataset version and `$1,000,000` limit are constants.
- Exactly eight stable IDs exist and every required project field is populated.
- Validator enforces input shape, amounts, full/partial funding, locks, dependency, incompatibility and budget limit in stable issue order.
- Validator is pure and does not read UI or browser globals.
- Trade-off outputs use only fixture values and resident weights and include caveats.

**Tests to run**

- All domain tests listed in `PRODUCT_SPEC.md`.
- Dataset schema/uniqueness snapshot test.
- Boundary tests for `$1` under, exact limit and `$1` over.

**Dependencies**

- Stage 1 and approval of the hypothetical dataset/rules.

**Stop condition**

- Stop if any rule requires UI-specific logic, hidden data repair or invented special cases; simplify the rule or revise the specification first.

### Stage 3 — State model and reducer/store

**Objective**

Implement one revisioned state machine used by manual actions and future tool handlers.

**Expected files/components**

- `src/state/initialState.ts`
- `src/state/actions.ts`
- `src/state/reducer.ts`
- `src/state/selectors.ts`
- `src/state/store.tsx`
- `src/state/__tests__/reducer.test.ts`
- `src/state/__tests__/selectors.test.ts`

**Acceptance criteria**

- State matches the specification and invariants.
- Human actions alone change priorities, locks and manual allocations.
- Revision increments and automatic proposal staleness are deterministic.
- Proposal revision changes independently from budget revision.
- Actor attribution is created by typed actions/reducer, never accepted from external inputs.
- Final state and reset behavior are representable even before UI wiring.

**Tests to run**

- Transition table tests for every allowed proposal state.
- Rejection tests for forbidden transitions.
- Revision, hash, attribution and reset tests.

**Dependencies**

- Stage 2 pure domain APIs.

**Stop condition**

- Stop if two mutable stores emerge or if a tool/UI path could bypass the reducer and validator.

### Stage 4 — Manual interface

**Objective**

Complete the resident-owned allocation experience without WebMCP.

**Expected files/components**

- `src/components/ScenarioHeader.tsx`
- `src/components/BudgetSummary.tsx`
- `src/components/PriorityControls.tsx`
- `src/components/ProjectList.tsx`
- `src/components/ProjectCard.tsx`
- `src/components/CurrentAllocation.tsx`
- `src/components/ConstraintMessages.tsx`
- `src/components/UnsupportedWebMcpNotice.tsx`
- component tests alongside components

**Acceptance criteria**

- Resident can change priorities, select/remove projects, choose a valid `P-06` phase and lock/unlock selected projects.
- Visible total, remaining funds, revision and all constraint messages match selectors.
- Dependency and incompatibility explanations are plain-language and never auto-repair choices.
- Lock controls are available only to the human UI and preserve exact amount.
- The entire manual allocation path works with WebMCP absent.

**Tests to run**

- Component interaction tests for each control.
- Keyboard tests for priorities, project selection, funding choice and locks.
- Manual responsive check at narrow and wide widths.

**Dependencies**

- Stages 2–3.

**Stop condition**

- Stop if displayed values diverge from selectors or if a resident can create an unreported invalid state.

### Stage 5 — WebMCP registration

**Objective**

Feature-detect the current supported WebMCP runtime and register exactly six narrow tools over the same store/domain functions.

**Expected files/components**

- `src/webmcp/contracts.ts`
- `src/webmcp/errors.ts`
- `src/webmcp/handlers.ts`
- `src/webmcp/register.ts`
- `src/webmcp/useWebMcp.ts`
- `src/webmcp/__tests__/contracts.test.ts`
- `src/webmcp/__tests__/handlers.test.ts`
- `src/webmcp/__tests__/registration.test.ts`

**Acceptance criteria**

- Current normative registration surface is confirmed in the target ChatGPT browser before depending on it.
- Exactly `get_budget_state`, `list_projects`, `simulate_allocation`, `propose_allocation`, `explain_tradeoffs`, and `request_allocation_review` register.
- No finalisation, priority, lock, accept/reject or reset tool exists.
- Schemas reject unknown/oversized input and return documented structured errors.
- Read-only handlers cannot mutate state; state-changing handlers dispatch typed agent actions.
- Unsupported runtime renders the accurate fallback and no success claim.

**Tests to run**

- Schema and handler contract tests.
- Registration mock tests for supported/unsupported environments.
- Store/UI parity integration tests.

**Dependencies**

- Stages 2–4 and availability of the target WebMCP runtime for inspection.

**Stop condition**

- Stop if the target runtime cannot register or call the documented tools, or if tool handlers cannot share the exact visible store. Record evidence before choosing any workaround.

### Stage 6 — Agent proposal and revision workflow

**Objective**

Render proposals, validation, staleness and revision-aware comparison as one coherent collaboration loop.

**Expected files/components**

- `src/components/AgentProposal.tsx`
- `src/components/ProposalStatus.tsx`
- `src/components/TradeoffComparison.tsx`
- proposal workflow additions to reducer/selectors/handlers
- `src/integration/__tests__/proposalWorkflow.test.tsx`

**Acceptance criteria**

- Valid and invalid agent proposals are visibly attributed and revision-labelled.
- Human changes immediately stale old proposals and disable review.
- Re-proposal against the current revision preserves locks and can replace stale/invalid/rejected proposals.
- Trade-off facts shown in UI exactly match `explain_tradeoffs` output.
- Agent proposal never mutates manual allocation.

**Tests to run**

- Valid/invalid proposal integration tests.
- Priority, lock and manual-selection staleness tests.
- Fabricated/old revision rejection tests.
- Current-versus-previous proposal comparison tests.

**Dependencies**

- Stages 3–5.

**Stop condition**

- Stop if stale proposals can enter review, locked amounts can change, or tool results and visible proposal state differ.

### Stage 7 — Review and finalisation

**Objective**

Implement a visible human-only review and local transparent final record.

**Expected files/components**

- `src/components/HumanReview.tsx`
- `src/components/HypotheticalAcknowledgement.tsx`
- `src/components/FinalAllocationRecord.tsx`
- `src/domain/finalRecord.ts`
- review/finalisation reducer actions and selectors
- `src/integration/__tests__/reviewFinalisation.test.tsx`

**Acceptance criteria**

- Review opens only for the exact fresh valid proposal revision/hash.
- Human can reject, modify or accept; acceptance does not itself finalise.
- Finalise is a human UI handler with no exported WebMCP equivalent.
- Finalise rechecks status, disclosure, revisions, hash and validation.
- Record includes disclosure, allocations, totals, snapshots, revisions, validation and human attribution.
- No network request or persistence occurs.

**Tests to run**

- Review eligibility matrix.
- Agent inability to accept/finalise.
- Manual accept versus finalise distinction.
- Evidence-change/revision/hash invalidation before finalise.
- Final record snapshot and attribution tests.

**Dependencies**

- Stage 6.

**Stop condition**

- Stop if any callable tool or externally supplied flag can produce a final record, or if finalisation can skip fresh deterministic validation.

### Stage 8 — Activity history and reset

**Objective**

Make accountability and repeatable demonstration state visible and deterministic.

**Expected files/components**

- `src/components/ActivityHistory.tsx`
- `src/components/ResetDemo.tsx`
- `src/state/activity.ts`
- reset fixture/hash helpers
- `src/integration/__tests__/activityReset.test.tsx`

**Acceptance criteria**

- Human, agent and system events have text labels as well as visual distinction.
- Sequence, revisions and summaries are deterministic; timestamps are injectable in tests.
- Routine read calls do not flood history.
- Reset requires visible human confirmation, increments reset version, clears all prior working/final state and returns the initial-state hash.
- No reset tool is registered.

**Tests to run**

- Actor attribution and ordering tests.
- Reset from draft, review, accepted and finalised states.
- Initial-state deep equality/hash test after reset.

**Dependencies**

- Stages 3, 6 and 7.

**Stop condition**

- Stop if reset leaves a proposal, lock, record or prior history event behind, or if actor attribution can be supplied through a tool.

### Stage 9 — Automated testing

**Objective**

Close the automated coverage matrix and make one command validate the full MVP.

**Expected files/components**

- Consolidated unit/integration test suites
- `e2e/primaryJourney.spec.ts`
- `e2e/manualFallback.spec.ts`
- `playwright.config.ts`
- package scripts such as `validate`, `test:e2e`

**Acceptance criteria**

- Every automated test in the specification maps to at least one named test.
- Primary journey runs deterministically with a mocked clock where needed.
- Contract tests prove six tools and absence of a finalisation tool.
- Fallback test completes the resident journey with WebMCP unavailable.
- Typecheck, lint, unit/integration tests, end-to-end tests and build pass from a clean install.

**Tests to run**

- Full `validate` command.
- Production-build preview plus Playwright suite.
- Test-order randomisation or isolated-state rerun if supported.

**Dependencies**

- Stages 1–8.

**Stop condition**

- Stop if the primary journey is flaky, tests depend on live external services, or a test bypasses the public state/tool boundary it claims to verify.

### Stage 10 — ChatGPT runtime verification

**Objective**

Verify—not infer—the six tools, shared visible state and human-only finalisation in ChatGPT's browser.

**Expected files/components**

- `docs/CHATGPT_RUNTIME_CHECKLIST.md`
- Evidence notes with runtime/app version, date, exact steps and observed results
- Fixes limited to WebMCP adapter/contracts if required

**Acceptance criteria**

- ChatGPT discovers all and only the six expected tools.
- Read results match visible state and revision.
- Proposal call updates the visible proposal panel.
- Human edit stales the proposal and old/fabricated revisions fail.
- Review request opens the correct visible review.
- No finalisation tool is discoverable and fabricated arguments cannot finalise.
- Human finalisation and reset are visible and reflected in subsequent reads.

**Tests to run**

- Every manual ChatGPT-browser test in `PRODUCT_SPEC.md`.
- Repeat after a hard reload and after reset.

**Dependencies**

- Stage 9 and access to a supported ChatGPT browser runtime.

**Stop condition**

- Stop before polish/deployment claims if tool discovery, shared-state parity, revision enforcement or human-only finalisation cannot be demonstrated in the target runtime.

### Stage 11 — Accessibility and responsive polish

**Objective**

Make the proven journey clear and operable without expanding functionality.

**Expected files/components**

- Focus/live-region utilities only if necessary
- Responsive CSS refinements
- Accessibility tests integrated into component/e2e suites
- No design-system package unless an existing approved dependency already supplies it

**Acceptance criteria**

- Keyboard-only primary journey succeeds.
- Controls have accessible names, states and error relationships.
- Status does not rely on colour.
- Focus behavior for review, rejection, final record and reset is predictable.
- Wide and narrow layouts retain the same information and action order.
- Automated accessibility scan has no serious/critical findings; manual checks cover semantics the scanner cannot.

**Tests to run**

- Keyboard Playwright path.
- Automated accessibility scan on initial, invalid, stale, review and final states.
- Manual zoom/reflow and screen-reader spot check.

**Dependencies**

- Stage 10; runtime behavior must be proven before polish.

**Stop condition**

- Stop if polish changes domain behavior, action authority, tool schemas or information visibility.

### Stage 12 — Deployment and demo hardening

**Objective**

Publish a stable static demonstration and rehearse the sub-three-minute path.

**Expected files/components**

- Approved host configuration
- deployment build script
- `docs/DEPLOYMENT_CHECKLIST.md`
- `docs/DEMO_RUNBOOK.md`
- optional lightweight error boundary

**Acceptance criteria**

- Public HTTPS URL loads directly and after deep-link refresh if routing exists.
- No secrets, API keys, backend or external data calls are present.
- Hypothetical disclosure is visible before interaction.
- WebMCP supported path and manual fallback both work in production.
- Reset returns the production demo to the exact initial state.
- Full demo rehearses under three minutes with no hidden setup.

**Tests to run**

- Production URL smoke and primary journey.
- ChatGPT runtime checklist against deployed URL.
- Unsupported-browser fallback check.
- Clean-cache reload and mobile-width check.

**Dependencies**

- Stages 9–11 and approval of hosting target.

**Stop condition**

- Stop release if HTTPS, tool registration, fallback, reset or hypothetical-data disclosure differs from the verified local build.

## 4. Main implementation risks and mitigations

| Risk | Impact | Mitigation / evidence needed |
| --- | --- | --- |
| Target ChatGPT runtime does not expose the expected WebMCP registration surface | Core demonstration cannot run | Validate feature detection and one read tool early in Stage 5; do not wait for deployment. |
| Tool handlers and React render different state instances | Agent/user views diverge | Create the store once; inject the same store into UI and handlers; parity integration tests. |
| Human-only finalisation is accidentally exported as a dispatchable tool/action | Accountability claim becomes false | Separate action creators by authority, omit tool contract entirely, and test discovery plus fabricated inputs. |
| Revision semantics become confusing after acceptance | Stale plans may appear current | Keep budget and proposal revisions distinct; bind acceptance/finalisation to allocation hash; transition-table tests. |
| Project rules feel manufactured for the demo | Product credibility drops | Keep only one site dependency, one corridor incompatibility and one understandable phased project; explain each in dataset text. |
| Benefit score appears objective or falsely precise | Misrepresents civic values | Use bounded labels/weights, show assumptions, call score illustrative, and expose project-level trade-offs. |
| Activity history becomes noisy | Demo clarity suffers | Log meaningful state changes only; omit routine reads/simulations. |
| Three-minute demo becomes overloaded | Primary value is obscured | Keep one stale/revise journey; show one brief constraint example; cut secondary explanatory UI first. |
| Empty repository setup consumes hackathon time | Less time for runtime proof | Use standard static stack, minimal dependencies and one-page architecture. |

## 5. Runtime assumptions requiring validation

1. The target ChatGPT browser exposes the current normative WebMCP registration and call mechanism.
2. Registered handlers can close over or receive the same live in-page store used by visible React controls.
3. Tool registration updates appropriately after page reload without duplicate registrations.
4. Structured schema errors are returned to the agent in an inspectable form.
5. A state-changing tool call can trigger a visible React update without DOM actuation.
6. The deployed HTTPS host permits the required browser behavior and does not strip or isolate the registration surface.
7. Unsupported browsers fail feature detection cleanly and preserve the manual flow.

None of these is considered proven by the historical recall spike.

## 6. Scope-cut order if time runs short

Cut in this order while preserving the thesis:

1. Print-specific final-record styling; keep on-screen and copyable record.
2. Previous-proposal comparison mode; keep current-manual comparison.
3. Optional application-loaded example proposal in fallback mode.
4. Secondary project-card display mode; keep one responsive representation.
5. Detailed activity filtering; keep chronological attribution.
6. Fine visual polish beyond accessibility and hierarchy.

Do not cut:

- deterministic rules;
- proposal revisions and staleness;
- locked-selection preservation;
- same-state tool/UI parity;
- human-only finalisation and absence of a finalisation tool;
- hypothetical-data disclosure;
- complete reset;
- unsupported-WebMCP manual usability;
- target-runtime verification.

If the schedule cannot support the non-cuttable set, do not present the MVP as complete.

## 7. Locked decisions

- Product direction is a bounded participatory capital-budget workspace.
- Working title remains neutral; no final name in this phase.
- Scenario is exactly `$1 million`, exactly eight hypothetical projects and one resident.
- Every project, metric and community indicator is explicitly hypothetical.
- The deterministic application engine is authoritative for constraints.
- Agent can simulate, propose, explain and request review but cannot change resident-owned inputs or finalise.
- Exactly six WebMCP tools; no finalisation tool.
- Proposals are revision-bound and human edits make them stale.
- Finalisation is a visible human action and creates a local demonstration record only.
- No backend, external API, embedded LLM, authentication, payment, real vote or persistent account.

## 8. Decisions requiring approval

1. **Dataset and constraints:** approve project details, costs, benefit labels, `P-03 → P-04`, `P-01 ↔ P-08`, and phased `P-06`.
2. **Priority comparison:** approve 0–3 importance controls and the illustrative weighted comparison.
3. **Invalid proposals:** approve visibly retaining the last invalid agent candidate with its issues (recommended).
4. **Stack:** approve React + TypeScript + Vite, pnpm, Vitest/Testing Library and Playwright.
5. **Repository:** approve initialising the currently non-Git directory as a repository in Stage 1.
6. **Hosting:** select/approve a static HTTPS host.
7. **Final record:** approve copyable on-screen record as MVP, with print-specific formatting first in cut order.

## 9. Definition of done

The MVP is done only when:

- all non-cuttable scope is implemented;
- exactly eight approved projects and six approved tools ship;
- all domain, state, component, contract and end-to-end checks pass from a clean install;
- production build and public HTTPS deployment pass;
- tool results and visible state are proven identical in ChatGPT's browser;
- stale/fabricated revisions cannot reach review;
- no tool can accept, finalise or reset;
- human finalisation produces the specified transparent record;
- manual fallback completes without WebMCP;
- accessibility requirements and complete reset are verified;
- the demonstration completes in under three minutes; and
- documentation makes no claim of real government use or WebMCP-native confirmation security.

## 10. Go/no-go gates before final polish

### Gate A — Domain go

Go only if the eight-project fixture is approved and every deterministic rule has passing pure tests.

### Gate B — Shared-state go

Go only if a WebMCP read sees the same revision/totals as the page and a proposal call produces the same visible proposal state.

### Gate C — Authority go

Go only if old/fabricated revisions are rejected, locks are preserved, no finalisation tool is discoverable, and only the visible human control can create a final record.

### Gate D — Journey go

Go only if the complete stale/revise/review/finalise/reset journey passes automatically and manually in ChatGPT's browser.

Failure at Gates B or C is a no-go for the WebMCP product claim. Failure at Gate D is a no-go for visual polish or public demo hardening.

