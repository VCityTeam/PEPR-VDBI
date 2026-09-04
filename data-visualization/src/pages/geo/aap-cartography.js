import * as d3 from 'npm:d3'
import * as Plot from 'npm:@observablehq/plot'
import {
  default_projection_style,
  // france_geojson,
  france_regions_geojson,
  mainland_france_regions_geojson,
  // idf_region_geojson,
  france_departements_geojson,
  mainland_france_departements_geojson,
  // mainland_france_departements_no_idf_geojson,
  idf_departements_geojson,
  italy_regions_geojson,
  land_geojson,
  idf_department_codes,
  france_projection,
  idf_projection,
  paris_projection,
  italy_projection,
  default_mainland_france_marks,
  mainland_france_choropleth_marks,
  // idf_choropleth_marks,
  // italy_choropleth_marks,
} from '../../components/projection-map.js'
import {
  vdbi_color_scheme,
  project_color_scale,
} from '../../components/color.js'

// Project terrain map

/**
 * Check whether a longitude/latitude point falls within a bounding box
 *
 * @param {number} longitude - the point's longitude
 * @param {number} latitude - the point's latitude
 * @param {Object} bbox - the bounding box
 * @param {number} [bbox.min_x=-180] - minimum longitude
 * @param {number} [bbox.max_x=180] - maximum longitude
 * @param {number} [bbox.min_y=-180] - minimum latitude
 * @param {number} [bbox.max_y=180] - maximum latitude
 * @returns {boolean} true if the point is within the bounding box
 */
export const inBBox = (
  longitude,
  latitude,
  { min_x = -180, max_x = 180, min_y = -180, max_y = 180 },
) =>
  min_x < longitude && longitude < max_x && min_y < latitude && latitude < max_y

export const europe_bbox = {
  min_x: -10,
  max_x: 30,
  min_y: 30,
  max_y: 70,
}

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

export const filterFranceTerrains = (terrain_data) => {
  const france_terrains_by_idf = [...terrain_data].filter((d) =>
    inBBox(d.longitude, d.latitude, mainland_france_bbox),
  )

  const idf_terrain = terrain_data.find((d) => d.terrain_id == 89)

  // this is pretty hacky but it works for now
  france_terrains_by_idf.forEach((d) => {
    // if ile-de-france terrain
    if (!inBBox(d.longitude, d.latitude, ile_de_france_bbox)) return

    // replace everything with idf terrain data but keep the project name
    const project = d.project

    // Source - https://stackoverflow.com/a/28570479
    // Posted by Dave Lugg
    // Retrieved 2026-09-04, License - CC BY-SA 3.0

    for (var key in d) {
      d[key] = idf_terrain[key]
    }

    d.project = project
  })

  return france_terrains_by_idf
}

export const filterIdfTerrains = (terrain_data_by_city) =>
  [...terrain_data_by_city].filter(
    (d) =>
      d.terrain != 'Île-de-France' &&
      d.terrain != 'Métropole du Grand Paris' &&
      inBBox(d.longitude, d.latitude, ile_de_france_bbox),
  )

export const filterInternationalTerrains = (terrain_data_by_city) =>
  terrain_data_by_city.filter(
    (d) =>
      // keep projects outside of france
      !inBBox(d.longitude, d.latitude, mainland_france_bbox),
  )

