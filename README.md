# ColumnFlow

Reusable React component for column-organized node-link graphs.

ColumnFlow is useful for layered, multipartite, or staged relationship data where nodes belong to ordered columns and links connect nodes across those columns. It is visually related to Sankey diagrams, but it does not imply quantitative edge width.

```tsx
import {ColumnFlow} from "column-flow";
import "column-flow/style.css";

<ColumnFlow
  columns={columns}
  nodes={nodes}
  links={links}
  accessors={{
    columnId: "id",
    columnLabel: "label",
    nodeId: "id",
    nodeColumnId: "stage",
    nodeLabel: "name",
    linkSourceId: "source",
    linkTargetId: "target",
    linkId: "id"
  }}
  onNodeClick={({node}) => console.log(node)}
/>;
```
