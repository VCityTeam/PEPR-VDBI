---
title: Researcher Dashboard
theme: [dashboard, light]
sql:
  annex_partners: ./data/partners_by_project_annex.csv
  aap_partners: ./data/partners_aap2023.csv
  general_partners: ./data/partners_general.csv
  cjn1: ./data/cj_septembre_2022_n1.csv
  cjn2: ./data/cj_septembre_2022_n2.csv
  cjn3: ./data/cj_septembre_2022_n3.csv
---

```js
import {
  projectionMap
} from "./components/projection-map.js";
import {
  cropText
} from "./components/utilities.js";
```

```js
const debug = false;
```

```sql id=partner_data
-- Clean tables
UPDATE general_partners
  SET project_name = 'RESILIENCE'
  WHERE project_name = 'RÉSILIENCE';
UPDATE general_partners
  SET project_name = 'NEO'
  WHERE project_name = 'NÉO';

-- merge tables as views
WITH
  union_all AS (
    SELECT *
    FROM aap_partners
    UNION
    SELECT *
    FROM annex_partners
    UNION
    SELECT *
    FROM general_partners
  ),
  partners AS (
    SELECT
      siret,
      project_name,
      nom_complet,
      nature_juridique,
      libelle_commune,
      commune,
      latitude,
      longitude,
      code_postal,
      region,
      list(project_coordinator) AS project_coordinator,
      list(source) AS source,
      list(source_label) AS source_label,
    FROM union_all
    GROUP BY ALL
  )
SELECT
  partners.*,
  cjn1.Libellé AS nature_juridique_n1,
  cjn2.Libellé AS nature_juridique_n2,
  cjn3.Libellé AS nature_juridique_n3,
FROM partners
JOIN cjn1
ON partners.nature_juridique // 1000 = cjn1.Code
JOIN cjn2
ON partners.nature_juridique // 100 = cjn2.Code
JOIN cjn3
ON partners.nature_juridique = cjn3.Code 
```

# Phase 1 Actors

```js
const world = FileAttachment("./data/world.json").json();
```
```js
const regions = FileAttachment("./data/regions.json").json();
```
```js
const departements = FileAttachment("./data/departements.json").json();
```

```js
const filtered_partner_data = [...partner_data]
  .filter((d) => d.source.includes('partenaires_aap2023'));

const partners_by_city = d3.groups(
  filtered_partner_data,
  (d) => d.code_postal ? d.code_postal.slice(0, 2) : null
);
```

```js
const legal_nature_plot_config = (data, width, height=undefined) => {
  return {
    width: width,
    height: height,
    marginBottom: 60,
    x: {
      tickRotate: -20,
      label: "Legal nature",
      tickFormat: (d) => cropText(d, 15),
    },
    y: {
      grid: true,
      label: "Occurences",
    },
    marks: [
      Plot.barY(
        data,
        {
          x: (d) => d[0],
          y: (d) => d[1],
          fill: (d) => d[1],
          sort: { x: "x" },
          tip: {
            format : {
              fill: false,
            },
            lineWidth: 100,
          },
        }
      ),
    ],
  };
};
```

```js
const filtered_partner_data_search = Inputs.search(filtered_partner_data);
const filtered_partner_data_value = Generators.input(filtered_partner_data_search);
```

```js
if (debug) {
  // display("Inputs.table(partner_data)");
  // display(Inputs.table(partner_data));
  display("Inputs.table(filtered_partner_data)");
  display(Inputs.table(filtered_partner_data));
  display("partners_by_city");
  display(partners_by_city);
  display("world");
  display(world);
  display("regions");
  display(regions);
  display("departements");
  display(departements);
}
```

<div class="grid grid-cols-3">
  <div class="card grid-rowspan-2 grid-colspan-2">
    <h1>Partner sites by city</h1>
    <div>${
      resize((width) => 
        projectionMap(
          partners_by_city,
          {
            width: width,
            height: width,
            entity_label: "Departement",
            borderList: [
              regions,
              departements,
            ],
            borderList: [
              regions,
              departements,
            ],
            borderListStrokeOpacity: [
              1,
              0.3,
            ],
          }
        )
      )
    }</div>
  </div>
  <div class="card">
    <h2>Partner by legal nature level 1</h2>
    <div>${
      resize((width) => 
        Plot.plot(
          legal_nature_plot_config(
            d3.rollups(
              filtered_partner_data,
              (D) => D.length,
              (d) => `(${Math.floor(d.nature_juridique / 1000)}) ${d.nature_juridique_n1}`
            ),
            width,
            width,
          )
        )
      )
    }</div>
  </div>
  <div class="card">
    <h2>Partner by legal nature level 2</h2>
    <div>${
      resize((width) => 
        Plot.plot(
          legal_nature_plot_config(
            d3.rollups(
              filtered_partner_data,
              (D) => D.length,
              (d) => `(${Math.floor(d.nature_juridique / 100)}) ${d.nature_juridique_n2}`
            ),
            width,
            width,
          )
        )
      )
    }</div>
  </div>
</div>

<div class="grid">
  <div class="card">
    <h2>Partner by legal nature level 3</h2>
    <div>${
      resize((width) => 
        Plot.plot(
          legal_nature_plot_config(
            d3.rollups(
              filtered_partner_data,
              (D) => D.length,
              (d) => `(${d.nature_juridique}) ${d.nature_juridique_n3}`
            ),
            width
          )
        )
      )
    }</div>
  </div>
  <div class="card" style="padding: 0;">
    <div style="padding: 1em">${filtered_partner_data_search}</div>${
      resize((width) => 
        Inputs.table(
          filtered_partner_data_value,
          {
            width: width,
          }
        )
      )
    }</div>
</div>
