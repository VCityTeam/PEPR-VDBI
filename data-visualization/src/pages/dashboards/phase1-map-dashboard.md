---
sql:
  annex_partners: /data/partners_by_project_annex.csv
  general_partners: /data/partners_general.csv
  socioeco_partners: /data/socioeco_partners.csv
  etablissement_partners: /data/etablissement_partners.csv
  labs: /data/labs.csv
  projects_by_partner: /data/projects_by_partner.csv
  aap_partners: /data/private/partenaires_aap2023.csv
  terrain_locations: /data/project_summary_terrain_locations.csv
  project_summaries: /data/private/project_summary.csv
  project_terrains_by_scale: /data/private/project_summary_terrains.csv
---

# Phase 1 Cartography

<div class="warning" label="Data visualization notice">
  Data visualizations are unverified and errors may exist.
  Consider these data visualizations as estimations and not a "ground truth".
</div>

```js
import {
  countEntities,
  sparkbar,
  downloadTableButton,
  downloadSVGButton,
  writeToFile,
} from "/components/utilities.js"
```

```js
import {
  getGeneralSheet,
  getResearcherSheet,
  getLabSheet,
  getInstitutionSheet,
  resolveGeneralEntities,
  resolveResearcherEntities,
  resolveLabEntities,
  resolveInstitutionEntities,
  getColumnOptions,
  filterOnInput,
} from "/components/phase1-workbook.js"
```

```js
import {
  forceGraph,
  mapTableToPropertyGraphLinks,
  mapTableToTriples,
} from "/components/graph.js"
```

```js
import {
  europe_geojson,
  france_geojson,
  france_regions_geojson,
  mainland_france_regions_geojson,
  idf_region_geojson,
  france_departements_geojson,
  mainland_france_departements_geojson,
  mainland_france_departements_no_idf_geojson,
  idf_departements_geojson,
  italy_regions_geojson,
  france_projection,
  idf_projection,
  paris_projection,
  italy_projection,
  default_mainland_france_marks,
  mainland_france_choropleth_marks,
  idf_choropleth_marks,
  italy_choropleth_marks,
} from "/components/projection-map.js"
```

```js
import { vdbi_color_scheme, project_color_scale } from "/components/color.js"
```

```js
import { vectorFromArray } from "npm:apache-arrow"
```

## Projects by Terrain

```js
const selected_terrain_project = view(
  Inputs.checkbox(
    [...all_partner_data].map((d) => d.projet),
    {
      label: "Included projects:",
      unique: true,
      sort: true,
      value: [...all_partner_data].map((d) => d.projet),
    }
  )
)

const selected_terrain_scale = view(
  Inputs.checkbox(
    [...(await sql`select echelle from project_terrains_by_scale`)].map(
      (d) => d.echelle
    ),
    {
      label: "Included scales:",
      unique: true,
      sort: true,
      value: [
        ...(await sql`select echelle from project_terrains_by_scale`),
      ].map((d) => d.echelle),
    }
  )
)

const terrain_legend_type = view(
  Inputs.toggle({
    label: "Remove legend lines?",
    value: false,
  })
)

const big_labels = view(
  Inputs.toggle({
    label: "Big labels?",
    value: false,
  })
)
```

<div style="display: flex">
  <div>
    ${downloadTableButton(
      () => [...terrain_data_by_city_by_scale].map((d) => d.toJSON()),
      {
        label: "Download terrains by location data",
        delimeter: "\t",
      }
    )}
    <!-- $ -->
    ${downloadTableButton(
      () => [...terrain_data].map((d) => d.toJSON()),
      {
        label: "Download terrain and scale data",
        delimeter: "\t",
      }
    )}
    <!-- $ -->
    ${downloadTableButton(
      () => [...all_partner_data].map((d) => d.toJSON()),
      {
        label: "Download partners by project data",
        delimeter: "\t",
      }
    )}
    <!-- $ -->
  </div>
  <div>
    ${downloadSVGButton(
      "#map-container-france svg",
      "Download French project terrains map",
      `${selected_terrain_project.flat()}_france_terrains_map_by_${selected_terrain_scale.flat()}_scales.svg`
    )}
    <!-- $ -->
    ${downloadSVGButton(
      "#map-container-idf svg",
      "Download Grand Métropole de Paris project terrains map",
      `${selected_terrain_project.flat()}_paris_terrains_map_by_${selected_terrain_scale.flat()}_scales.svg`
    )}
    <!-- $ -->
    ${downloadSVGButton(
      "#map-container-italy svg",
      "Download Italian project terrains map",
      `${selected_terrain_project.flat()}_italy_terrains_map_by_${selected_terrain_scale.flat()}_scales.svg`
    )}
    <!-- $ -->
  </div>
</div>

