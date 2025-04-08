---
title: Phase 2 Laboratory Dashboard
theme: [dashboard, light]
---

# Phase 2 Institutions

```js
import {
  countEntities,
  addEntityProjectOwnerAndPartnerCounts,
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
  getFilterableCountPlot,
} from "./components/phase2-dashboard.js";
```

```js
const workbook1 = FileAttachment(
  "./data/private/PEPR_VBDI_analyse_210524_15h24_GGE.xlsx"
).xlsx();
```

```js
const anonymize = false;
const anonymizeDict = new Map();
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
const project_data = resolveGeneraliteEntities(
  getGeneraliteSheet(workbook1),
  anonymize,
  anonymizeDict
);
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
display("project_data");
display(project_data);
// display("researcher_data");
// display(researcher_data);
display("laboratory_data");
display(laboratory_data);
// display("university_data");
// display(university_data);
```

```js
addEntityProjectOwnerAndPartnerCounts(
  project_data,
  laboratory_data,
  (project) => project.laboratoires.slice(0, 1),
  (project) => project.laboratoires.slice(1),
  (lab) => lab.laboratoire,
);

// export function addEntityProjectOwnerAndPartnerCounts(
//   source_data,
//   target_data,
//   ownerMapFunction,
//   partnerMapFunction,
//   getTargetDatumIdFunction
// ) {
//   const owner_count = countEntities(source_data, ownerMapFunction);
//   const partner_count = countEntities(source_data, partnerMapFunction);

//   target_data.forEach((di) => {
//     const di_entity = getTargetDatumIdFunction(di);
//     di.project_owner_count = owner_count.find((dj) => di_entity === dj.entity);
//     di.project_partner_count = partner_count.find(
//       (dj) => di_entity === dj.entity
//     );
//     di.project_total_count = di.project_owner_count + di.project_partner_count;
//   });
// }

// university by project filter checkboxes
// const university_project_stage_input = Inputs.checkbox(['Auditioned', 'Financed']);
// const university_project_stage = Generators.input(university_project_stage_input);

// university by project filter radio buttons
// const university_project_stage_input = Inputs.radio(['All', 'Auditioned', 'Financed'], {value: 'All',});
// const university_project_stage = Generators.input(university_project_stage_input);

// university by project filter select inputs
const university_auditioned_input = Inputs.select(
  getColumnOptions(project_data, "auditionne"),
  {
    value: "All",
    label: "Auditioned?",
  }
);
const university_financed_input = Inputs.select(
  getColumnOptions(project_data, "finance"),
  {
    value: "All",
    label: "Financed?",
  }
);
const university_auditioned = Generators.input(university_auditioned_input);
const university_financed = Generators.input(university_financed_input);

// university by project sort select inputs
const university_sort_input = Inputs.select(
  new Map([
    ["University name", true],
    ["Project count", false],
  ]),
  {
    value: false,
    label: "Sort by",
  }
);
const university_sort = Generators.input(university_sort_input);

// laboratory by project filter select inputs
const laboratory_auditioned_input = Inputs.select(
  getColumnOptions(project_data, "auditionne"),
  {
    value: "All",
    label: "Auditioned?",
  }
);
const laboratory_financed_input = Inputs.select(
  getColumnOptions(project_data, "finance"),
  {
    value: "All",
    label: "Financed?",
  }
);
const laboratory_auditioned = Generators.input(laboratory_auditioned_input);
const laboratory_financed = Generators.input(laboratory_financed_input);

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
```

```js
// helper functions to access input field criteria
const critera_functions = [d => d.auditionne, d => d.finance];

// group by university project owner
const projects_by_university_project_owner = d3.groups(
  project_data,
  (d) => d.etablissements[0]
);
// display(projects_by_university_project_owner);

// for every group of projects by university map...
const filtered_projects_by_university_project_owner = d3.map(
  projects_by_university_project_owner,
  (D) => {
    // ... a filter on the auditionne and finance fields iff specified in the university_project_stage input
    const filtered_projects = filterOnInput(
      D[1],
      [university_auditioned, university_financed],
      critera_functions
    );
    // ... and reformat for plot
    return {
      entity: D[0],
      projects: filtered_projects,
      project_count: filtered_projects.length,
    };
  }
);
// display(filtered_projects_by_university_project_owner);
```

