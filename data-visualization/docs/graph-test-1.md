---
title: Initial tree test
---

# Visualize Workbook data using Graphs and Trees

Visualize the first sheet from the phase 1 Excel document using trees and dendrogram diagrams.

```js echo
import { getProductSheet, resolveKnownEntities } from "./components/import-products.js";
import { mapProductsToGraph } from "./components/force-graph.js";
import { mapProductsToTree, radialDendrogram } from "./components/radial-dendrogram.js";
import { collapsableRadialDendrogram } from "./components/collapsable-radial-dendrogram.js";

const workbook1 = FileAttachment("./data/240117 consortium laboratoire, établissement CNRS-SHS_Stat.xlsx").xlsx();
const workbook2 = FileAttachment("./data/240108_consortium, contenus des propositions CNRS-SHS_GGE_JYT_ANRT.xlsx").xlsx();
```

**Input data:**

Using the transformation proposed in the imported components we can extract the tabular workbook data and resolve known entities.
This transformation produces the following hierarchy: `root -> Project Acronym -> Project attribute (keywords, titles, etc.) -> ...`
```js echo
const productData = resolveKnownEntities(getProductSheet(workbook2));
display(productData);
```

**Sheet mapped to tree:**

We can map this dataset to a tree hierarchy...

```js
const productTree = mapProductsToTree(productData);
display(productTree);
```

**Sheet mapped to graph:**

... and a graph hierarchy

```js echo
const productGraph = mapProductsToGraph(productData);
display(productGraph);
```

## Collapsable Radial Dendrogram

We can display our tree dataset using a dendrogram. This dendrogram implements the following features:
* Radial structure
* Collapsable nodes
  * TODO: Fix label animation updates
* TODO: Zoom
* TODO: Pan

```js echo
const collapsableRadialProducts = collapsableRadialDendrogram(productTree, {
    label: d => d.name,
    width: 1600,
    height: 1600,
    margin: 80,
    r: 3,
    fontsize: 15,
    depth: 150,
    duration: 500
});
display(collapsableRadialProducts);
```

## Visualization information

Once integrated the following information is desired for visualization:
- lab names
- ERC disciplines
- show missing information
- ~~show graphs over charts~~
  - theme -> projet (in other workbook ANRT)
  - col I : produit (ou resultats) de la recherche (primaire) -> J : secondaire -> H : Quelles actions pour quelles solutions -> A : acronyme
- ~~Root node: PEPR VDBI~~

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
        C["Array (of objects)"] -->|Transform| TF[Tree formalism]
        C["Array (of objects)"] -->|Transform| GF[Graph formalism]
        TF -->|Load| T(Collapsable Radial Dendrogram)
        GF -->|Load| G(Collapsable Force-directed Graph)
    end
```
