---
title: Phase 2 Project Dashboard
theme: dashboard
---

# PEPR Project Statistics

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
// const laboratory_data = resolveLaboratoireEntities(
//   getLaboSheet(workbook1),
//   anonymize,
//   anonymizeDict
// );
display(project_data);
// display(laboratory_data);
```

```js
// laboratory by project sort select inputs
const laboratory_sort_input = Inputs.select(
  new Map([
    ["Laboratory name", true],
    ["Project count", false],
  ]),
  {
    value: false,
    label: "Sort by",
  }
);
const laboratory_sort = Generators.input(laboratory_sort_input);

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

<div class="grid grid-cols-2">
  <div class="card grid-colspan-2">
    <h2>Laboratory count by Project</h2>
    <div>${project_laboratories_auditioned_input}</div>
    <div>${project_laboratories_financed_input}</div>
    <div>${project_laboratories_sort_input}</div>
    <div style="max-height: 450px">${filtered_projects_laboratories_plot}</div>
  </div>
</div>