<div class="grid grid-cols-3">
  <div
    id="map-container-france"
    class="card grid-colspan-2 grid-rowspan-2"
    style="padding: 10px;"
  >
    ${resize((width, height) =>
      defaultProjectionFrance(
        width,
        height - 15,
        terrain_legend_type
        ? generateDotMapMarks(france_terrain_data, france_terrain_legend, 0.2)
        : generateLineMapMarks(
        choropleth_terrain_data_by_city,
        france_terrain_legend
      ),
        "- Project terrains by city and Île-de-France, France"
      ))
    }

  </div>
  <div id="map-container-idf" class="card" style="padding: 10px; overflow: hidden;">
    ${resize(
      (width) => defaultProjectionParis(
        width,
        terrain_legend_type
        ? generateDotMapMarks(ile_de_france_terrain_data, idf_terrain_legend, 0.015)
        : generateLineMapMarks(ile_de_france_terrain_data, idf_terrain_legend),
        "- Project terrains by city, Grand Métropole de Paris"
      )
    )}

  </div>
  <div id="map-container-italy" class="card" style="padding: 10px; overflow: hidden;">
    ${resize(
      (width) => defaultProjectionItaly(
        width,
        terrain_legend_type
        ? generateDotMapMarks(
            terrain_data_by_city_by_scale_by_scale,
            italy_terrain_legend,
            0.1
          )
        : generateLineMapMarks(terrain_data_by_city_by_scale_by_scale, italy_terrain_legend),
        "- TRACES terrains by city, Italy"
      )
    )}

  </div>
</div>

## Project terrains by department

<div style="display: flex">
  ${downloadSVGButton(
    "#terrain-choropleth-container-france svg:nth-of-type(2)",
    "Download French terrain choropleth",
    `${selected_partner_project}_france_partner_choropleth.svg`
  )}
  ${downloadSVGButton(
    "#terrain-choropleth-container-france svg:nth-of-type(1)",
    "Download legend",
    `${selected_partner_project}_france_partner_choropleth_legend.svg`
  )}
  ${downloadSVGButton(
    "#terrain-choropleth-container-idf svg:nth-of-type(2)",
    "Download Île-de-France terrain choropleth",
    `${selected_partner_project}_idf_partner_choropleth.svg`
  )}
  ${downloadSVGButton(
    "#terrain-choropleth-container-idf svg:nth-of-type(1)",
    "Download legend",
    `${selected_partner_project}_idf_partner_choropleth_legend.svg`
  )}
  ${downloadSVGButton(
    "#terrain-choropleth-container-italy svg:nth-of-type(2)",
    "Download Italian terrain choropleth",
    `${selected_partner_project}_idf_partner_choropleth.svg`
  )}
  ${downloadSVGButton(
    "#terrain-choropleth-container-italy svg:nth-of-type(1)",
    "Download legend",
    `${selected_partner_project}_idf_partner_choropleth_legend.svg`
  )}
</div>
<div class="grid grid-cols-3">
  <div
    id="terrain-choropleth-container-france"
    class="card grid-colspan-2 grid-rowspan-2"
    style="padding: 12px;"
  >
    ${resize((width, height) => choroplethFrance(
      width,
      height,
      ({ properties }) =>
        (choropleth_terrain_data.get(properties.nom) || { size: null }).size
    ))}
    <!-- $ -->
  </div>
  <div id="terrain-choropleth-container-idf" class="card" style="padding: 12px;">
    ${resize((width) => choroplethIdf(
      width,
      ({ properties }) =>
        (choropleth_terrain_data.get(properties.nom) || { size: null }).size + 2
    ))}
    <!-- $ -->
  </div>
  <div id="terrain-choropleth-container-italy" class="card" style="padding: 12px;">
    ${resize((width) => choroplethItaly(
      width,
      ({ properties }) => true
    ))}
    <!-- $ -->
  </div>
</div>

<!-- <div class="card">
  ${Inputs.table(choropleth_terrain_data, { layout: "auto" })}

</div> -->

${downloadTableButton(() => [...choropleth_terrain_data].map(d => d.toJSON()))}

<!-- $ -->

```js
const choropleth_terrain_data = d3.group(
  terrain_data,
  (d) =>
    (
      mainland_france_departements_geojson.features.find((department) =>
        d3.geoContains(department, [d.longitude, d.latitude])
      ) || { properties: { nom: null } }
    ).properties.nom,
  (d) => d.project_acronyme
)
display(choropleth_terrain_data)

const choropleth_terrain_data_by_city = [
  ...d3
    .rollup(
      france_terrain_data.map((d) => ({
        projects: d.projects.toJSON(),
        code: (
          mainland_france_departements_geojson.features.find((department) =>
            d3.geoContains(department, [d.longitude, d.latitude])
          ) || { properties: { code: null } }
        ).properties.code,
        latitude: d3.geoCentroid(
          mainland_france_departements_geojson.features.find((department) =>
            d3.geoContains(department, [d.longitude, d.latitude])
          ) || [0, 0]
        )[1],
        longitude: d3.geoCentroid(
          mainland_france_departements_geojson.features.find((department) =>
            d3.geoContains(department, [d.longitude, d.latitude])
          ) || [0, 0]
        )[0],
      })),
      (D) =>
        D.reduce(
          (a, v) => ({
            projects: [...new Set(a.projects).union(new Set(v.projects))],
            code: v.code,
            latitude: v.latitude,
            longitude: v.longitude,
          }),
          { projects: [] }
        ),
      (d) => d.code
    )
    .values(),
]

display(choropleth_terrain_data_by_city)
```

## Projects by partners

```js
const selected_partner_project = view(
  Inputs.select(
    [
      "All",
      // ...[...(await sql`select "Nom projet" from project_summaries`)]
      ...[...all_partner_data].map((d) => d.projet),
    ],
    {
      multiple: false,
      label: "Optionally, select a project to focus on:",
      unique: true,
      sort: true,
      value: "All",
    }
  )
)

const flatten_choropleth = view(Inputs.toggle({ label: "Flatten choropleth?" }))
```

