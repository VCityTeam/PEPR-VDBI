---
toc: false
sql:
  annex_partners: /data/partners_by_project_annex.csv
  general_partners: /data/partners_general.csv
  aap_partners: /data/partners_aap2023.csv
  cjn1: /data/cj_septembre_2022_n1.csv
  cjn2: /data/cj_septembre_2022_n2.csv
  cjn3: /data/cj_septembre_2022_n3.csv
---

# Phase 1 Partners

```js
import { cropText, copyTableToClipboardButton } from "/components/utilities.js"
```

```js
import { parallelSetToGraph, sankeyDiagram } from "/components/sankey.js"
```

```js
import { parseTabularGraph } from "/components/graph.js"
```

```js
import {
  project_color_scale,
  legal_nature_colors,
  interpolated_legal_nature_color,
} from "/components/color.js"
```

```js
const filter_no_result = view(
  Inputs.toggle({ label: "Exclude results with no SIREN", value: true })
)
```

Excluded data sources:

```js
const filter_annex_data = view(
  Inputs.toggle({ label: "Financial annexes", value: false })
)
const filter_general_data = view(
  Inputs.toggle({ label: "AAP generality", value: false })
)
const filter_aap_data = view(
  Inputs.toggle({
    label: "AAP partenaires_aap2023",
    value: false,
  })
)
```

<div class="card">
  <h2>Legal nature distributions by project</h2>
  <h3>(Levels 1, 2, 3)</h3>
  <!-- ${level_1_select} -->
  <!-- $ -->
  ${resize((width) =>
    sankeyDiagram(
      filtered_partners_by_project_graph_1_2,
      {
        width: width,
        pathMap: () => [],
        nodeFill: (d) => project_color_scale.unknown('black')(d.id),
        linkStroke: (d) => legal_nature_colors(Number(d.source.id[6])),
      }
    )
  )}
  <!-- $ -->
</div>
<div class="card">
  <h2>Legal nature distribution</h2>
  <h3>(Levels 1, 2)</h3>
  ${resize((width) =>
    sankeyDiagram(
      partner_graph_1_2,
      {
        width: width,
        nodeFill: (d) => project_color_scale.unknown('black')(d.id),
        linkStroke: (d) => legal_nature_colors(Number(d.path[1][6])),
      }
    )
  )}<!-- $ -->
</div>

<div class="card">
  <h2>Level 3 legal nature distribution</h2>
  <h3>(Levels 1, 2, 3)</h3>
  ${level_1_select}
  <!-- $ -->
  ${resize((width) =>
    sankeyDiagram(
      partner_graph_2_3,
      {
        width: width,
        nodeFill: (d) => project_color_scale.unknown('black')(d.id),
        linkStroke: (d) => interpolated_legal_nature_color(
            level_1_value,
            filtered_cjn2_codes)
          (Number(d.path[1][7])),
      }
    )
  )}
  <!-- $ -->
</div>
<div class="card" style="padding: 0;">
  <div style="padding: 1em">
    <h2>Filtered partner data</h2>
    ${filtered_partner_data_search}<!-- $ -->
  </div>
  ${Inputs.table(filtered_partner_data_value)}
  <!-- $ -->
  ${copyTableToClipboardButton(filtered_partner_data_value, { delimeter: ";" })}
  <!-- $ -->
</div>
<div class="card" style="padding: 0;">
  <div style="padding: 1em">
    <h2>Filtered legal nature data</h2>
    ${filtered_legal_natures_search}<!-- $ -->
  </div>
  ${Inputs.table(filtered_legal_natures)}
  <!-- $ -->
  ${copyTableToClipboardButton(filtered_legal_natures_value, { delimeter: ";" })}
  <!-- $ -->
</div>

<!-- Initial data preparation -->

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
  siret,
  siren,
  -- project_name,
  nom_complet,
  nature_juridique,
  libelle_commune,
  commune,
  latitude,
  longitude,
  code_postal,
  region,
  list_distinct(list(project_name)) AS project_names,
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
  aggregate_partners as (
    SELECT
      nom_complet,
      nature_juridique,
      siren,
      list_distinct(list(source)) as sources,
    FROM (
    SELECT *
    FROM aap_partners
    UNION
    SELECT *
    FROM annex_partners
    UNION
    SELECT *
    FROM general_partners
  )
    GROUP BY all
  ),
  partner_count as (
    SELECT
      siren,
      length(list_distinct(list(project_name))) as "partnerships",
    FROM (
    SELECT *
    FROM aap_partners
    UNION
    SELECT *
    FROM annex_partners
    UNION
    SELECT *
    FROM general_partners
  )
    GROUP BY all
  )
