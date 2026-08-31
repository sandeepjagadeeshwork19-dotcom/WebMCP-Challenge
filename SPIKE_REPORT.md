# Phase 1 CPSC / WebMCP Feasibility Spike

## Purpose and scope

This disposable spike was intended to test whether authoritative CPSC recall identifiers can support deterministic product matching before testing WebMCP shared state and an application-owned human-verification gate. The specification requires an early stop when no sampled category supports that workflow honestly. The data investigation reached that stop condition, so no application, WebMCP tool registration, or gate implementation was created.

Excluded as requested: complete product architecture, branding, final visual design, authentication, OCR, notifications, multiple-country support, manufacturer integrations, and submission materials.

## Repository baseline

- Workspace: `C:\Users\sande\WebMCP-Challenge`.
- The workspace was empty before this spike and contained no applicable `AGENTS.md`.
- `git status --short --branch` failed with `fatal: not a git repository`; there was no existing worktree or unrelated change to modify.
- There was no application architecture, dependency manifest, state store, test suite, lint/typecheck/build configuration, or deployment configuration to inspect or run.
- Available runtimes: Node `v26.3.0`, pnpm `11.19.0`, Git `2.42.0.windows.2`.
- Pre-existing environment failure: `npm --version` failed because `C:\Users\sande\AppData\Roaming\npm\node_modules\npm\bin\npm-cli.js` was missing.
- Because the data premise failed, only isolated research artifacts were added at the workspace root.

## Official sources used