<div style="display: flex">
  ${downloadSVGButton(
    "#choropleth-container-france svg:nth-of-type(2)",
    "Download French choropleth partner map",
    `${selected_partner_project}_france_partner_choropleth.svg`
  )}
  ${downloadSVGButton(
    "#choropleth-container-france svg:nth-of-type(1)",
    "Download legend",
    `${selected_partner_project}_france_partner_choropleth_legend.svg`
  )}
  ${downloadSVGButton(
    "#choropleth-container-idf svg:nth-of-type(2)",
    "Download Île-de-France choropleth partner map",
    `${selected_partner_project}_idf_partner_choropleth.svg`
  )}
  ${downloadSVGButton(
    "#choropleth-container-idf svg:nth-of-type(1)",
    "Download legend",
    `${selected_partner_project}_idf_partner_choropleth_legend.svg`
  )}
  <!-- ${open_choropleth_italy} -->
  <!-- $ -->
</div>
<div class="grid grid-cols-3">
  <div
    id="choropleth-container-france"
    class="card grid-colspan-2 grid-rowspan-2"
    style="padding: 12px;"
  >
    ${resize((width, height) => choroplethFrance(
      width,
      height,
      ({ properties }) => project_partners_by_code.get(properties.code)
    ))}
    <!-- $ -->
  </div>
  <div id="choropleth-container-idf" class="card" style="padding: 12px;">
    ${resize((width) => choroplethIdf(
      width,
      ({ properties }) => project_partners_by_code.get(properties.code)
    ))}
    <!-- $ -->
  </div>
  <!-- <div id="choropleth-container-italy" class="card" style="padding: 12px;">
    ${resize((width) => choroplethItaly(
      width,
      ({ properties }) => true
    ))}
  </div> -->
</div>

<div class="card">
  ${Inputs.table(choropleth_data, { layout: "auto" })}

</div>

${downloadTableButton(() => [...choropleth_data].map(d => d.toJSON()))}<!-- $ -->

```js
const choropleth_data = [...all_partner_data].filter(
  (d) =>
    selected_partner_project == "All" || d.projet == selected_partner_project
)
```

## Participating Laboratories

<div style="display: flex">
  ${download_lab_choropleth_france}
  ${download_lab_choropleth_idf}
</div>
<div class="grid grid-cols-3">
  <div
    id="lab-choropleth-container-france"
    class="card grid-colspan-2 grid-rowspan-2"
    style="padding: 12px;"
  >
    ${resize((width, height) =>
      choroplethFrance(
        width,
        height,
        ({ properties }) => lab_disciplines_by_code.get(properties.code),
        "- Laboratoires par département, France",
      )
    )}

  </div>
  <div id="lab-choropleth-container-idf" class="card" style="padding: 12px;">
    ${resize((width) => choroplethIdf(
      width,
      ({ properties }) => lab_disciplines_by_code.get(properties.code),
      "- Laboratoires par département, Île-de-France",
    ))}

  </div>
</div>

<!-- Initial data integration -->

```js
const terrain_partners_by_code = new Map(
  d3.rollups(
    [...all_partner_data],
    (D) =>
      D.reduce(
        (a, v) => (selected_terrain_project.includes(v.projet) ? a + 1 : a),
        0
      ),
    (d) => (d.code_postal ? String(d.code_postal).slice(0, 2) : null)
  )
)
```

```js
const project_partners_by_code = new Map(
  d3
    .rollups(
      [...all_partner_data].concat([
        // with hardcoded project corrections
        {
          projet: "INTEGREEN",
          code_postal: 95,
        },
        {
          projet: "INTEGREEN",
          code_postal: 93,
        },
        {
          projet: "URBHEALTH",
          code_postal: 95,
        },
        {
          projet: "URBHEALTH",
          code_postal: 78,
        },
        {
          projet: "URBHEALTH",
          code_postal: 92,
        },
        {
          projet: "URBHEALTH",
          code_postal: 91,
        },
      ]),
      (D) =>
        D.reduce(
          (a, v) =>
            selected_partner_project == "All" ||
            v.projet == selected_partner_project
              ? a * Number(!flatten_choropleth) + 1
              : a,
          0
        ),
      (d) => (d.code_postal ? String(d.code_postal).slice(0, 2) : null)
    )
    .filter((d) => d[1] > 0)
)
```

```js
const lab_disciplines_by_code = new Map(
  d3
    .rollups(
      [...labs],
      (D) =>
        D.reduce(
          (a, v) =>
            selected_partner_project == "All" ||
            v.projet == selected_partner_project
              ? a + 1
              : a,
          0
        ),
      (d) => d.code_postal
    )
    .filter((d) => d[1] > 0)
)

console.debug("lab_disciplines_by_code", lab_disciplines_by_code)
```

