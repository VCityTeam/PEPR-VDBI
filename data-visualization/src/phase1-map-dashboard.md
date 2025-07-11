---
theme: [dashboard, light]
sql:
  general_partners: ./data/partners_general.csv
  aap_partners: ./data/private/partenaires_aap2023.csv
  terrains: ./data/project_summary_terrain_locations.csv
  projects: ./data/private/project_summary.csv
  project_terrain_map: ./data/private/project_summary_terrains.csv
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
update project_terrain_map
set terrain = replace(terrain, 'Commune de ', '');
update project_terrain_map
set terrain = replace(terrain, 'Ville de ', '');
update project_terrain_map
set terrain = replace(terrain, 'Métropole d''', '');
update project_terrain_map
set terrain = replace(terrain, 'Métropole de ', '');
update project_terrain_map
set terrain = replace(terrain, 'Métropole européenne de ', '');
update project_terrain_map
set terrain = replace(terrain, 'Métropole Européenne de ', '');
update project_terrain_map
set terrain = replace(terrain, 'Aix-Marseille-Provence', 'Marseille');
update terrains
set terrain = replace(terrain, 'Métropole Européenne de ', '');

select
  terrains.terrain,
  list(project_terrain_map.acronyme) as projects,
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
).xlsx();
```
```js
const france_regions = await FileAttachment("./data/regions.json").json();
const mainland_france_regions = {
  type: "FeatureCollection",
  features: france_regions.features.filter(
    (d) => d.properties.code > 10 && d.properties.nom != "Corse"
  )
};
const ile_de_france_region = {
  type: "Feature",
  feature: mainland_france_regions.features.find((d) => d.properties.code == 11)
};
```
```js
const departements = await FileAttachment("./data/departements.json").json();
const ile_de_france_departements = {
  type: "FeatureCollection",
  features: departements.features.filter(
    (d) => d3.geoContains(ile_de_france_region.feature.geometry, d3.geoCentroid(d.geometry))
  )
}
```
```js
const europe = await FileAttachment("./data/europe.geo.json").json();
// const ile_de_france_departements = {
//   type: "FeatureCollection",
//   features: departements.features.filter(
//     (d) => d3.geoContains(ile_de_france_region.feature.geometry, d3.geoCentroid(d.geometry))
//   )
// }
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

const france_terrain_data = [...terrain_data].filter(
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
  (d) => d.terrain != 'Île-de-France' &&
    inBBox(d.longitude, d.latitude, ile_de_france_bbox)
);

france_terrain_data.push({
  terrain: 'Île-de-France',
  projects: [
    ...new Set([...terrain_data]
      .filter((d) => d.terrain == 'Île-de-France')
      .flatMap((d) => [...d.projects])),
    ...new Set(ile_de_france_terrain_data.flatMap((d) => [...d.projects]))
  ],
  latitude: d3.mean([ile_de_france_bbox.min_y, ile_de_france_bbox.max_y]),
  longitude: d3.mean([ile_de_france_bbox.min_x, ile_de_france_bbox.max_x]),
});

const international_terrain_data = [...terrain_data].filter(
  (d) => 
    // filter missing data
    d.terrain &&
    d.longitude &&
    d.latitude &&
    // keep projects outside of france
    !inBBox(d.longitude, d.latitude, mainland_france_bbox)
);
```

```js
const france_terrain_legend = [...project_colors.entries()];

const mapToFranceLongitude = (index, subdivisions) =>
  d3.scaleLinear(
    [0, subdivisions],
    [-4, 9.5]
  )(index);

for (let index = 0; index < france_terrain_legend.length; index++) {
  // push longitude
  france_terrain_legend[index].push(
    mapToFranceLongitude(index, france_terrain_legend.length)
  );
    // push latitude
  france_terrain_legend[index].push(52);
}

const idf_terrains = new Set(
  ile_de_france_terrain_data.flatMap((row) => [...row.projects])
);
const idf_terrain_legend = [...project_colors.entries()
  .filter((d) => idf_terrains.has(d[0]))
];

const mapToIdfLongitude = (index, subdivisions) =>
  d3.scaleLinear(
    [0, subdivisions],
    [2.15, 2.7] 
  )(index);

for (let index = 0; index < idf_terrain_legend.length; index++) {
  // push longitude
  idf_terrain_legend[index].push(
    mapToIdfLongitude(index, idf_terrain_legend.length)
  );
    // push latitude
  idf_terrain_legend[index].push(49);
}

const international_terrains = new Set(
  international_terrain_data.flatMap((row) => [...row.projects])
);
const italy_terrain_legend = [...project_colors.entries()
  .filter((d) => international_terrains.has(d[0]))
];

const mapToItalyLongitude = (index, subdivisions) =>
  d3.scaleLinear(
    [0, subdivisions],
    [11, 16]
  )(index);