export const filterExtraEuropeanTerrains = (terrain_data_by_city) =>
  terrain_data_by_city.filter(
    (d) =>
      // keep projects outside of france
      !inBBox(d.longitude, d.latitude, europe_bbox),
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

export const france_terrain_legend = () => {
  const legend = base_legend.map((d) => Object.create(d))

  for (let index = 0; index < legend.length; index++) {
    // push longitude
    legend[index].push(d3.scaleLinear([0, legend.length], [-4, 9.5])(index))
    // push latitude
    legend[index].push(51.5)
  }

  return legend
}

export const idf_terrain_legend = (filterIdfTerrains) => {
  const idf_terrains = new Set(
    filterIdfTerrains.flatMap((row) => [...row.projects]),
  )

  const legend = base_legend
    .filter((d) => idf_terrains.has(d[0]))
    .map((d) => Object.create(d))
  // .map((d) => structuredClone(d))

  for (let index = 0; index < legend.length; index++) {
    // push longitude
    legend[index].push(d3.scaleLinear([0, legend.length], [2.15, 2.7])(index))
    // push latitude
    legend[index].push(49)
  }

  return legend
}

export const italy_terrain_legend = (filterInternationalTerrains) => {
  const international_terrains = new Set(
    filterInternationalTerrains.flatMap((row) => [...row.projects]),
  )

  const legend = base_legend
    .filter((d) => international_terrains.has(d[0]))
    .map((d) => Object.create(d))

  for (let index = 0; index < legend.length; index++) {
    // push longitude
    legend[index].push(d3.scaleLinear([0, legend.length], [13.1, 13.1])(index))
    // push latitude
    legend[index].push(44.3)
  }

  return legend
}

export const world_terrain_legend = (filterInternationalTerrains) => {
  const international_terrains = new Set(
    filterInternationalTerrains.flatMap((row) => [...row.projects]),
  )

  const legend = base_legend
    .filter((d) => international_terrains.has(d[0]))
    .map((d) => Object.create(d))

  for (let index = 0; index < legend.length; index++) {
    // push longitude
    legend[index].push(d3.scaleLinear([0, legend.length], [13.1, 13.1])(index))
    // push latitude
    legend[index].push(44.3)
  }

  return legend
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

/**
 * Build a Plot.tip configuration object for a terrain label
 *
 * @param {Object} datum - a terrain datum with `longitude`/`latitude`
 * @param {string} tip_anchor - the tip anchor position (e.g. 'top-left')
 * @param {boolean} big_labels - whether to use larger label styling
 * @returns {Object} a Plot.tip options object
 */
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

/**
 * Generate Plot.tip marks for terrain data points, anchoring each tip
 * according to terrain_anchor_map (falling back to 'top-left')
 *
 * @param {Object[]} data - terrain data points, each with a `terrain`
 * @param {boolean} big_labels - whether to use larger label styling
 * @returns {Object[]} an array of Plot.tip marks
 */
export const terrain_tips = (data, big_labels) =>
  Plot.tip(
    data.map((d) => d.terrain),
    {
      x: 'longitude',
      y: 'latitude',
      textPadding: big_labels ? 5 : 3,
      strokeOpacity: 0,
      fillOpacity: 0.5,
      fontFamily: 'Marianne, sans-serif',
      fontSize: big_labels ? 25 : 12,
      // fontWeight: "bold",
      anchor: 'top-left',
      // anchor: (d) => terrain_anchor_map.has(d)
      //   ? terrain_anchor_map.get(d)
      //   : 'top-left',
    },
  )

export const terrain_tip_dots_float_left = [
  // 'Lyon',
  // 'Thiers',
  // 'Plauzat',
  // 'Saclay Cachan',
  'Arquata del Tronto',
]

/**
 * Compute offset dot positions and label coordinates for each project at a
 * terrain location, spreading overlapping project markers apart by delta
 *
 * @param {Object[]} data - terrain data points, each with `projects`, `longitude`, `latitude`, `terrain`
 * @param {Array} legend - the legend rows (`[project, color, label_x, label_y]`) to look up label positions from
 * @param {number} delta - horizontal offset applied between stacked project markers
 * @returns {Object[]} an array of per-project datum objects with `x`, `y`, `label_x`, `label_y`, `project_index`
 */
export const terrain_tip_dots = (data, legend, delta) =>
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

/**
 * Wrap Plot.plot with a given geo projection and marks
 *
 * @param {number} width - chart width
 * @param {number} height - chart height
 * @param {Object} projection - a d3/Plot geo projection specification
 * @param {Array} marks - the Plot marks to render
 * @param {string} [caption=''] - the chart caption
 * @returns {SVGElement} the rendered map
 */
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

/**
 * Convenience wrapper for France-projected maps, including the default
 * mainland France marks
 *
 * @param {number} width - chart width
 * @param {number} height - chart height
 * @param {Array} marks - additional Plot marks to layer on top
 * @param {string} [caption=''] - the chart caption
 * @returns {SVGElement} the rendered map
 */
export const franceProjection = (width, height, marks, caption = '') =>
  defaultProjection(
    width,
    height,
    labeled_france_projection,
    default_mainland_france_marks.concat(marks),
    caption,
  )

/**
 * Convenience wrapper for Ile-de-France-projected maps, including a France
 * departments base layer
 *
 * @param {number} width - chart width (used for both width and height)
 * @param {Array} marks - additional Plot marks to layer on top
 * @param {string} [caption=''] - the chart caption
 * @returns {SVGElement} the rendered map
 */
export const idfProjection = (width, marks, caption = '') =>
  defaultProjection(
    width,
    width,
    idf_projection,
    [
      Plot.geo(france_departements_geojson, {
        ...default_projection_style,
      }),
      Plot.frame(),
      marks,
    ],
    caption,
  )

/**
 * Convenience wrapper for Paris-projected maps, including a France
 * departments base layer
 *
 * @param {number} width - chart width (used for both width and height)
 * @param {Array} marks - additional Plot marks to layer on top
 * @param {string} [caption=''] - the chart caption
 * @returns {SVGElement} the rendered map
 */
export const parisProjection = (width, marks, caption = '') =>
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

/**
 * Convenience wrapper for Italy-projected maps, including an Italian
 * regions base layer
 *
 * @param {number} width - chart width (used for both width and height)
 * @param {Array} marks - additional Plot marks to layer on top
 * @param {string} [caption=''] - the chart caption
 * @returns {SVGElement} the rendered map
 */
export const italyProjection = (width, marks, caption = '') =>
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

/**
 * Convenience wrapper for world-projected maps, including an global
 * landmass base layer
 *
 * @param {number} width - chart width (used for both width and height)
 * @param {Array} marks - additional Plot marks to layer on top
 * @param {string} [caption=''] - the chart caption
 * @returns {SVGElement} the rendered map
 */
export const worldProjection = (width, height, marks, caption = '') =>
  defaultProjection(
    width,
    height,
    'equirectangular',
    [
      Plot.geo(land_geojson, {
        ...default_projection_style,
      }),
      Plot.frame(),
      marks,
    ],
    caption,
  )

// generate plot marks for each visualisation method

/**
 * Build Plot.dot legend markers for the terrain legend, dimming unselected
 * projects
 *
 * @param {Array} terrain_legend - legend rows (`[project, color, x, y]`)
 * @param {boolean} big_labels - whether to use larger marker styling
 * @param {string[]} selected_projects - the user selected projects
 * @returns {Object} a Plot.dot mark
 */
export const map_legend_dots = (
  terrain_legend,
  big_labels,
  selected_projects,
) =>
  Plot.dot(terrain_legend, {
    x: (d) => d[2],
    y: (d) => d[3],
    r: big_labels ? 7 : 5,
    fill: (d) => d[1],
    fillOpacity: (d) => (selected_projects.includes(d[0]) ? 1 : 0.2),
  })

/**
 * Build Plot.text legend labels for the terrain legend, dimming unselected
 * projects
 *
 * @param {Array} terrain_legend - legend rows (`[project, color, x, y]`)
 * @param {boolean} big_labels - whether to use larger label styling
 * @param {string[]} selected_projects - the user selected projects
 * @returns {Object} a Plot.text mark
 */
export const map_legend_text = (
  terrain_legend,
  big_labels,
  selected_projects,
) =>
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
    opacity: (d) => (selected_projects.includes(d[0]) ? 1 : 0.2),
  })

