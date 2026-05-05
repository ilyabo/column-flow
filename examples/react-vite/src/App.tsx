import { ColumnFlow, type ColumnFlowNodeRenderContext } from "column-flow";
import { Info, RotateCcw } from "lucide-react";
import type { CSSProperties } from "react";
import { useMemo, useState } from "react";

type Stage = {
  id: string;
  label: string;
  color: string;
};

type CompanyNode = {
  id: string;
  stage: string;
  name: string;
  country: string;
  summary: string;
  tone?: "muted" | "accent";
};

type TradeLink = {
  id: string;
  source: string;
  target: string;
  commodity: string;
};

const stages: Stage[] = [
  {id: "production", label: "Crude production", color: "#0f766e"},
  {id: "transport", label: "Pipeline & shipping", color: "#7c3aed"},
  {id: "refining", label: "Refining", color: "#f2c14e"},
  {id: "markets", label: "Fuel markets", color: "#2563eb"}
];

const companies: CompanyNode[] = [
  {
    id: "northstar",
    stage: "production",
    name: "Northstar Offshore",
    country: "Norway",
    summary: "Synthetic offshore operator producing medium crude blends."
  },
  {
    id: "canyon",
    stage: "production",
    name: "Canyon Basin Energy",
    country: "United States",
    summary: "Onshore producer feeding pipeline networks and coastal terminals.",
    tone: "accent"
  },
  {
    id: "delta",
    stage: "production",
    name: "Delta Shelf Partners",
    country: "Brazil",
    summary: "Deepwater crude producer with export terminal capacity."
  },
  {
    id: "transgulf",
    stage: "transport",
    name: "TransGulf Pipeline",
    country: "United States",
    summary: "Regional pipeline network moving crude to refinery hubs."
  },
  {
    id: "bluewater",
    stage: "transport",
    name: "Bluewater Tankers",
    country: "Singapore",
    summary: "Marine carrier linking export terminals with coastal refineries."
  },
  {
    id: "harborgrid",
    stage: "transport",
    name: "Harborgrid Storage",
    country: "Netherlands",
    summary: "Terminal operator blending and storing crude cargoes."
  },
  {
    id: "riverbend",
    stage: "refining",
    name: "Riverbend Refining",
    country: "United Kingdom",
    summary: "Refinery producing gasoline, diesel, and aviation fuel.",
    tone: "accent"
  },
  {
    id: "sundial",
    stage: "refining",
    name: "Sundial Petrochem",
    country: "Spain",
    summary: "Integrated refinery and petrochemical complex."
  },
  {
    id: "pacific",
    stage: "refining",
    name: "Pacific Hydrocrack",
    country: "Japan",
    summary: "Refiner focused on low-sulfur transport fuels."
  },
  {
    id: "metro",
    stage: "markets",
    name: "MetroFuel Retail",
    country: "France",
    summary: "Retail fuel network supplied by regional refineries.",
    tone: "accent"
  },
  {
    id: "skyport",
    stage: "markets",
    name: "Skyport Aviation",
    country: "United Arab Emirates",
    summary: "Airport fuel buyer sourcing jet fuel contracts."
  },
  {
    id: "polymer",
    stage: "markets",
    name: "PolymerWorks",
    country: "Germany",
    summary: "Petrochemical manufacturer using naphtha feedstock."
  },
  {
    id: "coastline",
    stage: "markets",
    name: "Coastline Diesel",
    country: "Canada",
    summary: "Wholesale distributor serving fleet fuel contracts."
  }
];

const relationships: TradeLink[] = [
  {id: "canyon-transgulf", source: "canyon", target: "transgulf", commodity: "Light sweet crude"},
  {id: "canyon-harborgrid", source: "canyon", target: "harborgrid", commodity: "Pipeline blend"},
  {id: "northstar-bluewater", source: "northstar", target: "bluewater", commodity: "North Sea crude"},
  {id: "delta-bluewater", source: "delta", target: "bluewater", commodity: "Deepwater crude"},
  {id: "transgulf-riverbend", source: "transgulf", target: "riverbend", commodity: "Crude delivery"},
  {id: "bluewater-riverbend", source: "bluewater", target: "riverbend", commodity: "Seaborne crude"},
  {id: "bluewater-sundial", source: "bluewater", target: "sundial", commodity: "Seaborne crude"},
  {id: "harborgrid-pacific", source: "harborgrid", target: "pacific", commodity: "Blended feedstock"},
  {id: "riverbend-metro", source: "riverbend", target: "metro", commodity: "Gasoline"},
  {id: "riverbend-skyport", source: "riverbend", target: "skyport", commodity: "Jet fuel"},
  {id: "riverbend-coastline", source: "riverbend", target: "coastline", commodity: "Diesel"},
  {id: "sundial-polymer", source: "sundial", target: "polymer", commodity: "Naphtha"},
  {id: "pacific-skyport", source: "pacific", target: "skyport", commodity: "Jet fuel"}
];

