import {
  countEntities,
  sparkbar,
  downloadTableButton,
  downloadSVGButton,
  writeToFile,
} from '/components/utilities.js'
import {
  forceGraph,
  mapTableToPropertyGraphLinks,
  mapTableToTriples,
} from '/components/graph.js'
import {
  default_projection_style,
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
  idf_department_codes,
  france_projection,
  idf_projection,
  paris_projection,
  italy_projection,
  default_mainland_france_marks,
  mainland_france_choropleth_marks,
  idf_choropleth_marks,
  italy_choropleth_marks,
} from '/components/projection-map.js'
import { vdbi_color_scheme, project_color_scale } from '/components/color.js'
import { vectorFromArray } from 'npm:apache-arrow'

export const choropleth_terrain_data = d3.group(
  terrain_data,
  (d) =>
    (
      mainland_france_departements_geojson.features.find((department) =>
        d3.geoContains(department, [d.longitude, d.latitude]),
      ) || { properties: { nom: null } }
    ).properties.nom,
  (d) => d.project_acronyme,
)

console.debug('choropleth_terrain_data', choropleth_terrain_data)

export const choropleth_terrain_data_by_city = [
  ...d3
    .rollup(
      france_terrain_data.map((d) => ({
        projects: d.projects.toJSON(),
        code: (
          mainland_france_departements_geojson.features.find((department) =>
            d3.geoContains(department, [d.longitude, d.latitude]),
          ) || { properties: { code: null } }
        ).properties.code,
        latitude: d3.geoCentroid(
          mainland_france_departements_geojson.features.find((department) =>
            d3.geoContains(department, [d.longitude, d.latitude]),
          ) || [0, 0],
        )[1],
        longitude: d3.geoCentroid(
          mainland_france_departements_geojson.features.find((department) =>
            d3.geoContains(department, [d.longitude, d.latitude]),
          ) || [0, 0],
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
          { projects: [] },
        ),
      (d) => d.code,
    )
    .values(),
]

console.debug(
  'choropleth_terrain_data_by_city',
  choropleth_terrain_data_by_city,
)

export const terrain_partners_by_code = new Map(
  d3.rollups(
    [...all_partner_data],
    (D) =>
      D.reduce(
        (a, v) => (selected_terrain_project.includes(v.projet) ? a + 1 : a),
        0,
      ),
    (d) => (d.code_postal ? String(d.code_postal).slice(0, 2) : null),
  ),
)

export const all_partners_by_code = new Map(
  d3
    .rollups(
      [...all_partner_data].concat([
        // with hardcoded project corrections
        {
          projet: 'INTEGREEN',
          code_postal: 95,
        },
        {
          projet: 'INTEGREEN',
          code_postal: 93,
        },
        {
          projet: 'URBHEALTH',
          code_postal: 95,
        },
        {
          projet: 'URBHEALTH',
          code_postal: 78,
        },
        {
          projet: 'URBHEALTH',
          code_postal: 92,
        },
        {
          projet: 'URBHEALTH',
          code_postal: 91,
        },
      ]),
      (D) =>
        D.reduce(
          (a, v) =>
            selected_partner_project == 'All' ||
            v.projet == selected_partner_project
              ? a * Number(!flatten_choropleth) + 1
              : a,
          0,
        ),
      (d) => (d.code_postal ? String(d.code_postal).slice(0, 2) : null),
    )
    .filter((d) => d[1] > 0),
)

export const all_partners_by_code_group_idf = new Map(all_partners_by_code)

let idf_count = 0
all_partners_by_code_group_idf.forEach((value, key) =>
  idf_department_codes.includes(key) ? (idf_count += value) : null,
)
idf_department_codes.forEach((code) =>
  all_partners_by_code_group_idf.has(code)
    ? all_partners_by_code_group_idf.set(code, idf_count)
    : null,
)

export const lab_disciplines_by_code = new Map(
  d3
    .rollups(
      [...labs],
      (D) =>
        D.reduce(
          (a, v) =>
            selected_partner_project == 'All' ||
            v.projet == selected_partner_project
              ? a + 1
              : a,
          0,
        ),
      (d) => d.code_postal,
    )
    .filter((d) => d[1] > 0),
)

console.debug('lab_disciplines_by_code', lab_disciplines_by_code)

// Project terrain map

// point in bbox?
export const inBBox = (
  longitude,
  latitude,
  { min_x = -180, max_x = 180, min_y = -180, max_y = 180 },
) =>
  min_x < longitude && longitude < max_x && min_y < latitude && latitude < max_y

export const terrain_data_by_city_by_scale_by_scale = [
  ...terrain_data_by_city_by_scale,
]
// ].filter((d) => selected_terrain_scale.includes(d.scale))

export const mainland_france_bbox = {
  min_x: -5.273438,
  max_x: 8.833008,
  min_y: 42.228517,
  max_y: 51.261915,
}

export const ile_de_france_bbox = {
  min_x: 1.4425891164457563,
  max_x: 3.559891742088918,
  min_y: 48.120414136323795,
  max_y: 49.24342474094858,
}

export const france_terrain_data =
  terrain_data_by_city_by_scale_by_scale.filter(
    (d) =>
      // keep projects within france
      inBBox(d.longitude, d.latitude, mainland_france_bbox) &&
      // separate out small scale ile-de-france data
      (!inBBox(d.longitude, d.latitude, ile_de_france_bbox) ||
        // d.terrain_label == "Île-de-France" ||
        d.terrain_label == 'Métropole du Grand Paris'),
  )

export const ile_de_france_terrain_data =
  terrain_data_by_city_by_scale_by_scale.filter(
    (d) =>
      d.terrain_label != 'Île-de-France' &&
      d.terrain_label != 'Métropole du Grand Paris' &&
      inBBox(d.longitude, d.latitude, ile_de_france_bbox),
  )

if (selected_terrain_scale.includes('région'))
  france_terrain_data.push({
    terrain_label: 'Île-de-France',
    projects: vectorFromArray([
      ...new Set(
        terrain_data_by_city_by_scale_by_scale
          .filter((d) => d.terrain_label == 'Île-de-France')
          .flatMap((d) => [...d.projects]),
      ),
      ...new Set(ile_de_france_terrain_data.flatMap((d) => [...d.projects])),
    ]),
    scale: 'région',
    latitude: 48.856,
    longitude: 2.342,
  })

export const international_terrain_data =
  terrain_data_by_city_by_scale_by_scale.filter(
    (d) =>
      // keep projects outside of france
      !inBBox(d.longitude, d.latitude, mainland_france_bbox),
  )

/* Legends are structured as a 2D array, each row containing a
 * - project name
 * - project color
 * - longitude for label and/or symbol
 * - latitude for label and/or symbol
 */

export const base_legend = d3.zip(
  project_color_scale.domain(),
  project_color_scale.range(),
)

export const france_terrain_legend = base_legend.map((d) => Object.create(d))

for (let index = 0; index < france_terrain_legend.length; index++) {
  // push longitude
  france_terrain_legend[index].push(
    d3.scaleLinear([0, france_terrain_legend.length], [-4, 9.5])(index),
  )
  // push latitude
  france_terrain_legend[index].push(51.5)
}

export const idf_terrains = new Set(
  ile_de_france_terrain_data.flatMap((row) => [...row.projects]),
)
export const idf_terrain_legend = base_legend
  .filter((d) => idf_terrains.has(d[0]))
  .map((d) => Object.create(d))

for (let index = 0; index < idf_terrain_legend.length; index++) {
  // push longitude
  idf_terrain_legend[index].push(
    d3.scaleLinear([0, idf_terrain_legend.length], [2.15, 2.7])(index),
  )
  // push latitude
  idf_terrain_legend[index].push(49)
}

export const international_terrains = new Set(
  international_terrain_data.flatMap((row) => [...row.projects]),
)
export const italy_terrain_legend = base_legend
  .filter((d) => international_terrains.has(d[0]))
  .map((d) => Object.create(d))

for (let index = 0; index < italy_terrain_legend.length; index++) {
  // push longitude
  italy_terrain_legend[index].push(
    d3.scaleLinear([0, italy_terrain_legend.length], [13.1, 13.1])(index),
  )
  // push latitude
  italy_terrain_legend[index].push(44.3)
}

export const terrain_anchor_map = new Map([
  // ['Saclay Cachan', 'top-right'],
  ['Lyon', 'top'],
  ['Plauzat', 'top-right'],
  // ["Marseille", "top-left"],
  ['Strasbourg', 'top-right'],
  ['Lille', 'top-right'],
  ['Montpellier Méditerranée Métropole', 'bottom'],
  // ['Aix-Marseille-Provence', 'top'],
  // ['Villeurbanne', 'top-left'],
  // ["La Trambouze", "top-left"],
  ['Thiers', 'top-right'],
  ['Toulouse Métropole', 'top'],
  // ['Saint Denis', 'top-right'],
  ['Seine-Saint-Denis', 'top'],
  ['Paris', 'top-right'],
  // ["Ivry-sur-Seine", "top-left"],
  ['Cachan', 'top-right'],
  ['Nantes', 'top'],
  ['Montpellier', 'top'],
  // ['Ris-Orangis', 'top'],
  // ['Saclay', 'top'],
  ['Arquata del Tronto', 'top-right'],
  // ["Acquasanta Terme", "top-left"],
])

export const tip_config = (datum, tip_anchor, big_labels) => ({
  x: datum.longitude,
  y: datum.latitude,
  textPadding: big_labels ? 5 : 3,
  strokeOpacity: 0,
  fillOpacity: 0.5,
  fontFamily: 'Marianne, sans-serif',
  fontSize: big_labels ? 25 : 12,
  // fontWeight: "bold",
  anchor: tip_anchor,
})

export const terrain_tips = (data, big_labels) =>
  data.map((d) => {
    let tip_anchor = 'top-left'

    if (terrain_anchor_map.has(d.terrain_label)) {
      tip_anchor = terrain_anchor_map.get(d.terrain_label)
    }

    return Plot.tip([d.terrain_label], tip_config(d, tip_anchor, big_labels))
  })

export const terrain_tip_dots_float_left = [
  // 'Lyon',
  // 'Thiers',
  // 'Plauzat',
  // 'Saclay Cachan',
  'Arquata del Tronto',
]

export const terrain_tip_dots = (data, legend, delta) =>
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
          (legend_datum) => legend_datum[0] === data.projects,
        )
        data.label_x = data.label_x ? data.label_x[2] : null
        data.label_y = legend.find(
          (legend_datum) => legend_datum[0] === data.projects,
        )
        data.label_y = data.label_y ? data.label_y[3] : null
        indexed_projects.push(data)
      }

      return indexed_projects
    })
    .filter((d) => !!d)