```sql id=all_partner_data
WITH user_partner_data AS (
  SELECT
    label,
    "ID primaire",
    "type",
    nom_complet,
    code_postal,
  FROM socioeco_partners
  -- UNION
  -- SELECT
  --   label,
  --   "ID primaire",
  --   'LABORATOIRE' AS "type",
  --   libelle AS nom_complet,
  --   code_postal,
  -- FROM labs
  UNION
  SELECT
    label,
    "ID primaire",
    "type",
    nom_complet,
    code_postal,
  FROM etablissement_partners
)
SELECT DISTINCT
  projet,
  user_partner_data.label,
  "ID primaire",
  -- user_partner_data.type,
  -- nom_complet,
  code_postal,
  -- "IGNORE",
FROM projects_by_partner
JOIN user_partner_data
ON projects_by_partner.source_label = user_partner_data.label
WHERE NOT "IGNORE"
```

```sql id=all_partner_data_deprecated
-- Clean tables
UPDATE general_partners
  SET project_name = 'RESILIENCE'
  WHERE project_name = 'RÉSILIENCE';
UPDATE general_partners
  SET project_name = 'NEO'
  WHERE project_name = 'NÉO';
UPDATE general_partners
  SET project_name = 'NEO'
  WHERE project_name = 'NÉO';

-- merge tables
-- WITH
--   union_all AS (
--     SELECT *
--     FROM aap_partners
--     UNION
--     SELECT *
--     FROM annex_partners
--     UNION
--     SELECT *
--     FROM general_partners
--   )
SELECT
  nom_complet,
  siret,
  -- siren,
  -- list_distinct(list(siren)) as sirens,
  -- list_distinct(list(project_name)) as projects,
  project_name,
  -- nature_juridique,
  -- libelle_commune,
  -- commune,
  latitude,
  longitude,
  -- first(latitude) as latitude,
  -- first(longitude) as longitude,
  code_postal,
  -- region,
  -- list_distinct(list(project_coordinator)) AS project_coordinator,
  -- list_distinct(list(source)) AS sources,
  source_label,
  -- count() as count,
FROM general_partners
-- FROM union_all
-- GROUP BY ALL;
```

```sql id=terrain_data
-- merge osm data with terrain+scale data

select
  acronyme as project_acronyme,
  terrain_locations.terrain,
  echelle as échelle,
  latitude,
  longitude,
  raw_data->>'osm_id' as osm_id,
  raw_data->>'osm_type' as osm_type,
  raw_data->>'name' as osm_name,
  raw_data->>'addresstype' as osm_address_type,
  case
    when json_exists(raw_data, '$.address.city')
      then raw_data->>'$.address.city'
    when json_exists(raw_data, '$.address.town')
      then raw_data->>'$.address.town'
    when json_exists(raw_data, '$.address.village')
      then raw_data->>'$.address.village'
    when json_exists(raw_data, '$.address.municipality')
      then raw_data->>'$.address.municipality'
    else null
  end as osm_city_name,
  case
    when json_exists(raw_data, '$.address.local_authority')
      then raw_data->>'$.address.local_authority'
    when json_exists(raw_data, '$.address.county')
      then raw_data->>'$.address.county'
    else null
  end as osm_agglomeration_name,
  case
    when json_exists(raw_data, '$.address.state')
      then raw_data->>'$.address.state'
    when json_exists(raw_data, '$.address.region')
      then raw_data->>'$.address.region'
    else null
  end as osm_regional_name,
  case
    when json_exists(raw_data, '$.address.city') then 'city'
    when json_exists(raw_data, '$.address.town') then 'town'
    when json_exists(raw_data, '$.address.village') then 'village'
    when json_exists(raw_data, '$.address.municipality') then 'municipality'
    else null
  end as osm_city_type,
  case
    when json_exists(raw_data, '$.address.local_authority') then 'local_authority'
    when json_exists(raw_data, '$.address.county') then 'county'
    when json_exists(raw_data, '$.address.state') then 'state'
    when json_exists(raw_data, '$.address.region') then 'region'
    else null
  end as osm_agglomeration_type,
  case
    when json_exists(raw_data, '$.address.state') then 'state'
    when json_exists(raw_data, '$.address.region') then 'region'
    else null
  end as osm_regional_type,
  commentaire,
from terrain_locations, project_terrains_by_scale
where terrain_locations.terrain = project_terrains_by_scale.terrain
```

```sql id=terrain_data_by_city_by_scale
-- merge data on a terrain_label
-- (a simplified terrain label for merging locations at the city level)

with
  labeled_terrain_locations as (
    select distinct
      terrain as terrain_label,
      latitude,
      longitude,
    FROM terrain_locations
  ),
  labeled_project_terrains_by_scale as (
    select
      *,
      terrain as terrain_label,
    from project_terrains_by_scale
  )
select distinct
  labeled_terrain_locations.terrain_label,
  -- list_distinct(list(labeled_terrain_locations.terrain)) as terrains,
  list_distinct(list(labeled_project_terrains_by_scale.acronyme)) as projects,
  first(labeled_terrain_locations.latitude) as latitude,
  first(labeled_terrain_locations.longitude) as longitude,
  -- echelle as scale,
from labeled_terrain_locations
join labeled_project_terrains_by_scale
on labeled_project_terrains_by_scale.terrain_label = labeled_terrain_locations.terrain_label
group by all
```

