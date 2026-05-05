import {useMemo, useState} from "react";
import type {CSSProperties, MouseEventHandler} from "react";
import {createColumnFlowLayout, getConnectedNeighborhood} from "./layout";
import type {
  ColumnFlowLinkLayout,
  ColumnFlowNodeLayout,
  ColumnFlowNodeRenderContext,
  ColumnFlowProps
} from "./types";
import {useElementSize} from "./useElementSize";

const DEFAULT_COLORS = [
  "#4d6c7d",
  "#6a6e7a",
  "#ddddf2",
  "#8f9d35",
  "#a4776c",
  "#947372"
];

export function ColumnFlow<TNode, TLink, TColumn>({
  columns,
  nodes,
  links,
  accessors,
  className,
  style,
  rowHeight = 28,
  columnGap = 72,
  nodeWidthRatio = 0.76,
  headerHeight = 96,
  contentPadding,
  selectedNodeId,
  defaultSelectedNodeId,
  onSelectedNodeIdChange,
  nodeSort,
  getNodeColor,
  getColumnColor,
  renderNode,
  onNodeClick,
  onLinkClick,
  onCanvasClick
}: ColumnFlowProps<TNode, TLink, TColumn>) {
  const [setContainer, size] = useElementSize<HTMLDivElement>();
  const [uncontrolledSelectedNodeId, setUncontrolledSelectedNodeId] = useState(
    defaultSelectedNodeId
  );
  const [hoveredNodeId, setHoveredNodeId] = useState<string>();
  const [hoveredLinkId, setHoveredLinkId] = useState<string>();

  const activeSelectedNodeId = selectedNodeId ?? uncontrolledSelectedNodeId;
  const activeNodeId = hoveredNodeId ?? activeSelectedNodeId;

  const layout = useMemo(
    () =>
      createColumnFlowLayout({
        columns,
        nodes,
        links,
        accessors,
        width: size.width,
        height: size.height,
        rowHeight,
        columnGap,
        nodeWidthRatio,
        headerHeight,
        contentPadding,
        nodeSort
      }),
    [
      accessors,
      columnGap,
      columns,
      contentPadding,
      headerHeight,
      links,
      nodeSort,
      nodeWidthRatio,
      nodes,
      rowHeight,
      size.height,
      size.width
    ]
  );

  const connected = useMemo(
    () => getConnectedNeighborhood(layout, activeNodeId),
    [activeNodeId, layout]
  );

  const hasActiveState = Boolean(activeNodeId || hoveredLinkId);
  const selectedLink = hoveredLinkId ? layout.linksById.get(hoveredLinkId) : undefined;
  const highlightedColumnIds = useMemo(() => {
    const columnIds = new Set<string>();
    const activeNode = activeNodeId ? layout.nodesById.get(activeNodeId) : undefined;
    if (activeNode) {
      columnIds.add(activeNode.columnId);
    }
    const hoveredLink = hoveredLinkId ? layout.linksById.get(hoveredLinkId) : undefined;
    if (hoveredLink) {
      columnIds.add(hoveredLink.source.columnId);
      columnIds.add(hoveredLink.target.columnId);
    }
    return columnIds;
  }, [activeNodeId, hoveredLinkId, layout]);

  const setSelected = (nodeId: string | undefined) => {
    if (selectedNodeId === undefined) {
      setUncontrolledSelectedNodeId(nodeId);
    }
    onSelectedNodeIdChange?.(nodeId);
  };

  return (
    <div
      ref={setContainer}
      className={["column-flow", className].filter(Boolean).join(" ")}
      style={style}
      onMouseLeave={() => {
        setHoveredNodeId(undefined);
        setHoveredLinkId(undefined);
      }}
    >
      {size.width > 0 && size.height > 0 ? (
        <div
          className="column-flow__surface"
          style={{height: layout.contentHeight}}
          onClick={() => {
            setSelected(undefined);
            onCanvasClick?.();
          }}
        >
          <div className="column-flow__headers" style={{height: headerHeight}}>
            {layout.columns.map((column) => {
              const color =
                getColumnColor?.(column.data, column.index) ??
                DEFAULT_COLORS[column.index % DEFAULT_COLORS.length];
              return (
                <div
                  className={[
                    "column-flow__column-header",
                    highlightedColumnIds.has(column.id)
                      ? "column-flow__column-header--active"
                      : ""
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  key={column.id}
                  style={
                    {
                      "--column-flow-color": color,
                      left: column.x,
                      width: column.width,
                      height: layout.contentHeight
                    } as CSSProperties
                  }
                >
                  <div className="column-flow__column-title">
                    <span
                      className="column-flow__column-dot"
                      style={{backgroundColor: color}}
                    />
                    <span>{column.label}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <svg
            className="column-flow__links"
            width={layout.width}
            height={layout.contentHeight}
            aria-hidden="true"
          >
            {layout.links.map((link) => (
              <LinkPath
                key={link.id}
                link={link}
                isDimmed={
                  hasActiveState &&
                  link.id !== hoveredLinkId &&
                  !connected.linkIds.has(link.id)
                }
                isHighlighted={link.id === hoveredLinkId}
                onMouseEnter={() => setHoveredLinkId(link.id)}
                onMouseLeave={() => setHoveredLinkId(undefined)}
                onClick={(nativeEvent) => {
                  nativeEvent.stopPropagation();
                  onLinkClick?.({
                    link: link.link,
                    linkId: link.id,
                    source: link.source,
                    target: link.target,
                    layout: link,
                    nativeEvent
                  });
                }}
              />
            ))}
            {selectedLink ? (
              <path className="column-flow__link-selected" d={selectedLink.path} />
            ) : null}
          </svg>

          <div className="column-flow__nodes">
            {layout.nodes.map((node) => {
              const isSelected = activeSelectedNodeId === node.id;
              const isHovered = hoveredNodeId === node.id;
              const isConnected = !activeNodeId || connected.nodeIds.has(node.id);
              const isDimmed = hasActiveState && !isConnected;
              const context: ColumnFlowNodeRenderContext<TNode, TColumn> = {
                node: node.node,
                column: node.column,
                layout: node,
                state: {isSelected, isHovered, isDimmed, isConnected}
              };
              const color =
                getNodeColor?.(node.node, context) ??
                getColumnColor?.(node.column.data, node.column.index) ??
                DEFAULT_COLORS[node.column.index % DEFAULT_COLORS.length];
              return (
                <button
                  className={[
                    "column-flow__node",
                    isSelected ? "column-flow__node--selected" : "",
                    isHovered ? "column-flow__node--hovered" : "",
                    isDimmed ? "column-flow__node--dimmed" : ""
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  key={node.id}
                  type="button"
                  style={
                    {
                      "--column-flow-color": color,
                      left: node.x,
                      top: node.y,
                      width: node.width,
                      minHeight: node.height
                    } as CSSProperties
                  }
                  onMouseEnter={() => setHoveredNodeId(node.id)}
                  onMouseLeave={() => setHoveredNodeId(undefined)}
                  onClick={(nativeEvent) => {
                    nativeEvent.stopPropagation();
                    setSelected(activeSelectedNodeId === node.id ? undefined : node.id);
                    onNodeClick?.({
                      node: node.node,
                      nodeId: node.id,
                      column: node.column,
                      layout: node,
                      nativeEvent
                    });
                  }}
                >
                  {renderNode ? renderNode(context) : <DefaultNode node={node} />}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function DefaultNode<TNode, TColumn>({
  node
}: {
  node: ColumnFlowNodeLayout<TNode, TColumn>;
}) {
  return <span className="column-flow__node-label">{node.label}</span>;
}

function LinkPath<TNode, TLink, TColumn>({
  link,
  isDimmed,
  isHighlighted,
  onMouseEnter,
  onMouseLeave,
  onClick
}: {
  link: ColumnFlowLinkLayout<TNode, TLink, TColumn>;
  isDimmed: boolean;
  isHighlighted: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClick: MouseEventHandler<SVGPathElement>;
}) {
  return (
    <g>
      <path
        className={[
          "column-flow__link",
          isDimmed ? "column-flow__link--dimmed" : "",
          isHighlighted ? "column-flow__link--highlighted" : ""
        ]
          .filter(Boolean)
          .join(" ")}
        d={link.path}
      />
      <path
        className="column-flow__link-hit-area"
        d={link.path}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onClick={onClick}
      />
    </g>
  );
}
