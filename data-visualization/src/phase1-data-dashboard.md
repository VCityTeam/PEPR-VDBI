---
title: Phase 1 Raw Data Dashboard
theme: [dashboard, light]
---

# Phase 1 Data

```js
import {
  countEntities,
} from "./components/utilities.js";
import {
  extractPhase2Workbook,
  getColumnOptions,
  filterOnInput,
} from "./components/phase1-dashboard.js";
```

```js
const workbook1 = FileAttachment(
  // "./data/private/PEPR_VBDI_analyse_210524_15h24_GGE.xlsx" //outdated
  "./data/private/250120 PEPR_VBDI_analyse modifiée JYT_financed_redacted.xlsx"
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


<div class="warning">Possible data quality errors found for special characters, e.g., sheet `GÉNÉRALITÉ`:`Z23`</div>
