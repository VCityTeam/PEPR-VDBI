---
toc: false
sql:
  # annex_partners: /data/partners_by_project_annex.csv
  # projects_by_partner: /data/partners_by_project.tsv
  # aap_partners: /data/partners.tsv
  project_terrains: /data/project_terrains.tsv
---

# Projets par terrain d'étude

<div class="warning" label="Data visualization notice">
  Data visualizations are unverified and errors may exist.
  Consider these data visualizations as estimations and not a "ground truth".
</div>

<!-- IMPORTS -->

```js
import {
  downloadTableButton,
  downloadSVGButton,
  formTemplate,
} from '/components/utilities.js'
import * as geo from './aap-cartography.js'
```

<!-- DATA IMPORT -->

```js
const terrain_features = FileAttachment(
  '/data/terrain_feature_collection.json',
).json()

console.debug('terrain_features', terrain_features)
```

terrain_data

```sql id=terrain_data display
select * from project_terrains
```

terrain_data_by_city

```sql id=terrain_data_by_city
-- merge data on terrain feature
-- (a simplified terrain label for merging locations at the city level)

select distinct *
  -- terrain_id,
  -- terrain,
  -- osm_id,
  -- osm_type,
  -- -- list_distinct(list(terrain)) as terrains,
  -- list_distinct(list(project)) as projects,
  -- first(latitude) as latitude,
  -- first(longitude) as longitude,
  -- -- scale,
from project_terrains
-- group by all
```

```js
const filtered_terrain_data = [...terrain_data_by_city]
  .map((d) => d.toJSON())
  .filter(
    (d) =>
      settings.selected_terrain_scale.includes(d.scale) &&
      settings.selected_terrain_project_type.includes(d.project_type),
    // && settings.selected_terrain_project.includes(d.project),
  )
// display(filtered_terrain_data)
// display(filtered_terrain_data.find((d) => d.terrain === 'Hanoi'))
// display(terrain_features.features.find((d) => d.properties.label === 'Hanoi'))
```

<div class="card">

```js
// const projects = [
//   ...(await sql`select distinct project from project_terrains`),
// ].map((d) => d.project)

const project_types = [
  ...(await sql`select distinct project_type from project_terrains`),
].map((d) => d.project_type)

const scales = [
  ...(await sql`select distinct scale from project_terrains where scale is not null`),
].map((d) => d.scale)

const settings = view(
  Inputs.form(
    {
      selected_terrain_project_type: Inputs.checkbox(project_types, {
        label: 'Included project types',
        unique: true,
        sort: true,
        value: project_types,
      }),
      selected_terrain_scale: Inputs.checkbox(scales, {
        label: 'Included scales',
        unique: true,
        sort: true,
        value: scales,
      }),
    },
    { template: formTemplate },
  ),
)
```

</div>

<div class="card">
  <div class="grid grid-cols-4">
    <div
      id="map-container-france"
      class="grid-colspan-2 grid-rowspan-2"
    >
      ${resize((width, height) =>
        geo.choroplethFrance(
          width,
          height - 15,
          (department) => geo.filterFranceTerrains(filtered_terrain_data)
            .reduce((acc, terrain) => d3.geoContains(
              department,
              [terrain.longitude, terrain.latitude]
            )? acc + 1 : acc,
            0
          )
        )
      )}
      <!-- $ -->
    </div>
    <div id="map-container-idf" style="overflow: hidden;">
      ${resize(
        (width) => geo.idfProjection(
          width,
          // geo.handleTerrainView(
          //   geo.filterIdfTerrains(filtered_terrain_data),
          //   terrain_features,
          //   geo.idf_terrain_legend,
          //   0.015,
          //   width > 500,
          //   settings.selected_terrain_project),
          // "- Project terrains, Ile-de-France"
        )
      )}
      <!-- $ -->
    </div>
    <div id="map-container-italy" style="overflow: hidden;">
      ${resize(
        (width) => geo.italyProjection(
          width,
          // geo.handleTerrainView(
          //   filtered_terrain_data,
          //   terrain_features,
          //   geo.italy_terrain_legend,
          //   0.1,
          //   width > 500,
          //   settings.selected_terrain_project),
          // "- TRACES terrains, Italy"
        )
      )}
      <!-- $ -->
    </div>
    <div id="map-container-world" class="grid-colspan-2" style="overflow: hidden;">
      ${resize(
        (width) => geo.worldProjection(
          width,
          width / 2,
          geo.generateSimpleGeoTipMarks(
            geo.filterInternationalTerrains(filtered_terrain_data).map((d) => ({
              ...d,
              label: `${d.terrain}, ${d.country_code.toUpperCase()}`,
            })),
            new Map([
              ['Bangkok', 'top-right'],
              ['Hanoi', 'bottom-left'],
              ['Mayotte', 'bottom-right'],
              ['Perth', 'top-right'],
              ['Urbino', 'bottom-right'],
              ['Arquata del Tronto', 'left'],
              ['Acquasanta Terme', 'top-right'],
            ]),
          ),
          "- Terrains internationaux par ville"
        )
      )}
      <!-- $ -->
    </div>
  </div>
</div>

<div class="card">

```js
display(
  Inputs.form(
    [
      downloadTableButton(() => filtered_terrain_data, {
        label: 'Download terrains by location data',
        delimeter: '\t',
      }),
      downloadTableButton(() => [...terrain_data].map((d) => d.toJSON()), {
        label: 'Download terrain and scale data',
        delimeter: '\t',
      }),
      downloadSVGButton(
        '#map-container-france svg',
        'Download French project terrain map',
        'france_project_terrains_by_scales_map.svg',
      ),
      downloadSVGButton(
        '#map-container-idf svg',
        'Download Grand Métropole de Paris project terrain map',
        'paris_project_terrains_by_scales_map.svg',
      ),
      // downloadSVGButton(
      //   '#map-container-italy svg',
      //   'Download Italian project terrain map',
      //   'italy_project_terrains_by_scales_map.svg'
      // ),
      downloadSVGButton(
        '#map-container-world svg',
        'Download world project terrain map',
        'world_project_terrains_by_scales_map.svg',
      ),
    ],
    { template: formTemplate },
  ),
)
```

</div>

<!-- saving this for later when we figure out financial annex integration -->

<!--
```sql id=partner_project_code
WITH user_partner_project_data as (
  SELECT DISTINCT
    project,
    aap_partners.label,
    aap_partners.id as "ID primaire",
    aap_partners.type,
    -- nom_complet,
    postal_code,
  FROM projects_by_partner
  JOIN aap_partners
  ON projects_by_partner.partner_id::VARCHAR = aap_partners.id::VARCHAR
)
SELECT
  project,
  "ID primaire",
  postal_code,
FROM user_partner_project_data
UNION
SELECT DISTINCT
  upper(project_name) AS project,
  -- source_label AS label,
  siret AS "ID primaire",
  -- nature_juridique AS "type",
  -- nom_complet,
  code_postal AS postal_code,
FROM annex_partners
```
-->