SELECT
  aggregate_partners.nom_complet,
  aggregate_partners.nature_juridique,
  '(Code ' || cjn1."Code" || ') ' || cjn1."Libellé" as "cjn1_label",
  cjn1."Code" as "cjn1_code",
  '(Code ' || cjn2."Code" || ') ' || cjn2."Libellé" as "cjn2_label",
  cjn2."Code" as "cjn2_code",
  '(Code ' || cjn3."Code" || ') ' || cjn3."Libellé" as "cjn3_label",
  cjn3."Code" as "cjn3_code",
  aggregate_partners.siren,
  sources,
  partner_count.partnerships,
  1 as "value",
  'All partners' as total,
from aggregate_partners
join cjn3
on cjn3.Code = aggregate_partners.nature_juridique
join cjn2
on cjn2.Code = floor(aggregate_partners.nature_juridique / 100)
join cjn1
on cjn1.Code = floor(aggregate_partners.nature_juridique / 1000)
join partner_count
on partner_count.siren = aggregate_partners.siren
```

```sql id=partners_by_project_links_1_2
-- Clean tables
UPDATE general_partners
  SET project_name = 'RESILIENCE'
    WHERE project_name = 'RÉSILIENCE';
  UPDATE general_partners
    SET project_name = 'NEO'
    WHERE project_name = 'NÉO';

WITH partner_project_graph as (
    SELECT
      list_distinct(list(source)) as sources,
      nature_juridique,
      project_name as "target",
      length(list_distinct(list(siren))) as "value",
    FROM (
      SELECT *
      FROM aap_partners
      UNION
      SELECT *
      FROM annex_partners
      UNION
      SELECT *
      FROM general_partners
    )
    GROUP BY all
  )
SELECT
  '(Code ' || cjn2."Code" || ') ' || cjn2."Libellé" AS source,
  partner_project_graph.target,
  partner_project_graph.value,
  [
    'All partners',
    '(Code ' || cjn1."Code" || ') ' || cjn1."Libellé",
    '(Code ' || cjn2."Code" || ') ' || cjn2."Libellé",
    -- '(Code ' || cjn3."Code" || ') ' || cjn3."Libellé",
    partner_project_graph.target,
  ] as "path",
  partner_project_graph.sources,
  true as siren, -- needed to skip siren filter
FROM partner_project_graph
JOIN cjn3
ON cjn3.Code = partner_project_graph.nature_juridique
JOIN cjn2
ON cjn2.Code = floor(partner_project_graph.nature_juridique / 100)
JOIN cjn1
ON cjn1.Code = floor(partner_project_graph.nature_juridique / 1000)
```

<!-- helpter functions -->

```js
function filterResults(d) {
  if (filter_no_result && !d.siren) {
    return false
  }
  if (
    filter_annex_data &&
    d.sources.includes("financed_annex_partners_by_project")
  ) {
    return false
  }
  if (filter_general_data && d.sources.includes("generality")) {
    return false
  }
  if (filter_aap_data && d.sources.includes("partenaires_aap2023")) {
    return false
  }
  return true
}
```

```js
const level_1_select = Inputs.select(
  new Set(filtered_legal_natures.map((d) => d.cjn1_code)),
  {
    label: "Select level 1 legal nature",
    value: 0,
  }
)

const level_1_value = Generators.input(level_1_select)
```

```js
const filtered_partner_data = [...all_partner_data].filter(filterResults)
```

```js
const filtered_legal_natures = [...legal_natures].filter(filterResults)
```

```js
const filtered_partners_by_project_links_1_2 = [
  ...partners_by_project_links_1_2,
].filter(filterResults)

console.debug(
  "filtered_partners_by_project_links_1_2",
  filtered_partners_by_project_links_1_2.map((d) => d.toJSON())
)

const filtered_partners_by_project_ids_1_2_by_key = new Map()

filtered_partners_by_project_links_1_2.forEach(({ target }) => {
  if (!filtered_partners_by_project_ids_1_2_by_key.has(target)) {
    filtered_partners_by_project_ids_1_2_by_key.set(target, { id: target })
  }
})