// generate geo projection plot functions
export const labeled_france_projection = {
  type: 'equal-earth',
  domain: d3.geoCircle().center([1.7, 47.1]).radius(4.7)(),
}

export const defaultProjection = (
  width,
  height,
  projection,
  marks,
  caption = '',
) =>
  Plot.plot({
    width: width,
    height: height,
    caption: caption.toLocaleString(),
    projection: projection,
    marks: [...marks],
  })

export const defaultProjectionFrance = (width, height, marks, caption = '') =>
  defaultProjection(
    width,
    height,
    labeled_france_projection,
    default_mainland_france_marks.concat(marks),
    caption,
  )

export const defaultProjectionParis = (width, marks, caption = '') =>
  defaultProjection(
    width,
    width,
    paris_projection,
    [
      Plot.geo(france_departements_geojson, {
        ...default_projection_style,
      }),
      Plot.frame(),
      marks,
    ],
    caption,
  )

export const defaultProjectionItaly = (width, marks, caption = '') =>
  defaultProjection(
    width,
    width,
    italy_projection,
    [
      Plot.geo(italy_regions_geojson, {
        ...default_projection_style,
      }),
      Plot.frame(),
      marks,
    ],
    caption,
  )

// generate plot marks for each visualisation method

export const isProjectSelected = (project) =>
  selected_terrain_project.includes(project)

