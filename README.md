# ColumnFlow

Reusable React component for supply chain visualizations and other column-organized node-link graphs.

<img width="1152" height="343" alt="image" src="https://github.com/user-attachments/assets/8c07fa01-829a-435b-9892-0e95a860cf3a" />

ColumnFlow is useful for supply chain maps, process networks, lineage views, and other layered or multipartite relationship data where nodes belong to ordered columns and links connect nodes across those columns. It is visually related to Sankey diagrams, but it does not imply quantitative edge width.

Live example: https://column-flow.pages.dev

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

## Data format

ColumnFlow expects three flat arrays:

- `columns`: ordered stages or lanes in the flow.
- `nodes`: entities that belong to one column.
- `links`: relationships between nodes.

The field names are configurable through `accessors`, so your data does not need to use the exact names below.

```ts
const columns = [
  {id: "production", label: "Crude production", color: "#0f766e"},
  {id: "transport", label: "Pipeline & shipping", color: "#7c3aed"},
  {id: "refining", label: "Refining", color: "#f2c14e"},
  {id: "markets", label: "Fuel markets", color: "#2563eb"}
];

const nodes = [
  {
    id: "northstar",
    stage: "production",
    name: "Northstar Offshore",
    country: "Norway"
  },
  {
    id: "riverbend",
    stage: "refining",
    name: "Riverbend Refining",
    country: "United Kingdom"
  }
];

const links = [
  {
    id: "northstar-riverbend",
    source: "northstar",
    target: "riverbend",
    commodity: "North Sea crude"
  }
];
```

Required relationships:

- `nodeId` must uniquely identify each node.
- `nodeColumnId` must match one `columnId`.
- `linkSourceId` and `linkTargetId` must match node ids.
- `columns` order controls left-to-right layout.

The React/Vite example loads the same shape from CSV files:

```csv
# stages.csv
id,label,color
production,Crude production,#0f766e

# companies.csv
id,stage,name,country,summary,tone
northstar,production,Northstar Offshore,Norway,Synthetic offshore operator producing medium crude blends,

# relationships.csv
id,source,target,commodity
northstar-bluewater,northstar,bluewater,North Sea crude
```
