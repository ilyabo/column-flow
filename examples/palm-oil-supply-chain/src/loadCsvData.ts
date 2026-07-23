import {csvParse, type DSVRowString} from "d3-dsv";
import type {CompanyNode, Stage, TradeLink} from "./types";

export type ExampleData = {
  stages: Stage[];
  companies: CompanyNode[];
  relationships: TradeLink[];
};

export async function loadExampleData(): Promise<ExampleData> {
  const [stages, companies, relationships] = await Promise.all([
    loadCsv<Stage>("/data/stages.csv", (row) => ({
      id: row.id,
      label: row.label,
      color: row.color
    })),
    loadCsv<CompanyNode>("/data/companies.csv", (row) => ({
      id: row.id,
      stage: row.stage,
      name: row.name,
      country: row.country
    })),
    loadCsv<TradeLink>("/data/relationships.csv", (row) => ({
      id: row.id,
      source: row.source,
      target: row.target,
      commodity: row.commodity
    }))
  ]);

  return {stages, companies, relationships};
}

async function loadCsv<T>(
  url: string,
  mapRow: (row: DSVRowString<string>) => T
): Promise<T[]> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load ${url}: ${response.status}`);
  }
  return csvParse(await response.text()).map(mapRow);
}
