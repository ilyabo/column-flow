import {ColumnFlow, type ColumnFlowNodeRenderContext} from "column-flow";
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
  const degreeByNode = useMemo(() => {
    const counts = new Map<string, number>();
    relationships.forEach((link) => {
      counts.set(link.source, (counts.get(link.source) ?? 0) + 1);
      counts.set(link.target, (counts.get(link.target) ?? 0) + 1);
    });
    return counts;
  }, [relationships]);

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
                <CompanyNodeView
                  context={context}
                  degree={degreeByNode.get(context.layout.id) ?? 0}
                />
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
                meta={`${stageLabel(stages, selectedNode.stage)} / ${selectedNode.country}`}
                body={selectedNode.summary}
              />
            ) : selectedLink ? (
              <DetailBlock
                title={selectedLink.commodity}
                meta={`${nameFor(companies, selectedLink.source)} -> ${nameFor(
                  companies,
                  selectedLink.target
                )}`}
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

function CompanyNodeView({
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
      <p className="text-xs font-semibold uppercase text-slate-500">{meta}</p>
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

function stageLabel(stages: Stage[], stageId: string) {
  return stages.find((stage) => stage.id === stageId)?.label ?? stageId;
}

function nameFor(companies: CompanyNode[], companyId: string) {
  return companies.find((company) => company.id === companyId)?.name ?? companyId;
}
