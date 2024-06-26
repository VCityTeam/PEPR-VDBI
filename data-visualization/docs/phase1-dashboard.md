---
title: Phase 1 Dashboard
theme: dashboard
---

# PEPR Dashboard

```js
import {
  getPhase1Sheet,
  getVillesSheet,
  getLabSheet,
  resolvePhase1Entities,
  resolveLaboEntities,
} from "./components/240117-proposals-labs-establishments.js";
import {
  getProductSheet,
  resolveProjectEntities,
} from "./components/240108-proposals-keywords.js";
import { mapEntitiesToGraph } from "./components/force-graph.js";
import { mapCounts, mergeCounts, countEntities } from "./components/utilities.js";
```

```js
const workbook1 = FileAttachment(
  "./data/240108_consortium, contenus des propositions CNRS-SHS_GGE_JYT_ANRT.xlsx"
).xlsx();

const workbook2 = FileAttachment(
  "./data/240117 consortium laboratoire, établissement CNRS-SHS_Stat.xlsx"
).xlsx();
```

```js
const projects_product = resolveProjectEntities(getProductSheet(workbook1));
const projects_phase_1 = resolvePhase1Entities(getPhase1Sheet(workbook2));

const city_data = getVillesSheet(workbook2).map((d) => {
  return {
    etablissement: [d["Etablissements"]],
    lieu: [d["Lieu"]],
  };
});
```

```js
const sorted_partner_counts = countEntities(
  projects_phase_1,
  (project) => project.partenaires
);
display(projects_phase_1)
display(sorted_partner_counts)
const sorted_keyword_counts = countEntities(
  projects_product,
  (project) => project.motClefs
);

const sorted_establishment_owner_counts = countEntities(
  projects_phase_1,
  (project) => project.etablissements.slice(0, 1)
);

const sorted_establishment_partner_counts = countEntities(
  projects_phase_1,
  (project) => project.etablissements.slice(1)
);

const establishment_counts = mapCounts(
  [sorted_establishment_owner_counts, sorted_establishment_partner_counts],
  ["owner", "partner"]
);

const total_establishment_counts = d3.sort(
  d3
    .rollup(
      establishment_counts,
      (D) => {
        let count = 0;
        D.forEach((d) => {
          count = count + d.count;
        });
        return {
          entity: D[0].entity,
          count: count,
          type: "total",
        };
      },
      (d) => d.entity
    )
    .values(),
  (d) => d.entity
);

const sorted_establishment_counts = d3.sort(
  establishment_counts.concat(total_establishment_counts),
  (d) => d.count,
  (d) => d.entity
);

const city_count = countEntities(
  city_data,
  (establishment) => establishment.lieu
);

const lab_owner_count = countEntities(projects_phase_1, (project) =>
  project.laboratoires.slice(0, 1)
);

const lab_partner_count = countEntities(projects_phase_1, (project) =>
  project.laboratoires.slice(1)
);

const lab_counts = mapCounts(
  [lab_owner_count, lab_partner_count],
  ["owner", "partner"]
);

const total_lab_counts = d3.sort(
  d3
    .rollup(
      lab_counts,
      (D) => {
        let count = 0;
        D.forEach((d) => {
          count = count + d.count;
        });
        return {
          entity: D[0].entity,
          count: count,
          type: "total",
        };
      },
      (d) => d.entity
    )
    .values(),
  (d) => d.entity
);

const sorted_lab_counts = [];

d3.sort(
  mergeCounts(
    [lab_owner_count, lab_partner_count, total_lab_counts],
    ["owner_count", "partner_count", "total_count"]
  ).values(),
  (d) => d.entity
).forEach((d) => {
  sorted_lab_counts.push({
    entity: d.entity,
    count: d.owner_count,
    type: "owner",
  });
  sorted_lab_counts.push({
    entity: d.entity,
    count: d.partner_count,
    type: "partner",
  });
  sorted_lab_counts.push({
    entity: d.entity,
    count: d.total_count,
    type: "total",
  });
});
display(sorted_lab_counts);
```

<div class="grid grid-cols-4">
  <div class="card">
    <h2>Project count</h2>
    <span class="big">${projects_product.length.toLocaleString("en-US")}</span>
  </div>
  <div class="card">
    <h2>University count</h2>
    <span class="big">${sorted_establishment_counts.length.toLocaleString("en-US")}</span>
  </div>
  <div class="card">
    <h2>Laboratory count</h2>
    <span class="big">${total_lab_counts.length.toLocaleString("en-US")}</span>
  </div>
  <div class="card">
    <h2>Partner count</h2>
    <span class="big">${sorted_partner_counts.length.toLocaleString("en-US")}</span>
  </div>
</div>

<div class="grid grid-cols-3">
  <div class="card grid-colspan-2">
    <h2>City occurrences</h2>
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
            Plot.barY(city_count, {
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
    <h2>Laboratory occurrences</h2>
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
</div>