```js
// format laboratory project owner data

// group by laboratory project owner
const projects_by_laboratory_project_owner = d3.groups(
  project_data,
  (d) => d.laboratoires[0]
);
display("projects_by_laboratory_project_owner");
display(projects_by_laboratory_project_owner);

// for every group of project owner by laboratory map...
const filtered_projects_by_laboratory_project_owner = d3.map(
  projects_by_laboratory_project_owner,
  (D) => {
    // ... a filter on the auditionne and finance fields iff specified in the university_project_stage input
    const filtered_projects = filterOnInput(
      D[1],
      [laboratory_auditioned, laboratory_financed],
      critera_functions
    );
    // ... and reformat for plot
    return {
      entity: D[0],
      projects: filtered_projects,
      project_count: filtered_projects.length,
    };
  }
);
display("filtered_projects_by_laboratory_project_owner");
display(filtered_projects_by_laboratory_project_owner);
```

```js
const filtered_projects_by_university_project_owner_plot = Plot.plot({
  height: filtered_projects_by_university_project_owner.length * 20, // assure adequate horizontal space for each line
  width: 600,
  marginLeft: 250,
  color: {
    scheme: "Plasma",
  },
  x: {
    grid: true,
    axis: "top",
    label: "Project count",
    domain: [0, Math.max(...filtered_projects_by_university_project_owner.map((d) => d.project_count)) + 1], // set domain from 0 to max project count value + 1
  },
  y: {
    tickFormat: (d) => d.length > 50 ? d.slice(0, 48).concat("...") : d, // cut off long tick labels
    label: "University",
  },
  marks: [
    Plot.barX(filtered_projects_by_university_project_owner, {
      x: "project_count",
      y: "entity",
      fill: d3.map(filtered_projects_by_university_project_owner, (d) => d.project_count + 2), // shift up the color values to be more visible
      sort: {y: university_sort ? "y" : "-x"},
      tip: true,
    }),
  ],
});

// const filtered_projects_by_laboratory_project_owner_plot = Plot.plot({
//   height: filtered_projects_by_laboratory_project_owner.length * 20, // assure adequate horizontal space for each line
//   width: 600,
//   marginLeft: 400,
//   color: {
//     scheme: "Plasma",
//   },
//   x: {
//     grid: true,
//     axis: "top",
//     label: "Project count",
//     domain: [0, Math.max(...filtered_projects_by_laboratory_project_owner.map((d) => d.project_count)) + 1], // set domain from 0 to max project count value + 1
//   },
//   y: {
//     tickFormat: (d) => d.length > 65 ? d.slice(0, 63).concat("...") : d, // cut off long tick labels
//     label: "Laboratory",
//   },
//   marks: [
//     Plot.barX(filtered_projects_by_laboratory_project_owner, {
//       x: "project_count",
//       y: "entity",
//       fill: d3.map(filtered_projects_by_laboratory_project_owner, (d) => d.project_count + 2), // shift up the color values to be more visible
//       sort: {y: laboratory_sort ? "y" : "-x"},
//       tip: true,
//     }),
//   ],
// });

const filtered_projects_by_laboratory_project_owner_plot = getFilterableCountPlot(
  filtered_projects_by_laboratory_project_owner,
);
```

<div class="grid grid-cols-2">
  <div class="card">
    <h2>Projects by University Project Owners</h2>
    <div>${university_auditioned_input}</div>
    <div>${university_financed_input}</div>
    <div>${university_sort_input}</div>
    <div style="max-height: 400px; overflow: auto;">${filtered_projects_by_university_project_owner_plot}</div>
  </div>
  <div class="card">
    <h2>Projects by Laboratory Project Owners</h2>
    <div>${laboratory_auditioned_input}</div>
    <div>${laboratory_financed_input}</div>
    <div>${laboratory_sort_input}</div>
    <div style="max-height: 400px; overflow: auto;">${filtered_projects_by_laboratory_project_owner_plot}</div>
  </div>
</div>