/**
 * Build marks for the "polygon" style terrain map
 * (project markers connected to legend entries by curved links)
 *
 * @param {Object[]} terrain_data - terrain data points
 * @param {Object[]} terrain_features - terrain geojson feature collection
 * @returns {Array} an array of Plot marks
 */
export function generateGeojsonMarks(terrain_data, terrain_features) {
  console.debug('terrain_features', terrain_features)

  const filtered_terrain_features = {
    type: 'FeatureCollection',
    features: terrain_features.features.filter((feature) =>
      terrain_data.some((d) => d.terrain_id == feature.properties.id),
    ),
  }

  console.debug('filtered terrain_features', filtered_terrain_features)

  const project_terrain_top_tips = Plot.tip(terrain_data, {
    title: (d) => d.terrain,
    // `${d.properties.label}\n${d.properties.projects.map((p) => p.label)}`,
    x: 'longitude',
    y: 'latitude',
    anchor: 'left',
    textPadding: 3,
  })

  const project_terrain_mark = Plot.geo(filtered_terrain_features, {
    stroke: 'blue',
    strokeWidth: 1,
    fillOpacity: 0.5,
  })

  return [
    project_terrain_mark,
    // legend marks //
    // map_legend_dots(terrain_legend, big_labels),
    // map_legend_text(terrain_legend, big_labels),
    // legend_axis_label,
    // tip marks //
    project_terrain_top_tips,
    // project_terrain_top_tips,
    // ...terrain_tips(terrain_data),
  ]
}