- [CPSC Recalls API information](https://www.cpsc.gov/Recalls/CPSC-Recalls-Application-Program-Interface-API-Information)
- [CPSC Recall Retrieval Web Services Programmer's Guide, version 1.4](https://www.cpsc.gov/s3fs-public/RecallRetrievalWebServicesProgrammersGuide20180917.pdf)
- Official Recall API queries:
  - `http://www.saferproducts.gov/RestWebServices/Recall?ProductName=stroller&format=json`
  - `http://www.saferproducts.gov/RestWebServices/Recall?ProductName=Toddler&format=json`
- Selected records were cross-checked against their current official pages, including [Thule recall 20-164](https://www.cpsc.gov/Recalls/2020/Thule-Recalls-Strollers-Due-to-Injury-Hazard), [Aria Child recall 17-057](https://www.cpsc.gov/Recalls/2017/Aria-Child-Recalls-Strollers), and [Woodure recall 26-658](https://www.cpsc.gov/Recalls/2026/Woodure-Toddler-Kitchen-Step-Stools-Recalled-Due-to-Risk-of-Serious-Injury-and-Death-from-Entrapment-and-Fall-Hazards-Imported-by-Shenzhen-Muqiqu-Creative-Development).

The documented HTTPS API endpoint returned the SaferProducts.gov maintenance page from this machine. To avoid mistaking that availability failure for a data result, the same official API responses were fetched through the read-only `r.jina.ai` pass-through. The JSON payload after the pass-through wrapper was preserved without changing official field values. Retrieval date: `2026-08-31`.

## Records and categories sampled

The sample contains every record returned by each case-insensitive `ProductName` query, not a hand-picked subset:

| Query label | API query | Records inspected |
| --- | --- | ---: |
| Strollers | `ProductName=stroller` | 111 |
| Toddler products | `ProductName=Toddler` | 77 |
| Total |  | 188 |

These are plausible product-name cohorts rather than CPSC taxonomy exports. They overlap where a record's product name contains both terms; the per-query measurements remain complete for each returned result set.

## Structured identifier population

"Usable UPC" means the official `ProductUPCs[].UPC` value normalizes to 8, 12, 13, or 14 digits. Free-text identifiers are not counted as structured values.

| Measure | Strollers | Toddler products |
| --- | ---: | ---: |
| Total records | 111 | 77 |
| Usable `Products[].Model` | 0 (0.0%) | 0 (0.0%) |
| Usable `ProductUPCs[].UPC` | 1 (0.9%) | 1 (1.3%) |
| Empty structured model | 111 | 77 |
| Empty structured UPC | 110 | 76 |
| Malformed populated UPC | 0 | 0 |
| Ambiguous recall-level UPC set | 1 | 1 |
| Multiple structured model values | 0 | 0 |
| Multiple product entries in one recall | 10 | 7 |
| Model signal only in free text | 81 | 29 |
| UPC signal only in free text | 2 | 0 |

The two populated UPC records are:

- Recall `20164`, Thule Sleek strollers: 13 structured UPC values attached to the recall as a whole.
- Recall `22232`, Toddleroo rotating cabinet latches: two structured UPC values attached to the recall as a whole.

Both are classified as ambiguous for product-variant attribution because `ProductUPCs` is a top-level recall collection, not a value attached to an individual `Products[]` entry. Exact agreement can identify the recall, but the schema does not prove which product variant a UPC belongs to when several identifiers are listed.

## Formatting and multi-model findings

- There is no structured model format to normalize in either cohort because all 188 `Products[].Model` values are empty.
- Model formatting in narrative descriptions is inconsistent: examples include hyphenated alphanumeric values (`10AW1G-AQU2U`), short alphanumeric values (`WD1764`), underscored values (`DASH_V5_5`), plain numeric values (`6178`), and compact ranges (`11000001-5`, `11000337-342`).
- Authentic recalls can contain multiple affected models only in narrative text while the structured model field remains empty. Recall `17057` lists five Qbit stroller model numbers in `Description`; recall `26658` lists three Woodure stool models. These are evidence of a real schema gap, not normalized identifiers used by the spike.
- Ten stroller records and seven toddler-product records contain multiple `Products[]` entries, while UPCs remain recall-level. This makes identifier-to-product attribution ambiguous whenever a multi-product record has UPCs.
- The free-text counts above are conservative regex signals used only for data-quality measurement. No extracted value is presented as an authoritative structured identifier.

## Authentic near-match availability

No authentic structured near-match with a conflicting model or UPC exists within either complete cohort. Each cohort contains only one record with structured UPCs and no record with a structured model, so a genuine conflicting structured pair cannot be demonstrated. Similar products do exist—for example, several toddler tower recalls—but their identifiers remain in narrative text or absent, which yields an unresolved candidate rather than an honest deterministic rejection case. No near-match was fabricated.

## Selected category

Toddler products had the strongest measured UPC coverage, at 1 of 77 records (1.3%), but it still had 0 structured models and only one UPC-populated recall. That is insufficient to seed a truthful exact/possible/rejected workflow using authoritative structured identifiers. Therefore no category was selected for an application fixture.

## Fixture locations

- Unchanged official source-value fixtures:
  - `fixtures/raw/cpsc-strollers.json`
  - `fixtures/raw/cpsc-toddler-products.json`
- Separate normalized analysis fixture: `fixtures/normalized/cpsc-sample.json`
- Reproducible metrics: `fixtures/analysis.json`
- Retrieval and analysis script: `scripts/analyze-cpsc.mjs`

The normalized fixture retains recall number, recall date, title, product name, product description, product model, UPC, hazard, remedy, official URL, and retrieval date. It is analysis-only: there is no application because the stop condition was reached.

## Browser CORS result and exact method

The CORS probe is separate from command-line, crawler, robots, and endpoint-availability checks.

1. Served `experiments/cors-test.html` from `http://127.0.0.1:4174`.
2. Opened that page in the Codex in-app Chromium browser.
3. The page executed a normal cross-origin `fetch()` to the documented SaferProducts recall endpoint.
4. Normal CORS fetch result: `TypeError: Failed to fetch`.
5. The same page executed a `mode: "no-cors"` control request. It resolved with `status: 0` and `responseType: "opaque"`.

The control demonstrates that the browser can issue the network request but cannot expose the response to page JavaScript. Therefore the API is not browser-readable from this localhost origin under normal CORS rules. The API's separate maintenance response was recorded as an availability issue, not used as CORS evidence.

## Interaction experiment results

- Tool registration: not attempted; the required data premise failed at the Stage 2 stop condition.
- Shared application state between WebMCP calls and visible actions: not tested.
- Premature advancement rejection: not implemented or tested.
- Fabricated-argument bypass: not implemented or tested.
- Human verification: not implemented or tested.
- Evidence invalidation: not implemented or tested.
- Reset reliability: not implemented or tested.

No claim is made about ChatGPT WebMCP runtime compatibility or a native non-bypassable confirmation boundary.

## Automated commands and results

- `git status --short --branch` — failed before changes because the workspace is not a Git repository.
- Runtime/version checks — Node, pnpm, and Git available; npm shim failed as recorded in the baseline.
- Existing tests/typecheck/lint/build — none existed in the empty workspace.
- `node scripts/analyze-cpsc.mjs` — passed; preserved and analyzed 111 stroller plus 77 toddler-product records.
- `node --check scripts/analyze-cpsc.mjs` — passed.
- JSON parse validation — passed for both raw fixtures, the 188-record normalized fixture, and `fixtures/analysis.json`.
- Production build and application tests — not applicable because the mandated data-stage rejection stopped implementation before an application existed.

## Manual ChatGPT tests still required

None are required to validate this stopped spike's data verdict. WebMCP discovery, shared-state behavior, and advancement-gate checks remain untested because implementing them after the failed data premise would violate the requested stop condition.

## Known limitations

- The two cohorts are product-name wildcard query results, not mutually exclusive official taxonomy categories.
- Direct API access from this machine was unavailable during the spike; raw payloads were obtained through a read-only pass-through and selected values were cross-checked against current CPSC pages.
- Free-text identifier signals are heuristic measurements and deliberately were not promoted into authoritative fixture fields.
- This spike answers the structured-data feasibility question negatively. It does not answer the independent WebMCP runtime/state questions because the specification required stopping first.

## Final verdict

`REJECT`

Across 188 authentic CPSC API records, structured ProductModel coverage was 0%, structured UPC coverage was only 0.9% and 1.3%, and populated UPCs were recall-level collections with ambiguous product-variant attribution. The intended deterministic model/UPC workflow cannot be demonstrated truthfully from these official structured fields, so the spike stops before application implementation.
