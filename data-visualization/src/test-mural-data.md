---
theme: [light]
sql:
  mural_data: ./data/private/Cartographie PEPR VDBI-1748339060380.csv
  # mural_data: ./data/private/Cartographie PEPR VDBI-1748013777151.csv
---

```js
import {
  forceGraph,
  MuralGraph,
  mapTableToPropertyGraphLinks,
  mapTableToTriples,
} from "./components/graph.js"
import { circleLegend } from "./components/legend.js"
```

# Mural link editor

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

## Mural project data

```js echo
const project_graph_data = {
  nodes: [...projects].map((d) => d.toJSON()),
  links: [],
}
display(project_graph_data)
```

```js echo
const project_color_scale = new Map([
  ["#AAED92", "Projet PEPR VDBI"],
  ["#FCF281", "Projet externe"],
  ["#9EDCFA", "Centre Opérationel"],
  ["#FCB6D4", "Projet PEPR (externe)"],
  ["#0561A6", "Structure"],
  ["#FFC061", "other"],
])

const project_graph = new MuralGraph(project_graph_data, {
  id: "project_graph",
  width: 1000,
  height: 1000,
  margin: 500,
  r: 20,
  fontSize: 50,
  strokeWidth: 5,
  keyMap: (d) => d.label,
  valueMap: (d) => d.type,
  color: d3.scaleOrdinal(
    [...project_color_scale.keys()],
    [...project_color_scale.keys()]
  ),
  nodeLabelOpacity: 1,
  linkLabelOpacity: 1,
  nodeLabelOffset: 25,
  legend: circleLegend([...project_color_scale.values()], {
    keyMap: (d) => d,
    valueMap: (d) => d,
    color: d3.scaleOrdinal(
      [...project_color_scale.values()],
      [...project_color_scale.keys()]
    ),
    radius: 40,
    lineSeparation: 120,
    text: (d) => d,
    fontSize: 100,
    backgroundColor: "black",
    backgroundStroke: "black",
    backgroundOpacity: 0.1,
  }),
})
```

## Mural graph

<div class="card">${project_graph.getCanvas()}</div>

## Mural graph data

```js
const mural_links = (async function* () {
  while (true) {
    yield [...project_graph.links].map(({ source, target, label }) => {
      return {
        source: source.id,
        target: target.id,
        label: label,
      }
    })
    await new Promise((resolve) => setTimeout(resolve, 5000))
  }
})()
```

```js
import { copyTableToClipboardButton } from "./components/utilities.js"
```

```js
display(
  copyTableToClipboardButton(mural_links, {
    columns: ["source", "target", "label"],
  })
)
display(Inputs.table(mural_links))
```