/**
 * Build marks for a simple terrain map with tips.
 *
 * @param {Object[]} terrain_data - terrain data points
 * @param {string} default_anchor - default anchor position
 * @param {Map} anchor_map - optional map of terrain to anchor position
 * @returns {Array} an array of Plot marks
 */
export function generateSimpleGeoTipMarks(
  terrain_data,
  anchor_map,
  default_anchor = 'left',
) {
  const grouped_terrains = d3.rollup(
    terrain_data,
    (v) => ({
      terrain: v[0].terrain,
      projects: v.map((d) => d.project),
      label: v.find((d) => !!d.label)?.label,
      longitude: v.find((d) => !!d.longitude)?.longitude,
      latitude: v.find((d) => !!d.latitude)?.latitude,
    }),
    (d) => d.terrain,
  )

  const default_config = {
    title: (d) => `${d.label}\n${d.projects.join(', ')}`,
    x: 'longitude',
    y: 'latitude',
    anchor: 'left',
    textPadding: 3,
  }

  const marks = []

  // if an anchor map is provided generate the corresponding marks
  if (!!anchor_map) {
    for (const anchor of anchor_map.values()) {
      marks.push(
        Plot.tip(
          grouped_terrains
            .values()
            .filter((d) => anchor_map.get(d.terrain) == anchor),
          // terrain_data.filter((d) => anchor_map.get(d.terrain) == anchor),
          {
            ...default_config,
            anchor: anchor,
          },
        ),
      )
    }
  }

  // add the default marks
  marks.push(
    Plot.tip(
      grouped_terrains
        .values()
        .filter((d) => !anchor_map || !anchor_map.has(d.terrain)),
      // terrain_data.filter((d) => !anchor_map || !anchor_map.has(d.terrain)),
      {
        ...default_config,
        anchor: default_anchor,
      },
    ),
  )

  return marks
}

/**
 * Build link, dot, and legend marks for the "line" style terrain map
 * (project markers connected to legend entries by curved links)
 *
 * @param {Object[]} terrain_data - terrain data points
 * @param {Array} terrain_legend - legend rows (`[project, color, x, y]`)
 * @param {boolean} big_labels - whether to use larger marker/line styling
 * @param {string[]} selected_projects - the user selected projects
 * @returns {Array} an array of Plot marks
 */
