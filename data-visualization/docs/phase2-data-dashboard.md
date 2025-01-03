---
title: Phase 2 Raw Data Dashboard
theme: dashboard
---

# PEPR Projects Overview

```js
import {
  countEntities,
} from "./components/utilities.js";
import {
  extractPhase2Workbook,
  getColumnOptions,
  filterOnInput,
} from "./components/phase2-dashboard.js";
```

```js
const workbook1 = FileAttachment(
  // "./data/PEPR_VBDI_analyse_210524_15h24_GGE.xlsx" //outdated
  "./data/241021 PEPR_VBDI_analyse modifiée JYT.xlsx"
).xlsx();
```

```js echo
const phase_2_data = extractPhase2Workbook(workbook1, false);
display(phase_2_data);
```

```js
const project_table = Inputs.table(phase_2_data.projects);
const researcher_table = Inputs.table(phase_2_data.researchers);
const laboratory_table = Inputs.table(phase_2_data.laboratories);
const university_table = Inputs.table(phase_2_data.universities);
```

<div class="grid grid-cols-2">
  <div class="card grid-colspan-2">
    <h2>Projects</h2>
    <div style="max-height: 400px; overflow: auto;">${project_table}</div>
  </div>
  <div class="card grid-colspan-2">
    <h2>Researchers</h2>
    <div style="max-height: 400px; overflow: auto;">${researcher_table}</div>
  </div>
  <div class="card grid-colspan-2">
    <h2>Laboratories</h2>
    <div style="max-height: 400px; overflow: auto;">${laboratory_table}</div>
  </div>
  <div class="card grid-colspan-2">
    <h2>Universities</h2>
    <div style="max-height: 400px; overflow: auto;">${university_table}</div>
  </div>
</div>

## Phase 2 Data structure wishlist
- `Liste cheurcheurs` sheet
  - 1 column per `Nom et Prénom`
  - +1 column per projet/labo (not ideal but intuitive)
  - Move `DOMAINES ERC LABO` and related columns (HCERES) to `liste des labo`
- `liste des établissements` sheet
  - Add code uai? (often used by [ESR Open Data](data.enseignementsup-recherche.gouv.fr))
- `liste des labo` sheet
  - Separate `Identifiant Laboratoire` into two columns
    - `Identifiant Laboratoire`
    - `Nom Complet Laboratoire`

> [!NOTE]
> Data quality errors found for special characters, e.g., sheet `GÉNÉRALITÉ`:`Z23`
