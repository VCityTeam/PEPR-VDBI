---
title: Phase 2 Overview Dashboard
theme: dashboard
---

# PEPR Projects Overview

```js
import {
  countEntities,
} from "./components/utilities.js";
import {
  getGeneraliteSheet,
  getChercheurSheet,
  getLaboSheet,
  getEtablissementSheet,
  resolveGeneraliteEntities,
  resolveChercheursEntities,
  resolveLaboratoireEntities,
  resolveEtablissementEntities,
  getColumnOptions,
  filterOnInput,
} from "./components/phase2-dashboard.js";
```

```js
const workbook1 = FileAttachment(
  "./data/PEPR_VBDI_analyse_210524_15h24_GGE.xlsx"
).xlsx();
```

```js
const anonymize = false;
const anonymizeDict = new Map();
const project_data = resolveGeneraliteEntities(
  getGeneraliteSheet(workbook1),
  anonymize,
  anonymizeDict
);
// resolveGeneraliteEntities -> @return:
// {
//    acronyme: string,
//    auditionne: boolean,
//    finance: boolean,
//    budget: string,
//    note: string,
//    defi: string,
//    nom_fr: string,
//    nom_en: string,
//    etablissements: [],
//    etablissements_count: number
//    laboratoires: [],
//    laboratoires_count: number
//    partenaires: [],
//    partenaires_count: number
//    action: string,
//    comment: string,
//    pourquoi: string,
//    notes: string
// }
const researcher_data = resolveChercheursEntities(
  getChercheurSheet(workbook1),
  anonymize,
  anonymizeDict
);
const laboratory_data = resolveLaboratoireEntities(
  getLaboSheet(workbook1),
  anonymize,
  anonymizeDict
);
const university_data = resolveEtablissementEntities(
  getEtablissementSheet(workbook1),
  anonymize,
  anonymizeDict
);
// display(project_data);
// display(researcher_data);
// display(laboratory_data);
// display(university_data);
```

```js
const auditioned_project_count = d3.reduce(
  project_data,
  (p, v) => p + (v.auditionne ? 1 : 0),
  0
);
const financed_project_count = d3.reduce(
  project_data,
  (p, v) => p + (v.finance ? 1 : 0),
  0
);

const partner_count = countEntities(project_data, (d) => d.partenaires);
// display(partner_count);
const total_partner_count = d3.reduce(partner_count, (p, v) => p + v.count, 0);
```

```js
// project_laboratories by project filter select inputs
const project_laboratories_auditioned_input = Inputs.select(
  getColumnOptions(project_data, "auditionne"),
  {
    value: "All",
    label: "Auditioned?",
  }
);
const project_laboratories_financed_input = Inputs.select(
  getColumnOptions(project_data, "finance"),
  {
    value: "All",
    label: "Financed?",
  }
);

const project_laboratories_auditioned = Generators.input(
  project_laboratories_auditioned_input
);
const project_laboratories_financed = Generators.input(
  project_laboratories_financed_input
);

// project_laboratories by project sort select inputs
const project_laboratories_sort_input = Inputs.select(
  new Map([
    ["Project name", true],
    ["Laboratory count", false],
  ]),
  {
    value: false,
    label: "Sort by",
  }
);
const project_laboratories_sort = Generators.input(project_laboratories_sort_input);
```

```js
// helper functions to access input field criteria
const critera_functions = [d => d.auditionne, d => d.finance];

const filtered_projects_laboratories = filterOnInput(
  project_data,
  [project_laboratories_auditioned, project_laboratories_financed],
  critera_functions
);
// display(filtered_projects_laboratories);
```

```js
const filtered_projects_laboratories_plot = Plot.plot({
  width,
  height: 450,
  marginBottom: 70,
  color: {
    scheme: "Plasma",
  },
  x: {
    tickRotate: 30,
    label: "Project",
  },
  y: {
    grid: true,
    label: "Laboratory count",
    domain: [0, Math.max(...filtered_projects_laboratories.map((d) => d.laboratoires_count)) + 1],
  },
  marks: [
    Plot.barY(filtered_projects_laboratories, {
      x: "acronyme",
      y: "laboratoires_count",
      fill: "laboratoires_count",
      sort: {x: project_laboratories_sort ? "x" : "-y"},
      tip: true,
    }),
  ],
});
```


