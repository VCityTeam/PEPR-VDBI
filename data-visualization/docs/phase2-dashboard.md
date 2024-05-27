---
title: Phase 2 Dashboard
theme: dashboard
---

# PEPR Dashboard

```js
import { mapEntitiesToGraph } from './components/force-graph.js';
import {
  mapCounts,
  mergeCounts,
  countEntities,
} from './components/utilities.js';
import {
  getGeneraliteSheet,
  getChercheurSheet,
  getLaboSheet,
  getEtablissementSheet,
  resolveGeneraliteEntities,
  resolveChercheursEntities,
  resolveLaboratoireEntities,
  resolveEtablissementEntities,
} from './components/phase2-dashboard.js';
```

```js
const workbook1 = FileAttachment(
  './data/PEPR_VBDI_analyse_210524_15h24_GGE.xlsx'
).xlsx();
```

```js
const project_data = resolveGeneraliteEntities(getGeneraliteSheet(workbook1));
// resolveGeneraliteEntities -> @return:
// {
//   acronyme: [],
//   auditionne: boolean,
//   finance: boolean,
//   budget: [],
//   note: [],
//   defi: [],
//   nom_fr: [],
//   nom_en: [],
//   etablissements: [],
//   laboratoires: [],
//   partenaires: [],
//   action: [],
//   comment: [],
//   pourquoi: [],
//   notes: []
// }
const researcher_data = resolveChercheursEntities(getChercheurSheet(workbook1));
const laboratory_data = resolveLaboratoireEntities(getLaboSheet(workbook1));
const university_data = resolveEtablissementEntities(
  getEtablissementSheet(workbook1)
);
display(project_data);
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

```js
// university by project filter checkboxes
// const university_project_stage_input = Inputs.checkbox(['Auditioned', 'Financed']);
// const university_project_stage = Generators.input(university_project_stage_input);

// university by project filter radio buttons
// const university_project_stage_input = Inputs.radio(['All', 'Auditioned', 'Financed'], {value: 'All',});
// const university_project_stage = Generators.input(university_project_stage_input);

// university by project filter select inputs
const university_auditioned_input = Inputs.select(
  new Map([['All', 0], ['Yes', 1], ['No', 2]]),
  {
    value: 'All',
    label: 'Auditioned?',
  },
);
const university_financed_input = Inputs.select(
  new Map([['All', 0], ['Yes', 1], ['No', 2]]),
  {
    value: 'All',
    label: 'Financed?',
  },
);
const university_auditioned = Generators.input(university_auditioned_input);
const university_financed = Generators.input(university_financed_input);

// laboratory by project filter select inputs
const laboratory_auditioned_input = Inputs.select(
  new Map([['All', 0], ['Yes', 1], ['No', 2]]),
  {
    value: 'All',
    label: 'Auditioned?',
  },
);
const laboratory_financed_input = Inputs.select(
  new Map([['All', 0], ['Yes', 1], ['No', 2]]),
  {
    value: 'All',
    label: 'Financed?',
  },
);
const laboratory_auditioned = Generators.input(laboratory_auditioned_input);
const laboratory_financed = Generators.input(laboratory_financed_input);
```

```js
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
    const filtered_projects = d3.filter( 
      D[1],
      (d) => {
        let auditioned_filter = false;
        switch (university_auditioned) {
          case 0: // All
            auditioned_filter = true;
            break;
          case 1: // Yes
            auditioned_filter = d.auditionne;
            break;
          case 2: // No
            auditioned_filter = !d.auditionne;
            break;
          default:
            console.error(`Invalid university_auditioned value: ${university_auditioned}`);
            auditioned_filter = false;
            break;
        }
        console.debug('auditioned_filter', auditioned_filter);
        let financed_filter = false;
        switch (university_financed) {
          case 0: // All
            financed_filter = true;
            break;
          case 1: // Yes
            financed_filter = d.finance;
            break;
          case 2: // No
            financed_filter = !d.finance;
            break;
          default:
            console.error(`Invalid university_financed value: ${university_financed}`);
            financed_filter = false;
            break;
        }
        console.debug('financed_filter', financed_filter);
        return auditioned_filter && financed_filter;
      }
    );
    // ... and reformat for plot
    return {
      university: D[0],
      projects: filtered_projects,
      project_count: filtered_projects.length,
    };
  }
);
// display(filtered_projects_by_university_project_owner);
```

```js
// group by laboratory project owner
const projects_by_laboratory_project_owner = d3.groups(
  project_data,
  (d) => d.laboratoires[0]
);
// display(projects_by_laboratory_project_owner);

