import * as d3 from 'd3'
import { geo, graticule, sphere, dot, hexbin, plot } from '@observablehq/plot'
import { FileAttachment } from 'observablehq:stdlib'
import { feature } from 'npm:topojson-client'

// geospatial address data

export const corse_department_codes = ['2A', '2B']

export const idf_department_codes = [
  '95',
  '94',
  '93',
  '92',
  '91',
  '78',
  '77',
  '75',
]

// geojson maps

export const europe_geojson = await FileAttachment(
  '/data/europe.geo.json',
).json()

export const france_geojson = europe_geojson.features.find(
  ({ properties }) => (properties.name = 'France'),
)

export const france_regions_geojson = await FileAttachment(
  '/data/france_regions.json',
).json()

export const mainland_france_regions_geojson = {
  type: 'FeatureCollection',
  features: france_regions_geojson.features.filter(
    ({ properties }) => properties.code > 10 && properties.nom != 'Corse',
  ),
}

export const france_departements_geojson = await FileAttachment(
  '/data/france_departements.json',
).json()

export const mainland_france_departements_geojson = {
  type: 'FeatureCollection',
  features: france_departements_geojson.features.filter(
    ({ properties }) => !corse_department_codes.includes(properties.code),
  ),
}

const mainland_france_departements_by_idf = d3.group(
  mainland_france_departements_geojson.features,
  ({ properties }) => idf_department_codes.includes(properties.code),
)

export const mainland_france_departements_no_idf_geojson = {
  type: 'FeatureCollection',
  features: mainland_france_departements_by_idf.get(false),
}

export const idf_departements_geojson = {
  type: 'FeatureCollection',
  features: mainland_france_departements_by_idf.get(true),
}

export const italy_regions_geojson = await FileAttachment(
  '/data/italy_regions.json',
).json()

export const world_geojson = await FileAttachment(
  '/data/countries-110m.json',
).json()

export const land_geojson = feature(world_geojson, world_geojson.objects.land)

// export const france_geonames = await FileAttachment('https://download.geonames.org/export/dump/FR.zip').zip()

// default map options

export const france_projection = {
  type: 'equal-earth',
  domain: d3
    .geoCircle()
    .center([
      d3.geoCentroid(mainland_france_regions_geojson)[0] - 0.8,
      d3.geoCentroid(mainland_france_regions_geojson)[1] + 0.1,
    ])
    .radius(4.45)(),
}

export const paris_projection = {
  type: 'equal-earth',
  domain: d3.geoCircle().center([2.35, 48.85]).radius(0.2)(),
  // domain: d3
  //   .geoCircle()
  //   .center(
  //     d3.geoCentroid(
  //       france_departements_geojson.features.find(
  //         ({ properties }) => properties.code === "75"
  //       )
  //     )
  //   )
  //   .radius(0.2)(),
}

export const idf_projection = {
  type: 'equal-earth',
  domain: d3
    .geoCircle()
    .center(
      d3.geoCentroid(
        france_regions_geojson.features.find((d) => d.properties.code === '11'),
      ),
    )
    .radius(0.8)(),
}

export const italy_projection = {
  type: 'equal-earth',
  domain: d3.geoCircle().center([13, 43.5]).radius(2)(),
  // domain: d3
  //   .geoCircle()
  //   .center(d3.geoCentroid(italy_regions_geojson))
  //   .radius(2)(),
}

// default map marks

export const default_projection_style = {
  stroke: 'white',
  fill: 'var(--theme-foreground-focus)',
  strokeWidth: 1.5,
  strokeOpacity: 0.7,
  fillOpacity: 0.4,
}

export const default_mainland_france_marks = [
  geo(mainland_france_departements_geojson, {
    ...default_projection_style,
    strokeWidth: 0.5,
  }),
  geo(mainland_france_regions_geojson, {
    ...default_projection_style,
    fill: undefined,
    fillOpacity: undefined,
  }),
]

export const mainland_france_choropleth_marks = [
  geo(mainland_france_departements_geojson, {
    stroke: 'var(--theme-foreground-focus)',
    strokeWidth: 0.1,
  }),
  geo(mainland_france_regions_geojson, {
    stroke: 'var(--theme-foreground-focus)',
  }),
]

export const idf_choropleth_marks = [
  geo(idf_departements_geojson, {
    stroke: 'var(--theme-foreground-focus)',
    // strokeWidth: 0.1,
  }),
]

export const italy_choropleth_marks = [
  geo(italy_regions_geojson, {
    stroke: 'var(--theme-foreground-focus)',
    // strokeWidth: 0.1,
  }),
]