```js
// create auditioned filter input
const project_auditioned_input = Inputs.select(
  getColumnOptions(project_data, "auditionne"),
  {
    value: "All",
    label: "Auditioned?",
  }
);
const projects_auditioned = Generators.input(
  project_auditioned_input
);

// create financed filter input
const project_financed_input = Inputs.select(
  getColumnOptions(project_data, "finance"),
  {
    value: "All",
    label: "Financed?",
  }
);
const projects_financed = Generators.input(
  project_financed_input
);

// create note filter input
const project_note_input = Inputs.select(
  getColumnOptions(project_data, "note"),
  {
    value: "All",
    label: "Grade?",
  }
);
const project_notes = Generators.input(
  project_note_input
);

// create defi filter input
const project_defi_input = Inputs.select(
  getColumnOptions(project_data, "defi"),
  {
    value: "All",
    label: "Challenge?",
  }
);
const project_defis = Generators.input(
  project_defi_input
);
```

```js
// filter project data based on input fields
const filtered_project_data = filterOnInput(
  project_data,
  [projects_auditioned, projects_financed, project_notes, project_defis],
  [(d) => d.auditionne, (d) => d.finance, (d) => d.note, (d) => d.defi]
);
// display(projects_auditioned);
// display(projects_financed);
// display(project_notes);
// display(filtered_project_data);
```

```js
// create search input
const project_search_input = Inputs.search(filtered_project_data, { placeholder: "Search projects..." })
const projects_search = Generators.input(project_search_input);
// display(projects_search);
```

```js
function sparkbar(max) {
  // code source: https://observablehq.com/framework/inputs/table
  return (x) => htl.html`<div style="
    background: var(--theme-green);
    color: black;
    width: ${100 * x / max}%;
    float: left;
    padding-right: 3px;
    box-sizing: border-box;
    overflow: visible;
    display: flex;
    justify-content: end;">${x.toLocaleString("en-US")}`
}

const project_table = Inputs.table(projects_search, {
  rows: 25,
  columns: [
    "acronyme",
    "note",
    "defi",
    "budget",
  ],
  header: {
    acronyme: "Project Acronyme",
    budget: "Budget (M)",
    note: "Jury grade",
    defi: "Challenge",
  },
  width: {
    acronyme: 120,
    note: 80,
    defi: 80,
  },
  align: {
    note: "center",
    defi: "center",
    budget: "left",
  },
  format: {
    budget: sparkbar(d3.max(projects_search, d => d.budget)),
  },
});
```

<div class="grid grid-cols-4">
  <div class="card">
    <h2>Project count (Total / Auditioned / Financed)</h2>
    <span class="big">${project_data.length.toLocaleString("en-US")} / 
    ${auditioned_project_count.toLocaleString("en-US")} / 
    ${financed_project_count.toLocaleString("en-US")}</span>
  </div>
  <div class="card">
    <h2>University count</h2>
    <span class="big">${university_data.length.toLocaleString("en-US")}</span>
  </div>
  <div class="card">
    <h2>Laboratory count</h2>
    <span class="big">${laboratory_data.length.toLocaleString("en-US")}</span>
  </div>
  <div class="card">
    <h2>Partner count</h2>
    <span class="big">${total_partner_count.toLocaleString("en-US")}</span>
  </div>
</div>
<div class="grid grid-cols-2">
  <div class="card grid-colspan-2">
    <h2>Laboratory count by Project</h2>
    <div>${project_laboratories_auditioned_input}</div>
    <div>${project_laboratories_financed_input}</div>
    <div>${project_laboratories_sort_input}</div>
    <div style="max-height: 450px">${filtered_projects_laboratories_plot}</div>
  </div>
</div>
<div class="grid grid-cols-2">
  <div class="card grid-colspan-2">
    <h2>PEPR Projects</h2>
    <div>${project_search_input}</div>
    <div>${project_auditioned_input}</div>
    <div>${project_financed_input}</div>
    <div>${project_note_input}</div>
    <div>${project_defi_input}</div>
    <div>${project_table}</div>
  </div>
</div>
