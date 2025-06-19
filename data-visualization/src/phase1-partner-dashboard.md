---
theme: [dashboard, light]
sql:
  annex_partners: ./data/partners_by_project_annex.csv
  general_partners: ./data/partners_general.csv
  aap_partners: ./data/partners_aap2023.csv
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
import {
  zoomableSunburst
} from "./components/zoomable-sunburst.js";
```

```js
const debug = false;

if (debug) {
  display("annex_partners");
  display(Inputs.table(await sql`select * from annex_partners`));
  display([... await sql`select * from annex_partners`].length);
  display("general_partners");
  display(Inputs.table(await sql`select * from general_partners`));
  display([...await sql`select * from general_partners`].length);
  display("aap_partners");
  display(Inputs.table(await sql`select * from aap_partners`));
  display([... await sql`select * from aap_partners`].length);

  display("all_partner_data");
  display(Inputs.table(all_partner_data));
  display("filtered_partner_data");
  display(Inputs.table(filtered_partner_data));

  display("partners_by_city");
  display(partners_by_city);
  display("world");
  display(world);
  display("regions");
  display(regions);
  display("departements");
  display(departements);

  // display("questionable_labels")
  // display(questionable_labels)
}
```

# Phase 1 Partners

```js
const filter_no_result = view(
  Inputs.toggle({label: "Filter results with no SIREN", value: true})
);
const filter_single_source = view(
  Inputs.toggle({label: "Filter results from only 1 source", value: false})
);
```
<div class="card">
  <h2>Legal nature distribution</h2>
  ${
    resize((width) => 
      zoomableSunburst()
    )
  }
</div>

<div class="grid grid-cols-3">
  <div class="card grid-rowspan-2 grid-colspan-2">
    <h1>Partner sites by city</h1>
    ${
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
    }

  </div>

  <div class="card">
    <h2>Partner by legal nature level 1</h2>
    ${
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
    }

  </div>
  <div class="card">
    <h2>Partner by legal nature level 2</h2>
    ${
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
    }
    
  </div>
</div>

<div class="grid">
  <div class="card">
    <h2>Partner by legal nature level 3</h2>
    ${
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
    }
    
  </div>
  <div class="card" style="padding: 0;">
    <div style="padding: 1em">
      <h2>All filtered partner data</h2>${filtered_partner_data_search}
    </div>
    ${
      resize((width) => 
        Inputs.table(
          filtered_partner_data_value,
          {
            width: width,
            rows: 20
          }
        )
      )
    }

  </div>
</div>


```sql id=all_partner_data
-- Clean tables
UPDATE general_partners
  SET project_name = 'RESILIENCE'
  WHERE project_name = 'RÉSILIENCE';
UPDATE general_partners
  SET project_name = 'NEO'
  WHERE project_name = 'NÉO';

-- merge tables
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
  )
SELECT
  -- siret,
  siren,
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
  list(source) AS sources,
  list(source_label) AS source_labels,
FROM union_all
GROUP BY ALL;
```

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
const filtered_partner_data = [...all_partner_data].filter((d) => {
  if (filter_no_result && !d.siren) {
    return false
  }
  if (filter_single_source && d.sources.length <= 1) {
    return false
  }
  return true
});

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

## Partner label data quality

<div class="grid grid-cols-2">
  <div class="card" style="padding: 0;">
    <div style="padding: 1em;">
      <h2>
        Labels from only 1 source: ${[...no_results].length}/${[...all_partner_data].length}
      </h2>
      <div>${no_result_search}</div>
    </div>
    ${
      resize((width) => 
        Inputs.table(no_result_search_result, { width: width })
      )
    }
    
  </div>
  <div class="card" style="padding: 0;">
    <div style="padding: 1em;">
      <h2>
        Labels from only 1 source: ${[...outliers].length}/${[...all_partner_data].length}
      </h2>
      <div>${outlier_search}</div>
    </div>
    ${
      resize((width) => 
        Inputs.table(outlier_search_result, { width: width })
      )
    }
    
  </div>
</div>

```js
const no_result_search = Inputs.search(no_results);
const no_result_search_result = Generators.input(no_result_search);
```
```js
const outlier_search = Inputs.search(outliers);
const outlier_search_result = Generators.input(outlier_search);
```

```js
const columns = [
  "siren",
  "project_name",
  "nom_complet",
  "source_label",
  "libelle_commune",
]
```

```sql id=no_results
UPDATE general_partners
  SET project_name = 'RESILIENCE'
  WHERE project_name = 'RÉSILIENCE';
UPDATE general_partners
  SET project_name = 'NEO'
  WHERE project_name = 'NÉO';

with
  union_all as (
    SELECT
      siren,
      source,
      source_label,
    FROM annex_partners
    where siren is null
    UNION
    SELECT
      siren,
      source,
      source_label,
    FROM general_partners
    where siren is null
    UNION
    SELECT
      siren,
      source,
      source_label,
    FROM aap_partners
    where siren is null
  )
select
  -- siren,
  source_label,
  list(source) as sources,
from union_all
group by all
```

```sql id=outliers
UPDATE general_partners
  SET project_name = 'RESILIENCE'
  WHERE project_name = 'RÉSILIENCE';
UPDATE general_partners
  SET project_name = 'NEO'
  WHERE project_name = 'NÉO';

with
  union_all as (
    SELECT
      source_label,
      nom_complet,
      project_name,
      source,
    FROM annex_partners
    union
    SELECT
      source_label,
      nom_complet,
      project_name,
      source,
    FROM general_partners
    union
    SELECT
      source_label,
      nom_complet,
      project_name,
      source,
    FROM aap_partners
  ),
  group_all as (
    SELECT
      nom_complet,
      list(project_name) as project_names,
      list(source_label) as source_labels,
      list(source) as sources,
    from union_all
    group by all
  )
select * from group_all
where length(sources) == 1
```
