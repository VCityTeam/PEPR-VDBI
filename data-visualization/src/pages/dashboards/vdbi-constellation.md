---
style: /css/vdbi-page.css
---

```js
import { Graph } from "/components/graph.js"
```

```js
import { circleLegend } from "/components/legend.js"
```

```js
import { downloadSVGButton, downloadJSONButton } from "/components/utilities.js"
```

# Constellation PEPR VDBI

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

<div id="graph_container" class="card">
  ${resize(
    (width) => new Graph(
      filtered_constellation,
      {
        width: width,
        height: width,
        color: color_scale,
        fontSize: 3,
        r: 5,
        nodeLabelOffset: -1,
        legend: circleLegend([...mural_color_scale.values()], {
          keyMap: (d) => d,
          valueMap: (d) => d,
          text: (d) => d,
          color: color_scale,
          backgroundColor: "black",
          backgroundStroke: "black",
          backgroundOpacity: 0.1,
          lineSeparation: 18,
        }),
      }
    ).getSVG()
  )}

</div>

```js
filtered_constellation
```

${downloadSVGButton("#graph_container svg.d3_graph","Download SVG")}

<!-- $ -->

${downloadJSONButton(() => filtered_constellation, { label: "Download JSON"})}

```js
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
  [...mural_color_scale.keys()]
)
```

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
const filtered_constellation_links = search_links
  .filter((l) =>
    filtered_constellation_nodes.some(
      (n) =>
        n.id === l.source ||
        n === l.source ||
        n.id === l.target ||
        n === l.target
    )
  )
  .filter((l) => {
    const source =
      typeof l.source === "string"
        ? filtered_constellation_nodes.find((n) => n.id === l.source) || {
            type: null,
          }
        : l.source
    const target =
      typeof l.target === "string"
        ? filtered_constellation_nodes.find((n) => n.id === l.target) || {
            type: null,
          }
        : l.target

    return (
      l.source &&
      l.target &&
      (color_filter.includes(source.type) || color_filter.includes(target.type))
    )
  })
```

```js
const filtered_constellation = {
  // the set of nodes includes the filtered nodes and any neighbors
  nodes: [
    ...new d3.InternSet(
      d3.merge([
        filtered_constellation_nodes,
        filtered_constellation_links.map(({ source }) =>
          constellation_data.nodes.find(
            (node) => node.id === source || node === source
          )
        ),
        filtered_constellation_links.map(({ target }) =>
          constellation_data.nodes.find(
            (node) => node.id === target || node === target
          )
        ),
      ])
    ),
  ],
  links: filtered_constellation_links,
}
```