for (let index = 0; index < italy_terrain_legend.length; index++) {
  // push longitude
  italy_terrain_legend[index].push(
    mapToItalyLongitude(index, italy_terrain_legend.length)
  );
    // push latitude
  italy_terrain_legend[index].push(46);
}


const terrain_anchor_map = new Map([
  // ['Saclay Cachan', 'top-right'],
  ['Lyon', 'top'],
  ['Plauzat', 'top-right'],
  ['Marseille', 'bottom-left'],
  // ['Aix-Marseille-Provence', 'bottom-left'],
  // ['Villeurbanne', 'bottom-left'],
  ['La Trambouze', 'bottom-left'],
  ['Thiers', 'bottom-right'],
  // ['Saint Denis', 'bottom-right'],
  // ['Seine Saint Denis', 'bottom-left'],
  // ['Paris', 'bottom-right'],
  ['Ivry-sur-Seine', 'bottom-left'],
  // ['Cachan', 'top'],
  // ['Ris-Orangis', 'top'],
  // ['Saclay', 'bottom'],
  ['Acquasanta', 'top'],
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

const terrain_tip_dots = (data, legend, delta) => data.flatMap((d) => {

  const indexed_projects = [];

  const projects = [...d.projects];
  
  for (let index = 0; index < projects.length; index++) {
    const data = {...d};
    data.projects = projects[index];
    data.project_index = index;
    data.x = terrain_tip_dots_float_left.includes(data.terrain) ?
      data.longitude - delta - (index * delta) :
      data.longitude + delta + (index * delta);
    data.y = data.latitude;
    data.label_x = legend.find(
        (legend_datum) => legend_datum[0] === data.projects
      );
    data.label_x = data.label_x ? data.label_x[2] : null;
    data.label_y = legend.find(
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
      Plot.geo(mainland_france_regions, {
        stroke: 'white',
        strokeOpacity: 0.5,
        fill: pepr_colors.blue,
        fillOpacity: 0.3,
      }),
      ...marks,
    ],
  }
);

const defaultProjectionIleDeFrance = (width, marks) =>
  Plot.plot({
    width: width,
    height: width,
    projection: {
      type: 'azimuthal-equidistant',
      domain: d3.geoCircle().center([2.35, 48.83]).radius(0.18)(),
    },
    marks: [
      Plot.geo(ile_de_france_departements, {
        stroke: 'white',
        strokeOpacity: 0.5,
        fill: pepr_colors.blue,
        fillOpacity: 0.3,
      }),
      ...marks,
    ],
  }
);

const defaultProjectionItaly = (width, marks) =>
  Plot.plot({
    width: width,
    height: width,
    projection: {
      type: 'azimuthal-equidistant',
      domain: d3.geoCircle().center([11, 44]).radius(2.5)(),
    },
    marks: [
      Plot.geo(europe, {
        stroke: 'white',
        strokeOpacity: 0.5,
        fill: pepr_colors.blue,
        fillOpacity: 0.3,
      }),
      ...marks,
    ],
  }
);
```

<div class="grid grid-cols-3">
  <div class="card grid-colspan-2 grid-rowspan-2" style="padding: 0;">
    ${resize((width) => defaultProjectionFrance(
      width,
      [
        Plot.link(
          terrain_tip_dots(france_terrain_data, france_terrain_legend, 0.2),
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
          france_terrain_data,
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
          france_terrain_legend,
          {
            x: (d) => d[2],
            y: (d) => d[3],
            r: 5,
            fill: (d) => d[1],
          }
        ),
        Plot.text(
          france_terrain_legend,
          {
            x: (d) => d[2],
            y: (d) => d[3],
            dy: -12,
            text: (d) => d[0],
          }
        ),
        // tip marks //
        ...terrain_tips(france_terrain_data),
      ],
    ))}

  </div>
  <div class="card" style="padding: 0; overflow: hidden;">
    ${resize((width) => defaultProjectionIleDeFrance(
      width,
      [
        Plot.link(
          terrain_tip_dots(ile_de_france_terrain_data, idf_terrain_legend, 0.01),
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
          ile_de_france_terrain_data,
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
          idf_terrain_legend,
          {
            x: (d) => d[2],
            y: (d) => d[3],
            r: 5,
            fill: (d) => d[1],
          }
        ),
        Plot.text(
          idf_terrain_legend,
          {
            x: (d) => d[2],
            y: (d) => d[3],
            dy: -12,
            text: (d) => d[0],
          }
        ),
        // tip marks //
        ...terrain_tips(ile_de_france_terrain_data),
      ]
    ))}

  </div>
  <div class="card" style="padding: 0;">
    ${resize((width) => defaultProjectionItaly(
      width,
      [
        Plot.link(
          terrain_tip_dots(international_terrain_data, italy_terrain_legend, 0.01),
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
          international_terrain_data,
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
          italy_terrain_legend,
          {
            x: (d) => d[2],
            y: (d) => d[3],
            r: 5,
            fill: (d) => d[1],
          }
        ),
        Plot.text(
          italy_terrain_legend,
          {
            x: (d) => d[2],
            y: (d) => d[3],
            dy: -12,
            text: (d) => d[0],
          }
        ),
        // tip marks //
        ...terrain_tips(international_terrain_data),
      ]
    ))}

  </div>
  <div class="card grid-colspan-2 grid-rowspan-2" style="padding: 0;">
    ${
      resize((width) => defaultProjectionFrance(
        width,
        [
          Plot.dot(
            france_terrain_data,
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
            france_terrain_legend,
            {
              x: (d) => d[2],
              y: (d) => d[3],
              r: 5,
              fill: (d) => d[1],
            }
          ),
          Plot.text(
            france_terrain_legend,
            {
              x: (d) => d[2],
              y: (d) => d[3],
              dy: -12,
              text: (d) => d[0],
            }
          ),
          // tip marks //
          ...terrain_tips(france_terrain_data),
          Plot.dot(
            terrain_tip_dots(france_terrain_data, france_terrain_legend, 0.2),
            {
              x: "x",
              y: "y",
              r: 4,
              fill: (d) => project_colors.get(d.projects),
            }
          ),
        ],
      )
    )}

  </div>
  <div class="card" style="padding: 0; overflow: hidden;">
    ${
      resize((width) => defaultProjectionIleDeFrance(
        width,
        [
          Plot.dot(
            ile_de_france_terrain_data,
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
            idf_terrain_legend,
            {
              x: (d) => d[2],
              y: (d) => d[3],
              r: 5,
              fill: (d) => d[1],
            }
          ),
          Plot.text(
            idf_terrain_legend,
            {
              x: (d) => d[2],
              y: (d) => d[3],
              dy: -12,
              text: (d) => d[0],
            }
          ),
          // tip marks //
          ...terrain_tips(ile_de_france_terrain_data),
          Plot.dot(
            terrain_tip_dots(ile_de_france_terrain_data, idf_terrain_legend, 0.015),
            {
              x: "x",
              y: "y",
              r: 4,
              fill: (d) => project_colors.get(d.projects),
            }
          ),
        ],
      )
    )}

  </div>
  <div class="card" style="padding: 0;">
    ${
      resize((width) => defaultProjectionItaly(
        width,
        [
          Plot.dot(
            international_terrain_data,
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
            italy_terrain_legend,
            {
              x: (d) => d[2],
              y: (d) => d[3],
              r: 5,
              fill: (d) => d[1],
            }
          ),
          Plot.text(
            italy_terrain_legend,
            {
              x: (d) => d[2],
              y: (d) => d[3],
              dy: -12,
              text: (d) => d[0],
            }
          ),
          // tip marks //
          ...terrain_tips(international_terrain_data),
          Plot.dot(
            terrain_tip_dots(international_terrain_data, italy_terrain_legend, 0.2),
            {
              x: "x",
              y: "y",
              r: 4,
              fill: (d) => project_colors.get(d.projects),
            }
          ),
        ],
      )
    )}

  </div>
</div>

<!-- <div class="card" style="padding: 0;">
  ${
    resize((width) => defaultProjectionFrance(
      width,
      [
        
      ],
    )
  )}

</div> -->


<!-- // Plot.dot(walmarts, Plot.hexbin({r: "count", fill: "min"}, {x: "longitude", y: "latitude", fill: "date"})) -->

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
  display(Inputs.table(await sql`select * from aap_partners`));
  display("terrains");
  display(Inputs.table(await sql`select * from terrains`));
  display("projects");
  display(Inputs.table(await sql`select * from projects`));
  display("project_terrain_map");
  display(Inputs.table(await sql`select * from project_terrain_map`));
}
```
```js
if (debug) {
  display("terrain_data");
  display(Inputs.table(terrain_data));
  display("france_terrain_data");
  display(Inputs.table(france_terrain_data));
  display("ile_de_france_terrain_data");
  display(Inputs.table(ile_de_france_terrain_data));
}
```
```js
if (debug) {
  display("france_terrain_legend")
  display(france_terrain_legend)
  display("idf_terrain_legend")
  display(idf_terrain_legend)
  display("france_regions")
  display(france_regions)
  display("mainland_france_regions")
  display(mainland_france_regions)
  display("ile_de_france_region")
  display(ile_de_france_region)
  display("departements")
  display(departements)
  display("ile_de_france_departements")
  display(ile_de_france_departements)
  display("europe")
  display(europe)
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
