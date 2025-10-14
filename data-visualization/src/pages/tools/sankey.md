---
style: /css/vdbi-page.css
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
```

```js
const user_data = await csvfile.csv()
display(parseTabularGraph(user_data))
```

<div class="card">
  ${resize(
    (width, height) => sankeyDiagram(
      user_data,
      {
        width: width,
        height: height,
      }
    )
  )}<!-- $ -->
</div>
