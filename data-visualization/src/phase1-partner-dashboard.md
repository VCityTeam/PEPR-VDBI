---
title: Researcher Dashboard
theme: [dashboard, light]
sql:
  ann: ./data/partners_by_project_annex.csv
  aap: ./data/partners_aap2023.csv
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
    FROM aap
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
      code_postal,
      region,
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
const regions = FileAttachment("./data/regions.json").json();
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
