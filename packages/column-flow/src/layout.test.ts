import {describe, expect, it} from "vitest";
import {createColumnFlowLayout, getConnectedNeighborhood} from "./layout";

type Column = {id: string; label: string};
type Node = {id: string; stage: string; name: string};
type Link = {id: string; source: string; target: string};

const columns: Column[] = [
  {id: "mining", label: "Mining"},
  {id: "smelting", label: "Smelting"},
  {id: "trading", label: "Trading"}
];

const nodes: Node[] = [
  {id: "a", stage: "mining", name: "A"},
  {id: "b", stage: "mining", name: "B"},
  {id: "c", stage: "smelting", name: "C"},
  {id: "d", stage: "trading", name: "D"}
];

const links: Link[] = [
  {id: "a-c", source: "a", target: "c"},
  {id: "c-d", source: "c", target: "d"}
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

describe("createColumnFlowLayout", () => {
  it("groups nodes by column and preserves input order by default", () => {
    const layout = createColumnFlowLayout({
      columns,
      nodes,
      links,
      accessors,
      width: 900,
      height: 500
    });

    expect(layout.columns.map((column) => column.id)).toEqual([
      "mining",
      "smelting",
      "trading"
    ]);
    expect(layout.columns[0].nodes.map((node) => node.id)).toEqual(["a", "b"]);
    expect(layout.columns[1].nodes.map((node) => node.id)).toEqual(["c"]);
  });

  it("sorts nodes with the supplied sorter", () => {
    const layout = createColumnFlowLayout({
      columns,
      nodes,
      links,
      accessors,
      width: 900,
      height: 500,
      nodeSort: (left, right) => right.degree - left.degree
    });

    expect(layout.columns[0].nodes.map((node) => node.id)).toEqual(["a", "b"]);
    expect(layout.columns[0].nodes[0].degree).toBe(1);
  });

  it("computes cubic link paths between node box edges", () => {
    const layout = createColumnFlowLayout({
      columns,
      nodes,
      links,
      accessors,
      width: 900,
      height: 500,
      rowHeight: 30,
      headerHeight: 80,
      contentPadding: 20
    });

    const link = layout.linksById.get("a-c");
    expect(link?.path).toMatch(/^M\d+(\.\d+)?,\d+(\.\d+)? C/);
    expect(link?.source.id).toBe("a");
    expect(link?.target.id).toBe("c");
  });
});

describe("getConnectedNeighborhood", () => {
  it("walks connected links and nodes from a selected node", () => {
    const layout = createColumnFlowLayout({
      columns,
      nodes,
      links,
      accessors,
      width: 900,
      height: 500
    });
    const neighborhood = getConnectedNeighborhood(layout, "a");

    expect(Array.from(neighborhood.nodeIds).sort()).toEqual(["a", "c", "d"]);
    expect(Array.from(neighborhood.linkIds).sort()).toEqual(["a-c", "c-d"]);
  });
});
