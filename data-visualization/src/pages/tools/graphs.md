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

```js
const user_data = await jsonfile.json()
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