/**
 * Create projection map from a dataset geocoded by:
 * https://adresse.data.gouv.fr/csv
 * and a geojson file of world borders
 *
 * @param {object} data - input dataset, by default expects a grouped d3 array. See:
 * - https://d3js.org/d3-array/group#groups
 * - https://d3js.org/d3-array/group#rollups
 * @param {Object} [options={}] - map configuration
 * @param {number} [options.width=800] - chart width
 * @param {number} [options.height=800] - chart height; depending on the
 *   projection this may not be the final size
 * @param {Function} [options.keyMap] - accessor for a datum's entity label
 * @param {Function} [options.valueMap] - accessor for a datum's count, used as the dot radius
 * @param {Function} [options.lonMap] - accessor for a datum's longitude
 * @param {Function} [options.latMap] - accessor for a datum's latitude
 * @param {Array} [options.borderList=[]] - geo-compatible border features to draw beneath the data
 * @param {string[]} [options.borderListStrokes] - one stroke color per entry in `borderList`
 * @param {number[]} [options.borderListStrokeOpacity] - one stroke opacity per entry in `borderList`
 * @param {string} [options.projectionType='equal-earth'] - Plot projection name
 * @param {Object} [options.projectionDomain] - GeoJSON object the projection is fitted to; defaults to a circle over France
 * @param {string} [options.stroke='#f43f5e'] - dot stroke color
 * @param {string} [options.fill='#f43f5e'] - dot fill color
 * @param {number} [options.fillOpacity=0.5] - dot fill opacity
 * @param {string} [options.entity_label='City'] - tip label for the entity channel
 * @param {Object} [options.channels] - Plot channel definitions for the dot mark's tip
 * @param {Object} [options.tip] - Plot tip options
 * @param {Array} [options.marks] - marks to render; replaces the default graticule/sphere/dot marks
 * @returns {d3.node} - SVG node containing the map
 */
export function projectionMap(
  data,
  {
    width = 800,
    height = 800, // depending on the projection, this may not be the final size
    keyMap = (d) => d[0],
    valueMap = (d) => d[1].length,
    lonMap = (d) => d[1][0].longitude,
    latMap = (d) => d[1][0].latitude,
    /*
     * list of geo compatible borders. For example:
     * const world = FileAttachment("/data/countries-110m.json").json();
     * const borders = [
     *   topojson.feature(world, world.objects.land),
     *   topojson.mesh(world, world.objects.countries, (a, b) => a !== b)
     * ];
     */
    borderList = [], // list of borders to draw
    borderListStrokes = borderList.map(() => 'var(--theme-foreground-faint)'), // list of border colors; use 'var(--theme-foreground-faint)' for default
    borderListStrokeOpacity = borderList.map(() => 1),
    projectionType = 'equal-earth',
    projectionDomain = d3.geoCircle().center([2, 47]).radius(5)(), // centered on France
    stroke = '#f43f5e',
    fill = '#f43f5e',
    fillOpacity = 0.5,
    entity_label = 'City',
    channels = {
      entity: {
        value: keyMap,
        label: entity_label,
      },
      count: {
        value: valueMap,
        label: 'Occurences',
      },
      longitude: {
        value: lonMap,
        label: 'Lon',
      },
      latitude: {
        value: latMap,
        label: 'Lat',
      },
    },
    tip = {
      format: {
        entity: true,
        longitude: false,
        latitude: false,
        count: true,
        x: false,
        y: false,
        r: false,
      },
    },
    marks = [
      // default marks
      graticule(),
      sphere(),
      dot(data, {
        x: lonMap,
        y: latMap,
        r: valueMap,
        stroke: stroke,
        fill: fill,
        fillOpacity: fillOpacity,
        channels: channels,
        tip: tip,
      }),
    ],
    // color = (d) =>
    //   d3.interpolatePlasma(
    //     d3
    //       .scaleLinear()
    //       .domain([
    //         Math.min(...data.map((d) => valueMap(d))),
    //         Math.max(...data.map((d) => valueMap(d))),
    //       ])(d)
    //   ),
  } = {},
) {
  // add borders
  const bordersToDraw = d3.zip(
    borderList,
    borderListStrokes,
    borderListStrokeOpacity,
  )
  bordersToDraw.forEach((borderAndStroke) => {
    marks.push(
      geo(borderAndStroke[0], {
        stroke: borderAndStroke[1],
        strokeOpacity: borderAndStroke[2],
      }),
    )
  })
  console.debug('bordersToDraw', bordersToDraw)

  return plot({
    width: width,
    height: height,
    projection: {
      type: projectionType,
      domain: projectionDomain,
    },
    marks: marks,
    ...options,
  })
}

// Future hexbin map implementation?

