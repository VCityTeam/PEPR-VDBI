---
title: Phase 2 Researcher Dashboard
theme: dashboard
---

# Phase 2 Researchers

```js
import {
  countEntities,
  cropText
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
const input = Inputs.range([0, 1], {step: 0.1});
const value = Generators.input(input);
```

```js
// Researcher table //
const researcher_search_input = Inputs.search(phase_2_data.researchers, {
  placeholder: "Search researchers..."
});

const researcher_search = Generators.input(researcher_search_input);
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
```

```js
// ERC Discipline count //
const discipline_erc_count = countEntities(
    phase_2_data.researchers,
    (d) => d.discipline_erc
  )
  .filter((d) => d.entity != "non renseignée" && d.entity != "Non Renseigné")
  .sort((a, b) => d3.descending(a.count, b.count));

const discipline_erc_pie = donutChart(discipline_erc_count, {
  width: 700,
  fontSize: 18
});
```

```js
// Discipline count //
const discipline_count = countEntities(
  phase_2_data.researchers,
  (d) => d.disciplines
).sort((a, b) => d3.descending(a.count, b.count));

const discipline_search_input = Inputs.search(discipline_count, {
  placeholder: "Search disciplines..."
});

const discipline_search = Generators.input(discipline_search_input);
```

```js
const discipline_plot = Plot.plot({
  width: 450,
  height: discipline_search.length * 20,
  marginTop: 30,
  marginLeft: 100,
  color: {
    scheme: "Plasma",
  },
  y: {
    label: "Discipline",
    tickRotate: 30,
    tickFormat: (d) => cropText(d),
  },
  x: {
    grid: true,
    axis: "top",
    label: "Occurences",
    // ticks: 5,
    // domain: [0, Math.max(...discipline_search.map((d) => d.count)) + 1],
  },
  marks: [
    Plot.barX(discipline_search, {
      y: "entity",
      x: "count",
      fill: "count",
      sort: {y: "-x"},
      tip: {format: {fill: false}}
    }),
    Plot.barX(
      discipline_search, 
      Plot.pointerY({x: "count", y: "entity"}),
    ),
  ],
});
```

```js
// CNU count //
const cnu_count = d3.rollups(
    phase_2_data.researchers,
    (d) => d.length,
    (d) => d.cnu
  )
  .filter((d) => d[0] != null)
  .sort((a, b) => d3.descending(a[1], b[1]));

const cnu_search_input = Inputs.search(cnu_count, {
  placeholder: "Search CNUs..."
});

const cnu_search = Generators.input(cnu_search_input);
```

```js
const cnu_plot = Plot.plot({
  width: 450,
  marginTop: 50,
  marginLeft: 100,
  color: {
    scheme: "Plasma",
  },
  y: {
    label: "CNU",
    tickRotate: 30,
    tickFormat: (d) => cropText(d),
  },
  x: {
    grid: true,
    axis: "top",
    label: "Occurences",
    // ticks: 5,
    // domain: [0, Math.max(...cnu_search.map((d) => d.count)) + 1],
  },
  marks: [
    Plot.barX(cnu_search, {
      y: (d) => d[0],
      x: (d) => d[1],
      fill: (d) => d[1],
      sort: {y: "-x"},
      tip: {
        format: {
          fill: false
        },
        lineWidth: 25,
        textOverflow: "ellipsis-end"
      }
    }),
    Plot.barX(
      cnu_search, 
      Plot.pointerY({x: (d) => d[1], y: (d) => d[0]}),
    ),
  ],
});
display("cnu_search.length");
display(cnu_search.length);
```

```js
// Position count //
const position_count = d3.rollups(
    phase_2_data.researchers,
    (d) => d.length,
    (d) => d.position
  )
  .filter((d) => d[0] != null)
  .sort((a, b) => d3.descending(a[1], b[1]));

const position_search_input = Inputs.search(position_count, {
  placeholder: "Search Positions..."
});

const position_search = Generators.input(position_search_input);
```

```js
const position_pie = donutChart(position_count, {
  width: 700,
  fontSize: 18
});
```

```js
if (debug) {
  display("discipline_count");
  display(discipline_count);
  display("discipline_erc_count");
  display(discipline_erc_count);
  display("cnu_count");
  display(cnu_count);
  display("position_count");
  display(position_count);
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
  <div class="card grid-colspan-2">
    <h2>Researchers</h2>
    <div style="padding-bottom: 5px">${researcher_search_input}</div>
    <div>${researcher_table}</div>
  </div>
  <div class="card grid-colspan-1">
    <h2>ERC Disciplines</h2>
    <div>${discipline_erc_pie}</div>
  </div>
  <div class="card grid-colspan-1">
    <h2>CNUs</h2>
    <div style="padding: 5px">${cnu_search_input}</div>
    <div style="max-height: 350px; overflow: auto">${cnu_plot}</div>
  </div>
  <div class="card grid-colspan-2 grid-rowspan-2">
    Researcher map
  </div>
  <div class="card grid-colspan-1">
    positions
  </div>
  <div class="card grid-colspan-2">
    Graph, arc diagram; group by discipline, position, CNU, partner
  </div>
  <div class="card grid-colspan-1">
    <h2>Disciplines</h2>
    <div style="padding-bottom: 5px">${discipline_search_input}</div>
    <div style="max-height: 350px; overflow: auto">${discipline_plot}</div>
  </div>
</div>
<div class="grid grid-cols-2">
  
  
</div>

<!--
TODO:
- pie -> %
- add notes for data modifications
- dont show 
-->
