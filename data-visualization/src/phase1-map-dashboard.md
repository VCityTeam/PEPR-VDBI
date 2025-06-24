---
theme: [dashboard, light]
sql:
  general_partners: ./data/partners_general.csv
  aap_partners: ./data/private/partenaires_aap2023.csv
  terrains: ./data/project_summary_terrains.csv
  projects: ./data/private/project_summary.csv
  project_terrains: ./data/private/project_summary_terrains.csv
---

# Phase 1 Overview

<div class="warning" label="Data visualization notice">
  Data visualizations are unverified and errors may exist. Regard these data visualizations as estimations and not a "ground truth".
</div>

```js
const debug = true;
```

```js
import {
  countEntities,
  sparkbar,
} from "./components/utilities.js";
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
} from "./components/phase1-dashboard.js";
```
```js
import {
  forceGraph,
  mapTableToPropertyGraphLinks,
  mapTableToTriples,
} from "./components/graph.js";
```
```js
import {
  projectionMap
} from "./components/projection-map.js";
```
```js
import {
  pepr_colors,
  project_colors,
} from "./components/color.js";
```


<!-- Initial data integration -->

```sql id=terrain_data
-- clean data

-- update terrains
-- set project = upper(project);
-- update terrains
-- set terrain = replace(terrain, 'Commune de ', '')
-- where starts_with(terrain, 'Commune de ');
-- update terrains
-- set terrain = replace(terrain, 'Ville de ', '')
-- where starts_with(terrain, 'Ville de ');
-- update terrains
-- set terrain = replace(terrain, 'Métropole d''', '')
-- where starts_with(terrain, 'Métropole d''');
-- update terrains
-- set terrain = replace(terrain, 'Métropole européenne de ', '')
-- where starts_with(terrain, 'Métropole européenne de ');

select
  terrain,
  -- list(project) as projects,
  first(lat) as latitude,
  first(lon) as longitude,
from terrains
group by all
```

```js
const workbook1 = FileAttachment(
  "./data/private/250120 PEPR_VBDI_analyse modifiée JYT_financed_redacted.xlsx"
).xlsx();
```
```js
const regions = await FileAttachment("./data/regions.json").json();
regions.features = regions.features.filter((d) => d.properties.nom != "Corse");
```
```js
// const departements = FileAttachment("./data/departements.json").json();
```

```js
const anonymize = false;
const anonymizeDict = new Map();

const project_data = resolveGeneralEntities(
  getGeneralSheet(workbook1),
  anonymize,
  anonymizeDict
);
const researcher_data = resolveResearcherEntities(
  getResearcherSheet(workbook1),
  anonymize,
  anonymizeDict
);
const laboratory_data = new Set(d3.merge(project_data.map((d) => d.labs)));
// const laboratory_data = resolveLabEntities(
//   getLabSheet(workbook1),
//   anonymize,
//   anonymizeDict
// );
const university_data = new Set(d3.merge(project_data.map((d) => d.institutions)));
// const university_data = resolveInstitutionEntities(
//   getInstitutionSheet(workbook1),
//   anonymize,
//   anonymizeDict
// );
const partner_data = new Set(d3.merge(project_data.map((d) => d.partners)));
```

<!-- Project terrain map -->

```js
// point in bbox?
const inBBox = (
  longitude,
  latitude,
  {
    min_x = -180,
    max_x = 180,
    min_y = -180,
    max_y = 180
  }) =>
  min_x < longitude && longitude < max_x &&
  min_y < latitude && latitude < max_y
```

