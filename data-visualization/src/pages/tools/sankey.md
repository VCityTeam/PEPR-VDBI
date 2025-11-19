---
style: /css/vdbi-page.css
# sql:
#   test: /data/test.csv
---

# Sankey Diagram Generator

```js
import { parseTabularGraph } from "/components/graph.js"
import { sankeyDiagram } from "/components/sankey.js"
import { downloadSVGButton } from "/components/utilities.js"
```

Upload a csv file with the following structure:

```csv
source,target,value,color
node 1,node 2,red,5
node 1,node 3,blue,4
...
```

<div class="tip">
  If you leave the color field black, it will be filled automatically
</div>

```js
const csvfile = view(
  Inputs.file({ label: "CSV file", accept: ".csv", required: true })
)

const height = view(Inputs.range([1, 1000], { label: "Height:", step: 1 }))

const fill_opacity = view(Inputs.range([0, 1], { label: "Fill Opacity:" }))

// const color_scheme = view(Inputs.select(new Map([
//   [d3.schemeCategory10],
//   [d3.schemeCategory10],
//   [d3.schemeCategory10],
//   [d3.schemeCategory10],
//   [d3.schemeCategory10],
// ]), { label: "Fill Opacity:" }))
```

```js
// const user_data = [...(await sql`select * from test`)].map((d) => d.toJSON())
const user_data = await csvfile.csv()

const color_ordinal = d3
  .scaleOrdinal(new Set(user_data.map((d) => d.target)), d3.schemeObservable10)
  .unknown("grey")

user_data.forEach((d) => {
  d.color = d.color || color_ordinal(d.target)
})

display(Inputs.table(user_data))
console.debug("user_data", user_data)

const sankey_data = parseTabularGraph(user_data)

console.debug("sankey_data", sankey_data)
```

<div class="card">
  ${resize(
    (width) => sankeyDiagram(
      sankey_data,
      {
        width: width,
        height: height,
        fillOpacity: fill_opacity,
      }
    )
  )}<!-- $ -->

  ${downloadSVGButton(".card svg")}<!-- $ -->
</div>
