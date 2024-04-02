---
title: Initial graph test
---

# Visualize Workbook data using Graphs

Visualize the first sheet from the phase 1 Excel document using graphs.

## Data integration process

Take the data imported from the [initial-import-test](./initial-import-test) and transform the table into a graph formalism.
To do this, we need to set up a component to transform the data.

**Input:**

- Workbook 1: "240117 consortium laboratoire, établissement CNRS-SHS_Stat"
- Workbook 2: "240108_consortium, contenus des propositions CNRS-SHS_GGE_JYT_ANRT"

```mermaid
flowchart TD
    subgraph "Workbook 1"
        AA[Sheet: 240117 consortium laboratoire^J]
        AB[Sheet ...]
        AC[Sheet n]
    end
    subgraph "Workbook 2"
        BA[Sheet: Feuil1]
        BB[Sheet ...]
        BC[Sheet n]
    end
    AA -->|Load| C
    BA -->|Load| C
    subgraph Web Application
        C["Array (of objects)"] -->|Transform| GF[Graph formalism]
        GF -->|Load| G(Collapsable Force-directed Graph)
    end
```

```js echo
import {
  getProductSheet,
  resolveProjectEntities,
} from "./components/240108-proposals-keywords.js";
import {
  mapEntitiesToGraph,
  filterLinks,
  forceGraph,
} from "./components/force-graph.js";

const workbook1 = FileAttachment(
  "./data/240117 consortium laboratoire, établissement CNRS-SHS_Stat.xlsx"
).xlsx();
const workbook2 = FileAttachment(
  "./data/240108_consortium, contenus des propositions CNRS-SHS_GGE_JYT_ANRT.xlsx"
).xlsx();
```

**Input data:**

Using the transformation proposed in the imported components we can extract the tabular workbook data and resolve known entities.
This transformation produces the following hierarchy: `root -> Project Acronym -> Project attribute (keywords, titles, etc.) -> ...`

```js echo
const productData = resolveProjectEntities(getProductSheet(workbook2));
display(productData);
```

# Visualization results

Once integrated the following information is desired for visualization:

- lab names
- ERC disciplines
- show missing information
- show graphs over charts
  - theme → projet (in other workbook ANRT)
  - col I : produit (ou resultats) de la recherche (primaire) → J : secondaire → H : Quelles actions pour quelles solutions → A : acronyme
- Root node: PEPR VDBI

## Force Directed Graph - all project data

**Sheet mapped to graph:**

... We can also map the data to a graph hierarchy

```js echo
const productGraph = mapEntitiesToGraph(productData);
display(productGraph);
```

Another graph is proposed with a "central" `Project PEPR` node connected to each project

```js echo
const productGraphWithPEPR = { ...productGraph };

// add "root" node
productGraphWithPEPR.nodes.push({
  id: "Projet PEPR",
  color: 0,
});
// add root to project links
d3.rollup(
  productGraphWithPEPR.links,
  (D) => {
    return {
      source: "Projet PEPR",
      label: "hasProject",
      target: D[0].source,
    };
  },
  (d) => d.source
)
  .values()
  .forEach((d) => productGraphWithPEPR.links.push(d));
display(productGraphWithPEPR);
```

```js echo
const productForceGraph = forceGraph(productGraph, {
  width: 1400,
  height: 1400,
  r: 3,
  fontsize: 12,
});
display(productForceGraph);
```

## Force Directed Graph - projects and keywords

**Filtered graph nodes and links:**

```js echo
const filteredProductGraph = filterLinks(
  productGraph,
  (d) => d.label == "action"
);
display(filteredProductGraph);
```

```js echo
const filteredProductForceGraph = forceGraph(filteredProductGraph, {
  width: 1400,
  height: 1400,
  r: 3,
  fontsize: 12,
});
display(filteredProductForceGraph);
```
