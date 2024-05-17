---
title: Overview Dashboard
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
import { mapCounts, mergeCounts } from "./components/utilities.js";
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

function countEntities(data, mapFunction) {
  // flatten (map to array then merge) entities
  const entity_list = d3.merge(d3.map(data, (d) => mapFunction(d)));
  // group by entity then reduce to a count with d3.rollup()
  const entityCounts = d3.rollup(
    entity_list,
    (D) => D.length,
    (d) => d
  );
  // map entityCounts to a [{x: entity, y: count}] data structure
  const formatted_entity_counts = d3.map(
    entityCounts.entries(),
    ([key, value], i) => {
      return {
        entity: key,
        count: value,
      };
    }
  );
  // sort by entity and return
  return d3.sort(formatted_entity_counts, (d) => d.entity);
}
```

```js
const sorted_lab_counts = countEntities(
  projects_phase_1,
  (project) => project.laboratoires
);

const sorted_partner_counts = countEntities(
  projects_phase_1,
  (project) => project.partenaires
);

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
    <span class="big">${sorted_lab_counts.length.toLocaleString("en-US")}</span>
  </div>
  <div class="card">
    <h2>Partner count</h2>
    <span class="big">${sorted_partner_counts.length.toLocaleString("en-US")}</span>
  </div>
</div>

```js 
display(
  Plot.plot({
    height: sorted_keyword_counts.length * 15, // assure adequate horizontal space for each line
    marginLeft: 150,
    color: {
      scheme: "Spectral",
    },
    x: {
      grid: true,
      axis: "both",
      anchor: "top",
    },
    y: {
      tickFormat: (d) => (d.length > 25 ? d.slice(0, 23).concat("...") : d), // cut off long tick labels
      fontSize: 20,
    },
    marks: [
      Plot.barX(sorted_keyword_counts, {
        x: "count",
        y: "entity",
        title: "entity",
        fill: d3.map(sorted_keyword_counts, (d) => d.count + 2), // shift up the color values to be more visible
      }),
    ],
  })
);
```

```js
display(
  Plot.plot({
    height: sorted_establishment_counts.length * 20, // assure adequate horizontal space for each line
    width: 1000,
    marginLeft: 60,
    marginRight: 150,
    color: {
      scheme: "Plasma",
    },
    x: {
      grid: true,
      axis: "both",
      anchor: "top",
    },
    fy: {
      tickFormat: (d) => (d.length > 25 ? d.slice(0, 23).concat("...") : d), // cut off long tick labels
    },
    marks: [
      Plot.barX(sorted_establishment_counts, {
        x: "count",
        y: "type",
        fy: "entity",
        title: "entity",
        fill: "count",
        sort: { fy: "-x" },
      }),
    ],
  })
);
```
