import {ColumnFlow} from "column-flow";
import {Info, RotateCcw} from "lucide-react";
import type {CSSProperties} from "react";
import {useEffect, useMemo, useState} from "react";
import {loadExampleData, type ExampleData} from "./loadCsvData";
import type {CompanyNode, Stage} from "./types";

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
  const [data, setData] = useState<ExampleData>();
  const [loadError, setLoadError] = useState<string>();
  const [selectedNodeId, setSelectedNodeId] = useState<string>();
  const [selectedLinkId, setSelectedLinkId] = useState<string>();

  useEffect(() => {
    let isMounted = true;
    loadExampleData()
      .then((nextData) => {
        if (isMounted) {
          setData(nextData);
        }
      })
      .catch((error: unknown) => {
        if (isMounted) {
          setLoadError(error instanceof Error ? error.message : String(error));
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const stages = data?.stages ?? [];
  const companies = data?.companies ?? [];
  const relationships = data?.relationships ?? [];
  const selectedNode = companies.find((company) => company.id === selectedNodeId);
  const selectedLink = relationships.find((link) => link.id === selectedLinkId);
  const connectionCounts = useMemo(() => {
    const counts = new Map<string, {incoming: number; outgoing: number}>();
    const ensureCounts = (nodeId: string) => {
      const existing = counts.get(nodeId);
      if (existing) return existing;
      const nextCounts = {incoming: 0, outgoing: 0};
      counts.set(nodeId, nextCounts);
      return nextCounts;
    };

    companies.forEach((company) => {
      ensureCounts(company.id);
    });
    relationships.forEach((link) => {
      ensureCounts(link.source).outgoing += 1;
      ensureCounts(link.target).incoming += 1;
    });
    return counts;
  }, [companies, relationships]);
  const selectedNodeCounts = selectedNodeId
    ? connectionCounts.get(selectedNodeId)
    : undefined;

  return (
    <main className="min-h-screen bg-[#f4f7fb] text-[#263645]">
      <div className="flex min-h-screen flex-col gap-4 p-4 lg:flex-row">
        <section className="min-h-[620px] flex-1 overflow-hidden rounded-md border border-slate-200 bg-[#f4f7fb] shadow-sm">
          {loadError ? (
            <div className="flex h-full min-h-[620px] items-center justify-center p-8 text-sm text-red-700">
              Failed to load CSV data: {loadError}
            </div>
          ) : data ? (
            <ColumnFlow
              columns={stages}
              nodes={companies}
              links={relationships}
              accessors={accessors}
              columnGap={40}
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
              getNodeColor={(node) =>
                stages.find((stage) => stage.id === node.stage)?.color ?? "#51606f"
              }
              nodeSort={(left, right) => right.degree - left.degree}
              renderNode={(context) => (
                <span
                  className={`block w-full truncate ${
                    context.node.stage === "refinery" ? "text-[#263645]" : "text-white"
                  }`}
                  title={context.node.name}
                >
                  {context.node.name}
                </span>
              )}
            />
          ) : (
            <div className="flex h-full min-h-[620px] items-center justify-center p-8 text-sm text-slate-600">
              Loading CSV data...
            </div>
          )}
        </section>

        <aside className="w-full rounded-md border border-slate-200 bg-white p-5 shadow-sm lg:w-96">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">
                Selection
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-normal">
                Palm Oil Supply Chain
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
                meta={`${stageLabel(stages, selectedNode.stage)} / ${selectedNode.country}`}
              />
            ) : selectedLink ? (
              <DetailBlock
                title={selectedLink.commodity}
                meta={`${nameFor(companies, selectedLink.source)} -> ${nameFor(
                  companies,
                  selectedLink.target
                )}`}
              />
            ) : (
              <div className="flex gap-3 text-sm leading-6 text-slate-600">
                <Info className="mt-0.5 shrink-0" size={18} />
                <p>
                  Click a company or a relationship to inspect it. Hovering
                  dims unrelated parts of the graph.
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
            {selectedNodeCounts ? (
              <>
                <Metric label="Incoming" value={selectedNodeCounts.incoming} />
                <Metric label="Outgoing" value={selectedNodeCounts.outgoing} />
              </>
            ) : (
              <>
                <Metric label="Companies" value={companies.length} />
                <Metric label="Relationships" value={relationships.length} />
              </>
            )}
          </div>

          <div className="mt-6">
            <p className="text-xs font-medium text-slate-500">Stages</p>
            <ul className="mt-2 space-y-1.5 text-sm">
              {stages.map((stage) => (
                <li className="flex items-center gap-2" key={stage.id}>
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{backgroundColor: stage.color}}
                  />
                  <span>{stage.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </main>
  );
}

function DetailBlock({title, meta}: {title: string; meta: string}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase text-slate-500">{meta}</p>
      <h2 className="mt-1 text-xl font-semibold">{title}</h2>
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

function stageLabel(stages: Stage[], stageId: string) {
  return stages.find((stage) => stage.id === stageId)?.label ?? stageId;
}

function nameFor(companies: CompanyNode[], companyId: string) {
  return companies.find((company) => company.id === companyId)?.name ?? companyId;
}
