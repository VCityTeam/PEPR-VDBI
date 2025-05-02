import * as d3 from 'npm:d3';
import * as Plot from 'npm:@observablehq/plot';

/**
 * Create projection map from a dataset geocoded by:
 * https://adresse.data.gouv.fr/csv
 * and a geojson file of world borders
 *
 * @param {Object} data - input dataset, by default expects a grouped d3 array. See:
 * - https://d3js.org/d3-array/group#groups
 * - https://d3js.org/d3-array/group#rollups
 * @returns {d3.node} - SVG node containing the map
 */
export function projectionMap(
  data,
  {
    width = 800,
    // height = 800, // depending on the projection, this may not be the final size
    keyMap = (d) => d[0],
    valueMap = (d) => d[1].length,
    lonMap = (d) => d[1][0].longitude,
    latMap = (d) => d[1][0].latitude,
    /*
     * list of Plot.geo compatible borders. For example:
     * ```js
     * const world = FileAttachment("./data/world.json").json();
     * const borders = [
     *   topojson.feature(world, world.objects.land),
     *   topojson.mesh(world, world.objects.countries, (a, b) => a !== b)
     * ];
     * ```
     */
    borderList = [], // list of borders to draw
    borderListStrokes = borderList.map(() => 'var(--theme-foreground-faint)'), // list of border colors; use 'var(--theme-foreground-faint)' for default
    borderListStrokeOpacity = borderList.map(() => 1),
    projectionType = 'azimuthal-equidistant',
    projectionDomain = d3.geoCircle().center([2, 47]).radius(5)(), // centered on France
    stroke = '#f43f5e',
    fill = '#f43f5e',
    fillOpacity = 0.5,
    entity_label = 'City',
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
    // color = (d) =>
    //   d3.interpolatePlasma(
    //     d3
    //       .scaleLinear()
    //       .domain([
    //         Math.min(...data.map((d) => valueMap(d))),
    //         Math.max(...data.map((d) => valueMap(d))),
    //       ])(d)
    //   ),
  } = {}
) {
  // create basic marks
  const marks = [
    Plot.graticule(),
    Plot.sphere(),
    Plot.dot(data, {
      x: lonMap,
      y: latMap,
      r: valueMap,
      stroke: stroke,
      fill: fill,
      fillOpacity: fillOpacity,
      channels: {
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
      tip: tip,
    }),
  ];

  // add borders
  const bordersToDraw = d3.zip(
    borderList,
    borderListStrokes,
    borderListStrokeOpacity
  );
  bordersToDraw.forEach((borderAndStroke) => {
    marks.push(
      Plot.geo(borderAndStroke[0], {
        stroke: borderAndStroke[1],
        strokeOpacity: borderAndStroke[2],
      })
    );
  });
  console.debug('bordersToDraw', bordersToDraw);

  return Plot.plot({
    width: width,
    // height: height,
    projection: {
      type: projectionType,
      domain: projectionDomain,
    },
    marks: marks,
  });
}
