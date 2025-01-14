---
title: Phase 2 Researcher Dashboard
theme: dashboard
---

# Researcher Dashboard

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

Raw researcher data:
```js
const phase_2_data = extractPhase2Workbook(workbook1, false);
display(phase_2_data.researchers);
```

```js
const researcher_table = Inputs.table(phase_2_data.researchers, {
  columns: [
    "fullname",
    // "lastname",
    // "firstname",
    "position",
    "project",
    "gender",
    "discipline",
    "discipline_erc",
    "cnu",
    "site",
    "orcid",
    "idhal",
    "lab",
    "notes",
  ],
  header: {
    "fullname": "Name",
    "lastname": "Lastname",
    "firstname": "Firstname",
    "position": "Position",
    "project": "Project(s)",
    "gender": "Gender",
    "discipline": "Discipline",
    "discipline_erc": "ERC discipline",
    "cnu": "CNU",
    "site": "Site",
    "orcid": "ORCiD",
    "idhal": "idHAL",
    "lab": "Laboratory",
    "notes": "Notes",
  }
});
```

<div class="grid grid-cols-2">
  <!-- Table: Researcher, discipline, (sub) domain HCERES, position, ORCiD, idHal, Lab -->
  <div class="card grid-colspan-2">
    <h2>Researchers</h2>
    <div style="max-height: 400px; overflow: auto;">${researcher_table}</div>
  </div>
  <!-- Researcher map -->
  <div class="card grid-colspan-2 grid-rowspan-2"></div>
  <!-- Graph, arc diagram; group by discipline, position, CNU, partner -->
  <div class="card grid-colspan-2 grid-rowspan-2"></div>
</div>