// const test_plot_hexbin = (width, height) =>
//   defaultProjectionFrance(
//     width,
//     height,
//     [
//       dot(
//         [...all_partner_data],
//         hexbin(
//           {
//             r: "count",
//             fill: "count",
//             // opacity: "count",
//           },
//           {
//             x: "longitude",
//             y: "latitude",
//             // stroke: 'var(--theme-foreground-focus)',
//             fill: 'var(--theme-foreground-focus)',
//             // binWidth: 15,
//           }
//         )
//       ),
//       ...terrain_tips(filterFranceTerrains),
//     ],
//     "- Project partners, France"

//   )

/**
 * Default Observable Plot color-scale config (Blues scheme, legend, margins)
 * for choropleth maps
 *
 * @param {Object} [config] - color scale overrides merged over the defaults;
 *   defaults to `{label: 'N° de partenaires et parties prenantes'}`
 * @param {boolean} [flatten_choropleth=false] - clamp the color domain to
 *   `[1, 10]` so that a few high-count departments stop flattening the rest of
 *   the scale; otherwise the domain is inferred from the data
 * @returns {Object} an object wrapping a Plot `color` scale configuration
 */
export const choropleth_color_config = (
  config = {
    label: `N° de partenaires et parties prenantes`,
    // label: "N° of Partners",
  },
  flatten_choropleth = false,
) => ({
  color: '#3558a2',
  domain: flatten_choropleth ? [1, 10] : undefined,
  range: [0.1, 1],
  legend: true,
  marginLeft: 10,
  marginRight: 10,
  // type: "log",
  // zero: true,
  nice: true,
  // ticks: 2,
  ...config,
})

/**
 * Build a choropleth Plot.plot for given geojson features and a fill
 * accessor
 *
 * @param {Function|string} opacity - accessor or field name for the fill opacity
 *   channel, which carries the mapped value
 * @param {Object} features - a GeoJSON FeatureCollection to render
 * @param {Array} [marks=[]] - additional marks drawn over the geo mark
 * @param {Object} [options={}] - Plot.plot options merged over the defaults
 *   (`width`, `height`, `caption`, and e.g. `projection`)
 * @returns {SVGElement} the rendered choropleth map
 */
export const choropleth = (opacity, features, marks = [], options = {}) =>
  plot({
    width: 600,
    height: 500,
    caption: '- Project partners by department and Île-de-France, France',
    ...options,
    marks: [
      geo(features, {
        channels: {
          Department: ({ properties }) => properties.nom,
          Code: ({ properties }) => properties.code,
          Lat: (d) => d3.geoCentroid(d)[0],
          Lon: (d) => d3.geoCentroid(d)[1],
          Value: opacity,
        },
        tip: true,
        fill: 'var(--theme-foreground-focus)',
        fillOpacity: opacity,
        strokeOpacity: 0,
      }),
      [...marks],
    ],
  })

/**
 * Choropleth wrapper specialized for mainland France departments
 *
 * @param {Function|string} opacity - accessor or field name for the fill opacity channel
 * @param {Array} [marks] - additional marks drawn over the department borders
 * @param {Object} [options={}] - Plot.plot options merged over the defaults
 * @returns {SVGElement} the rendered choropleth map
 */
export const choroplethFrance = (opacity, marks, options = {}) =>
  choropleth(
    opacity,
    mainland_france_departements_geojson,
    mainland_france_choropleth_marks.concat(marks),
    {
      projection: france_projection,
      ...options,
    },
  )

/**
 * Choropleth wrapper specialized for Île-de-France departments
 *
 * @param {Function|string} opacity - accessor or field name for the fill opacity channel
 * @param {Array} [marks] - additional marks drawn over the department borders
 * @param {Object} [options={}] - Plot.plot options merged over the defaults
 * @returns {SVGElement} the rendered choropleth map
 */
export const choroplethIdf = (opacity, marks, options = {}) =>
  choropleth(
    opacity,
    idf_departements_geojson,
    mainland_france_choropleth_marks.concat(marks),
    {
      projection: idf_projection,
      ...options,
    },
  )

/**
 * Choropleth wrapper specialized for Italy regions
 *
 * @param {Function|string} opacity - accessor or field name for the fill opacity channel
 * @param {Array} [marks] - additional marks drawn over the region borders
 * @param {Object} [options={}] - Plot.plot options merged over the defaults
 * @returns {SVGElement} the rendered choropleth map
 */
export const choroplethItaly = (opacity, marks, options = {}) =>
  choropleth(
    opacity,
    italy_regions_geojson,
    italy_choropleth_marks.concat(marks),
    {
      projection: italy_projection,
      ...options,
    },
  )
