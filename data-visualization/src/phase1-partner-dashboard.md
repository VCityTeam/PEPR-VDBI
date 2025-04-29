---
title: Researcher Dashboard
theme: [dashboard, light]
sql:
  ann: ./data/partners_by_project_annex.csv
  app: ./data/partners_aap2023.csv
  gen: ./data/partners_general.csv
---

```js
import {
  projectionMap
} from "./components/projection-map.js";

const debug = true;
```

```sql id=partner_data
-- Clean tables
UPDATE gen
  SET project_name = 'RESILIENCE'
  WHERE project_name = 'RÉSILIENCE';
UPDATE gen
  SET project_name = 'NEO'
  WHERE project_name = 'NÉO';

-- merge tables as views
WITH
  union_all AS (
    SELECT *
    FROM app
    UNION
    SELECT *
    FROM ann
    UNION
    SELECT *
    FROM gen
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
      list(project_coordinator) AS project_coordinator,
      list(source) AS source,
      list(source_label) AS source_label,
    FROM union_all
    GROUP BY ALL
  )
SELECT * FROM partners
```

# Phase 1 Actors

```js
const world = FileAttachment("./data/world.json").json();
```

```js
const filtered_partner_data = [...partner_data]
  .filter((d) => d.source.includes('partenaires_aap2023'));

const partners_by_city = d3.groups(
  filtered_partner_data,
  (d) => d.libelle_commune
);

if (debug) {
  display(Inputs.table(partner_data));
  display(filtered_partner_data);
  // display(Inputs.table(filtered_partner_data));
  display(partners_by_city);
}
```

<div class="grid grid-cols">
  <div class="card">
    <h1>Partner sites by city</h1>
    <div>
      ${
        resize((width) => 
          projectionMap(
            partners_by_city,
            {
              width: width,
              borderList: [
                topojson.feature(world, world.objects.land),
                topojson.mesh(world, world.objects.countries, (a, b) => a !== b)
              ],
            }
          )
        )//$
      }
    </div>
  </div>
  <!-- <div class="card grid-colspan-4 grid-rowspan-3">
    <h2>Researcher Knowledge Graph</h2>
    <div style="padding-bottom: 5px;">${researcher_triples_predicate_select_input}</div>
    <div style="overflow: auto;">${researcher_force_graph}</div>
  </div> -->
</div>