```sql id=terrain_data_by_city
-- merge data on a terrain_label
-- (a simplified terrain label for merging locations at the city level)

with
  labeled_terrain_locations as (
    select distinct
      terrain as terrain_label,
      latitude,
      longitude,
    FROM terrain_locations
  ),
  labeled_project_terrains_by_scale as (
    select
      *,
      terrain as terrain_label,
    from project_terrains_by_scale
  )
select distinct
  labeled_terrain_locations.terrain_label,
  -- list_distinct(list(labeled_terrain_locations.terrain)) as terrains,
  list_distinct(list(labeled_project_terrains_by_scale.acronyme)) as projects,
  first(labeled_terrain_locations.latitude) as latitude,
  first(labeled_terrain_locations.longitude) as longitude,
  -- echelle as scale,
from labeled_terrain_locations
join labeled_project_terrains_by_scale
on labeled_project_terrains_by_scale.terrain_label = labeled_terrain_locations.terrain_label
group by all
```

```sql id=terrain_data_by_city_deprecated
-- merge data on a terrain_label
-- (a simplified terrain label for merging locations at the city level)

with
  labeled_terrain_locations as (
    select distinct
      terrain,
      case
        when instr(terrain, 'Aix-Marseille-Provence') > 0
          then replace(terrain, 'Aix-Marseille-Provence', 'Marseille')
        else terrain
      end as terrain_label,
      latitude,
      longitude,
    FROM terrain_locations
  ),
  labeled_project_terrains_by_scale as (
    select
      *,
      case
        when instr(terrain, ' Méditerranée Métropole') > 0
          then replace(terrain, ' Méditerranée Métropole', '')
        when instr(terrain, 'Aix-Marseille-Provence') > 0
          then replace(terrain, 'Aix-Marseille-Provence', 'Marseille')
        when instr(terrain, 'Métropole du Grand Paris') > 0
          then replace(terrain, 'Métropole du Grand Paris', 'Paris')
        when instr(terrain, 'Métropole Européenne de ') > 0
          then replace(terrain, 'Métropole Européenne de ', '')
        when instr(terrain, 'Métropole d''') > 0
          then replace(terrain, 'Métropole d''', '')
        when instr(terrain, 'Métropole de ') > 0
          then replace(terrain, 'Métropole de ', '')
        when instr(terrain, ' Métropole') > 0
          then replace(terrain, ' Métropole', '')
        else terrain
      end as terrain_label,
    from project_terrains_by_scale
  )
select distinct
  labeled_terrain_locations.terrain_label,
  -- list_distinct(list(labeled_terrain_locations.terrain)) as terrains,
  list_distinct(list(labeled_project_terrains_by_scale.acronyme)) as projects,
  first(labeled_terrain_locations.latitude) as latitude,
  first(labeled_terrain_locations.longitude) as longitude,
from labeled_terrain_locations
join labeled_project_terrains_by_scale
on labeled_project_terrains_by_scale.terrain_label = labeled_terrain_locations.terrain_label
group by all
```

```sql id=labs
select
  "ID primaire",
  projet,
  "code_postal"[0:2] as code_postal,
  code_panel_erc,
from labs
join projects_by_partner
on label = source_label
```

<!-- saving this for later when we figure out financial annex integration -->

```sql id=partner_project_code
WITH user_partner_data AS (
  SELECT
    label,
    "ID primaire",
    "type",
    nom_complet,
    code_postal,
  FROM socioeco_partners
  UNION
  SELECT
    label,
    "ID primaire",
    'LABORATOIRE' AS "type",
    libelle AS nom_complet,
    code_postal,
  FROM labs
),
user_partner_project_data as (
  SELECT DISTINCT
    projet,
    user_partner_data.label,
    "ID primaire",
    user_partner_data.type,
    -- nom_complet,
    code_postal,
  FROM projects_by_partner
  JOIN user_partner_data
  ON trim(projects_by_partner.source_label) = trim(user_partner_data.label)
)
SELECT
  projet,
  "ID primaire",
  code_postal,
FROM user_partner_project_data
UNION
SELECT DISTINCT
  upper(project_name) AS projet,
  -- source_label AS label,
  siret AS "ID primaire",
  -- nature_juridique AS "type",
  -- nom_complet,
  code_postal,
FROM annex_partners
```

<!-- Project terrain map -->

```js
// point in bbox?
const inBBox = (
  longitude,
  latitude,
  { min_x = -180, max_x = 180, min_y = -180, max_y = 180 }
) =>
  min_x < longitude && longitude < max_x && min_y < latitude && latitude < max_y
```

```js
const terrain_data_by_city_by_scale_by_scale = [
  ...terrain_data_by_city_by_scale,
]
// ].filter((d) => selected_terrain_scale.includes(d.scale))
```

