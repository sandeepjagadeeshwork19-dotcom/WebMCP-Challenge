/**
 * The immutable hypothetical dataset for the demonstration.
 *
 * All projects, costs, benefits, neighbourhoods and community-support indicators
 * are invented for this demo. Nothing here is real municipal data.
 */

import type { Project, ProjectId } from "./types";

export const DATASET_VERSION = "demo-budget-v1" as const;

export const FUND_LIMIT = 1_000_000 as const;

/** Hypothetical Indian rupees, displayed to the nearest ₹10,000. */
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
    shortName: "road crossings",
    name: "Safer road crossings & footpath",
    description:
      "Table-top crossings, footpath repair and brighter street lights at two busy MG Road junctions in the ward.",
    neighbourhood: "MG Road junctions",
    category: "Pedestrian safety",
    peopleServed: "About 3,000 daily pedestrians and nearby residents",
    cost: 180_000,
    fundingRule: { kind: "complete", cost: 180_000 },
    benefits: { safety: "High", accessibility: "Medium", climate: "Low" },
    communitySupport: "High",
    dependencies: [],
    incompatibilities: ["P-08"],
    minimumViableFunding: "Full ₹1,80,000 or not selected.",
    hypotheticalAssumption:
      "Both junctions can be reworked within the stated amount; benefit ratings reflect slower turns and shorter crossing distances.",
  },
  {
    id: "P-02",
    shortName: "bus shelters",
    name: "Accessible bus shelters",
    description:
      "Rebuild six stops on the market road with raised boarding, seating, shade and tactile paving.",
    neighbourhood: "Market Road",
    category: "Accessible transport",
    peopleServed: "About 1,500 daily bus commuters",
    cost: 150_000,
    fundingRule: { kind: "complete", cost: 150_000 },
    benefits: { safety: "Medium", accessibility: "High", climate: "Medium" },
    communitySupport: "High",
    dependencies: [],
    incompatibilities: [],
    minimumViableFunding: "Full ₹1,50,000 or not selected.",
    hypotheticalAssumption:
      "The existing right-of-way is enough and six stops can be rebuilt without any land acquisition.",
  },
  {
    id: "P-03",
    shortName: "play area",
    name: "Riverside play area upgrade",
    description:
      "Replace broken equipment with inclusive play structures, shade and a safe soft surface at the riverside ground.",
    neighbourhood: "Riverside colony",
    category: "Parks and children",
    peopleServed: "About 900 children and parents",
    cost: 210_000,
    fundingRule: { kind: "complete", cost: 210_000 },
    benefits: { safety: "Medium", accessibility: "High", climate: "Low" },
    communitySupport: "High",
    dependencies: ["P-04"],
    incompatibilities: [],
    minimumViableFunding: "Full ₹2,10,000 or not selected.",
    hypotheticalAssumption:
      "The ground waterlogs every monsoon; the drain must be fixed first or the new surface will not last or stay safe.",
  },
  {
    id: "P-04",
    shortName: "storm-water drain",
    name: "Riverside storm-water drain",
    description:
      "Widen two stormwater drains and add a planted retention pit beside the riverside ground.",
    neighbourhood: "Riverside colony",
    category: "Flood resilience",
    peopleServed: "About 2,500 residents and ground users",
    cost: 240_000,
    fundingRule: { kind: "complete", cost: 240_000 },
    benefits: { safety: "High", accessibility: "Medium", climate: "High" },
    communitySupport: "High",
    dependencies: [],
    incompatibilities: [],
    minimumViableFunding: "Full ₹2,40,000 or not selected.",
    hypotheticalAssumption:
      "The work handles routine monsoon waterlogging on these lanes; it is not represented as full catchment protection.",
  },
  {
    id: "P-05",
    shortName: "PHC equipment",
    name: "Primary Health Centre equipment",
    description:
      "Equip two examination rooms and add an accessible diagnostic station at the ward Primary Health Centre.",
    neighbourhood: "Ward centre",
    category: "Public health",
    peopleServed: "About 4,000 patients each year",
    cost: 160_000,
    fundingRule: { kind: "complete", cost: 160_000 },
    benefits: { safety: "Medium", accessibility: "High", climate: "Low" },
    communitySupport: "High",
    dependencies: [],
    incompatibilities: [],
    minimumViableFunding: "Full ₹1,60,000 or not selected.",
    hypotheticalAssumption:
      "The building, staff and running costs already exist; only durable equipment is part of this fund.",
  },
  {
    id: "P-06",
    shortName: "tree drive",
    name: "Tree plantation & shade drive",
    description:
      "Plant avenue trees with tree guards and two years of upkeep on heat-exposed lanes across the ward.",
    neighbourhood: "Ward-wide, heat-exposed lanes",
    category: "Urban greening",
    peopleServed: "About 2,000 residents at full funding; lower phases cover fewer lanes",
    cost: 120_000,
    fundingRule: { kind: "phased", allowedAmounts: [60_000, 90_000, 120_000] },
    benefits: { safety: "Low", accessibility: "Low", climate: "High" },
    communitySupport: "Moderate",
    dependencies: [],
    incompatibilities: [],
    minimumViableFunding:
      "₹60,000 minimum; allowed allocations are exactly ₹60,000, ₹90,000, or ₹1,20,000.",
    hypotheticalAssumption:
      "Each ₹30,000 above the minimum covers one more lane; below ₹60,000 there is no upkeep budget and the saplings die.",
  },
  {
    id: "P-07",
    shortName: "study room",
    name: "Ward library study room",
    description:
      "Convert an unused room in the ward office into a quiet, accessible study room with furniture, power points and lighting.",
    neighbourhood: "Ward office",
    category: "Learning and public space",
    peopleServed: "About 1,200 students and readers",
    cost: 140_000,
    fundingRule: { kind: "complete", cost: 140_000 },
    benefits: { safety: "Low", accessibility: "Medium", climate: "Low" },
    communitySupport: "Moderate",
    dependencies: [],
    incompatibilities: [],
    minimumViableFunding: "Full ₹1,40,000 or not selected.",
    hypotheticalAssumption:
      "No structural work is needed; the amount covers furnishing and accessible fit-out only.",
  },
  {
    id: "P-08",
    shortName: "cycle track",
    name: "Protected cycle track",
    description:
      "Build a protected one-kilometre cycle track along MG Road linking the station and the market.",
    neighbourhood: "MG Road corridor",
    category: "Active transport",
    peopleServed: "About 2,000 daily cyclists and corridor users",
    cost: 260_000,
    fundingRule: { kind: "complete", cost: 260_000 },
    benefits: { safety: "High", accessibility: "Medium", climate: "High" },
    communitySupport: "Moderate",
    dependencies: [],
    incompatibilities: ["P-01"],
    minimumViableFunding: "Full ₹2,60,000 or not selected.",
    hypotheticalAssumption:
      "The amount covers this one protected stretch only, not a ward-wide cycle network.",
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
