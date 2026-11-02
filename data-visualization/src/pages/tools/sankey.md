---
style: /css/vdbi-dashboard.css
---

# Sankey Diagram Generator

```js
import { parseTabularGraph } from '/components/graph.js'
import { sankeyDiagram } from '/components/sankey.js'
import { downloadSVGButton } from '/components/utilities.js'
```

Upload a csv file with the following structure:

```csv
source,target,value,color
node 1,node 2,5,red
node 1,node 3,4,blue
...
```

<div class="tip">
  If you leave the color field black, it will be filled automatically
</div>

```js
const csvfile = view(
  Inputs.file({ label: 'CSV file', accept: '.csv', required: true }),
)
```

```js
// const user_data = [...(await sql`select * from test`)].map((d) => d.toJSON())
const user_data = await csvfile.csv()
display(Inputs.table(user_data))
console.debug('user_data', user_data)
```

```js
const width = view(Inputs.range([1, 2000], { label: 'Width:', value: 1000,step: 1 }))

const height = view(Inputs.range([1, 2000], { label: 'Height:', value: 500,step: 1 }))

const fill_opacity = view(
  Inputs.range([0, 1], { label: 'Fill Opacity:', step: 0.05 }),
)

const show_labels = view(Inputs.toggle({ label: 'Show labels:', value: true }))

// const color_scheme = view(Inputs.select(new Map([
//   [d3.schemeCategory10],
//   [d3.schemeCategory10],
//   [d3.schemeCategory10],
//   [d3.schemeCategory10],
//   [d3.schemeCategory10],
// ]), { label: "Fill Opacity:" }))
```

```js
const color_ordinal = d3
  .scaleOrdinal(new Set(user_data.map((d) => d.target)), d3.schemeObservable10)
  .unknown('grey')

user_data.forEach((d) => {
  d.color = d.color || color_ordinal(d.target)
})

const sankey_data = parseTabularGraph(user_data)

console.debug('sankey_data', sankey_data)
```

<div class="card">
  ${sankeyDiagram(
    sankey_data,
    {
      width: width,
      height: height,
      fillOpacity: fill_opacity,
      show_labels: show_labels,
    }
  )}<!-- $ -->

${downloadSVGButton(".card svg")}<!-- $ -->

</div>
