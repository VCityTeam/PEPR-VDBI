---
theme: [dashboard, light]
sql:
  mural_data: ./data/private/Cartographie PEPR VDBI-1748013777151.csv
---

```js
import {
  staticGraph,
  mapTableToPropertyGraphLinks,
  mapTableToTriples,
} from "./components/graph.js";
```

# Mural data

```sql id=projects
select
  -- *
  ID as id,
  Text as label,
  "BG Color" as "type",
  -- "Sticky type" as shape
  "Position X" as fx,
  "Position Y" as fy,
from mural_data
where Area = 'Cartographie (à compléter)'
```

```js
const project_graph = {
  nodes: [...projects].map((d) => d.toJSON()),
  links: []
};
display(project_graph)
```

```js
// const filtered_project_triples = {
//   nodes: project_triples.nodes.filter(
//     ({ type }) => project_triples_predicate_select == "" || type == project_triples_predicate_select || type == "acronyme"
//   ),
//   links: project_triples.links.filter(
//     ({ label }) => project_triples_predicate_select == "" ? true : label == project_triples_predicate_select
//   )
// };

const project_force_graph = (width) => staticGraph(
  project_graph,
  // filtered_project_triples,
  {
    id: "project_force_graph",
    width: width,
    height: width - 50,
    r: 20,
    fontSize: 50,
    keyMap: (d) => d.label,
    color: (d) => d.type,
    nodeLabelOpacity: 0.2,
    linkLabelOpacity: 0,
  }
);
```

```js
display(project_force_graph(1000))
```

```js
display(Inputs.table(projects))
```
