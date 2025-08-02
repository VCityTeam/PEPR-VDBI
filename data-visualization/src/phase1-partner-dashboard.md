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
import { projectionMap } from './components/projection-map.js';
```

```js
import {
  cropText,
  copyTableToClipboardButton,
} from './components/utilities.js';
```

```js
import { tableToSankeyGraph, sankeyDiagram } from './components/sankey.js';
```

```js
import {
  project_color_scale,
  legal_nature_colors,
  interpolated_legal_nature_color,
} from './components/color.js';
```

# Phase 1 Partners

```js
const filter_no_result = view(
  Inputs.toggle({ label: 'Filter results with no SIREN', value: true })
);
const filter_annex_data = view(
  Inputs.toggle({ label: 'Filter annex data', value: false })
);
const filter_general_data = view(
  Inputs.toggle({ label: 'Filter AAP generality data source', value: false })
);
const filter_aap_data = view(
  Inputs.toggle({ label: 'Filter AAP partenaires_aap2023 data source', value: false })
);
```

```js
function filterResults(d) {
  if (filter_no_result && !d.siren) {
    return false
  }
  if (filter_annex_data && d.sources.includes('financed_annex_partners_by_project')) {
    return false
  }
  if (filter_general_data && d.sources.includes('generality')) {
    return false
  }
  if (filter_aap_data && d.sources.includes('partenaires_aap2023')) {
    return false
  }
  return true
}
```

<div class="card">
  <h2>Legal nature distribution</h2>
  <h3>(Levels 1, 2)</h3>
  ${resize((width) =>
    sankeyDiagram(
      partner_graph_1_2, 
      {
        width: width,
        nodeFill: (d) => project_color_scale.unknown('black')(d.id),
        linkStroke: (d) => legal_nature_colors(Number(d.path[0][6])),
      }
    )
  )}

</div>

```js
const level_1_select = Inputs.select(
  new Set(partners_by_legal_nature_level_data.map((d) => d.cjn1_code)),
  {
    label: 'Select level 1 legal nature',
    value: 0,
  }
);

const level_1_value = Generators.input(level_1_select);
```

<div class="card">
  <h2>Level 3 legal nature distribution</h2>
  <h3>(Levels 2, 3)</h3>
  ${level_1_select}
  ${resize((width) =>
    sankeyDiagram(
      partner_graph_2_3, 
      {
        width: width,
        nodeFill: (d) => project_color_scale.unknown('black')(d.id),
        linkStroke: (d) => interpolated_legal_nature_color(
            level_1_value,
            filtered_cjn2_codes)
          (Number(d.path[0][7])),
      }
    )
  )}

</div>

<div class="card">
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
          borderListStrokeOpacity: [
            1,
            0.3,
          ],
        }
      )
    )
  }
</div>

<div class="card" style="padding: 0;">
  <div style="padding: 1em">
    <h2>All filtered partner data</h2>
    ${filtered_partner_data_search}
  </div>
  ${Inputs.table(filtered_partner_data_value)}
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
  list_distinct(list(project_coordinator)) AS project_coordinator,
  list_distinct(list(source)) AS sources,
  list_distinct(list(source_label)) AS source_labels,
FROM union_all
GROUP BY ALL;
```

```sql id=legal_natures
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
  ),
  aggregate_partners as (
    SELECT
      project_name,
      nom_complet,
      nature_juridique,
      siren,
      list_distinct(list(source)) AS sources,
      count() as count,
    FROM union_all
    GROUP BY all
  )
SELECT
  aggregate_partners.project_name,
  aggregate_partners.nom_complet,
  aggregate_partners.nature_juridique,
  cjn3."Libellé" as "cjn3_label",
  cjn3."Code" as "cjn3_code",
  cjn2."Libellé" as "cjn2_label",
  cjn2."Code" as "cjn2_code",
  cjn1."Libellé" as "cjn1_label",
  cjn1."Code" as "cjn1_code",
  siren,
  sources,
  aggregate_partners.count as "value",
from aggregate_partners
join cjn3
on cjn3.Code = aggregate_partners.nature_juridique
join cjn2
on cjn2.Code = floor(aggregate_partners.nature_juridique / 100)
join cjn1
on cjn1.Code = floor(aggregate_partners.nature_juridique / 1000)
```

```js
const world = FileAttachment('./data/world.json').json();
```

```js
const regions = await FileAttachment('./data/france_regions.json').json();
regions.features = regions.features.filter((d) => d.properties.nom != 'Corse');
```

```js
const departements = FileAttachment('./data/france_departements.json').json();
```

```js
const filtered_partner_data = [...all_partner_data].filter(filterResults);
```

```js
const filtered_legal_natures = [...legal_natures].filter(filterResults);
```

```js
const partners_by_legal_nature_level_data = filtered_legal_natures.map((d) => {
  const datum = { ...d };
  datum.level_3_label = `(Code ${datum.cjn3_code}) ${datum.cjn3_label}`;
  datum.level_2_label = `(Code ${datum.cjn2_code}) ${datum.cjn2_label}`;
  datum.level_1_label = `(Code ${datum.cjn1_code}) ${datum.cjn1_label}`;
  return datum;
});
```