```js
const mainland_france_bbox = {
  'min_x': -5.273438,
  'max_x': 8.833008,
  'min_y': 42.228517,
  'max_y': 51.261915
};

const ile_de_france_bbox = {
  'min_x': 1.4425891164457563,
  'max_x': 3.559891742088918,
  'min_y': 48.120414136323795,
  'max_y': 49.24342474094858
};

const filtered_terrain_data = [...terrain_data].filter(
  (d) => 
    // filter missing data
    d.terrain &&
    d.longitude &&
    d.latitude &&
    // keep projects within france
    inBBox(d.longitude, d.latitude, mainland_france_bbox) &&
    // separate out ile-de-france data 
    !inBBox(d.longitude, d.latitude, ile_de_france_bbox)
);

const ile_de_france_terrain_data = [...terrain_data].filter(
  (d) => inBBox(d.longitude, d.latitude, ile_de_france_bbox));

filtered_terrain_data.push({
  terrain: "Île-de-France",
  projects: [...new Set(ile_de_france_terrain_data.flatMap((d) => [...d.projects]))],
  latitude: d3.mean([ile_de_france_bbox.min_y, ile_de_france_bbox.max_y]),
  longitude: d3.mean([ile_de_france_bbox.min_x, ile_de_france_bbox.max_x]),
});


const terrain_legend = [...project_colors.entries()];

const mapToFranceLongitude = (index, subdivisions) =>
  d3.scaleLinear(
    [0, subdivisions],
    [-4, 9.5]
  )(index);

for (let index = 0; index < terrain_legend.length; index++) {
  terrain_legend[index].push(
    mapToFranceLongitude(index, terrain_legend.length)
  );
  terrain_legend[index].push(52);
}


const terrain_anchor_map = new Map([
  ['Saclay Cachan', 'top-right'],
  ['Lyon', 'top-right'],
  ['Plauzat', 'top-right'],
  ['Marseille', 'top-left'],
  ['Paris', 'top-left'],
  ['Aix Marseille Provence', 'bottom-left'],
  ['Villeurbanne', 'bottom-left'],
]);

const terrain_tips = (data) => data.map((d) => {

  let tip_anchor = 'bottom';

  if (terrain_anchor_map.has(d.terrain)) {
    tip_anchor = terrain_anchor_map.get(d.terrain);
  }

  return Plot.tip(
    [d.terrain],
    {
      x: d.longitude,
      y: d.latitude,
      textPadding: 1,
      strokeOpacity: 0,
      fillOpacity: 0.5,
      fontSize: 12,
      fontWeight: 'bold',
      anchor: tip_anchor,
    }
  );
});

const terrain_tip_dots_float_left = [
  // 'Lyon',
  // 'Thiers',
  // 'Plauzat',
  // 'Saclay Cachan',
];

const terrain_tip_dots = (data) => data.flatMap((d) => {

  const indexed_projects = [];

  const projects = [...d.projects];
  
  for (let index = 0; index < projects.length; index++) {
    const data = {...d};
    data.projects = projects[index];
    data.project_index = index;
    data.x = terrain_tip_dots_float_left.includes(data.terrain) ?
      data.longitude - 0.2 - (index * 0.2) :
      data.longitude + 0.2 + (index * 0.2);
    data.y = data.latitude;
    data.label_x = terrain_legend.find(
        (legend_datum) => legend_datum[0] === data.projects
      );
    data.label_x = data.label_x ? data.label_x[2] : null;
    data.label_y = terrain_legend.find(
        (legend_datum) => legend_datum[0] === data.projects
      );
    data.label_y = data.label_y ? data.label_y[3] : null;
    indexed_projects.push(data);
  }

  return indexed_projects;
}).filter((d) => !!d);
```