const filtered_partners_by_project_graph_1_2 = {
  nodes: [...filtered_partners_by_project_ids_1_2_by_key.values()].concat(
    partner_graph_1_2.nodes
  ),
  links: filtered_partners_by_project_links_1_2
    .map((d) => d.toJSON())
    .concat(partner_graph_1_2.links),
}

console.debug(
  "filtered_partners_by_project_graph_1_2",
  filtered_partners_by_project_graph_1_2
)
```

```js
const partner_graph_1_2 = parallelSetToGraph(filtered_legal_natures, [
  "total",
  "cjn1_label",
  "cjn2_label",
  // "cjn3_label",
  // "project_name",
])
console.debug("partner_graph_1_2", partner_graph_1_2)
```

```js
const selected_filtered_legal_natures = filtered_legal_natures.filter(
  (d) => d.cjn1_code == level_1_value
)

const partner_graph_2_3 = parallelSetToGraph(selected_filtered_legal_natures, [
  // "total",
  "cjn1_label",
  "cjn2_label",
  "cjn3_label",
  // "project_name",
])

const filtered_cjn2_codes = [
  ...new Set(selected_filtered_legal_natures.map((d) => d.cjn2_code % 10)),
]

console.debug("partner_graph_2_3", partner_graph_2_3)
console.debug("filtered_cjn2_codes", filtered_cjn2_codes)
```

```js
const partners_by_city = d3.groups(filtered_partner_data, (d) =>
  d.code_postal ? d.code_postal.slice(0, 2) : null
)
```

```js
const legal_nature_plot_config = (data, width, height = undefined) => {
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
      Plot.barY(data, {
        x: (d) => d[0],
        y: (d) => d[1],
        fill: (d) => d[1],
        sort: { x: "x" },
        tip: {
          format: {
            fill: false,
          },
          lineWidth: 100,
        },
      }),
    ],
  }
}
```

```js
const filtered_partner_data_search = Inputs.search(filtered_partner_data)
const filtered_partner_data_value = Generators.input(
  filtered_partner_data_search
)

const filtered_legal_natures_search = Inputs.search(filtered_legal_natures)
const filtered_legal_natures_value = Generators.input(
  filtered_legal_natures_search
)
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
    ${copyTableToClipboardButton(consensus_search_result, { delimeter: ";" })}

  </div>
  <div class="card" style="padding: 0;">
    <div style="padding: 1em;">
      <h2>
        Labels with no siren/siret: ${[...no_results].length}
      </h2>
      <div>${no_result_search}</div>
    </div>
    ${
      resize((width) =>
        Inputs.table(no_result_search_result, { width: width, layout: 'auto' })
      )
    }
    ${copyTableToClipboardButton(no_result_search_result, { delimeter: ";" })}

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
    ${copyTableToClipboardButton(outlier_search_result, { delimeter: ";" })}

  </div>
</div>

```js
const no_result_search = Inputs.search(no_results)
const no_result_search_result = Generators.input(no_result_search)
```

```js
const outlier_search = Inputs.search(outliers)
const outlier_search_result = Generators.input(outlier_search)
```

```js
const consensus_search = Inputs.search(consensus)
const consensus_search_result = Generators.input(consensus_search)
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
      project_name,
    FROM annex_partners
    where siren is null
    UNION
    SELECT
      siren,
      source,
      source_label,
      project_name,
    FROM general_partners
    where siren is null
    UNION
    SELECT
      siren,
      source,
      source_label,
      project_name,
    FROM aap_partners
    where siren is null
  )
select
  -- siren,
  source_label,
  project_name,
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
const debug = true

if (debug) {
  display("annex_partners")
  display(Inputs.table(await sql`select * from annex_partners`))
  display([...(await sql`select * from annex_partners`)].length)
  display("general_partners")
  display(Inputs.table(await sql`select * from general_partners`))
  display([...(await sql`select * from general_partners`)].length)
  display("aap_partners")
  display(Inputs.table(await sql`select * from aap_partners`))
  display([...(await sql`select * from aap_partners`)].length)

  display("all_partner_data")
  display(Inputs.table(all_partner_data))
  display("filtered_partner_data")
  display(Inputs.table(filtered_partner_data))
  display("legal_natures")
  display(Inputs.table(legal_natures))
  display("filtered_legal_natures")
  display(Inputs.table(filtered_legal_natures))
}
```