```js
const mainland_france_bbox = {
  min_x: -5.273438,
  max_x: 8.833008,
  min_y: 42.228517,
  max_y: 51.261915,
}

const ile_de_france_bbox = {
  min_x: 1.4425891164457563,
  max_x: 3.559891742088918,
  min_y: 48.120414136323795,
  max_y: 49.24342474094858,
}

const france_terrain_data = terrain_data_by_city_by_scale_by_scale.filter(
  (d) =>
    // keep projects within france
    inBBox(d.longitude, d.latitude, mainland_france_bbox) &&
    // separate out small scale ile-de-france data
    (!inBBox(d.longitude, d.latitude, ile_de_france_bbox) ||
      // d.terrain_label == "Île-de-France" ||
      d.terrain_label == "Métropole du Grand Paris")
)

const ile_de_france_terrain_data =
  terrain_data_by_city_by_scale_by_scale.filter(
    (d) =>
      d.terrain_label != "Île-de-France" &&
      d.terrain_label != "Métropole du Grand Paris" &&
      inBBox(d.longitude, d.latitude, ile_de_france_bbox)
  )

if (selected_terrain_scale.includes("région"))
  france_terrain_data.push({
    terrain_label: "Île-de-France",
    projects: vectorFromArray([
      ...new Set(
        terrain_data_by_city_by_scale_by_scale
          .filter((d) => d.terrain_label == "Île-de-France")
          .flatMap((d) => [...d.projects])
      ),
      ...new Set(ile_de_france_terrain_data.flatMap((d) => [...d.projects])),
    ]),
    scale: "région",
    latitude: 48.856,
    longitude: 2.342,
  })

const international_terrain_data =
  terrain_data_by_city_by_scale_by_scale.filter(
    (d) =>
      // keep projects outside of france
      !inBBox(d.longitude, d.latitude, mainland_france_bbox)
  )
```

```js
/* Legends are structured as a 2D array, each row containing a
 * - project name
 * - project color
 * - longitude for label and/or symbol
 * - latitude for label and/or symbol
 */

const base_legend = d3.zip(
  project_color_scale.domain(),
  project_color_scale.range()
)

const france_terrain_legend = base_legend.map((d) => Object.create(d))

for (let index = 0; index < france_terrain_legend.length; index++) {
  // push longitude
  france_terrain_legend[index].push(
    d3.scaleLinear([0, france_terrain_legend.length], [-4, 9.5])(index)
  )
  // push latitude
  france_terrain_legend[index].push(51.5)
}

const idf_terrains = new Set(
  ile_de_france_terrain_data.flatMap((row) => [...row.projects])
)
const idf_terrain_legend = base_legend
  .filter((d) => idf_terrains.has(d[0]))
  .map((d) => Object.create(d))

for (let index = 0; index < idf_terrain_legend.length; index++) {
  // push longitude
  idf_terrain_legend[index].push(
    d3.scaleLinear([0, idf_terrain_legend.length], [2.15, 2.7])(index)
  )
  // push latitude
  idf_terrain_legend[index].push(49)
}

const international_terrains = new Set(
  international_terrain_data.flatMap((row) => [...row.projects])
)
const italy_terrain_legend = base_legend
  .filter((d) => international_terrains.has(d[0]))
  .map((d) => Object.create(d))

for (let index = 0; index < italy_terrain_legend.length; index++) {
  // push longitude
  italy_terrain_legend[index].push(
    d3.scaleLinear([0, italy_terrain_legend.length], [13.1, 13.1])(index)
  )
  // push latitude
  italy_terrain_legend[index].push(44.3)
}

const terrain_anchor_map = new Map([
  // ['Saclay Cachan', 'top-right'],
  ["Lyon", "top"],
  ["Plauzat", "top-right"],
  // ["Marseille", "top-left"],
  ["Strasbourg", "top-right"],
  ["Lille", "top-right"],
  ["Montpellier Méditerranée Métropole", "bottom"],
  // ['Aix-Marseille-Provence', 'top'],
  // ['Villeurbanne', 'top-left'],
  // ["La Trambouze", "top-left"],
  ["Thiers", "top-right"],
  ["Toulouse Métropole", "top"],
  // ['Saint Denis', 'top-right'],
  ["Seine-Saint-Denis", "top"],
  ["Paris", "top-right"],
  // ["Ivry-sur-Seine", "top-left"],
  ["Cachan", "top-right"],
  ["Nantes", "top"],
  ["Montpellier", "top"],
  // ['Ris-Orangis', 'top'],
  // ['Saclay', 'top'],
  ["Arquata del Tronto", "top-right"],
  // ["Acquasanta Terme", "top-left"],
])

const tip_config = (datum, tip_anchor) => ({
  x: datum.longitude,
  y: datum.latitude,
  textPadding: big_labels ? 5 : 3,
  strokeOpacity: 0,
  fillOpacity: 0.5,
  fontSize: big_labels ? 30 : 12,
  // fontWeight: "bold",
  anchor: tip_anchor,
})

const terrain_tips = (data) =>
  data.map((d) => {
    let tip_anchor = "top-left"

    if (terrain_anchor_map.has(d.terrain_label)) {
      tip_anchor = terrain_anchor_map.get(d.terrain_label)
    }

    return Plot.tip([d.terrain_label], tip_config(d, tip_anchor))
  })

const terrain_tip_dots_float_left = [
  // 'Lyon',
  // 'Thiers',
  // 'Plauzat',
  // 'Saclay Cachan',
  "Arquata del Tronto",
]

const terrain_tip_dots = (data, legend, delta) =>
  data
    .flatMap((d) => {
      const indexed_projects = []

      const projects = [...d.projects]

      for (let index = 0; index < projects.length; index++) {
        const data = { ...d }
        data.projects = projects[index]
        data.project_index = index
        data.x = terrain_tip_dots_float_left.includes(data.terrain_label)
          ? data.longitude - delta - index * delta
          : data.longitude + delta + index * delta
        data.y = data.latitude
        data.label_x = legend.find(
          (legend_datum) => legend_datum[0] === data.projects
        )
        data.label_x = data.label_x ? data.label_x[2] : null
        data.label_y = legend.find(
          (legend_datum) => legend_datum[0] === data.projects
        )
        data.label_y = data.label_y ? data.label_y[3] : null
        indexed_projects.push(data)
      }

      return indexed_projects
    })
    .filter((d) => !!d)
```