const accessors = {
  columnId: "id",
  columnLabel: "label",
  nodeId: "id",
  nodeColumnId: "stage",
  nodeLabel: "name",
  linkId: "id",
  linkSourceId: "source",
  linkTargetId: "target"
} as const;

export function App() {
  const [selectedNodeId, setSelectedNodeId] = useState<string>();
  const [selectedLinkId, setSelectedLinkId] = useState<string>();

  const selectedNode = companies.find((company) => company.id === selectedNodeId);
  const selectedLink = relationships.find((link) => link.id === selectedLinkId);
  const degreeByNode = useMemo(() => {
    const counts = new Map<string, number>();
    relationships.forEach((link) => {
      counts.set(link.source, (counts.get(link.source) ?? 0) + 1);
      counts.set(link.target, (counts.get(link.target) ?? 0) + 1);
    });
    return counts;
  }, []);

  return (
    <main className="min-h-screen bg-[#f4f7fb] text-[#263645]">
      <div className="flex min-h-screen flex-col gap-4 p-4 lg:flex-row">
        <section className="min-h-[620px] flex-1 overflow-hidden rounded-md border border-slate-200 bg-[#f4f7fb] shadow-sm">
          <ColumnFlow
            columns={stages}
            nodes={companies}
            links={relationships}
            accessors={accessors}
            style={
              {
                "--column-flow-background": "#f4f7fb",
                "--column-flow-text": "#263645",
                "--column-flow-link": "#64748b",
                "--column-flow-link-dimmed": "#d8dee8",
                "--column-flow-selected": "#1f2a44"
              } as CSSProperties
            }
            selectedNodeId={selectedNodeId}
            onSelectedNodeIdChange={setSelectedNodeId}
            onNodeClick={() => {
              setSelectedLinkId(undefined);
            }}
            onLinkClick={({linkId}) => setSelectedLinkId(linkId)}
            onCanvasClick={() => {
              setSelectedNodeId(undefined);
              setSelectedLinkId(undefined);
            }}
            getColumnColor={(stage) => stage.color}
            getNodeColor={(node) => stages.find((stage) => stage.id === node.stage)?.color ?? "#51606f"}
            nodeSort={(left, right) => right.degree - left.degree}
            renderNode={(context) => (
              <CompanyNode
                context={context}
                degree={degreeByNode.get(context.layout.id) ?? 0}
              />
            )}
          />
        </section>

        <aside className="w-full rounded-md border border-slate-200 bg-white p-5 shadow-sm lg:w-96">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">
                Selection
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-normal">
                ColumnFlow
              </h1>
            </div>
            <button
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50"
              type="button"
              aria-label="Reset selection"
              onClick={() => {
                setSelectedNodeId(undefined);
                setSelectedLinkId(undefined);
              }}
            >
              <RotateCcw size={16} />
            </button>
          </div>

          <div className="mt-6 rounded-md bg-slate-50 p-4">
            {selectedNode ? (
              <DetailBlock
                title={selectedNode.name}
                meta={`${stageLabel(selectedNode.stage)} / ${selectedNode.country}`}
                body={selectedNode.summary}
              />
            ) : selectedLink ? (
              <DetailBlock
                title={selectedLink.commodity}
                meta={`${nameFor(selectedLink.source)} -> ${nameFor(selectedLink.target)}`}
                body="Link click events expose the original link object, source node, target node, and layout geometry."
              />
            ) : (
              <div className="flex gap-3 text-sm leading-6 text-slate-600">
                <Info className="mt-0.5 shrink-0" size={18} />
                <p>
                  Click a company or a relationship to inspect the event payload.
                  Hovering dims unrelated parts of the graph.
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
            <Metric label="Nodes" value={companies.length} />
            <Metric label="Links" value={relationships.length} />
          </div>
        </aside>
      </div>
    </main>
  );
}

function CompanyNode({
  context,
  degree
}: {
  context: ColumnFlowNodeRenderContext<CompanyNode, Stage>;
  degree: number;
}) {
  const textColor = context.node.stage === "refining" ? "text-[#263645]" : "text-white";
  return (
    <span className={`flex w-full items-center justify-between gap-2 ${textColor}`}>
      <span className="truncate">{context.node.name}</span>
      {context.node.tone === "accent" ? (
        <span className="rounded-sm bg-white/25 px-1.5 py-0.5 text-[10px] leading-none">
          {degree}
        </span>
      ) : null}
    </span>
  );
}

function DetailBlock({
  title,
  meta,
  body
}: {
  title: string;
  meta: string;
  body: string;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase text-slate-500">
        {meta}
      </p>
      <h2 className="mt-1 text-xl font-semibold">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-slate-600">{body}</p>
    </div>
  );
}

function Metric({label, value}: {label: string; value: number}) {
  return (
    <div className="rounded-md border border-slate-200 p-3">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function stageLabel(stageId: string) {
  return stages.find((stage) => stage.id === stageId)?.label ?? stageId;
}

function nameFor(companyId: string) {
  return companies.find((company) => company.id === companyId)?.name ?? companyId;
}
