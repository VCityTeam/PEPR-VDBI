---
theme: [light]
sql:
  mural_data: ./data/private/Cartographie PEPR VDBI-1748339060380.csv
  # mural_data: ./data/private/Cartographie PEPR VDBI-1748013777151.csv
---

```js
import {
  staticGraph,
  mapTableToPropertyGraphLinks,
  mapTableToTriples,
} from "./components/graph.js";
import {
  circleLegend,
} from "./components/legend.js";
```

# Mural data

projects ${Inputs.table(projects)}

```sql id=projects echo
select
  -- *
  ID as id,
  "Text" as label,
  "BG Color" as "type",
  -- "Sticky type" as shape
  "Position X" as fx,
  "Position Y" as fy,
from mural_data
where
  Area = 'Cartographie (à compléter)' and
  "Text" is not null
```

bounding_box ${Inputs.table(bounding_box)}

```sql id=bounding_box echo
select
  min("Position x") as min_x,
  min("Position Y") as min_y,
  max("Position X") as max_x,
  max("Position Y") as max_y,
from mural_data
where Area = 'Cartographie (à compléter)'

```

```js
const project_graph_data = {
  nodes: [...projects].map((d) => d.toJSON()),
  links: []
};
display(project_graph_data)
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
const project_colors = new Map([
  ["#AAED92", "Projet PEPR VDBI"],
  ["#FCF281", "Projet externe"],
  ["#9EDCFA", "Centre Opérationel"],
  ["#FCB6D4", "Projet PEPR (externe)"],
  ["#0561A6", "Structure"],
  ["#FFC061", "other"],
])

const project_graph = staticGraph(
  project_graph_data,
  {
    id: "project_graph",
    width: 1000,
    // height: width - 50,
    r: 20,
    fontSize: 50,
    keyMap: (d) => d.label,
    valueMap: (d) => d.type,
    color: (d) => d,
    nodeLabelOpacity: 0.5,
    linkLabelOpacity: 0,
    legend: circleLegend(
      [
        ...new Set(
          project_graph_data.nodes
            .map((d) => d.type)
            .filter((d) => d != null)
            .sort(d3.ascending)
        ),
      ],
      {
        keyMap: (d) => d,
        valueMap: (d) => d,
        color: (d) => d,
        radius: 40,
        lineSeparation: 120,
        text: (d) => project_colors.has(d) ? project_colors.get(d) : "",
        fontSize: 100,
        backgroundColor: 'black',
        backgroundStroke: 'black',
        backgroundOpacity: 0.1,
      }
    ),
  }
);
```

```js
const project_graph_selection = d3.select("#project_graph");
```

<div class="card">${project_graph}</div>