```js
// generate geo projection plot functions
const labeled_france_projection = {
  type: "equal-earth",
  domain: d3.geoCircle().center([2, 47.3]).radius(5)(),
}

const defaultProjection = (width, height, projection, marks, caption = "") =>
  Plot.plot({
    width: width,
    height: height,
    caption: caption.toLocaleString(),
    projection: projection,
    marks: [...marks],
  })

const defaultProjectionFrance = (width, height, marks, caption = "") =>
  defaultProjection(
    width,
    height,
    labeled_france_projection,
    default_mainland_france_marks.concat(marks),
    caption
  )

const defaultProjectionParis = (width, marks, caption = "") =>
  defaultProjection(
    width,
    width,
    paris_projection,
    [
      Plot.geo(france_departements_geojson, {
        stroke: "white",
        strokeOpacity: 0.5,
        fill: vdbi_color_scheme.blue,
        fillOpacity: 0.3,
      }),
      marks,
    ],
    caption
  )

const defaultProjectionItaly = (width, marks, caption = "") =>
  defaultProjection(
    width,
    width,
    italy_projection,
    [
      Plot.geo(italy_regions_geojson, {
        stroke: "white",
        strokeOpacity: 0.5,
        fill: vdbi_color_scheme.blue,
        fillOpacity: 0.3,
      }),
      marks,
    ],
    caption
  )

// generate plot marks for each visualisation method

const isProjectSelected = (project) =>
  selected_terrain_project.includes(project)

const map_legend_dots = (terrain_legend) =>
  Plot.dot(terrain_legend, {
    x: (d) => d[2],
    y: (d) => d[3],
    r: big_labels ? 7 : 5,
    fill: (d) => d[1],
    fillOpacity: (d) => (isProjectSelected(d[0]) ? 1 : 0.2),
  })

const map_legend_text = (terrain_legend) =>
  Plot.text(terrain_legend, {
    x: (d) => d[2],
    y: (d) => d[3],
    dy: big_labels ? -25 : -15,
    fontWeight: "bold",
    fontSize: big_labels ? 30 : 12,
    rotate: big_labels ? -15 : 0,
    text: (d) => d[0],
    opacity: (d) => (isProjectSelected(d[0]) ? 1 : 0.2),
  })

function generateLineMapMarks(terrain_data, terrain_legend) {
  const strokeWidth = big_labels ? 2 : 1

  const links = Plot.link(terrain_tip_dots(terrain_data, terrain_legend, 0.2), {
    x1: "label_x",
    y1: "label_y",
    x2: "longitude",
    y2: "latitude",
    stroke: (d) => project_color_scale(d.projects),
    strokeWidth: (d) => (isProjectSelected(d.projects) ? strokeWidth : 0.5),
    strokeOpacity: (d) => (isProjectSelected(d.projects) ? strokeWidth : 0.5),
    curve: "bump-y",
  })

  const terrain_dots = Plot.dot(terrain_data, {
    x: "longitude",
    y: "latitude",
    r: big_labels ? 4 : 3,
    fill: "black",
    //stroke: vdbi_color_scheme.orange,
    //fillOpacity: 0.5,
    channels: {
      entity: {
        value: "terrain_label",
        label: "City",
      },
      count: {
        value: (d) => 1,
        label: "Occurences",
      },
      longitude: {
        value: "longitude",
        label: "Lon",
      },
      latitude: {
        value: "latitude",
        label: "Lat",
      },
      projects: {
        value: "projects",
        label: "Projects",
      },
      scales: {
        value: "scale",
        label: "Scales",
      },
    },
    tip: {
      format: {
        longitude: false,
        latitude: false,
        count: false,
        x: false,
        y: false,
        r: false,
        scales: true,
      },
    },
  })

  return [
    links,
    terrain_dots,
    // legend marks //
    map_legend_dots(terrain_legend),
    map_legend_text(terrain_legend),
    // legend_axis_label,
    // tip marks //
    // ...terrain_tips(terrain_data),
  ]
}

function generateDotMapMarks(terrain_data, terrain_legend, tip_dot_delta) {
  const terrain_dots = Plot.dot(terrain_data, {
    x: "longitude",
    y: "latitude",
    r: big_labels ? 5 : 3,
    fill: vdbi_color_scheme.blue,
    fillOpacity: 0.5,
    channels: {
      entity: {
        value: "terrain",
        label: "City",
      },
      count: {
        value: (d) => 1,
        label: "Occurences",
      },
      longitude: {
        value: "longitude",
        label: "Lon",
      },
      latitude: {
        value: "latitude",
        label: "Lat",
      },
      projects: {
        value: "projects",
        label: "Projects",
      },
      scales: {
        value: "scale",
        label: "Scales",
      },
    },
    tip: {
      format: {
        longitude: false,
        latitude: false,
        count: false,
        x: false,
        y: false,
        r: false,
        scales: true,
      },
    },
  })

  const tip_dots = Plot.dot(
    terrain_tip_dots(
      terrain_data,
      terrain_legend,
      tip_dot_delta * (big_labels ? 1.2 : 1)
    ),
    {
      x: "x",
      y: "y",
      r: big_labels ? 5 : 4,
      fill: (d) => project_color_scale(d.projects),
      fillOpacity: (d) => (isProjectSelected(d.projects) ? 1 : 0.2),
    }
  )

  const legend_axis_label = Plot.text(["Financed Projects"], {
    x: d3.mean(terrain_legend.map((d) => d[2])),
    y: terrain_legend.length > 0 ? terrain_legend[0][3] : 0,
    dy: -45,
  })

  return [
    terrain_dots,
    // legend marks //
    map_legend_dots(terrain_legend),
    map_legend_text(terrain_legend),
    // legend_axis_label,
    // tip marks //
    ...terrain_tips(terrain_data),
    tip_dots,
  ]
}

// choropleth configs and functions

const color_config = {
  scheme: "Blues",
  label:
    "N° de partenaires " +
    (selected_partner_project == "All" ? "" : selected_partner_project),
  // label: "N° of Partners",
  domain: [0, 6],
  legend: true,
  marginLeft: 10,
  marginRight: 10,
  // type: "log",
  zero: true,
  nice: true,
  // ticks: 2,
}

if (flatten_choropleth) color_config.domain = [0, 2.7]

const choropleth = (width, height, fill, projection, features, caption) =>
  Plot.plot({
    width: width,
    height: height - 60,
    caption: caption,
    // "- Project partners by department and Île-de-France, France",
    color: color_config,
    projection: projection,
    marks: [
      Plot.geo(features, {
        channels: {
          Department: ({ properties }) => properties.nom,
          Code: ({ properties }) => properties.code,
          Lat: (d) => d3.geoCentroid(d)[0],
          Lon: (d) => d3.geoCentroid(d)[1],
        },
        tip: true,
        fill: fill,
        strokeOpacity: 0,
      }),
      // Plot.geo(
      //   mainland_france_regions_geojson.features.find(
      //     (d) => d.properties.code == "11"
      //   ),
      //   {
      //     channels: {
      //       Department: ({ properties }) => properties.nom,
      //       Code: ({ properties }) => properties.code,
      //       Lat: (d) => d3.geoCentroid(d)[0],
      //       Lon: (d) => d3.geoCentroid(d)[1],
      //     },
      //     tip: true,
      //     fill: (d) =>
      //       choropleth_terrain_data_by_city.find((d) => d.code == "75").projects
      //         .length,
      //     strokeOpacity: 0,
      //   }
      // ),
      [...mainland_france_choropleth_marks],
      // generateLineMapMarks(
      //   choropleth_terrain_data_by_city,
      //   france_terrain_legend
      // ),
    ],
  })

display("mainland_france_regions_geojson")
display(mainland_france_regions_geojson)

const choroplethFrance = (width, height, fill) =>
  choropleth(
    width,
    height,
    fill,
    france_projection,
    mainland_france_departements_no_idf_geojson,
    "- Partenaires des projets par département, France"
  )

const choroplethIdf = (width, fill) =>
  choropleth(
    width,
    width,
    fill,
    idf_projection,
    idf_departements_geojson,
    "- Partenaires des projets par département, Île-de-France"
  )

const choroplethItaly = (width, fill) =>
  choropleth(
    width,
    width,
    fill,
    italy_projection,
    italy_regions_geojson,
    "- Project partners by department, Italy"
  )
display(italy_regions_geojson)
```

