---
title: Phase 2 Overview Dashboard
theme: dashboard
---

# Phase 2 Project Overview

```js
import {
  countEntities,
} from "./components/utilities.js";
import {
  getGeneralSheet,
  getResearcherSheet,
  getLabSheet,
  getInstitutionSheet,
  resolveGeneralEntities,
  resolveResearcherEntities,
  resolveLabEntities,
  resolveInstitutionEntities,
  getColumnOptions,
  filterOnInput,
} from "./components/phase2-dashboard.js";
```

```js
const debug = true;
const anonymize = false;
const anonymizeDict = new Map();

const workbook1 = FileAttachment(
  // "./data/PEPR_VBDI_analyse_210524_15h24_GGE.xlsx" //outdated
  "./data/241021 PEPR_VBDI_analyse modifiée JYT.xlsx"
).xlsx();
```

```js
const project_data = resolveGeneralEntities(
  getGeneralSheet(workbook1),
  anonymize,
  anonymizeDict
);
const researcher_data = resolveResearcherEntities(
  getResearcherSheet(workbook1),
  anonymize,
  anonymizeDict
);
const laboratory_data = resolveLabEntities(
  getLabSheet(workbook1),
  anonymize,
  anonymizeDict
);
const university_data = resolveInstitutionEntities(
  getInstitutionSheet(workbook1),
  anonymize,
  anonymizeDict
);
if (debug) {
  display("project_data")
  display(project_data);
  display("researcher_data");
  display(researcher_data);
  display("laboratory_data");
  display(laboratory_data);
  display("university_data");
  display(university_data);
}
```

```js
const auditioned_project_count = d3.reduce(
  project_data,
  (p, v) => p + (v.auditioned ? 1 : 0),
  0
);
const financed_project_count = d3.reduce(
  project_data,
  (p, v) => p + (v.financed ? 1 : 0),
  0
);

const partner_count = countEntities(project_data, (d) => d.partners);
// display(partner_count);
const total_partner_count = d3.reduce(partner_count, (p, v) => p + v.count, 0);
```

<!-- LABORATORY COUNT -->

```js
// project_laboratories by project filter select inputs
const project_laboratories_auditioned_input = Inputs.select(
  getColumnOptions(project_data, "auditioned"),
  {
    value: "All",
    label: "Auditioned?",
  }
);
const project_laboratories_financed_input = Inputs.select(
  getColumnOptions(project_data, "financed"),
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
    ["Project name ⇧", "x"],
    ["Project name ⇩", "-x"],
    ["Laboratory count ⇧", "y"],
    ["Laboratory count ⇩", "-y"],
  ]),
  {
    value: "x",
    label: "Sort by",
  }
);
const project_laboratories_sort = Generators.input(project_laboratories_sort_input);
```

```js
// helper functions to access input field criteria
const critera_functions = [d => d.auditioned, d => d.financed];

const filtered_projects_laboratories = filterOnInput(
  project_data,
  [project_laboratories_auditioned, project_laboratories_financed],
  critera_functions
);
if (debug) {
  display("filtered_projects_laboratories");
  display(filtered_projects_laboratories);
}
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
    domain: [0, Math.max(...filtered_projects_laboratories.map((d) => d.labs.length)) + 1],
  },
  marks: [
    Plot.barY(filtered_projects_laboratories, {
      x: "acronyme",
      y: d => d.labs.length,
      fill: d => d.labs.length,
      sort: {x: project_laboratories_sort},
      tip: true,
    }),
  ],
});
```

<!-- UNIVERSITY COUNT -->

```js
// project_universities by project filter select inputs
const project_universities_auditioned_input = Inputs.select(
  getColumnOptions(project_data, "auditioned"),
  {
    value: "All",
    label: "Auditioned?",
  }
);
const project_universities_financed_input = Inputs.select(
  getColumnOptions(project_data, "finance"),
  {
    value: "All",
    label: "Financed?",
  }
);

const project_universities_auditioned = Generators.input(
  project_universities_auditioned_input
);
const project_universities_financed = Generators.input(
  project_universities_financed_input
);

// project_universities by project sort select inputs
const project_universities_sort_input = Inputs.select(
  new Map([
    ["Project name ⇧", "x"],
    ["Project name ⇩", "-x"],
    ["University count ⇧", "y"],
    ["University count ⇩", "-y"],
  ]),
  {
    value: "x",
    label: "Sort by",
  }
);
const project_universities_sort = Generators.input(project_universities_sort_input);
```

```js
const filtered_projects_universities = filterOnInput(
  project_data,
  [project_universities_auditioned, project_universities_financed],
  critera_functions
);
if (debug) {
  display("filtered_projects_universities");
  display(filtered_projects_universities);
}
```

```js
const filtered_projects_universities_plot = Plot.plot({
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
    domain: [0, Math.max(...filtered_projects_universities.map((d) => d.institutions.length)) + 1],
  },
  marks: [
    Plot.barY(filtered_projects_universities, {
      x: "acronyme",
      y: d => d.institutions.length,
      fill: d => d.institutions.length,
      sort: {x: project_universities_sort},
      tip: true,
    }),
  ],
});
```

<!-- PROJECT FINANCING -->

```js
// create auditioned filter input
const project_auditioned_input = Inputs.select(
  getColumnOptions(project_data, "auditioned"),
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
const project_grade_input = Inputs.select(
  getColumnOptions(project_data, "note"),
  {
    value: "All",
    label: "Grade?",
  }
);
const project_grades = Generators.input(
  project_grade_input
);

// create defi filter input
const project_challenge_input = Inputs.select(
  getColumnOptions(project_data, "defi"),
  {
    value: "All",
    label: "Challenge?",
  }
);
const project_challenge = Generators.input(
  project_challenge_input
);
```

```js
// filter project data based on input fields
const filtered_project_data = filterOnInput(
  project_data,
  [projects_auditioned, projects_financed, project_grades, project_challenge],
  [(d) => d.auditioned, (d) => d.financed, (d) => d.grade, (d) => d.challenge]
);
// display(projects_auditioned);
// display(projects_financed);
// display(project_grades);
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
    "grade",
    "challenge",
    "budget",
  ],
  header: {
    acronyme: "Project Acronyme",
    budget: "Budget (M)",
    grade: "Jury grade",
    challenge: "Challenge",
  },
  width: {
    acronyme: 120,
    grade: 80,
    challenge: 80,
  },
  align: {
    grade: "center",
    challenge: "center",
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
  <div class="card grid-colspan-2">
    <h2>University count by Project</h2>
    <div>${project_universities_auditioned_input}</div>
    <div>${project_universities_financed_input}</div>
    <div>${project_universities_sort_input}</div>
    <div style="max-height: 450px">${filtered_projects_universities_plot}</div>
  </div>
</div>
<div class="grid grid-cols-2">
  <div class="card grid-colspan-2">
    <h2>Project Financing</h2>
    <div>${project_search_input}</div>
    <div>${project_auditioned_input}</div>
    <div>${project_financed_input}</div>
    <div>${project_grade_input}</div>
    <div>${project_challenge_input}</div>
    <div>${project_table}</div>
  </div>
</div>
