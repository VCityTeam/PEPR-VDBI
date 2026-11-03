---
style: /css/vdbi-dashboard.css
---

<!-- imports -->

```js
import { Graph } from '/components/graph.js'
import { downloadSVGButton, formTemplate } from '/components/utilities.js'
```

# Knowledge Graph Generator

Upload a graph (.json) to generate a force-directed knowledge graph. The file holds a list of
`nodes`, each with a unique `id`, a `label` and a `type` used to color it, and a list of `links`,
each going from a `source` node id to a `target` node id with a `label`:

```json
{
  "nodes": [
    { "id": "n1", "label": "Node 1", "type": "A" },
    { "id": "n2", "label": "Node 2", "type": "B" }
  ],
  "links": [{ "source": "n1", "target": "n2", "label": "relation" }]
}
```

Nodes can be dragged, and the graph can be zoomed and panned. The data view at the bottom of the page
lists duplicate and orphaned nodes.

```js
const json_file = view(Inputs.file({ accept: '.json', required: true }))
```

```js
const graph_data = json_file.json()
```

```js
display(Inputs.table(graph_data.nodes, { layout: 'auto' }))
display(Inputs.table(graph_data.links, { layout: 'auto' }))
```

<!-- User parameters -->

<div class="card">
  ${display_form}
  <!-- $ -->
</div>
<div id="graph_container" class="card">
  ${graph}
  <!-- $ -->
  ${copy_button}
  <!-- $ -->
</div>

```js
const graph = resize((width) => {
  const svg_width = display_settings.width || width
  const svg_height = display_settings.height || svg_width
  const svg = new Graph(graph_data, {
    id: 'graph_svg',
    width: svg_width,
    height: svg_height,
  }).getSVG()

  // explicit dimensions so the downloaded SVG is not 0x0
  svg.setAttribute('width', svg_width)
  svg.setAttribute('height', svg_height)
  return svg
})
```

```js
const copy_button = downloadSVGButton(
  '#graph_svg',
  'Download (.svg)',
  'knowledge-graph.svg',
)
```

```js
// independent of the dataset, so these settings are kept when another file is loaded
const display_form = Inputs.form(
  {
    // left empty, the graph fits the page width and is square
    width: Inputs.number([1, Infinity], {
      label: 'SVG width (px)',
      step: 1,
      placeholder: 'fit to page',
    }),
    height: Inputs.number([1, Infinity], {
      label: 'SVG height (px)',
      step: 1,
      placeholder: 'same as width',
    }),
  },
  { template: formTemplate(2) },
)
```

```js
const display_settings = Generators.input(display_form)
```

<!-- Helpers -->

```js
// link ends are node ids in the file, or node objects once a force simulation has run on them
const linkEndId = (end) => (typeof end === 'object' ? end?.id : end)

/** Nodes whose value of `key` is shared with at least one other node. */
const duplicateNodes = (nodes, key) => {
  const counts = d3.rollup(
    nodes,
    (v) => v.length,
    (d) => d[key],
  )
  return nodes.filter((d) => counts.get(d[key]) > 1)
}

/** Nodes that are neither the source nor the target of any link. */
const orphanedNodes = ({ nodes, links }) => {
  const linked = new Set(
    links.flatMap(({ source, target }) => [
      linkEndId(source),
      linkEndId(target),
    ]),
  )
  return nodes.filter((d) => !linked.has(d.id))
}
```

## Data view

### Duplicate nodes

```js
display(
  Inputs.table(duplicateNodes(graph_data.nodes, 'id'), { layout: 'auto' }),
)
```

### Duplicate labels

```js
display(
  Inputs.table(duplicateNodes(graph_data.nodes, 'label'), { layout: 'auto' }),
)
```

### Orphaned nodes

```js
display(Inputs.table(orphanedNodes(graph_data), { layout: 'auto' }))
```