```js
const defaultProjectionFrance = (width, marks) =>
  Plot.plot({
    width: width,
    height: width,
    projection: {
      type: 'azimuthal-equidistant',
      domain: d3.geoCircle().center([2, 47]).radius(5)(),
    },
    marks: [
      Plot.geo(regions, {
        stroke: 'white',
        strokeOpacity: 0.5,
        fill: pepr_colors.blue,
        fillOpacity: 0.3,
      }),
      ...marks,
      Plot.sphere(),
    ],
  }
);

const lineProjection = (width, data) =>
  defaultProjectionFrance(
    width,
    [
      Plot.link(
        terrain_tip_dots(data),
        {
          x1: "label_x",
          y1: "label_y",
          x2: "longitude",
          y2: "latitude",
          stroke: (d) => project_colors.get(d.projects),
          markerEnd: "arrow",
          curve: "bump-y",
        }
      ),
      Plot.dot(
        data,
        {
          x: "longitude",
          y: "latitude",
          r: 3,
          fill: 'black',
          //stroke: pepr_colors.orange,
          //fillOpacity: 0.5,
          channels: {
            entity: {
              value: "terrain",
              label: 'City',
            },
            count: {
              value: (d) => 1,
              label: 'Occurences',
            },
            longitude: {
              value: "longitude",
              label: 'Lon',
            },
            latitude: {
              value: "latitude",
              label: 'Lat',
            },
            projects: {
              value: (d) => [...d.projects],
              label: 'Projects',
            },
          },
          tip: debug ? true : {
            format: {
              longitude: false,
              latitude: false,
              count: false,
              x: false,
              y: false,
              r: false,
            }
          },
        }
      ),
      // legend marks //
      Plot.dot(
        terrain_legend,
        {
          x: (d) => d[2],
          y: (d) => d[3],
          r: 5,
          fill: (d) => d[1],
        }
      ),
      Plot.text(
        terrain_legend,
        {
          x: (d) => d[2],
          y: (d) => d[3],
          dy: -12,
          text: (d) => d[0],
        }
      ),
      // tip marks //
      ...terrain_tips(data),
    ]
  );


const dotProjection = (width, data) =>
  defaultProjectionFrance(
    width,
    [
      // Plot.dot(walmarts, Plot.hexbin({r: "count", fill: "min"}, {x: "longitude", y: "latitude", fill: "date"}))
      Plot.dot(
        data,
        {
          x: "longitude",
          y: "latitude",
          r: 3,
          fill: pepr_colors.blue,
          fillOpacity: 0.5,
          channels: {
            entity: {
              value: "terrain",
              label: 'City',
            },
            count: {
              value: (d) => 1,
              label: 'Occurences',
            },
            longitude: {
              value: "longitude",
              label: 'Lon',
            },
            latitude: {
              value: "latitude",
              label: 'Lat',
            },
            projects: {
              value: (d) => [...d.projects],
              label: 'Projects',
            },
          },
          tip: debug ? true : {
            format: {
              longitude: false,
              latitude: false,
              count: false,
              x: false,
              y: false,
              r: false,
            }
          },
        }
      ),
      // legend marks //
      Plot.dot(
        terrain_legend,
        {
          x: (d) => d[2],
          y: (d) => d[3],
          r: 5,
          fill: (d) => d[1],
        }
      ),
      Plot.text(
        terrain_legend,
        {
          x: (d) => d[2],
          y: (d) => d[3],
          dy: -12,
          text: (d) => d[0],
        }
      ),
      // tip marks //
      ...terrain_tips(data),
      Plot.dot(
        terrain_tip_dots(data),
        {
          x: "x",
          y: "y",
          r: 4,
          fill: (d) => project_colors.get(d.projects),
        }
      ),
      Plot.sphere(),
    ],
  );
```

  <!-- <div class="card grid-rowspan-2 grid-colspan-2">
    <h1>Partner sites by city</h1>
    ${
      resize((width) =>
        Plot.plot({
          projection: "albers",
          r: {range: [0, 16]},
          color: {scheme: "spectral", label: "First year opened", legend: true},
          marks: [
            Plot.geo(statemesh, {strokeOpacity: 0.5}),
            Plot.geo(nation),
            Plot.dot(walmarts, Plot.hexbin({r: "count", fill: "min"}, {x: "longitude", y: "latitude", fill: "date"}))  // TODO: add this to projectionMap
          ]
        })
      )
    }
  </div> -->

<div class="grid grid-cols-2">
  <div class="card">
    ${resize((width) => lineProjection(width, filtered_terrain_data))}

  </div>
  <div class="card">
    ${resize((width) => dotProjection(width, filtered_terrain_data))}

  </div>
  <div class="card">
    ${resize((width) => lineProjection(width, summary_terrain_data))}

  </div>
  <div class="card">
    ${resize((width) => dotProjection(width, summary_terrain_data))}

  </div>
</div>



<!-- debugging info -->

```js
if (debug) {
  display("project_data")
  display(project_data);
  display("researcher_data");
  display(researcher_data);
  display("laboratory_data");
  display(laboratory_data);
  display("university_data");
  display(university_data);
}
```
```js
if (debug) {
  display("aap_partners");
  display([...await sql`select * from aap_partners`]);
  display("terrains");
  display([...await sql`select * from terrains`]);
  display("projects");
  display([...await sql`select * from projects`]);
  display("project_terrains");
  display([...await sql`select * from project_terrains`]);
}
```
```js
if (debug) {
  display("terrain_data");
  display([...terrain_data]);
  display("filtered_terrain_data");
  display([...filtered_terrain_data]);
  display("ile_de_france_terrain_data");
  display(ile_de_france_terrain_data);
}
```
```js
if (debug) {
  display("terrain_legend")
  display(terrain_legend)
  display("regions")
  display(regions)
}
```

```js
// which terrain results are outside mainland france bbox?
[...terrain_data].filter(
  (d) => !inBBox(d.longitude, d.latitude, mainland_france_bbox)
).forEach(
  (d) => console.warn("terrain outside of france?", d.toJSON())
);
```