export function generateLineMapMarks(
  terrain_data,
  terrain_legend,
  big_labels,
  selected_projects,
) {
  const strokeWidth = big_labels ? 2 : 1

  const links = Plot.link(terrain_tip_dots(terrain_data, terrain_legend, 0.2), {
    x1: 'label_x',
    y1: 'label_y',
    x2: 'longitude',
    y2: 'latitude',
    stroke: (d) => project_color_scale(d.projects),
    strokeWidth: (d) =>
      selected_projects.includes(d.projects) ? strokeWidth : 0.5,
    strokeOpacity: (d) =>
      selected_projects.includes(d.projects) ? strokeWidth : 0.5,
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

  return [
    links,
    terrain_dots,
    // legend marks //
    map_legend_dots(terrain_legend, big_labels),
    map_legend_text(terrain_legend, big_labels),
  ]
}

/**
 * Build dot, tip, and legend marks for the "dot" style terrain map
 * (terrain location dots plus offset per-project tip dots)
 *
 * @param {Object[]} terrain_data - terrain data points
 * @param {Array} terrain_legend - legend rows (`[project, color, x, y]`)
 * @param {number} tip_dot_delta - horizontal offset between stacked per-project tip dots
 * @param {boolean} big_labels - whether to use larger marker styling
 * @param {string[]} selected_projects - the user selected projects
 * @returns {Array} an array of Plot marks
 */
export function generateDotMapMarks(
  terrain_data,
  terrain_legend,
  tip_dot_delta,
  big_labels,
  selected_projects,
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
      fillOpacity: (d) => (selected_projects.includes(d.projects) ? 1 : 0.2),
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

export const color_config = (flatten_choropleth = false) => ({
  scheme: 'Blues',
  label: `N° de partenaires et parties prenantes estimé`,
  // label: "N° of Partners",
  domain: flatten_choropleth ? [0, 2.7] : undefined,
  legend: true,
  marginLeft: 10,
  marginRight: 10,
  // type: "log",
  zero: true,
  nice: true,
  // ticks: 2,
})

/**
 * Build a choropleth Plot.plot for given geojson features and a fill
 * accessor
 *
 * @param {number} width - chart width
 * @param {number} height - chart height
 * @param {Function|string} fill - accessor or field name for the fill/color channel
 * @param {Object} projection - a d3/Plot geo projection specification
 * @param {Object} features - a GeoJSON FeatureCollection to render
 * @param {string} caption - color legend label/caption
 * @returns {SVGElement} the rendered choropleth map
 */
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

/**
 * Choropleth wrapper specialized for mainland France departments
 *
 * @param {number} width - chart width
 * @param {number} height - chart height
 * @param {Function|string} fill - accessor or field name for the fill/color channel
 * @returns {SVGElement} the rendered choropleth map
 */
export const choroplethFrance = (width, height, fill) =>
  choropleth(
    width,
    height,
    fill,
    france_projection,
    mainland_france_departements_geojson,
    '- Partenaires et parties prenantes des projets par département, France',
  )

/**
 * Choropleth wrapper specialized for Île-de-France departments
 *
 * @param {number} width - chart width (used for both width and height)
 * @param {Function|string} fill - accessor or field name for the fill/color channel
 * @returns {SVGElement} the rendered choropleth map
 */
export const choroplethIdf = (width, fill) =>
  choropleth(
    width,
    width,
    fill,
    idf_projection,
    idf_departements_geojson,
    '- Partenaires et parties prenantes des projets par département, Île-de-France',
  )

/**
 * Choropleth wrapper specialized for Italy regions
 *
 * @param {number} width - chart width (used for both width and height)
 * @param {Function|string} fill - accessor or field name for the fill/color channel
 * @returns {SVGElement} the rendered choropleth map
 */
export const choroplethItaly = (width, fill) =>
  choropleth(
    width,
    width,
    fill,
    italy_projection,
    italy_regions_geojson,
    '- Partenaires et parties prenantes des projets par département, Italy',
  )

export const choropleth_terrain_data = (terrain_data) =>
  d3.group(
    terrain_data,
    (d) =>
      (
        mainland_france_departements_geojson.features.find((department) =>
          d3.geoContains(department, [d.longitude, d.latitude]),
        ) || { properties: { nom: null } }
      ).properties.nom,
    (d) => d.project_acronyme,
  )

export const choropleth_terrain_data_by_city = (terrains) => [
  ...d3
    .rollup(
      terrains.map((d) => ({
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

export const terrain_partners_by_code = (
  all_partner_data,
  selected_terrain_project,
) =>
  new Map(
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

export const all_partners_by_code = (
  all_partner_data,
  selected_partner_project,
  flatten_choropleth,
) =>
  new Map(
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

export const all_partners_by_code_group_idf = (all_partners_by_code) => {
  const all_partners_by_code_group_idf = new Map(all_partners_by_code)

  let idf_count = 0

  all_partners_by_code_group_idf.forEach((value, key) =>
    idf_department_codes.includes(key) ? (idf_count += value) : null,
  )

  idf_department_codes.forEach((code) =>
    all_partners_by_code_group_idf.has(code)
      ? all_partners_by_code_group_idf.set(code, idf_count)
      : null,
  )

  return all_partners_by_code_group_idf
}

export const lab_disciplines_by_code = (labs, selected_partner_project) =>
  new Map(
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
