import * as d3 from 'd3'
import * as Plot from '@observablehq/plot'
import { FileAttachment } from 'observablehq:stdlib'
import { vdbi_color_scheme } from './color.js'

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

export const italy_regions_geojson = FileAttachment(
  '/data/italy_regions.json',
).json()



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
  fill: vdbi_color_scheme.blue,
  strokeWidth: 1.5,
  strokeOpacity: 0.7,
  fillOpacity: 0.4,
}

export const default_mainland_france_marks = [
  Plot.geo(mainland_france_departements_geojson, {
    ...default_projection_style,
    strokeWidth: 0.5,
  }),
  Plot.geo(mainland_france_regions_geojson, {
    ...default_projection_style,
    fill: undefined,
    fillOpacity: undefined,
  }),
]

export const mainland_france_choropleth_marks = [
  Plot.geo(mainland_france_departements_geojson, {
    stroke: vdbi_color_scheme.blue,
    strokeWidth: 0.1,
  }),
  Plot.geo(mainland_france_regions_geojson, {
    stroke: vdbi_color_scheme.blue,
  }),
]

export const idf_choropleth_marks = [
  Plot.geo(idf_departements_geojson, {
    stroke: vdbi_color_scheme.blue,
    // strokeWidth: 0.1,
  }),
]

export const italy_choropleth_marks = [
  Plot.geo(italy_regions_geojson, {
    stroke: vdbi_color_scheme.blue,
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
     * list of Plot.geo compatible borders. For example:
     * const world = FileAttachment("/data/world.json").json();
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
      Plot.graticule(),
      Plot.sphere(),
      Plot.dot(data, {
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
      Plot.geo(borderAndStroke[0], {
        stroke: borderAndStroke[1],
        strokeOpacity: borderAndStroke[2],
      }),
    )
  })
  console.debug('bordersToDraw', bordersToDraw)

  return Plot.plot({
    width: width,
    height: height,
    projection: {
      type: projectionType,
      domain: projectionDomain,
    },
    marks: marks,
  })
}

// Future hexbin map implementation?

// const test_plot_hexbin = (width, height) =>
//   defaultProjectionFrance(
//     width,
//     height,
//     [
//       Plot.dot(
//         [...all_partner_data],
//         Plot.hexbin(
//           {
//             r: "count",
//             fill: "count",
//             // opacity: "count",
//           },
//           {
//             x: "longitude",
//             y: "latitude",
//             // stroke: vdbi_color_scheme.orange,
//             fill: vdbi_color_scheme.blue,
//             // binWidth: 15,
//           }
//         )
//       ),
//       ...terrain_tips(france_terrain_data),
//     ],
//     "- Project partners, France"

//   )

/**
 * Default Observable Plot color-scale config (Blues scheme, legend, margins)
 * for choropleth maps
 *
 * @param {string} [label='N° de partenaires et parties prenantes estimé'] - the color legend label
 * @returns {Object} a Plot `color` scale configuration object
 */
const choropleth_color_config = (
  label = 'N° de partenaires et parties prenantes estimé',
) => ({
  scheme: 'Blues',
  label: label,
  // label: "N° of Partners",
  // domain: [0, 6],
  legend: true,
  marginLeft: 10,
  marginRight: 10,
  // type: "log",
  zero: true,
  nice: true,
  // ticks: 2,
})

/**
 * Build a generic Observable Plot choropleth map from geojson features and
 * a fill accessor
 *
 * @param {number} width - chart width
 * @param {number} height - chart height
 * @param {string} caption - color legend label/caption
 * @param {Function|string} fill - accessor or field name for the fill/color channel
 * @param {Function} projection - a d3/Plot geo projection
 * @param {Object} features - a GeoJSON FeatureCollection to render
 * @param {Array} [marks=[]] - additional Plot marks to layer on top of the geo mark
 * @returns {SVGElement} the rendered choropleth map
 */
export const choropleth = (
  width,
  height,
  caption,
  fill,
  projection,
  features,
  marks = [],
) =>
  Plot.plot({
    width: width,
    height: height - 60,
    // caption: caption,
    color: choropleth_color_config(caption),
    projection: projection,
    marks: [
      Plot.geo(features, {
        channels: {
          Department: ({ properties }) => properties.nom,
          Code: ({ properties }) => properties.code,
          Lat: (d) => d3.geoCentroid(d)[0],
          Lon: (d) => d3.geoCentroid(d)[1],
          Count: fill,
        },
        tip: true,
        fill: fill,
        strokeOpacity: 0,
      }),
      ...marks,
    ],
  })

/**
 * Choropleth map preconfigured for mainland France departments
 *
 * @param {number} width - chart width
 * @param {string} caption - color legend label/caption
 * @param {Function|string} fill - accessor or field name for the fill/color channel
 * @param {Array} [marks=[]] - additional Plot marks to layer on top
 * @returns {SVGElement} the rendered choropleth map
 */
export const choroplethFrance = (width, caption, fill, marks = []) =>
  choropleth(
    width,
    width * 0.92,
    caption,
    fill,
    france_projection,
    mainland_france_departements_geojson,
    [...mainland_france_choropleth_marks, ...marks],
  )

/**
 * Choropleth map preconfigured for Île-de-France departments
 *
 * @param {number} width - chart width
 * @param {string} caption - color legend label/caption
 * @param {Function|string} fill - accessor or field name for the fill/color channel
 * @param {Array} [marks=[]] - additional Plot marks to layer on top
 * @returns {SVGElement} the rendered choropleth map
 */
export const choroplethIdf = (width, caption, fill, marks = []) =>
  choropleth(
    width,
    width,
    caption,
    fill,
    idf_projection,
    idf_departements_geojson,
    [...idf_choropleth_marks, ...marks],
  )

/**
 * Choropleth map preconfigured for Italian regions
 *
 * @param {number} width - chart width
 * @param {string} caption - color legend label/caption
 * @param {Function|string} fill - accessor or field name for the fill/color channel
 * @param {Array} [marks=[]] - additional Plot marks to layer on top
 * @returns {SVGElement} the rendered choropleth map
 */
export const choroplethItaly = (width, caption, fill, marks = []) =>
  choropleth(
    width,
    width,
    caption,
    fill,
    italy_projection,
    italy_regions_geojson,
    [...italy_choropleth_marks, ...marks],
  )
