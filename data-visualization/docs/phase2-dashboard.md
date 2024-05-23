---
title: Phase 2 Dashboard
theme: dashboard
---

# PEPR Dashboard

```js
import { mapEntitiesToGraph } from "./components/force-graph.js";
import { mapCounts, mergeCounts, countEntities } from "./components/utilities.js";
import {
  getGeneraliteSheet,
  getChercheurSheet,
  getLaboSheet,
  getEtablissementSheet,
  resolveGeneraliteEntities,
  resolveChercheursEntities,
  resolveLaboratoireEntities,
  resolveEtablissementEntities,
} from "./components/phase2-dashboard.js";
```

```js
const workbook1 = FileAttachment(
  "./data/PEPR_VBDI_analyse_210524_15h24_GGE.xlsx"
).xlsx();
```

```js
const project_data = resolveGeneraliteEntities(getGeneraliteSheet(workbook1));
const researcher_data = resolveChercheursEntities(getChercheurSheet(workbook1));
const laboratory_data = resolveLaboratoireEntities(getLaboSheet(workbook1));
const university_data = resolveEtablissementEntities(getEtablissementSheet(workbook1));
display(project_data);
// display(researcher_data);
// display(laboratory_data);
// display(university_data);
```

```js
const auditioned_project_count = d3.reduce(project_data, (p, v) => p + (v.auditionne ? 1 : 0), 0);
const financed_project_count = d3.reduce(project_data, (p, v) => p + (v.finance ? 1 : 0), 0);

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
const projects_by_university_project_owner_by_auditioned_by_financed = d3.group(
  project_data,
  (d) => d.etablissements[0],
  (d) => d.auditionne,
  (d) => d.finance
);
display(projects_by_university_project_owner_by_auditioned_by_financed);
const auditioned_input = html`<input type="checkbox">`;
const auditioned = Generators.input(auditioned_input);
const financed_input = html`<input type="checkbox">`;
const financed = Generators.input(financed_input);
```

```js echo
const watching = view(Inputs.checkbox(project_data, {label: "Projects", format: (d) => d.auditionne}));
```

```js echo
watching
```

<div class="grid grid-cols-3">
  <div class="card grid-colspan-2">
    <h2>Projects by University</h2>
    <div>${auditioned_input}: Auditioned</div>
    <div>${financed_input}: Financed</div>
    <div style="overflow: auto;">
      ${
        Plot.plot({
          width: 1000,
          marginBottom: 60,
          color: {
            scheme: "Plasma",
          },
          x: {
            tickRotate: 30,
            label: "City",
          },
          y: {
            grid: true,
            label: "Occurences",
          },
          marks: [
            Plot.barY(projects_by_university_project_owner_by_auditioned_by_financed, {
              x: "entity",
              y: "count",
              fill: "count",
              sort: { x: "-y" },
            }),
          ],
        })//$
      }
    </div>
  </div>
              <!-- 
  <div class="card">
    <h2>Keyword occurrences</h2>
    <div style="max-height: 400px; overflow: auto;">
      ${
        Plot.plot({
          height: sorted_keyword_counts.length * 20, // assure adequate horizontal space for each line
          width: 450,
          marginLeft: 140,
          color: {
            scheme: "Plasma",
          },
          x: {
            grid: true,
            axis: "top",
            ticks: 5,
            label: "Occurrences",
          },
          y: {
            tickFormat: (d) => (d.length > 25 ? d.slice(0, 23).concat("...") : d), // cut off long tick labels
            label: "Keyword",
          },
          marks: [
            Plot.barX(sorted_keyword_counts, {
              x: "count",
              y: "entity",
              fill: d3.map(sorted_keyword_counts, (d) => d.count + 2), // shift up the color values to be more visible
              sort: {y: "-x"},
            }),
          ],
        })//$
      }
    </div>
  </div>
  <div class="card grid-colspan-3">
    <h2>Establishment occurrences</h2>
    <div style="max-height: 400px; overflow: auto;">
      ${
        Plot.plot({
          height: sorted_establishment_counts.length * 25, // assure adequate horizontal space for each line
          width: 1500,
          marginLeft: 60,
          marginRight: 140,
          color: {
            scheme: "Plasma",
          },
          x: {
            grid: true,
            axis: "top",
            ticks: 20,
            label: "Occurrences",
          },
          fy: {
            tickFormat: (d) => (d.length > 25 ? d.slice(0, 23).concat("...") : d), // cut off long tick labels
            label: "Establishment",
          },
          marks: [
            Plot.barX(sorted_establishment_counts, {
              x: "count",
              y: "type",
              fy: "entity",
              fill: "count",
              sort: { fy: "-x" },
            }),
          ],
        })//$
      }
    </div>
  </div>
  <div class="card grid-colspan-3">
    <h2>Establishment occurrences</h2>
    <div style="max-height: 400px; overflow: auto;">
      ${
        Plot.plot({
          height: sorted_lab_counts.length * 17, // assure adequate horizontal space for each line
          width: 1500,
          marginLeft: 60,
          marginRight: 140,
          color: {
            scheme: "Plasma",
          },
          x: {
            grid: true,
            axis: "top",
            ticks: 12,
            label: "Occurrences",
          },
          fy: {
            tickFormat: (d) => (d.length > 25 ? d.slice(0, 23).concat("...") : d), // cut off long tick labels
            label: "Laboratory",
          },
          marks: [
            Plot.barX(sorted_lab_counts, {
              x: "count",
              y: "type",
              fy: "entity",
              fill: "count",
              sort: { fy: "-x" },
            }),
          ],
        })//$
      }
    </div>
  </div>
 -->
</div>
