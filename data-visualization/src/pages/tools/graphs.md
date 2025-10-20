---
style: /css/vdbi-page.css
---

# Knowledge Graph Generator

```js
import { Graph } from "/components/graph.js"
```

Upload a json file with the following structure:

```json
{
  "nodes": [
    {
      "id": "string",
      "label": "string",
      "type": "string"
    }
  ],
  "links": [
    {
      "source": "string",
      "target": "string",
      "label": "string"
    }
  ]
}
```

```js
const jsonfile = view(
  Inputs.file({ label: "JSON file", accept: ".json", required: true })
)
```

Uploaded data

```js
const user_data = await jsonfile.json()
display(user_data)
```

<div class="card">
  ${resize(
    (width) => new Graph(
      user_data,
      {
        width: width,
        height: width,
      }
    ).getCanvas()
  )}<!-- $ -->
</div>

## Data quality

Duplicate nodes

```js
display(
  user_data.nodes.filter(
    (d) => user_data.nodes.filter(({ id }) => d.id === id).length > 1
  )
)
```

Duplicate labels

```js
display(
  user_data.nodes.filter(
    (d) => user_data.nodes.filter(({ label }) => d.label === label).length > 1
  )
)
```

Orpaned nodes

```js
display(
  user_data.nodes.filter(
    (d) =>
      !user_data.links.some(
        ({ source, target }) => d.id === source.id || d.id === target.id
      )
  )
)
```
