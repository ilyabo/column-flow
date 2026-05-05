import type {ColumnFlowData} from "./types";

export type NestedColumnFlowColumn<TNode> = {
  id: string;
  label?: string;
  nodes: TNode[];
};

export type NestedColumnFlowNode = {
  id: string;
  [key: string]: unknown;
};

export function createColumnFlowData<
  TNode extends NestedColumnFlowNode,
  TLink
>(
  columns: Array<NestedColumnFlowColumn<TNode>>,
  links: TLink[]
): ColumnFlowData<TNode & {columnId: string}, TLink, {id: string; label: string}> {
  return {
    columns: columns.map((column) => ({
      id: column.id,
      label: column.label ?? column.id
    })),
    nodes: columns.flatMap((column) =>
      column.nodes.map((node) => ({...node, columnId: column.id}))
    ),
    links
  };
}
