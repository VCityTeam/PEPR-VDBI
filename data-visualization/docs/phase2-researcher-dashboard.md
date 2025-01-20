---
title: Phase 2 Researcher Dashboard
theme: dashboard
---

# Phase 2 Researchers

```js
import {
  countEntities,
} from "./components/utilities.js";
import {
  extractPhase2Workbook,
  getColumnOptions,
  filterOnInput,
} from "./components/phase2-dashboard.js";
import {
  donutChart
} from "./components/pie-chart.js";
```

```js
const debug = true;
const workbook1 = FileAttachment(
  // "./data/PEPR_VBDI_analyse_210524_15h24_GGE.xlsx" //outdated
  "./data/241021 PEPR_VBDI_analyse modifiée JYT.xlsx"
).xlsx();
```

```js
const phase_2_data = extractPhase2Workbook(workbook1, false);
if (debug) {
  display("phase_2_data.researchers");
  display(phase_2_data.researchers);
}
```

```js
const researcher_search = view(Inputs.search(phase_2_data.researchers, {
    placeholder: "Search for researcher..."
  }));
```

```js
const input = Inputs.range([0, 1], {step: 0.1});
const value = Generators.input(input);
```

```js
const researcher_table = Inputs.table(researcher_search, {
  height: 350,
  columns: [
    "fullname",
    // "firstname",
    // "lastname",
    "position",
    "project",
    "gender",
    "disciplines",
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
    "disciplines": "Discipline",
    "discipline_erc": "ERC discipline",
    "cnu": "CNU",
    "site": "Site",
    "orcid": "ORCiD",
    "idhal": "idHAL",
    "lab": "Laboratory",
    "notes": "Notes",
  },
});

const discipline_count = countEntities(
  phase_2_data.researchers,
  (d) => d.disciplines
);
const discipline_pie = donutChart(discipline_count, {
  width: 700,
  fontSize: 18
});

const discipline_erc_count = countEntities(
  phase_2_data.researchers,
  (d) => d.discipline_erc
).sort((a, b) => d3.descending(a.count, b.count));
const discipline_erc_pie = donutChart(discipline_erc_count, {
  width: 700,
  fontSize: 18
});

const cnu_count = d3.rollups(
  phase_2_data.researchers,
  (d) => d.length,
  (d) => d.cnu
).sort((a, b) => d3.descending(a[1], b[1]));
const cnu_pie = donutChart(cnu_count, {
  width: 700,
  keyMap: (d) => d[0],
  valueMap: (d) => d[1],
  // sort: (a, b) => d3.descending(a[1], b[1]),
  fontSize: 18,
  majorLabelText: (d) => d.data[0] != null ? `CNU ${d.data[0].split(" ")[0]}` : "N/A",
});

if (debug) {
  display("discipline_count");
  display(discipline_count);
  display("discipline_erc_count");
  display(discipline_erc_count);
  display("cnu_count");
  display(cnu_count);
}
```

<div class="tip" label="Data visualization policy">
  Pie charts:
  <ul>
    <li>Researchers with multiple disciplines are counted once per discipline.</li>
    <li>Pie charts do not include missing researcher data by default.</li>
  </ul>
</div>

<div class="grid grid-cols-3">
  <!-- Table with all data | ERC Discipline pie -->
  <div class="card grid-colspan-2">
    <h2>Researchers</h2>
    <div style="overflow: auto;">${researcher_table}</div>
  </div>
  <div class="card grid-colspan-1">
    <h2>ERC Disciplines</h2>
    <div style="overflow: auto;">${discipline_erc_pie}</div>
  </div>
</div>
<div class="grid grid-cols-2">
  <!-- Discipline pie | CNU pie -->
  <div class="card grid-colspan-1">
    <h2>Disciplines</h2>
    <!-- <div style="overflow: auto;">${discipline_pie}</div> -->
  </div>
  <div class="card grid-colspan-1">
    <h2>CNUs</h2>
    <!-- ${input} -->
    <div style="overflow: auto;">${cnu_pie}</div>
  </div>
  <!-- Project count | Lab count -->
  <!-- Researcher map -->
  <div class="card grid-colspan-2 grid-rowspan-2"></div>
  <!-- Graph, arc diagram; group by discipline, position, CNU, partner -->
  <div class="card grid-colspan-2 grid-rowspan-2"></div>
</div>

<!--
TODO:
- pie -> %
- add notes for data modifications
- dont show 
-->
