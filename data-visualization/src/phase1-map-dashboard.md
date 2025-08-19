---
theme: [dashboard, light]
sql:
  general_partners: ./data/partners_general.csv
  aap_partners: ./data/private/partenaires_aap2023.csv
  terrains: ./data/project_summary_terrain_locations.csv
  projects: ./data/private/project_summary.csv
  project_terrains_by_scale: ./data/private/project_summary_terrains.csv
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
} from "./components/utilities.js"
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
} from "./components/phase1-dashboard.js"
```

```js
import {
  forceGraph,
  mapTableToPropertyGraphLinks,
  mapTableToTriples,
} from "./components/graph.js"
```

```js
import { projectionMap } from "./components/projection-map.js"
```

```js
import { vdbi_color_scheme, project_color_scale } from "./components/color.js"
```

```js
const selected_project = view(
  Inputs.select(
    [
      "All",
      ...[...(await sql`select "Nom projet" from projects`)].map((d) =>
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
  copyTableToClipboardButton(
    terrain_data,
    null,
    "Copy project terrain city locations data to clipboard"
  )
)
```

## Projects by Terrain

<div class="grid grid-cols-3">
  <div class="card grid-colspan-2 grid-rowspan-2" style="padding: 10px;">
    ${resize(
      (width, height) => defaultProjectionFrance(
        width,
        height - 15,
        generateLineMapMarks(france_terrain_data, france_terrain_legend),
        "- Project terrains by city and Île-de-France, France"
      )
    )}

  </div>
  <div class="card" style="padding: 10px; overflow: hidden;">
    ${resize(
      (width) => defaultProjectionIleDeFrance(
        width,
        generateLineMapMarks(ile_de_france_terrain_data, idf_terrain_legend),
        "- Project terrains by city, Île-de-France"
      )
    )}

  </div>
  <div class="card" style="padding: 10px; overflow: hidden;">
    ${resize(
      (width) => defaultProjectionItaly(
        width,
        generateLineMapMarks(international_terrain_data, italy_terrain_legend),
        "- Project terrains by city, Italy"
      )
    )}

  </div>
  <div class="card grid-colspan-2 grid-rowspan-2" style="padding: 10px;">
    ${resize(
      (width, height) => defaultProjectionFrance(
        width,
        height - 15,
        generateDotMapMarks(france_terrain_data, france_terrain_legend, 0.2),
        "- Project terrains by city and Île-de-France, France"
      )
    )}

  </div>
  <div class="card" style="padding: 10px; overflow: hidden;">
    ${resize(
      (width) => defaultProjectionIleDeFrance(
        width,
        generateDotMapMarks(ile_de_france_terrain_data, idf_terrain_legend, 0.015),
        "- Project terrains by city, Île-de-France"
      )
    )}

  </div>
  <div class="card" style="padding: 10px; overflow: hidden;">
    ${resize(
      (width) => defaultProjectionItaly(
        width,
        generateDotMapMarks(international_terrain_data, italy_terrain_legend, 0.1),
        "- Project terrains by city, Italy"
      )
    )}

  </div>
</div>

<!-- Initial data integration -->

```sql id=terrain_data
-- clean data
alter table project_terrains_by_scale
  add column city varchar;
update project_terrains_by_scale
  set city = terrain;

update project_terrains_by_scale
  set terrain = replace(city, 'Commune de ', '');
update project_terrains_by_scale
  set terrain = replace(city, 'Ville de ', '');
update project_terrains_by_scale
  set terrain = replace(city, 'Métropole d''', '');
update project_terrains_by_scale
  set terrain = replace(city, 'Métropole de ', '');
update project_terrains_by_scale
  set terrain = replace(city, 'Métropole européenne de ', '');
update project_terrains_by_scale
  set terrain = replace(city, 'Métropole Européenne de ', '');
update project_terrains_by_scale
  set terrain = replace(city, 'Aix-Marseille-Provence', 'Marseille');

update terrains
  set terrain = replace(terrain, 'Commune de ', '');
update terrains
  set terrain = replace(terrain, 'Ville de ', '');
update terrains
  set terrain = replace(terrain, 'Métropole d''', '');
update terrains
  set terrain = replace(terrain, 'Métropole de ', '');
update terrains
  set terrain = replace(terrain, 'Métropole européenne de ', '');
update terrains
  set terrain = replace(terrain, 'Métropole Européenne de ', '');
update terrains
  set terrain = replace(terrain, 'Aix-Marseille-Provence', 'Marseille');

with project_terrain_map as (
    select
      acronyme,
      terrain,
    from project_terrains_by_scale
    group by all
  )
select distinct
  terrains.terrain,
  list_distinct(list(project_terrain_map.acronyme)) as projects,
  first(terrains.lat) as latitude,
  first(terrains.lon) as longitude,
from terrains
join project_terrain_map
on project_terrain_map.terrain = terrains.terrain
group by all
```

```js
const workbook1 = FileAttachment(
  "./data/private/250120 PEPR_VBDI_analyse modifiée JYT_financed_redacted.xlsx"
).xlsx()
```

```js
const france_regions = await FileAttachment("./data/france_regions.json").json()
const mainland_france_regions = {
  type: "FeatureCollection",
  features: france_regions.features.filter(
    (d) => d.properties.code > 10 && d.properties.nom != "Corse"
  ),
}
const ile_de_france_region = {
  type: "Feature",
  feature: mainland_france_regions.features.find(
    (d) => d.properties.code == 11
  ),
}
```

```js
const france_departements = await FileAttachment(
  "./data/france_departements.json"
).json()
const ile_de_france_departements = {
  type: "FeatureCollection",
  features: france_departements.features,
}
```

```js
const europe = FileAttachment("./data/europe.geo.json").json()
```

```js
const italy_regions = FileAttachment("./data/italy_regions.json").json()
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

const france_terrain_data = [...terrain_data]
  .filter(
    (d) =>
      // filter missing data
      d.terrain &&
      d.longitude &&
      d.latitude &&
      // keep projects within france
      inBBox(d.longitude, d.latitude, mainland_france_bbox) &&
      // separate out ile-de-france data
      !inBBox(d.longitude, d.latitude, ile_de_france_bbox)
  )
  .map((d) => d.toJSON()) // this is only to make debugging easier, should be removed at scale

const ile_de_france_terrain_data = [...terrain_data].filter(
  (d) =>
    d.terrain != "Île-de-France" &&
    inBBox(d.longitude, d.latitude, ile_de_france_bbox)
)

france_terrain_data.push({
  terrain: "Île-de-France",
  projects: [
    ...new Set(
      [...terrain_data]
        .filter((d) => d.terrain == "Île-de-France")
        .flatMap((d) => [...d.projects])
    ),
    ...new Set(ile_de_france_terrain_data.flatMap((d) => [...d.projects])),
  ],
  latitude: d3.mean([ile_de_france_bbox.min_y, ile_de_france_bbox.max_y]),
  longitude: d3.mean([ile_de_france_bbox.min_x, ile_de_france_bbox.max_x]),
})

const international_terrain_data = [...terrain_data].filter(
  (d) =>
    // filter missing data
    d.terrain &&
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

    if (terrain_anchor_map.has(d.terrain)) {
      tip_anchor = terrain_anchor_map.get(d.terrain)
    }

    return Plot.tip([d.terrain], {
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
        data.x = terrain_tip_dots_float_left.includes(data.terrain)
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
  marks,
  caption = "",
  domain = d3.geoCircle().center([2, 47]).radius(5)()
) =>
  Plot.plot({
    width: width,
    height: height,
    caption: caption,
    projection: {
      type: "azimuthal-equidistant",
      domain: domain,
    },
    marks: [...marks],
  })

const defaultProjectionFrance = (width, height, marks, caption = "") =>
  defaultProjection(
    width,
    height,
    [
      Plot.geo(mainland_france_regions, {
        stroke: "white",
        strokeOpacity: 0.5,
        fill: vdbi_color_scheme.blue,
        fillOpacity: 0.3,
      }),
      marks,
    ],
    caption,
    d3.geoCircle().center([2, 47.4]).radius(5)()
  )

const defaultProjectionIleDeFrance = (width, marks, caption = "") =>
  defaultProjection(
    width,
    width,
    [
      Plot.geo(ile_de_france_departements, {
        stroke: "white",
        strokeOpacity: 0.5,
        fill: vdbi_color_scheme.blue,
        fillOpacity: 0.3,
      }),
      marks,
    ],
    caption,
    d3.geoCircle().center([2.35, 48.85]).radius(0.2)()
  )

const defaultProjectionItaly = (width, marks, caption = "") =>
  defaultProjection(
    width,
    width,
    [
      Plot.geo(italy_regions, {
        stroke: "white",
        strokeOpacity: 0.5,
        fill: vdbi_color_scheme.blue,
        fillOpacity: 0.3,
      }),
      marks,
    ],
    caption,
    d3.geoCircle().center([13, 43.5]).radius(1.1)()
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

## Projects by Partner locations

<div class="grid grid-cols-3">
  <div class="card grid-colspan-2 grid-rowspan-2" style="padding: 10px;">
    ${resize(
      (width, height) => defaultProjectionFrance(
        width,
        height - 15,
        generateLineMapMarks(france_terrain_data, france_terrain_legend),
        "- Project terrains by city and Île-de-France, France"
      )
    )}

  </div>
  <div class="card" style="padding: 10px; overflow: hidden;">
    ${resize(
      (width) => defaultProjectionIleDeFrance(
        width,
        generateLineMapMarks(ile_de_france_terrain_data, idf_terrain_legend),
        "- Project terrains by city, Île-de-France"
      )
    )}

  </div>
  <div class="card" style="padding: 10px; overflow: hidden;">
    ${resize(
      (width) => defaultProjectionItaly(
        width,
        generateLineMapMarks(international_terrain_data, italy_terrain_legend),
        "- Project terrains by city, Italy"
      )
    )}

  </div>
  <div class="card grid-colspan-2 grid-rowspan-2" style="padding: 10px;">
    ${resize(
      (width, height) => defaultProjectionFrance(
        width,
        height - 15,
        generateDotMapMarks(france_terrain_data, france_terrain_legend, 0.2),
        "- Project terrains by city and Île-de-France, France"
      )
    )}

  </div>
  <div class="card" style="padding: 10px; overflow: hidden;">
    ${resize(
      (width) => defaultProjectionIleDeFrance(
        width,
        generateDotMapMarks(ile_de_france_terrain_data, idf_terrain_legend, 0.015),
        "- Project terrains by city, Île-de-France"
      )
    )}

  </div>
  <div class="card" style="padding: 10px; overflow: hidden;">
    ${resize(
      (width) => defaultProjectionItaly(
        width,
        generateDotMapMarks(international_terrain_data, italy_terrain_legend, 0.1),
        "- Project terrains by city, Italy"
      )
    )}

  </div>
</div>

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
  "terrains",
  [...(await sql`select * from terrains`)].map((d) => d.toJSON())
)
console.debug(
  "projects",
  [...(await sql`select * from projects`)].map((d) => d.toJSON())
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
console.debug("france_terrain_data", [...france_terrain_data])
console.debug(
  "ile_de_france_terrain_data",
  [...ile_de_france_terrain_data].map((d) => d.toJSON())
)
```

```js
console.debug("france_terrain_legend", france_terrain_legend)
console.debug("idf_terrain_legend", idf_terrain_legend)
console.debug("france_regions", france_regions)
console.debug("mainland_france_regions", mainland_france_regions)
console.debug("ile_de_france_region", ile_de_france_region)
console.debug("france_departements", france_departements)
console.debug("ile_de_france_departements", ile_de_france_departements)
console.debug("europe", europe)
```
