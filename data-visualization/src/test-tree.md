---
title: Initial tree test
theme: light
---

# Visualize Workbook data using Trees

Visualize the first sheet from the phase 1 Excel document using trees and dendrogram diagrams.


## Data integration process

Take the data imported from the [initial-import-test](./initial-import-test) and transform the table into a tree formalism.
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
        TF -->|Load| T(Collapsable Radial Dendrogram)
    end
```

```js echo
import {
  getProductSheet,
  resolveProjectEntities,
} from "./components/240108-proposals-keywords.js";
import {
  mapEntitesToProjectTree,
  mapEntitesToProductToProjectTree,
  collapsableRadialDendrogram,
} from "./components/radial-dendrogram.js";

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
- show trees/graphs over charts
  - theme → projet (in other workbook ANRT)
  - col I : produit (ou resultats) de la recherche (primaire) → J : secondaire → H : Quelles actions pour quelles solutions → A : acronyme
- Root node: PEPR VDBI

## Collapsable Radial Dendrogram

**Sheet mapped to tree:**

We can map the dataset to a tree hierarchy...

```js echo
const productTree = mapEntitesToProjectTree(productData);
display(productTree);
```

We can display our tree dataset using a dendrogram. This dendrogram implements the following features:

- Radial structure
- Collapsable nodes
- Zoom + Pan

```js echo
const collapsableRadialProducts = collapsableRadialDendrogram(productTree, {
  label: (d) => d.name,
  width: 1400,
  height: 1400,
  margin: 80,
  r: 3,
  fontsize: 15,
  depth: 150,
  duration: 500,
});
display(collapsableRadialProducts);
```

### Dendrogram: Products/results → Actions and solutions → Project acronym

A different mapping showing the relationships between the identified products and results and each project:

```mermaid
flowchart LR
    A[Primary products/results] --> B
    B[Secondary products/results] --> C
    C[Actions and solutions] --> D
    D[Project acronym]
```

```js echo
const productProjectTree = mapEntitesToProductToProjectTree(productData);
display(productProjectTree);
```

```js echo
const collapsableRadialProducts = collapsableRadialDendrogram(
  productProjectTree,
  {
    label: (d) => d.name,
    width: 1400,
    height: 1400,
    margin: 80,
    r: 3,
    fontsize: 15,
    depth: 150,
    duration: 500,
  }
);
display(collapsableRadialProducts);
```
