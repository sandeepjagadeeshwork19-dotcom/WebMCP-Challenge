/**
 * The immutable hypothetical dataset for the demonstration.
 *
 * All projects, costs, benefits, neighbourhoods and community-support indicators
 * are invented for this demo. Nothing here is real municipal data.
 */

import type { Project, ProjectId } from "./types";

export const DATASET_VERSION = "demo-budget-v1" as const;

export const FUND_LIMIT = 1_000_000 as const;

/** Currency is displayed to the nearest $10,000. */
export const DISPLAY_ROUNDING = 10_000 as const;

export const PRIORITY_KEYS = [
  "safety",
  "accessibility",
  "climate",
  "communitySupport",
] as const;

export const P06_ALLOWED_AMOUNTS = [60_000, 90_000, 120_000] as const;

const RAW_PROJECTS: readonly Project[] = [
  {
    id: "P-01",
    name: "Safer pedestrian crossings",
    description:
      "Raised crossings, curb extensions and brighter lighting at two busy Willow Avenue junctions.",
    neighbourhood: "Northgate / Willow Avenue",
    category: "Pedestrian safety",
    peopleServed: "About 3,000 regular walkers and nearby residents",
    cost: 180_000,
    fundingRule: { kind: "complete", cost: 180_000 },
    benefits: { safety: "High", accessibility: "Medium", climate: "Low" },
    communitySupport: "High",
    dependencies: [],
    incompatibilities: ["P-08"],
    minimumViableFunding: "Full $180,000 or not selected.",
    hypotheticalAssumption:
      "Two junctions can be reconstructed within the stated amount; benefit ratings reflect slower vehicle turns and shorter crossing distances.",
  },
  {
    id: "P-02",
    name: "Accessible bus stops",
    description:
      "Rebuild six Market Corridor stops with raised boarding pads, seating, shelter and tactile wayfinding.",
    neighbourhood: "Market Corridor",
    category: "Accessible transport",
    peopleServed: "About 1,500 regular riders",
    cost: 150_000,
    fundingRule: { kind: "complete", cost: 150_000 },
    benefits: { safety: "Medium", accessibility: "High", climate: "Medium" },
    communitySupport: "High",
    dependencies: [],
    incompatibilities: [],
    minimumViableFunding: "Full $150,000 or not selected.",
    hypotheticalAssumption:
      "Existing right-of-way is sufficient and six stops can be rebuilt without land acquisition.",
  },
  {
    id: "P-03",
    name: "Riverside playground renovation",
    description:
      "Replace worn equipment with an inclusive play structure, shaded seating and a safer resilient surface.",
    neighbourhood: "Riverside",
    category: "Parks and play",
    peopleServed: "About 900 children and caregivers",
    cost: 210_000,
    fundingRule: { kind: "complete", cost: 210_000 },
    benefits: { safety: "Medium", accessibility: "High", climate: "Low" },
    communitySupport: "High",
    dependencies: ["P-04"],
    incompatibilities: [],
    minimumViableFunding: "Full $210,000 or not selected.",
    hypotheticalAssumption:
      "The amount replaces one compact play area; drainage must be fixed first so the new surface is durable and safely accessible.",
  },
  {
    id: "P-04",
    name: "Riverside flood-drainage improvements",
    description:
      "Enlarge two storm inlets and add a planted drainage basin beside Riverside Park.",
    neighbourhood: "Riverside",
    category: "Flood resilience",
    peopleServed: "About 2,500 nearby residents and park users",
    cost: 240_000,
    fundingRule: { kind: "complete", cost: 240_000 },
    benefits: { safety: "High", accessibility: "Medium", climate: "High" },
    communitySupport: "High",
    dependencies: [],
    incompatibilities: [],
    minimumViableFunding: "Full $240,000 or not selected.",
    hypotheticalAssumption:
      "The defined work addresses routine surface flooding but is not represented as complete watershed protection.",
  },
  {
    id: "P-05",
    name: "Community health-centre equipment",
    description:
      "Equip two examination rooms and add an accessible diagnostic station at the Central Health Centre.",
    neighbourhood: "Central",
    category: "Community health",
    peopleServed: "About 4,000 patients each year",
    cost: 160_000,
    fundingRule: { kind: "complete", cost: 160_000 },
    benefits: { safety: "Medium", accessibility: "High", climate: "Low" },
    communitySupport: "High",
    dependencies: [],
    incompatibilities: [],
    minimumViableFunding: "Full $160,000 or not selected.",
    hypotheticalAssumption:
      "The building, staffing and operating budget already exist; only durable equipment is part of this capital exercise.",
  },
  {
    id: "P-06",
    name: "Street-tree programme",
    description:
      "Plant shade trees with soil cells and two years of establishment care on heat-exposed residential blocks.",
    neighbourhood: "Neighbourhood-wide, prioritising Southbank blocks",
    category: "Urban greening",
    peopleServed: "About 2,000 residents at full funding; lower phases cover fewer blocks",
    cost: 120_000,
    fundingRule: { kind: "phased", allowedAmounts: [60_000, 90_000, 120_000] },
    benefits: { safety: "Low", accessibility: "Low", climate: "High" },
    communitySupport: "Moderate",
    dependencies: [],
    incompatibilities: [],
    minimumViableFunding:
      "$60,000 minimum; allowed allocations are exactly $60,000, $90,000, or $120,000.",
    hypotheticalAssumption:
      "Each $30,000 above the minimum adds one additional block group; partial funding below $60,000 would not cover establishment care and is invalid.",
  },
  {
    id: "P-07",
    name: "Public-library study space",
    description:
      "Convert an underused room into a quiet, accessible study space with durable furniture, power and task lighting.",
    neighbourhood: "West End",
    category: "Learning and public space",
    peopleServed: "About 1,200 regular learners and library users",
    cost: 140_000,
    fundingRule: { kind: "complete", cost: 140_000 },
    benefits: { safety: "Low", accessibility: "Medium", climate: "Low" },
    communitySupport: "Moderate",
    dependencies: [],
    incompatibilities: [],
    minimumViableFunding: "Full $140,000 or not selected.",
    hypotheticalAssumption:
      "Structural work is unnecessary; the amount covers fit-out and accessible furnishings only.",
  },
  {
    id: "P-08",
    name: "Protected cycling connection",
    description:
      "Build a protected one-kilometre cycling link along Willow Avenue between Northgate and the Market Corridor.",
    neighbourhood: "Northgate / Willow Avenue",
    category: "Active transport",
    peopleServed: "About 2,000 regular riders and corridor users",
    cost: 260_000,
    fundingRule: { kind: "complete", cost: 260_000 },
    benefits: { safety: "High", accessibility: "Medium", climate: "High" },
    communitySupport: "Moderate",
    dependencies: [],
    incompatibilities: ["P-01"],
    minimumViableFunding: "Full $260,000 or not selected.",
    hypotheticalAssumption:
      "The amount covers the protected link only, not a network-wide route.",
  },
] as const;

function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object") {
    Object.freeze(value);
    for (const key of Object.keys(value as Record<string, unknown>)) {
      deepFreeze((value as Record<string, unknown>)[key]);
    }
  }
  return value;
}

/** The eight projects in their stable canonical order. */
export const PROJECTS: readonly Project[] = deepFreeze(RAW_PROJECTS);

export const PROJECT_IDS: readonly ProjectId[] = PROJECTS.map((p) => p.id);

const PROJECT_BY_ID: ReadonlyMap<ProjectId, Project> = new Map(
  PROJECTS.map((p) => [p.id, p]),
);

export function isProjectId(value: unknown): value is ProjectId {
  return typeof value === "string" && PROJECT_BY_ID.has(value as ProjectId);
}

export function getProject(id: ProjectId): Project {
  const project = PROJECT_BY_ID.get(id);
  if (!project) {
    throw new Error(`Unknown project id: ${id}`);
  }
  return project;
}

export const MAX_PROJECT_COST = Math.max(...PROJECTS.map((p) => p.cost));
