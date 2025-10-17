---
style: /css/vdbi-page.css
# sql:
#   test: /data/test.csv
---

# Sankey Diagram Generator

```js
import { parseTabularGraph } from "/components/graph.js"
```

```js
import { sankeyDiagram } from "/components/sankey.js"
```

Upload a csv file with the following structure:

```csv
source,target,value
node 1,node 2,5
node 1,node 3,4
...
```

```js
const csvfile = view(
  Inputs.file({ label: "CSV file", accept: ".csv", required: true })
)
const height = view(
  Inputs.range([1, 1000], { label: "Select height", step: 1 })
)
```

```js
// const user_data = [...(await sql`select * from test`)].map((d) => d.toJSON())
const user_data = await csvfile.csv()

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
      }
    )
  )}<!-- $ -->
</div>