export const map_legend_dots = (terrain_legend, big_labels) =>
  Plot.dot(terrain_legend, {
    x: (d) => d[2],
    y: (d) => d[3],
    r: big_labels ? 7 : 5,
    fill: (d) => d[1],
    fillOpacity: (d) => (isProjectSelected(d[0]) ? 1 : 0.2),
  })

export const map_legend_text = (terrain_legend, big_labels) =>
  Plot.text(terrain_legend, {
    x: (d) => d[2],
    y: (d) => d[3],
    dx: big_labels ? -5 : 0,
    dy: big_labels ? -25 : -15,
    fontFamily: 'Marianne, sans-serif',
    fontWeight: 'bold',
    fontSize: big_labels ? 25 : 12,
    rotate: big_labels ? -15 : 0,
    text: (d) => d[0],
    opacity: (d) => (isProjectSelected(d[0]) ? 1 : 0.2),
  })

function generateLineMapMarks(terrain_data, terrain_legend, big_labels) {
  const strokeWidth = big_labels ? 2 : 1

  const links = Plot.link(terrain_tip_dots(terrain_data, terrain_legend, 0.2), {
    x1: 'label_x',
    y1: 'label_y',
    x2: 'longitude',
    y2: 'latitude',
    stroke: (d) => project_color_scale(d.projects),
    strokeWidth: (d) => (isProjectSelected(d.projects) ? strokeWidth : 0.5),
    strokeOpacity: (d) => (isProjectSelected(d.projects) ? strokeWidth : 0.5),
    curve: 'bump-y',
  })

  const terrain_dots = Plot.dot(terrain_data, {
    x: 'longitude',
    y: 'latitude',
    r: big_labels ? 4 : 3,
    fill: 'black',
    //stroke: vdbi_color_scheme.orange,
    //fillOpacity: 0.5,
    channels: {
      entity: {
        value: 'terrain_label',
        label: 'City',
      },
      count: {
        value: (d) => 1,
        label: 'Occurences',
      },
      longitude: {
        value: 'longitude',
        label: 'Lon',
      },
      latitude: {
        value: 'latitude',
        label: 'Lat',
      },
      projects: {
        value: 'projects',
        label: 'Projects',
      },
      scales: {
        value: 'scale',
        label: 'Scales',
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
    map_legend_dots(terrain_legend, big_labels),
    map_legend_text(terrain_legend, big_labels),
    // legend_axis_label,
    // tip marks //
    // ...terrain_tips(terrain_data),
  ]
}

function generateDotMapMarks(
  terrain_data,
  terrain_legend,
  tip_dot_delta,
  big_labels,
) {
  const terrain_dots = Plot.dot(terrain_data, {
    x: 'longitude',
    y: 'latitude',
    r: big_labels ? 5 : 3,
    fill: vdbi_color_scheme.blue,
    fillOpacity: 0.5,
    channels: {
      entity: {
        value: 'terrain',
        label: 'City',
      },
      count: {
        value: (d) => 1,
        label: 'Occurences',
      },
      longitude: {
        value: 'longitude',
        label: 'Lon',
      },
      latitude: {
        value: 'latitude',
        label: 'Lat',
      },
      projects: {
        value: 'projects',
        label: 'Projects',
      },
      scales: {
        value: 'scale',
        label: 'Scales',
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
      tip_dot_delta * (big_labels ? 1.2 : 1),
    ),
    {
      x: 'x',
      y: 'y',
      r: big_labels ? 5 : 4,
      fill: (d) => project_color_scale(d.projects),
      fillOpacity: (d) => (isProjectSelected(d.projects) ? 1 : 0.2),
    },
  )

  const legend_axis_label = Plot.text(['Financed Projects'], {
    x: d3.mean(terrain_legend.map((d) => d[2])),
    y: terrain_legend.length > 0 ? terrain_legend[0][3] : 0,
    dy: -45,
  })

  return [
    terrain_dots,
    // legend marks //
    map_legend_dots(terrain_legend, big_labels),
    map_legend_text(terrain_legend, big_labels),
    // legend_axis_label,
    // tip marks //
    ...terrain_tips(terrain_data),
    tip_dots,
  ]
}

// choropleth configs and functions

export const color_config = {
  scheme: 'Blues',
  label: `N° de partenaires et parties prenantes estimé`,
  // label: "N° of Partners",
  // domain: [0, 6],
  legend: true,
  marginLeft: 10,
  marginRight: 10,
  // type: "log",
  zero: true,
  nice: true,
  // ticks: 2,
}

if (flatten_choropleth) color_config.domain = [0, 2.7]

export const choropleth = (
  width,
  height,
  fill,
  projection,
  features,
  caption,
) =>
  Plot.plot({
    width: width,
    height: height - 60,
    caption: caption,
    // "- Project partners by department and Île-de-France, France",
    color: color_config,
    projection: projection,
    marks: [
      // Plot.geo(projection.domain, { stroke: "red", strokeWidth: 2 }),
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

console.debug(
  'mainland_france_regions_geojson',
  mainland_france_regions_geojson,
)

export const choroplethFrance = (width, height, fill) =>
  choropleth(
    width,
    height,
    fill,
    france_projection,
    mainland_france_departements_geojson,
    '- Partenaires et parties prenantes des projets par département, France',
  )

export const choroplethIdf = (width, fill) =>
  choropleth(
    width,
    width,
    fill,
    idf_projection,
    idf_departements_geojson,
    '- Partenaires et parties prenantes des projets par département, Île-de-France',
  )

export const choroplethItaly = (width, fill) =>
  choropleth(
    width,
    width,
    fill,
    italy_projection,
    italy_regions_geojson,
    '- Partenaires et parties prenantes des projets par département, Italy',
  )

console.debug('italy_regions_geojson', italy_regions_geojson)

export const download_lab_choropleth_france = downloadSVGButton(
  '#lab-choropleth-container-france svg',
  'Download French choropleth lab partner map',
  `${selected_partner_project}_france_lab_partner_choropleth.svg`,
)

export const download_lab_choropleth_idf = downloadSVGButton(
  '#lab-choropleth-container-idf svg',
  'Download Île-de-France choropleth lab partner map',
  `${selected_partner_project}_idf_lab_partner_choropleth.svg`,
)
