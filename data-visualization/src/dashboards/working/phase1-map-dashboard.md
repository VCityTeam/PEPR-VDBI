---
theme: [dashboard, light]
sql:
  # annex_partners: /data/partners_by_project_annex.csv
  general_partners: /data/partners_general.csv
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
  copyTableToClipboardButton,
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
} from "/components/phase1-dashboard.js"
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
  italy_projection,
  default_mainland_france_marks,
} from "/components/projection-map.js"
```

```js
import { vdbi_color_scheme, project_color_scale } from "/components/color.js"
```

```js
import { vectorFromArray } from "npm:apache-arrow"
```

```js
const selected_project = view(
  Inputs.select(
    [
      "All",
      ...[...(await sql`select "Nom projet" from project_summaries`)].map((d) =>
        d["Nom projet"].trim()
      ),
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

display(
  copyTableToClipboardButton([...terrain_data_by_city], {
    label: "Copy terrain data by location to clipboard",
    delimeter: ";",
  })
)

display(
  copyTableToClipboardButton([...terrain_data], {
    label: "Copy terrain and scale data to clipboard",
    delimeter: ",",
  })
)
```

## Projects by Terrain

```js
const terrain_legend_type = view(
  Inputs.toggle({
    label: "Remove legend lines?",
    value: false,
  })
)
```

<div class="grid grid-cols-3">
  <div class="card grid-colspan-2 grid-rowspan-2" style="padding: 10px;">
    ${resize((width, height) =>
      defaultProjectionFrance(
        width,
        height - 15,
        terrain_legend_type
        ? generateDotMapMarks(france_terrain_data, france_terrain_legend, 0.2)
        : generateLineMapMarks(france_terrain_data, france_terrain_legend),
        "- Project terrains by city and Île-de-France, France"
      ))
    }

  </div>
  <div class="card" style="padding: 10px; overflow: hidden;">
    ${resize(
      (width) => defaultProjectionIleDeFrance(
        width,
        terrain_legend_type
        ? generateDotMapMarks(ile_de_france_terrain_data, idf_terrain_legend, 0.015)
        : generateLineMapMarks(ile_de_france_terrain_data, idf_terrain_legend),
        "- Project terrains by city, Grand Métropole de Paris"
      )
    )}

  </div>
  <div class="card" style="padding: 10px; overflow: hidden;">
    ${resize(
      (width) => defaultProjectionItaly(
        width,
        terrain_legend_type
        ? generateDotMapMarks(international_terrain_data, italy_terrain_legend, 0.1)
        : generateLineMapMarks(international_terrain_data, italy_terrain_legend),
        "- TRACES terrains by city, Italy"
      )
    )}

  </div>
</div>

## Projects by Partner locations

<div class="grid grid-cols-3">
  <div class="card grid-colspan-2 grid-rowspan-2" style="padding: 10px;">
    ${resize((width, height) => choropleth_france(width, height))}

  </div>
  <div class="card" style="padding: 10px;">
    ${resize((width) => choropleth_idf(width))}

  </div>
  
</div>



<!-- Initial data integration -->

```js
// debugger;
// const filtered_partner_data = [...all_partner_data].filter();
const partners_by_code = new Map(
  d3.rollups(
    [...all_partner_data],
    (D) =>
      D.reduce(
        (a, v) =>
          selected_project == "All" || v.project_name == selected_project
            ? a + 1
            : a,
        0
      ),
    (d) => (d.code_postal ? d.code_postal.slice(0, 2) : null)
  )
)
// partners_by_code.forEach((d) =>
//   france_departements_geojson.features.find(
//     ({ properties }) => properties.code == d[0]
//   ).partner_count = d[1].map((d) => d.count)
// )
```




```sql id=all_partner_data
-- Clean tables
UPDATE general_partners
  SET project_name = 'RESILIENCE'
  WHERE project_name = 'RÉSILIENCE';
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
  siret,
  -- list_distinct(list(siren)) as sirens,
  -- siren,
  -- list_distinct(list(project_name)) as projects,
  project_name,
  -- nom_complet,
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
  -- list_distinct(list(source_label)) AS source_labels,
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
  -- raw_data->>'osm_id' as osm_id,
  -- raw_data->>'osm_type' as osm_type,
  -- raw_data->>'name' as osm_name,
  raw_data->>'addresstype' as osm_address_type,
  -- case
  --   when json_exists(raw_data, '$.address.city')
  --     then raw_data->>'$.address.city'
  --   when json_exists(raw_data, '$.address.town')
  --     then raw_data->>'$.address.town'
  --   when json_exists(raw_data, '$.address.village')
  --     then raw_data->>'$.address.village'
  --   when json_exists(raw_data, '$.address.municipality')
  --     then raw_data->>'$.address.municipality'
  --   else null
  -- end as osm_city_name,
  -- case
  --   when json_exists(raw_data, '$.address.local_authority')
  --     then raw_data->>'$.address.local_authority'
  --   when json_exists(raw_data, '$.address.county')
  --     then raw_data->>'$.address.county'
  --   when json_exists(raw_data, '$.address.state')
  --     then raw_data->>'$.address.state'
  --   when json_exists(raw_data, '$.address.region')
  --     then raw_data->>'$.address.region'
  --   else null
  -- end as osm_agglomeration_name,
  -- case
  --   when json_exists(raw_data, '$.address.city') then 'city'
  --   when json_exists(raw_data, '$.address.town') then 'town'
  --   when json_exists(raw_data, '$.address.village') then 'village'
  --   when json_exists(raw_data, '$.address.municipality') then 'municipality'
  --   else null
  -- end as osm_city_type,
  -- case
  --   when json_exists(raw_data, '$.address.local_authority') then 'local_authority'
  --   when json_exists(raw_data, '$.address.county') then 'county'
  --   when json_exists(raw_data, '$.address.state') then 'state'
  --   when json_exists(raw_data, '$.address.region') then 'region'
  --   else null
  -- end as osm_agglomeration_type,
  commentaire,
from terrain_locations, project_terrains_by_scale
where terrain_locations.terrain = project_terrains_by_scale.terrain
```

```sql id=terrain_data_by_city
-- merge data on a terrain_label
-- (a simplified terrain label for merging locations at the city level)

with
  labeled_terrain_locations as (
    select distinct
      terrain,
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

```js
const workbook1 = FileAttachment(
  "/data/private/250120 PEPR_VBDI_analyse modifiée JYT_financed_redacted.xlsx"
).xlsx()
```

```js
const anonymize = false
const anonymizeDict = new Map()

const project_data = resolveGeneralEntities(
  getGeneralSheet(workbook1),
  anonymize,
  anonymizeDict
)
const researcher_data = resolveResearcherEntities(
  getResearcherSheet(workbook1),
  anonymize,
  anonymizeDict
)
const laboratory_data = new Set(d3.merge(project_data.map((d) => d.labs)))
// const laboratory_data = resolveLabEntities(
//   getLabSheet(workbook1),
//   anonymize,
//   anonymizeDict
// );
const university_data = new Set(
  d3.merge(project_data.map((d) => d.institutions))
)
// const university_data = resolveInstitutionEntities(
//   getInstitutionSheet(workbook1),
//   anonymize,
//   anonymizeDict
// );
const partner_data = new Set(d3.merge(project_data.map((d) => d.partners)))
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

const france_terrain_data = [...terrain_data_by_city]
  .filter(
    (d) =>
      // filter missing data
      d.terrain_label &&
      d.longitude &&
      d.latitude &&
      // keep projects within france
      inBBox(d.longitude, d.latitude, mainland_france_bbox) &&
      // separate out ile-de-france data
      !inBBox(d.longitude, d.latitude, ile_de_france_bbox)
  )
  .map((d) => d.toJSON()) // this is only to make debugging easier, should be removed

const ile_de_france_terrain_data = [...terrain_data_by_city].filter(
  (d) =>
    d.terrain_label != "Île-de-France" &&
    inBBox(d.longitude, d.latitude, ile_de_france_bbox)
)

france_terrain_data.push({
  terrain_label: "Île-de-France",
  projects: vectorFromArray([
    ...new Set(
      [...terrain_data_by_city]
        .filter((d) => d.terrain_label == "Île-de-France")
        .flatMap((d) => [...d.projects])
    ),
    ...new Set(ile_de_france_terrain_data.flatMap((d) => [...d.projects])),
  ]),
  latitude: d3.mean([ile_de_france_bbox.min_y, ile_de_france_bbox.max_y]),
  longitude: d3.mean([ile_de_france_bbox.min_x, ile_de_france_bbox.max_x]),
})

const international_terrain_data = [...terrain_data_by_city].filter(
  (d) =>
    // filter missing data
    d.terrain_label &&
    d.longitude &&
    d.latitude &&
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

// debugger;

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
  france_terrain_legend[index].push(52)
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
  ["Marseille", "bottom-left"],
  // ['Aix-Marseille-Provence', 'bottom-left'],
  // ['Villeurbanne', 'bottom-left'],
  ["La Trambouze", "bottom-left"],
  ["Thiers", "bottom-right"],
  // ['Saint Denis', 'bottom-right'],
  // ['Seine Saint Denis', 'bottom-left'],
  // ['Paris', 'bottom-right'],
  ["Ivry-sur-Seine", "bottom-left"],
  // ['Cachan', 'top'],
  // ['Ris-Orangis', 'top'],
  // ['Saclay', 'bottom'],
  ["Arquata del Tronto", "top-right"],
  ["Acquasanta Terme", "bottom-left"],
])

const terrain_tips = (data) =>
  data.map((d) => {
    let tip_anchor = "bottom"

    if (terrain_anchor_map.has(d.terrain_label)) {
      tip_anchor = terrain_anchor_map.get(d.terrain_label)
    }

    return Plot.tip([d.terrain_label], {
      x: d.longitude,
      y: d.latitude,
      textPadding: 1,
      strokeOpacity: 0,
      fillOpacity: 0.5,
      fontSize: 12,
      fontWeight: "bold",
      anchor: tip_anchor,
    })
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

const defaultProjection = (
  width,
  height,
  projection,
  marks,
  caption = "",
) =>
  Plot.plot({
    width: width,
    height: height,
    caption: caption,
    projection: projection,
    marks: [...marks],
  })

const defaultProjectionFrance = (width, height, marks, caption = "") =>
  defaultProjection(
    width,
    height,
    france_projection,
    default_mainland_france_marks.concat(marks),
    caption,
  )

const defaultProjectionIleDeFrance = (width, marks, caption = "") =>
  defaultProjection(
    width,
    width,
    idf_projection,
    [
      Plot.geo(france_departements_geojson, {
        stroke: "white",
        strokeOpacity: 0.5,
        fill: vdbi_color_scheme.blue,
        fillOpacity: 0.3,
      }),
      marks,
    ],
    caption,
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
    caption,
  )

// generate plot marks for each visualisation method

const isProjectSelected = (project) =>
  selected_project == "All" || project == selected_project

function generateLineMapMarks(terrain_data, terrain_legend) {
  const links = Plot.link(terrain_tip_dots(terrain_data, terrain_legend, 0.2), {
    x1: "label_x",
    y1: "label_y",
    x2: "longitude",
    y2: "latitude",
    stroke: (d) => project_color_scale(d.projects),
    strokeWidth: (d) => (isProjectSelected(d.projects) ? 1 : 0.5),
    strokeOpacity: (d) => (isProjectSelected(d.projects) ? 1 : 0.5),
    markerEnd: "arrow",
    curve: "bump-y",
  })
  const terrain_dots = Plot.dot(terrain_data, {
    x: "longitude",
    y: "latitude",
    r: 3,
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
        value: (d) => [...d.projects],
        label: "Projects",
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
      },
    },
  })
  const legend_dots = Plot.dot(terrain_legend, {
    x: (d) => d[2],
    y: (d) => d[3],
    r: 5,
    fill: (d) => d[1],
    fillOpacity: (d) => (isProjectSelected(d[0]) ? 1 : 0.2),
  })
  const legend_text = Plot.text(terrain_legend, {
    x: (d) => d[2],
    y: (d) => d[3],
    dy: -12,
    text: (d) => d[0],
  })
  const legend_axis_label = Plot.text(["Financed Projects"], {
    x: d3.mean(terrain_legend.map((d) => d[2])),
    y: terrain_legend.length > 0 ? terrain_legend[0][3] : 0,
    dy: -32,
    fontSize: 14,
  })
  return [
    links,
    terrain_dots,
    // legend marks //
    legend_dots,
    legend_text,
    legend_axis_label,
    // tip marks //
    ...terrain_tips(terrain_data),
  ]
}

function generateDotMapMarks(terrain_data, terrain_legend, tip_dot_delta) {
  const terrain_dots = Plot.dot(terrain_data, {
    x: "longitude",
    y: "latitude",
    r: 3,
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
        value: (d) => [...d.projects],
        label: "Projects",
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
      },
    },
  })
  const legend_dots = Plot.dot(terrain_legend, {
    x: (d) => d[2],
    y: (d) => d[3],
    r: 5,
    fill: (d) => d[1],
    fillOpacity: (d) => (isProjectSelected(d[0]) ? 1 : 0.2),
  })
  const legend_text = Plot.text(terrain_legend, {
    x: (d) => d[2],
    y: (d) => d[3],
    dy: -12,
    text: (d) => d[0],
  })
  const tip_dots = Plot.dot(
    terrain_tip_dots(terrain_data, terrain_legend, tip_dot_delta),
    {
      x: "x",
      y: "y",
      r: 4,
      fill: (d) => project_color_scale(d.projects),
      fillOpacity: (d) => (isProjectSelected(d.projects) ? 1 : 0.2),
    }
  )
  const legend_axis_label = Plot.text(["Financed Projects"], {
    x: d3.mean(terrain_legend.map((d) => d[2])),
    y: terrain_legend.length > 0 ? terrain_legend[0][3] : 0,
    dy: -32,
    fontSize: 14,
  })
  return [
    terrain_dots,
    // legend marks //
    legend_dots,
    legend_text,
    legend_axis_label,
    // tip marks //
    ...terrain_tips(terrain_data),
    tip_dots,
  ]
}
```

```js
const choropleth_france = (width, height) =>
  Plot.plot({
    width: d3.max([width, height]),
    height: d3.max([width, height]) - 40,
    caption:
      "- Project socio-economic partners by department and Île-de-France, France",
    color: {
      // scheme: "Oranges",
      scheme: "Blues",
      label: "# of Socioeconomic Partners",
      legend: true,
    },
    projection: {
      type: "azimuthal-equidistant",
      domain: d3
        .geoCircle()
        .center(d3.geoCentroid(mainland_france_regions_geojson))
        .radius(5)(),
    },
    marks: [
      Plot.geo(mainland_france_departements_geojson, {
        // fill: vdbi_color_scheme.blue,
        // fill: vdbi_color_scheme.orange,
        fill: ({ properties }) => partners_by_code.get(properties.code),
        // strokeOpacity: 0,
        // fillOpacity: (d) => partners_by_code.get(d.properties.code),
      }),
      Plot.geo(mainland_france_departements_geojson, {
        stroke: vdbi_color_scheme.blue,
        strokeWidth: 0.1,
      }),
      Plot.geo(mainland_france_regions_geojson, {
        stroke: vdbi_color_scheme.blue,
      }),
    ],
  })

const choropleth_idf = (width) =>
  Plot.plot({
    width: width,
    caption: "- Project socio-economic partners by department, Île-de-France",
    color: {
      // scheme: "Oranges",
      scheme: "Blues",
      label: "# of Socioeconomic Partners",
      legend: true,
    },
    projection: {
      type: "azimuthal-equidistant",
      domain: d3
        .geoCircle()
        .center(d3.geoCentroid(idf_departements_geojson))
        .radius(0.8)(),
    },
    marks: [
      Plot.geo(idf_departements_geojson, {
        // fill: vdbi_color_scheme.blue,
        // fill: vdbi_color_scheme.orange,
        fill: ({ properties }) => partners_by_code.get(properties.code),
        // strokeOpacity: 0,
        // fillOpacity: (d) => partners_by_code.get(d.properties.code),
      }),
      Plot.geo(idf_departements_geojson, {
        stroke: vdbi_color_scheme.blue,
        strokeWidth: 0.1,
      }),
      Plot.geo(idf_departements_geojson, {
        stroke: vdbi_color_scheme.blue,
      }),
    ],
  })
```

<!-- debugging info -->

```js
console.debug("project_data", project_data)
console.debug("researcher_data", researcher_data)
console.debug("laboratory_data", laboratory_data)
console.debug("university_data", university_data)
```

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
  "terrain_data_by_city",
  [...terrain_data_by_city].map((d) => d.toJSON())
)
console.debug("france_terrain_data", [...france_terrain_data])
console.debug(
  "ile_de_france_terrain_data",
  [...ile_de_france_terrain_data].map((d) => d.toJSON())
)
```

```js
console.debug(
  "all_partner_data",
  [...all_partner_data].map((d) => d.toJSON())
)
console.debug("partners_by_code", partners_by_code)
```