```js
const download_lab_choropleth_france = downloadSVGButton(
  "#lab-choropleth-container-france svg",
  "Download French choropleth lab partner map",
  `${selected_partner_project}_france_lab_partner_choropleth.svg`
)

const download_lab_choropleth_idf = downloadSVGButton(
  "#lab-choropleth-container-idf svg",
  "Download Île-de-France choropleth lab partner map",
  `${selected_partner_project}_idf_lab_partner_choropleth.svg`
)
```

<!-- debugging info -->

```js
console.debug(
  "aap_partners",
  [...(await sql`select * from aap_partners`)].map((d) => d.toJSON())
)
console.debug(
  "terrain_locations",
  [...(await sql`select * from terrain_locations`)].map((d) => d.toJSON())
)
console.debug(
  "project_summaries",
  [...(await sql`select * from project_summaries`)].map((d) => d.toJSON())
)
console.debug(
  "project_terrains_by_scale",
  [...(await sql`select * from project_terrains_by_scale`)].map((d) =>
    d.toJSON()
  )
)
```

```js
console.debug(
  "terrain_data",
  [...terrain_data].map((d) => d.toJSON())
)
console.debug(
  "terrain_data_by_city_by_scale",
  [...terrain_data_by_city_by_scale].map((d) => d.toJSON())
)
console.debug("france_terrain_data", france_terrain_data)
console.debug("ile_de_france_terrain_data", ile_de_france_terrain_data)
```

```js
console.debug(
  "all_partner_data",
  [...all_partner_data].map((d) => d.toJSON())
)
console.debug("terrain_partners_by_code", terrain_partners_by_code)
console.debug("project_partners_by_code", project_partners_by_code)
console.debug("lab_disciplines_by_code", lab_disciplines_by_code)
```
