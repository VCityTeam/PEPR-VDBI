---
title: Phase 2 Laboratory Dashboard
theme: dashboard
---

# PEPR Laboratory Statistics

```js
import {
  countEntities,
  addEntityProjectOwnerAndPartnerCounts,
  joinOnKeys,
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
  getSortableCountPlot,
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
joinOnKeys(
  project_data,
  "projects",
  "laboratoires",
  laboratory_data,
  "laboratoire"
);
```

```js
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

function getSortableCountPlot(
  data,
  {
    x = 'count',
    y = 'type',
    fy = 'entity',
    width = 1500,
    row_height = 17,
    margin_left = 60,
    margin_right = 140,
    color_scheme = 'Plasma',
    x_label = 'Occurrences',
    domain_min = 0,
    domain_max = 1, // added to max occurrences to define the domain max
    fy_tick_format_cuttoff = 25, // cut off label after this many characters
    fy_label = 'Laboratory',
    sort_criteria = '-x',
    tip = true
  } = {}
) {
  return Plot.plot({
    height: data.length * row_height, // assure adequate horizontal space for each line
    width: width,
    marginLeft: margin_left,
    marginRight: margin_right,
    color: {
      scheme: color_scheme,
    },
    x: {
      grid: true,
      axis: 'top',
      label: x_label,
      // domain useful for constraining ticks between 0 and max occurrences + 1
      domain: [domain_min, Math.max(...data.map((d) => d[x])) + domain_max],
    },
    fy: {
      tickFormat: (d) =>
        d.length > fy_tick_format_cuttoff ? d.slice(0, 23).concat('...') : d, // cut off long tick labels
      label: fy_label,
    },
    marks: [
      Plot.barX(data, {
        x: x,
        y: y,
        fy: fy,
        fill: x,
        sort: { fy: sort_criteria },
        tip: tip,
      }),
    ],
  });
}
const filtered_projects_by_laboratory_project_owner_plot = getSortableCountPlot(
  filtered_projects_by_laboratory_project_owner,
  {
    x: (d) => d.entity ? d.entity.laboratoire : d.entity,
    y: (d) => d.entity ? d.entity.laboratoire : d.entity, // TODO try with mutiple marks
  }
);

```

<div class="grid grid-cols-2">
  <div class="card grid-colspan-2">
    <h2>Projects by Laboratory Project Owners</h2>
    <div>${laboratory_auditioned_input}</div>
    <div>${laboratory_financed_input}</div>
    <div>${laboratory_sort_input}</div>
    <div style="max-height: 400px; overflow: auto;">${filtered_projects_by_laboratory_project_owner_plot}</div>
  </div>
</div>
