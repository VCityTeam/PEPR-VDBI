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
    height = 800,
    keyMap = (d) => d[0],
    valueMap = (d) => d[1],
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
    borderList = [],
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
    //         Math.min(...data.map((d) => valueMap(d).length)),
    //         Math.max(...data.map((d) => valueMap(d).length)),
    //       ])(d)
    //   ),
  } = {}
) {
  // create basic marks
  const marks = [
    Plot.graticule(),
    Plot.sphere(),
    Plot.dot(data, {
      x: (d) => valueMap(d)[0].longitude,
      y: (d) => valueMap(d)[0].latitude,
      r: (d) => valueMap(d).length,
      stroke: stroke,
      fill: fill,
      fillOpacity: fillOpacity,
      channels: {
        entity: {
          value: keyMap,
          label: entity_label,
        },
        count: {
          value: (d) => valueMap(d).length,
          label: 'Occurences',
        },
        longitude: {
          value: (d) => valueMap(d)[0].longitude,
          label: 'Lon',
        },
        latitude: {
          value: (d) => valueMap(d)[0].latitude,
          label: 'Lat',
        },
      },
      tip: tip,
    }),
  ];

  // add borders
  borderList.forEach((border) => {
    marks.push(Plot.geo(border, { stroke: 'var(--theme-foreground-faint)' }));
  });

  return Plot.plot({
    width: width,
    height: height,
    projection: {
      type: projectionType,
      domain: projectionDomain,
    },
    marks: marks,
  });
}