```js
const partner_graph_1_2 = tableToSankeyGraph(
  partners_by_legal_nature_level_data,
  [
    'level_1_label',
    'level_2_label',
    // "level_3_label",
    'project_name',
  ]
);
console.debug('partner_graph_1_2', partner_graph_1_2);
```

```js
const filtered_partners_by_legal_nature_level_data =
  partners_by_legal_nature_level_data.filter(
    (d) => d.cjn1_code == level_1_value
  );

const partner_graph_2_3 = tableToSankeyGraph(
  filtered_partners_by_legal_nature_level_data,
  [
    // "level_1_label",
    'level_2_label',
    'level_3_label',
    'project_name',
  ]
);

const filtered_cjn2_codes = [
  ...new Set(
    filtered_partners_by_legal_nature_level_data.map((d) => d.cjn2_code % 10)
  ),
];

console.debug('partner_graph_2_3', partner_graph_2_3);
console.debug('filtered_cjn2_codes', filtered_cjn2_codes);
```

```js
const partners_by_city = d3.groups(filtered_partner_data, (d) =>
  d.code_postal ? d.code_postal.slice(0, 2) : null
);
```

```js
const legal_nature_plot_config = (data, width, height = undefined) => {
  return {
    width: width,
    height: height,
    marginBottom: 60,
    x: {
      tickRotate: -20,
      label: 'Legal nature',
      tickFormat: (d) => cropText(d, 15),
    },
    y: {
      grid: true,
      label: 'Occurences',
    },
    marks: [
      Plot.barY(data, {
        x: (d) => d[0],
        y: (d) => d[1],
        fill: (d) => d[1],
        sort: { x: 'x' },
        tip: {
          format: {
            fill: false,
          },
          lineWidth: 100,
        },
      }),
    ],
  };
};
```

```js
const filtered_partner_data_search = Inputs.search(filtered_partner_data);
const filtered_partner_data_value = Generators.input(
  filtered_partner_data_search
);
```

## Partner label data quality

<div class="grid grid-cols-2">
  <div class="card grid-colspan-2" style="padding: 0;">
    <div style="padding: 1em;">
      <h2>
        Labels from all sources: ${[...consensus].length}/${[...all_partner_data].length}
      </h2>
      <div>${consensus_search}</div>
    </div>
    ${
      resize((width) => 
        Inputs.table(consensus_search_result, { width: width, layout: 'auto' })
      )
    }
    ${copyTableToClipboardButton(
      consensus_search_result,
      null,
      'Copy data to clipboard'
    )}
    
  </div>
  <div class="card" style="padding: 0;">
    <div style="padding: 1em;">
      <h2>
        Labels with no siren/siret: ${[...no_results].length}/${[...all_partner_data].length}
      </h2>
      <div>${no_result_search}</div>
    </div>
    ${
      resize((width) => 
        Inputs.table(no_result_search_result, { width: width, layout: 'auto' })
      )
    }
    ${copyTableToClipboardButton(
      no_result_search_result,
      null,
      'Copy data to clipboard'
    )}
    
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
        Inputs.table(outlier_search_result, { width: width, layout: 'auto' })
      )
    }
    ${copyTableToClipboardButton(
      outlier_search_result,
      null,
      'Copy data to clipboard'
    )}
    
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
const consensus_search = Inputs.search(consensus);
const consensus_search_result = Generators.input(consensus_search);
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
select
  nom_complet,
  project_names,
  source_labels[1] as source_label,
  sources[1] as source,
from group_all
where length(sources) == 1
```

```sql id=consensus
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
      project_name,
      list(source_label) as source_labels,
      list(source) as sources,
    from union_all
    group by all
  )
select
  nom_complet,
  project_name,
  source_labels,
  -- sources,
from group_all
where length(sources) == 3 and nom_complet is not null
```

```js
const debug = true;

if (debug) {
  display('annex_partners');
  display(Inputs.table(await sql`select * from annex_partners`));
  display([...(await sql`select * from annex_partners`)].length);
  display('general_partners');
  display(Inputs.table(await sql`select * from general_partners`));
  display([...(await sql`select * from general_partners`)].length);
  display('aap_partners');
  display(Inputs.table(await sql`select * from aap_partners`));
  display([...(await sql`select * from aap_partners`)].length);

  display('all_partner_data');
  display(Inputs.table(all_partner_data));
  display('filtered_partner_data');
  display(Inputs.table(filtered_partner_data));
  display('legal_natures');
  display(Inputs.table(legal_natures));
  display('filtered_legal_natures');
  display(Inputs.table(filtered_legal_natures));

  // display("questionable_labels")
  // display(questionable_labels)
}
console.debug('partners_by_city', partners_by_city);
console.debug('world', world);
console.debug('regions', regions);
console.debug('departements', departements);
```
