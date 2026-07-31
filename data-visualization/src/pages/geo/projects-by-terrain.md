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
} from '/components/utilities.js'
import {
  choropleth_terrain_data,
  all_partners_by_code,
  all_partners_by_code_group_idf,
  lab_disciplines_by_code,
  france_terrain_data,
  ile_de_france_terrain_data,
  international_terrain_data,
  france_terrain_legend,
  idf_terrain_legend,
  italy_terrain_legend,
  world_terrain_legend,
  franceProjection,
  parisProjection,
  italyProjection,
  worldProjection,
  handleTerrainView,
  choroplethFrance,
  choroplethIdf,
  choroplethItaly,
  download_lab_choropleth_france,
  download_lab_choropleth_idf,
} from './aap-cartography.js'
```

<!-- DATA IMPORT -->

```js
const terrain_features = FileAttachment(
  '/data/terrain_feature_collection.json',
).json()
```

```sql id=all_partner_data
SELECT * from aap_partners
```

```sql id=terrain_data
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

```sql id=labs
select
  label as "ID primaire",
  project,
  "postal_code"[0:2] as postal_code,
  -- code_panel_erc,
from aap_partners
join projects_by_partner
  on aap_partners.id = projects_by_partner.partner_id
where aap_partners.type = 'LABORATOIRE'
```

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

```js
const projects = [
  ...(await sql`select distinct project from project_terrains`),
].map((d) => d.project)

const selected_terrain_project = view(
  Inputs.checkbox(projects, {
    label: 'Included projects:',
    unique: true,
    sort: true,
    value: projects,
  }),
)

const scales = [
  ...(await sql`select distinct scale from project_terrains where scale is not null`),
].map((d) => d.scale)

const selected_terrain_scale = view(
  Inputs.checkbox(scales, {
    label: 'Included scales:',
    unique: true,
    sort: true,
    value: scales,
  }),
)

const terrain_legend_type = view(
  Inputs.select(['Polygon', 'Line', 'Dot'], {
    label: 'Legend view type',
    value: 'Polygon',
  }),
)
```

<div style="display: flex">
  <div>
    ${downloadTableButton(
      () => [...terrain_data_by_city].map((d) => d.toJSON()),
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
      "france_project_terrains_by_scales_map.svg"
    )}
    <!-- $ -->
    ${downloadSVGButton(
      "#map-container-idf svg",
      "Download Grand Métropole de Paris project terrains map",
      "paris_project_terrains_by_scales_map.svg"
    )}
    <!-- $ -->
    <!-- ${downloadSVGButton(
      "#map-container-italy svg",
      "Download Italian project terrains map",
      "italy_project_terrains_by_scales_map.svg"
    )} -->
    <!-- $ -->
    ${downloadSVGButton(
      "#map-container-world svg",
      "Download world project terrains map",
      "world_project_terrains_by_scales_map.svg"
    )}
    <!-- $ -->
  </div>
</div>

<div class="grid grid-cols-3 card">
  <div
    id="map-container-france"
    class="grid-colspan-2 grid-rowspan-2"
    style="padding: 10px;"
  >
    ${resize((width, height) =>
      franceProjection(
        width,
        height - 15,
        handleTerrainView(
          terrain_legend_type,
          france_terrain_data,
          terrain_features,
          france_terrain_legend,
          0.2,
          width > 1030),
        "- Project terrains by city and Île-de-France, France"
      )
    )}
    <!-- $ -->
  </div>
  <div id="map-container-idf" style="padding: 10px; overflow: hidden;">
    ${resize(
      (width) => parisProjection(
        width,
        handleTerrainView(
          terrain_legend_type,
          ile_de_france_terrain_data(terrain_data_by_city),
          terrain_features,
          idf_terrain_legend,
          0.015,
          width > 500),
        "- Project terrains by city, Grand Métropole de Paris"
      )
    )}
    <!-- $ -->
  </div>
  <!-- <div id="map-container-italy" style="padding: 10px; overflow: hidden;">
    ${resize(
      (width) => defaultProjectionItaly(
        width,
        handleTerrainView(
          terrain_legend_type,
          [...terrain_data_by_city],
          terrain_features,
          italy_terrain_legend,
          0.1,
          width > 500),
        "- TRACES terrains by city, Italy"
      )
    )}
  </div> -->
  <div id="map-container-world" style="padding: 10px; overflow: hidden;">
    ${resize(
      (width, height) => worldProjection(
        width,
        height,
        handleTerrainView(
          terrain_legend_type,
          [...terrain_data_by_city].map((d) => d.toJSON()),
          terrain_features,
          world_terrain_legend,
          0.1,
          width > 500),
        "- Global terrains"
      )
    )}
    <!-- $ -->
  </div>
</div>
