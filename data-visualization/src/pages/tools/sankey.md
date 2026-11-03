---
style: /css/vdbi-dashboard.css
---

<!-- imports -->

```js
import { parseTabularGraph } from '/components/graph.js'
import { sankeyDiagram } from '/components/sankey.js'
import { downloadSVGButton, formTemplate } from '/components/utilities.js'
```

# Sankey Diagram Generator

Upload a table of links (.csv) to generate a sankey diagram. Each row is a link going from its
`source` node to its `target` node, with a width proportional to its `value`. Nodes are created from
the distinct values of the `source` and `target` columns, and the optional `color` column sets the
color of each link:

```csv
source,target,value,color
node 1,node 2,5,red
node 1,node 3,4,blue
node 2,node 4,3,
```

<div class="tip">
  If you leave the color field blank, it will be filled automatically based on the link target.
</div>

```js
const csv_file = view(Inputs.file({ accept: '.csv', required: true }))
```

```js
const csv_data = csv_file.csv()
```

```js
display(Inputs.table(csv_data, { layout: 'auto' }))
```

<!-- User parameters -->

<div class="card">
  ${display_form}
  <!-- $ -->
</div>
<div id="sankey_diagram_container" class="card">
  ${sankey}
  <!-- $ -->
  ${copy_button}
  <!-- $ -->
</div>

```js
const sankey = resize((width) =>
  sankeyDiagram(sankey_data, {
    width: display_settings.width || width,
    height: display_settings.height || 500,
    linkFillOpacity: display_settings.link_opacity,
    show_labels: display_settings.show_labels,
  }),
)
```

```js
const copy_button = downloadSVGButton(
  '#sankey_diagram_container svg',
  'Download (.svg)',
  'sankey-diagram.svg',
)
```

```js
// independent of the dataset, so these settings are kept when another file is loaded
const display_form = Inputs.form(
  {
    link_opacity: Inputs.range([0, 1], {
      label: 'Link opacity',
      step: 0.05,
      value: 0.7,
    }),
    show_labels: Inputs.toggle({ label: 'Show labels', value: true }),
    // left empty, the diagram fits the page width
    width: Inputs.number([1, Infinity], {
      label: 'SVG width (px)',
      step: 1,
      placeholder: 'fit to page',
    }),
    height: Inputs.number([1, Infinity], {
      label: 'SVG height (px)',
      step: 1,
      value: 500,
      placeholder: '500',
    }),
  },
  { template: formTemplate(2) },
)
```

```js
const display_settings = Generators.input(display_form)
```

```js
const color_ordinal = d3
  .scaleOrdinal(new Set(csv_data.map((d) => d.target)), d3.schemeObservable10)
  .unknown('grey')

// copied, so that the uploaded data is not modified
const link_data = csv_data.map((d) => ({
  ...d,
  value: +d.value,
  color: d.color || color_ordinal(d.target),
}))
```

```js
const sankey_data = parseTabularGraph(link_data)
console.debug('sankey_data', sankey_data)
```

## Data view

### Nodes

```js
display(Inputs.table(sankey_data.nodes, { layout: 'auto' }))
```

### Links

```js
display(Inputs.table(sankey_data.links, { layout: 'auto' }))
```
