import type {CSSProperties, MouseEvent, ReactNode} from "react";

export type Accessor<T, TValue> = keyof T | ((item: T) => TValue);

export type ColumnFlowContentPadding =
  | number
  | Partial<{
      top: number;
      right: number;
      bottom: number;
      left: number;
    }>;

export type ColumnFlowColumn<TColumn = unknown> = {
  id: string;
  label: string;
  data: TColumn;
  index: number;
};

export type ColumnFlowAccessors<TNode, TLink, TColumn> = {
  columnId: Accessor<TColumn, string>;
  columnLabel?: Accessor<TColumn, string>;
  nodeId: Accessor<TNode, string>;
  nodeColumnId: Accessor<TNode, string>;
  nodeLabel?: Accessor<TNode, string>;
  linkId?: Accessor<TLink, string>;
  linkSourceId: Accessor<TLink, string>;
  linkTargetId: Accessor<TLink, string>;
};

export type ColumnFlowNodeLayout<TNode = unknown, TColumn = unknown> = {
  id: string;
  label: string;
  columnId: string;
  column: ColumnFlowColumn<TColumn>;
  node: TNode;
  index: number;
  rowIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  inDegree: number;
  outDegree: number;
  degree: number;
};

export type ColumnFlowColumnLayout<TNode = unknown, TColumn = unknown> =
  ColumnFlowColumn<TColumn> & {
    x: number;
    width: number;
    nodes: Array<ColumnFlowNodeLayout<TNode, TColumn>>;
  };

export type ColumnFlowLinkLayout<
  TNode = unknown,
  TLink = unknown,
  TColumn = unknown
> = {
  id: string;
  link: TLink;
  sourceId: string;
  targetId: string;
  source: ColumnFlowNodeLayout<TNode, TColumn>;
  target: ColumnFlowNodeLayout<TNode, TColumn>;
  path: string;
  isReverse: boolean;
};

export type ColumnFlowLayout<
  TNode = unknown,
  TLink = unknown,
  TColumn = unknown
> = {
  width: number;
  height: number;
  contentHeight: number;
  rowHeight: number;
  headerHeight: number;
  columns: Array<ColumnFlowColumnLayout<TNode, TColumn>>;
  nodes: Array<ColumnFlowNodeLayout<TNode, TColumn>>;
  links: Array<ColumnFlowLinkLayout<TNode, TLink, TColumn>>;
  nodesById: Map<string, ColumnFlowNodeLayout<TNode, TColumn>>;
  linksById: Map<string, ColumnFlowLinkLayout<TNode, TLink, TColumn>>;
};

export type ColumnFlowRenderState = {
  isSelected: boolean;
  isHovered: boolean;
  isDimmed: boolean;
  isConnected: boolean;
};

export type ColumnFlowNodeRenderContext<TNode, TColumn> = {
  node: TNode;
  column: ColumnFlowColumn<TColumn>;
  layout: ColumnFlowNodeLayout<TNode, TColumn>;
  state: ColumnFlowRenderState;
};

export type ColumnFlowNodeClickEvent<TNode, TColumn> = {
  node: TNode;
  nodeId: string;
  column: ColumnFlowColumn<TColumn>;
  layout: ColumnFlowNodeLayout<TNode, TColumn>;
  nativeEvent: MouseEvent<HTMLButtonElement>;
};

export type ColumnFlowLinkClickEvent<TNode, TLink, TColumn> = {
  link: TLink;
  linkId: string;
  source: ColumnFlowNodeLayout<TNode, TColumn>;
  target: ColumnFlowNodeLayout<TNode, TColumn>;
  layout: ColumnFlowLinkLayout<TNode, TLink, TColumn>;
  nativeEvent: MouseEvent<SVGPathElement>;
};

export type ColumnFlowData<TNode, TLink, TColumn> = {
  columns: TColumn[];
  nodes: TNode[];
  links: TLink[];
};

export type ColumnFlowProps<TNode, TLink, TColumn> = {
  columns: TColumn[];
  nodes: TNode[];
  links: TLink[];
  accessors: ColumnFlowAccessors<TNode, TLink, TColumn>;
  className?: string;
  style?: CSSProperties;
  rowHeight?: number;
  columnGap?: number;
  nodeWidthRatio?: number;
  headerHeight?: number;
  contentPadding?: ColumnFlowContentPadding;
  selectedNodeId?: string;
  defaultSelectedNodeId?: string;
  onSelectedNodeIdChange?: (nodeId: string | undefined) => void;
  nodeSort?: (
    a: ColumnFlowNodeLayout<TNode, TColumn>,
    b: ColumnFlowNodeLayout<TNode, TColumn>
  ) => number;
  getNodeColor?: (
    node: TNode,
    context: ColumnFlowNodeRenderContext<TNode, TColumn>
  ) => string;
  getColumnColor?: (column: TColumn, index: number) => string;
  renderNode?: (context: ColumnFlowNodeRenderContext<TNode, TColumn>) => ReactNode;
  onNodeClick?: (event: ColumnFlowNodeClickEvent<TNode, TColumn>) => void;
  onLinkClick?: (event: ColumnFlowLinkClickEvent<TNode, TLink, TColumn>) => void;
  onCanvasClick?: () => void;
};
