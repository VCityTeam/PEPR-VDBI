---
title: Phase 2 Financing Dashboard
theme: dashboard
---

# PEPR Projects Financing

```js
import {
  getGeneraliteSheet,
  resolveGeneraliteEntities,
  filterOnInput,
  getColumnOptions,
} from "./components/phase2-dashboard.js";
```

```js
const workbook1 = FileAttachment(
  "./data/PEPR_VBDI_analyse_210524_15h24_GGE.xlsx"
).xlsx();
```

```js
const anonymize = true;
const anonymizeDict = new Map();
const project_data = resolveGeneraliteEntities(getGeneraliteSheet(workbook1), anonymize, anonymizeDict);
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
// display(project_data);
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
  <div class="card grid-colspan-4">
    <h2>PEPR Projects</h2>
    <div>${project_search_input}</div>
    <div>${project_auditioned_input}</div>
    <div>${project_financed_input}</div>
    <div>${project_note_input}</div>
    <div>${project_defi_input}</div>
    <div>${project_table}</div>
  </div>
</div>
