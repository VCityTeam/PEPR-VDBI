---
style: /css/vdbi-page.css
sql:
  link_store: /data/private/mural_links.csv
  mural_store: /data/private/mural_export.csv
  link_store2: /data/private/mural_links2.csv
  mural_store2: /data/private/mural_export2.csv
---

```js
import {
  Graph,
  MuralGraph,
  mapTableToPropertyGraphLinks,
  mapTableToTriples,
} from "/components/graph.js"
import { circleLegend } from "/components/legend.js"
```

# Mural link editor

A simple editor for creating knowledge graphs from Mural CSV exports
and a workplace for integrating the PEPR VDBI Participative Constellation.

## Data source

```js
const selected_source = view(
  Inputs.select(
    new Map([
      ["Partner Constellation", ""],
      ["Object Constellation", "2"],
      ["Uploaded files", "user"],
    ]),
    {
      label: "Select a dataset to use",
    }
  )
)
```

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
const linkfile = view(
  Inputs.file({
    label: "Upload a CSV of links [source, target, label]",
    accept: ".csv",
    required: false,
  })
)
```

```js
const mural_export =
  selected_source !== "user"
    ? [...(await sql([`select * from mural_store${[selected_source]}`]))].map(
        (d) => d.toJSON()
      )
    : csvfile.csv()
```

```js
const links_export =
  selected_source !== "user"
    ? [...(await sql([`select * from link_store${[selected_source]}`]))].map(
        (d) => d.toJSON()
      )
    : linkfile.csv()
```

```js
mural_export.forEach((d) => {
  d.id = String(d["ID"])
  d.label = String(d["Text"])
  d.type = d["BG Color"]
  d.shape = d["Sticky type"]
  d.fx = Number(d["Position X"])
  d.fy = Number(d["Position Y"])
})

const project_graph_data = {
  nodes: mural_export,
  links: links_export,
}
```

## Mural graph editor

<div id="graph_container" class="card">${project_graph.getCanvas()}</div>
${downloadSVGButton("#graph_container svg")}

</br>

```js echo
const mural_color_scale = new Map([
  // project constellation
  ["#AAED92", "Projet PEPR VDBI"],
  ["#FCF281", "Projet externe ou vulnérabilité humaine"],
  ["#9EDCFA", "Centre Opérationel"],
  ["#FCB6D4", "Projet PEPR (externe) ou espace physique"],
  ["#0561A6", "Structure"],
  ["#FFC061", "Pratiques, organisation ou autre"],
  // object constellation
  // ["#AAED92", "Projet PEPR VDBI"],
  // ["#9EDCFA", "Centre Opérationel"],
  ["#767656", "Risque, épisode"],
  // ["#FCF281", "Vulnérabilité humaine"],
  // ["#FCB6D4", "Espaces physique"],
  ["#D8D8B1", "Méthode, approche, outil"],
  ["#D8C7FF", "Phénomène écoulement"],
  ["#86E6D9", "Savoirs locaux"],
  ["#EDEDED", "Acteurs"],
  // ["#FFC061", "Pratiques, organisation"],
])

const color_scale = d3.scaleOrdinal(
  [...mural_color_scale.keys()],
  [...mural_color_scale.keys()],
)

const project_graph = new MuralGraph(project_graph_data, {
  id: "mural_graph",
  width: 1000,
  height: 1000,
  margin: 500,
  r: 20,
  fontSize: 50,
  strokeWidth: 5,
  color: color_scale,
  nodeLabelOpacity: 1,
  linkLabelOpacity: 1,
  nodeLabelOffset: 25,
  legend: circleLegend([...mural_color_scale.values()], {
    keyMap: (d) => d,
    valueMap: (d) => d,
    color: color_scale,
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

### Mural data

Imported Mural data ${Inputs.table(mural_export)}

Graph data

```js
const project_graph_data_export = {
  nodes: project_graph_data.nodes.map(({ id, type, shape, label }) => ({
    id,
    type,
    shape,
    label,
  })),
  links: project_graph_data.links.map(({ source, target, label }) => ({
    source: source.id,
    target: target.id,
    label: label,
  })),
}
display(project_graph_data_export)
display(downloadJSONButton(() => project_graph_data_export))
```

```js
import {
  downloadSVGButton,
  downloadTableButton,
  downloadJSONButton,
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

## Constellation VDBI

```js
const color_filter = view(
  Inputs.checkbox(mural_color_scale, {
    label: "Select types",
    keyof: (d) => d[1],
    valueof: (d) => d[0],
    value: mural_color_scale.keys(),
  })
)
```

```js
const search_nodes = view(
  Inputs.search(constellation_data.nodes, { placeholder: "Search nodes…" })
)
const search_links = view(
  Inputs.search(constellation_data.links, { placeholder: "Search links…" })
)
```

```js
filtered_constellation
```

<div class="card">
  ${resize(
    (width) => new Graph(
      filtered_constellation,
      {
        width: width,
        height: width,
        //color: (d) => d,
        color: color_scale,
        legend: circleLegend([...mural_color_scale.values()], {
          keyMap: (d) => d,
          valueMap: (d) => d,
          text: (d) => d,
          color: color_scale,
          backgroundColor: "black",
          backgroundStroke: "black",
          backgroundOpacity: 0.1,
        }),
      }
    ).getCanvas()
  )}

</div>

```js
const constellation_file = FileAttachment(
  "/data/private/Constellation PEPR VDBI graph.json"
)
const constellation_data = await constellation_file.json()
console.debug("constellation_data", constellation_data)
```

```js
const filtered_constellation_nodes = search_nodes.filter((d) =>
  color_filter.includes(d.type)
)
```

```js
const filtered_constellation_links = search_links.filter(
  (l) =>
    (color_filter.includes(l.source.type) ||
      color_filter.includes(l.target.type)) &&
    (filtered_constellation_nodes.includes(l.source) ||
      filtered_constellation_nodes.includes(l.target))
)
```

```js
const filtered_constellation = {
  // the set of nodes includes the filtered nodes and any neighbors
  nodes: [
    ...new d3.InternSet(
      d3.merge([
        filtered_constellation_nodes,
        filtered_constellation_links.map(({ source }) => source),
        filtered_constellation_links.map(({ target }) => target),
      ])
    ),
  ],
  links: filtered_constellation_links,
}
```
