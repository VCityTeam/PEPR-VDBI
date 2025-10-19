---
style: /css/vdbi-page.css
sql:
  link_store: /data/private/mural_links.csv
  mural_store: /data/private/mural_export.csv
---

```js
import {
  forceGraph,
  MuralGraph,
  mapTableToPropertyGraphLinks,
  mapTableToTriples,
} from "/components/graph.js"
import { circleLegend } from "/components/legend.js"
```

# Mural link editor

Mural export ${Inputs.table(mural_export)}

```js
const csvfile = view(
  Inputs.file({
    label: "Upload a Mural CSV export",
    accept: ".csv",
    required: false,
  })
)
```

```js
// const mural_export = await csvfile.csv()

const mural_export = [...(await sql`select * from mural_store`)].map((d) =>
  d.toJSON()
)
```

```js
mural_export.forEach((d) => {
  d.label = String(d["Text"])
  d.fx = Number(d["Position X"])
  d.fy = Number(d["Position Y"])
})

const project_graph_data = {
  nodes: mural_export,
  // links: [],
  links: [...(await sql`select * from link_store`)].map((d) => d.toJSON()),
}
display(project_graph_data)
```

```js
// display([... await sql`select * from link_store`].map((d) => d.toJSON()))
```

## Mural project data

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
  keyMap: (d) => d.Text,
  valueMap: (d) => d["BG Color"],
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

<div id="graph_container" class="card">${project_graph.getCanvas()}</div>
${downloadSVGButton("#graph_container svg")}

</br>

### Mural graph data

<div class="card">${Inputs.table(mural_links, { layout: "auto" })}</div>
${downloadTableButton(() => mural_links, {delimeter: ';'}) }

```js
import {
  downloadSVGButton,
  downloadTableButton,
} from "/components/utilities.js"
```

```js
const mural_links = (async function* () {
  while (true) {
    yield [...project_graph.links].map(({ source, target, label }) => {
      return {
        source: source.label,
        target: target.label,
        label: label,
      }
    })
    await new Promise((resolve) => setTimeout(resolve, 5000))
  }
})()
```