// for every group of projects by laboratory map...
const filtered_projects_by_laboratory_project_owner = d3.map(
  projects_by_laboratory_project_owner,
  (D) => {
    // ... a filter on the auditionne and finance fields iff specified in the laboratory_project_stage input
    const filtered_projects = d3.filter( 
      D[1],
      (d) => {
        let auditioned_filter = false;
        switch (laboratory_auditioned) {
          case 0: // All
            auditioned_filter = true;
            break;
          case 1: // Yes
            auditioned_filter = d.auditionne;
            break;
          case 2: // No
            auditioned_filter = !d.auditionne;
            break;
          default:
            console.error(`Invalid laboratory_auditioned value: ${laboratory_auditioned}`);
            auditioned_filter = false;
            break;
        }
        console.debug('auditioned_filter', auditioned_filter);
        let financed_filter = false;
        switch (laboratory_financed) {
          case 0: // All
            financed_filter = true;
            break;
          case 1: // Yes
            financed_filter = d.finance;
            break;
          case 2: // No
            financed_filter = !d.finance;
            break;
          default:
            console.error(`Invalid laboratory_financed value: ${laboratory_financed}`);
            financed_filter = false;
            break;
        }
        console.debug('financed_filter', financed_filter);
        return auditioned_filter && financed_filter;
      }
    );
    // ... and reformat for plot
    return {
      laboratory: D[0],
      projects: filtered_projects,
      project_count: filtered_projects.length,
    };
  }
);
// display(filtered_projects_by_laboratory_project_owner);
```

```js
// materialize lab count
const project_data_with_lab_count = d3.map(
  project_data,
  (d) => {
    const copy = {...d};
    copy.lab_count = copy.laboratoires.length;
    copy.name = copy.acronyme[0];
    return copy;
  }
)
display(project_data_with_lab_count);

```

<div class="grid grid-cols-2">
  <div class="card">
    <h2>Projects by University Project Owners</h2>
    <div>${university_auditioned_input}</div>
    <div>${university_financed_input}</div>
    <div style="max-height: 400px; overflow: auto;">
      ${
        Plot.plot({
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
          },
          y: {
            tickFormat: (d) => d.length > 50 ? d.slice(0, 48).concat("...") : d, // cut off long tick labels
            label: "University",
          },
          marks: [
            Plot.barX(filtered_projects_by_university_project_owner, {
              x: "project_count",
              y: "university",
              fill: d3.map(filtered_projects_by_university_project_owner, (d) => d.project_count + 2), // shift up the color values to be more visible
              sort: {y: "-x"},
            }),
          ],
        })//$
      }
    </div>
  </div>
  <div class="card">
    <h2>Projects by Laboratory Project Owners</h2>
    <div>${laboratory_auditioned_input}</div>
    <div>${laboratory_financed_input}</div>
    <div style="max-height: 400px; overflow: auto;">
      ${
        Plot.plot({
          height: filtered_projects_by_laboratory_project_owner.length * 20, // assure adequate horizontal space for each line
          width: 600,
          marginLeft: 400,
          color: {
            scheme: "Plasma",
          },
          x: {
            grid: true,
            axis: "top",
            label: "Project count",
          },
          y: {
            tickFormat: (d) => d.length > 65 ? d.slice(0, 63).concat("...") : d, // cut off long tick labels
            label: "Laboratory",
          },
          marks: [
            Plot.barX(filtered_projects_by_laboratory_project_owner, {
              x: "project_count",
              y: "laboratory",
              fill: d3.map(filtered_projects_by_laboratory_project_owner, (d) => d.project_count + 2), // shift up the color values to be more visible
              sort: {y: "-x"},
            }),
          ],
        })//$
      }
    </div>
  </div>
  <div class="card">
    <h2>Laboratories by Projects</h2>
    <div style="max-height: 400px; overflow: auto;">
      ${
        Plot.plot({
          height: project_data_with_lab_count.length * 20, // assure adequate horizontal space for each line
          width: 600,
          marginLeft: 100,
          color: {
            scheme: "Plasma",
          },
          x: {
            grid: true,
            axis: "top",
            label: "Laboratory count",
          },
          y: {
            tickFormat: (d) => d.length > 65 ? d.slice(0, 63).concat("...") : d, // cut off long tick labels
            label: "Project",
          },
          marks: [
            Plot.barX(project_data_with_lab_count, {
              x: "lab_count",
              y: "name",
              fill: d3.map(project_data_with_lab_count, (d) => d.lab_count + 2), // shift up the color values to be more visible
              sort: {y: "-x"},
            }),
          ],
        })//$
      }
    </div>
  </div>
</div>

