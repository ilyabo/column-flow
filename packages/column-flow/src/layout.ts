import { getAccessorValue, getRequiredAccessorValue } from "./accessors";
import type {
    ColumnFlowAccessors,
    ColumnFlowColumn,
    ColumnFlowColumnLayout,
    ColumnFlowContentPadding,
    ColumnFlowLayout,
    ColumnFlowLinkLayout,
    ColumnFlowNodeLayout
} from "./types";

type NormalizedPadding = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

type CreateLayoutOptions<TNode, TLink, TColumn> = {
  columns: TColumn[];
  nodes: TNode[];
  links: TLink[];
  accessors: ColumnFlowAccessors<TNode, TLink, TColumn>;
  width: number;
  height: number;
  rowHeight?: number;
  columnGap?: number;
  nodeWidthRatio?: number;
  headerHeight?: number;
  contentPadding?: ColumnFlowContentPadding;
  nodeSort?: (
    a: ColumnFlowNodeLayout<TNode, TColumn>,
    b: ColumnFlowNodeLayout<TNode, TColumn>
  ) => number;
};

export function normalizePadding(
  padding: ColumnFlowContentPadding | undefined
): NormalizedPadding {
  if (typeof padding === "number") {
    return {top: padding, right: padding, bottom: padding, left: padding};
  }
  return {
    top: padding?.top ?? 24,
    right: padding?.right ?? 24,
    bottom: padding?.bottom ?? 24,
    left: padding?.left ?? 24
  };
}

export function createColumnFlowLayout<TNode, TLink, TColumn>({
  columns,
  nodes,
  links,
  accessors,
  width,
  height,
  rowHeight = 28,
  columnGap = 72,
  nodeWidthRatio = 0.76,
  headerHeight = 96,
  contentPadding,
  nodeSort
}: CreateLayoutOptions<TNode, TLink, TColumn>): ColumnFlowLayout<
  TNode,
  TLink,
  TColumn
> {
  const padding = normalizePadding(contentPadding);
  const resolvedColumns: Array<ColumnFlowColumnLayout<TNode, TColumn>> = [];
  const columnsById = new Map<string, ColumnFlowColumnLayout<TNode, TColumn>>();
  const nodesById = new Map<string, ColumnFlowNodeLayout<TNode, TColumn>>();
  const linksById = new Map<string, ColumnFlowLinkLayout<TNode, TLink, TColumn>>();

  const safeWidth = Math.max(width, 1);
  const innerWidth = Math.max(safeWidth - padding.left - padding.right, 1);
  const visibleGap = columns.length > 1 ? columnGap : 0;
  const columnWidth = Math.max(
    (innerWidth - visibleGap * Math.max(columns.length - 1, 0)) /
      Math.max(columns.length, 1),
    1
  );

  columns.forEach((column, index) => {
    const id = getRequiredAccessorValue(column, accessors.columnId, "column id");
    const label = String(getAccessorValue(column, accessors.columnLabel, id));
    const layoutColumn: ColumnFlowColumnLayout<TNode, TColumn> = {
      id,
      label,
      data: column,
      index,
      x: padding.left + index * (columnWidth + visibleGap),
      width: columnWidth,
      nodes: []
    };
    resolvedColumns.push(layoutColumn);
    columnsById.set(id, layoutColumn);
  });

  nodes.forEach((node, index) => {
    const id = getRequiredAccessorValue(node, accessors.nodeId, "node id");
    const columnId = getRequiredAccessorValue(
      node,
      accessors.nodeColumnId,
      "node column id"
    );
    const column = columnsById.get(columnId);
    if (!column) {
      throw new Error(`ColumnFlow node "${id}" references unknown column "${columnId}".`);
    }
    const nodeWidth = Math.max(column.width * nodeWidthRatio, 1);
    const layoutNode: ColumnFlowNodeLayout<TNode, TColumn> = {
      id,
      label: String(getAccessorValue(node, accessors.nodeLabel, id)),
      columnId,
      column: column as ColumnFlowColumn<TColumn>,
      node,
      index,
      rowIndex: column.nodes.length,
      x: column.x + (column.width - nodeWidth) / 2,
      y: 0,
      width: nodeWidth,
      height: Math.max(rowHeight - 4, 1),
      centerX: 0,
      centerY: 0,
      inDegree: 0,
      outDegree: 0,
      degree: 0
    };
    column.nodes.push(layoutNode);
    nodesById.set(id, layoutNode);
  });

  links.forEach((link, index) => {
    const sourceId = getRequiredAccessorValue(
      link,
      accessors.linkSourceId,
      "link source id"
    );
    const targetId = getRequiredAccessorValue(
      link,
      accessors.linkTargetId,
      "link target id"
    );
    const source = nodesById.get(sourceId);
    const target = nodesById.get(targetId);
    if (!source || !target) return;
    source.outDegree += 1;
    target.inDegree += 1;
    const id = String(
      getAccessorValue(link, accessors.linkId, `${sourceId}->${targetId}:${index}`)
    );
    linksById.set(id, {
      id,
      link,
      sourceId,
      targetId,
      source,
      target,
      path: "",
      isReverse: source.column.index >= target.column.index
    });
  });

  nodesById.forEach((node) => {
    node.degree = node.inDegree + node.outDegree;
  });

  if (nodeSort) {
    resolvedColumns.forEach((column) => column.nodes.sort(nodeSort));
  }

  let maxRows = 0;
  resolvedColumns.forEach((column) => {
    maxRows = Math.max(maxRows, column.nodes.length);
    column.nodes.forEach((node, rowIndex) => {
      node.rowIndex = rowIndex;
      node.y = headerHeight + padding.top + rowIndex * rowHeight;
      node.centerX = node.x + node.width / 2;
      node.centerY = node.y + node.height / 2;
    });
  });

  linksById.forEach((link) => {
    let startX = link.source.x + link.source.width;
    let startY = link.source.centerY;
    let endX = link.target.x;
    let endY = link.target.centerY;
    if (startX > endX) {
      startX = link.target.x + link.target.width;
      startY = link.target.centerY;
      endX = link.source.x;
      endY = link.source.centerY;
    }
    const midX = (startX + endX) / 2;
    link.path = `M${round(startX)},${round(startY)} C${round(midX)},${round(
      startY
    )} ${round(midX)},${round(endY)} ${round(endX)},${round(endY)}`;
  });

  const contentHeight =
    headerHeight + padding.top + maxRows * rowHeight + padding.bottom;

  return {
    width: safeWidth,
    height: Math.max(height, 1),
    contentHeight: Math.max(contentHeight, height, 1),
    rowHeight,
    headerHeight,
    columns: resolvedColumns,
    nodes: Array.from(nodesById.values()),
    links: Array.from(linksById.values()),
    nodesById,
    linksById
  };
}

export function getConnectedNeighborhood<
  TNode,
  TLink,
  TColumn
>(
  layout: ColumnFlowLayout<TNode, TLink, TColumn>,
  nodeId: string | undefined
) {
  const nodeIds = new Set<string>();
  const linkIds = new Set<string>();
  if (!nodeId || !layout.nodesById.has(nodeId)) {
    return {nodeIds, linkIds};
  }

  const visit = (currentId: string) => {
    if (nodeIds.has(currentId)) return;
    nodeIds.add(currentId);
    layout.links.forEach((link) => {
      if (link.sourceId === currentId || link.targetId === currentId) {
        linkIds.add(link.id);
        visit(link.sourceId);
        visit(link.targetId);
      }
    });
  };

  visit(nodeId);
  return {nodeIds, linkIds};
}

function round(value: number) {
  return Math.round(value * 1000) / 1000;
}
