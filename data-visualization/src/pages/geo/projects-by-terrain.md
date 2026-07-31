---
sql:
  annex_partners: /data/partners_by_project_annex.csv
  projects_by_partner: /data/partners_by_project.tsv
  aap_partners: /data/partners.tsv
  project_terrains: /data/project_terrains.tsv
---

# Projects by Terrain

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
import {
  france_terrain_data,
  ile_de_france_terrain_data,
  france_terrain_legend,
  idf_terrain_legend,
  italy_terrain_legend,
  world_terrain_legend,
  franceProjection,
  idfProjection,
  italyProjection,
  worldProjection,
  handleTerrainView,
} from './aap-cartography.js'
```

<!-- DATA IMPORT -->

```js
const terrain_features = FileAttachment(
  '/data/terrain_feature_collection.json',
).json()

console.debug('terrain_features', terrain_features)
```

```sql id=terrain_data display
select * from project_terrains
```

```sql id=terrain_data_by_city
-- merge data on terrain feature
-- (a simplified terrain label for merging locations at the city level)

select distinct
  terrain_id,
  terrain,
  osm_id,
  osm_type,
  -- list_distinct(list(terrain)) as terrains,
  list_distinct(list(project)) as projects,
  first(latitude) as latitude,
  first(longitude) as longitude,
  -- scale,
from project_terrains
group by all
```

<div class="card">

```js
const projects = [
  ...(await sql`select distinct project from project_terrains`),
].map((d) => d.project)

const scales = [
  ...(await sql`select distinct scale from project_terrains where scale is not null`),
].map((d) => d.scale)

const settings = view(
  Inputs.form(
    {
      selected_terrain_project: Inputs.checkbox(projects, {
        label: 'Included projects',
        unique: true,
        sort: true,
        value: projects,
      }),
      selected_terrain_scale: Inputs.checkbox(scales, {
        label: 'Included scales',
        unique: true,
        sort: true,
        value: scales,
      }),
      terrain_legend_type: Inputs.select(['Polygon', 'Line', 'Dot'], {
        label: 'Legend view type',
        value: 'Polygon',
      }),
    },
    { template: formTemplate },
  ),
)
```

</div>

<div class="grid grid-cols-3 card">
  <div
    id="map-container-france"
    class="grid-colspan-2 grid-rowspan-3"
  >
    ${resize((width, height) =>
      franceProjection(
        width,
        height - 15,
        handleTerrainView(
          settings.terrain_legend_type,
          france_terrain_data(
            terrain_data_by_city,
            settings.selected_terrain_scale),
          terrain_features,
          france_terrain_legend,
          0.2,
          width > 1030,
          settings.selected_terrain_project),
        "- Project terrains, France"
      )
    )}
    <!-- $ -->
  </div>
  <div id="map-container-idf" class="grid-rowspan-2" style="overflow: hidden;">
    ${resize(
      (width) => idfProjection(
        width,
        handleTerrainView(
          settings.terrain_legend_type,
          ile_de_france_terrain_data(terrain_data_by_city),
          terrain_features,
          idf_terrain_legend,
          0.015,
          width > 500,
          settings.selected_terrain_project),
        "- Project terrains, Ile-de-France"
      )
    )}
    <!-- $ -->
  </div>
  <!-- <div id="map-container-italy" style="overflow: hidden;">
    ${resize(
      (width) => defaultProjectionItaly(
        width,
        handleTerrainView(
          settings.terrain_legend_type,
          [...terrain_data_by_city],
          terrain_features,
          italy_terrain_legend,
          0.1,
          width > 500,
          settings.selected_terrain_project),
        "- TRACES terrains, Italy"
      )
    )}
  </div> -->
  <div id="map-container-world" style="overflow: hidden;">
    ${resize(
      (width) => worldProjection(
        width,
        width / 2,
        handleTerrainView(
          settings.terrain_legend_type,
          [...terrain_data_by_city].map((d) => d.toJSON()),
          terrain_features,
          world_terrain_legend,
          0.1,
          width > 500,
          settings.selected_terrain_project),
        "- Global project terrains"
      )
    )}
    <!-- $ -->
  </div>
</div>

<div class="card">

```js
display(
  Inputs.form(
    [
      downloadTableButton(
        () => [...terrain_data_by_city].map((d) => d.toJSON()),
        {
          label: 'Download terrains by location data',
          delimeter: '\t',
        },
      ),
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
