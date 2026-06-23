import * as d3 from "d3"

/**
 * Generates an intersection matrix for a given dataset.
 *
 * Constructs a square matrix where each cell represents the size of the intersection
 * between two sets, normalized by the total number of unique elements across the entire dataset.
 *
 * @param {Map<string, Set<any>>} set_map - The data array to process.
 * @returns {number[][]} A 2D array representing the intersection matrix, where values are between 0 and 1.
 */
export function generateIntersectionMatrix(set_map) {
  const superset_size = new Set(d3.merge(set_map.values())).size

  const intersection_matrix = d3
    .cross(
      set_map.values(),
      set_map.values(),
      (a, b) => a.intersection(b).size / superset_size,
    )
    // https://stackoverflow.com/questions/4492385/convert-simple-array-into-two-dimensional-array-matrix
    .reduce(
      (matrix, key, index) =>
        (index % set_map.size == 0
          ? matrix.push([key])
          : matrix[matrix.length - 1].push(key)) && matrix,
      [],
    )

  return intersection_matrix
}

/**
 * Creates a chord diagram based on a matrix.
 *
 * Adapted from:
 * - https://www.visualcinnamon.com/2014/12/using-data-storytelling-with-chord.html
 * - https://www.visualcinnamon.com/2016/06/orientation-gradient-d3-chord-diagram/
 *
 * @param {Array<Array>} [data=[]] - a matrix containing the numeric values of the chord
 * ribbons. Percentage values are used by default
 * @param {Array<Number>} [names=[]] - labels for each row
 * @param {Array} [colors=[]] - a list of colors for each row
 * @returns {node} A D3 selection containing the SVG node that makes up the chord diagram.
 */
export function chordDiagram(
  data = [],
  names = [],
  colors = [],
  {
    diagram_id = Math.random().toString(8),
    width = 928,
    height = width,
    margin = 50,
    outerRadius = Math.min(width, height) * 0.5 - margin,
    innerRadius = outerRadius - 30,
    opacityDefault = 0.8,
    tickStep = d3.tickStep(0, d3.sum(data.flat()), 100),
    formatValue = d3.format('.1~%'),
  } = {},
) {
  // init chord, color, and svg objects
  // const chord =
  let selectedGroupIndex = null

  const arc = d3.arc().innerRadius(innerRadius).outerRadius(outerRadius)

  const ribbon = d3
    .ribbon()
    .radius(innerRadius - 1)
    .padAngle(1 / innerRadius)

  const color = d3.scaleOrdinal(names, colors)

  const svg = d3
    .create('svg')
    .attr('id', diagram_id)
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', [
      -width / 2 - margin / 2,
      -height / 2 - margin / 2,
      width + margin / 2,
      height + margin / 2,
    ])
    .attr('style', 'width: 100%; height: auto; font: 10px sans-serif;')

  const chords = d3
    .chord()
    .padAngle(10 / innerRadius)
    .sortSubgroups(d3.descending)
    .sortChords(d3.descending)(data)

  // Create the gradient fills

  /**
   * Build the unique gradient id used for a chord's source/target pairing
   *
   * @param {Object} d - a chord datum with `source.index`/`target.index`
   * @returns {string} the gradient element id
   */
  function getGradID(d) {
    return `${diagram_id}-linkGrad-${d.source.index}-${d.target.index}`
  }

  // Create the gradients definitions for each chord
  var grads = svg
    .append('defs')
    .selectAll('linearGradient')
    .data(chords)
    .enter()
    .append('linearGradient')
    //Create the unique ID for this specific source-target pairing
    .attr('id', getGradID)
    .attr('gradientUnits', 'userSpaceOnUse')
    //Find the location where the source chord starts
    .attr(
      'x1',
      (d) =>
        innerRadius *
        Math.cos(
          (d.source.endAngle - d.source.startAngle) / 2 +
            d.source.startAngle -
            Math.PI / 2,
        ),
    )
    .attr(
      'y1',
      (d) =>
        innerRadius *
        Math.sin(
          (d.source.endAngle - d.source.startAngle) / 2 +
            d.source.startAngle -
            Math.PI / 2,
        ),
    )
    // Find the location where the target chord starts
    .attr(
      'x2',
      (d) =>
        innerRadius *
        Math.cos(
          (d.target.endAngle - d.target.startAngle) / 2 +
            d.target.startAngle -
            Math.PI / 2,
        ),
    )
    .attr(
      'y2',
      (d) =>
        innerRadius *
        Math.sin(
          (d.target.endAngle - d.target.startAngle) / 2 +
            d.target.startAngle -
            Math.PI / 2,
        ),
    )

  // Set the starting color (at 0%)
  grads
    .append('stop')
    .attr('offset', '0%')
    .attr('stop-color', (d) => color(names[d.source.index]))

  // Set the ending color (at 100%)
  grads
    .append('stop')
    .attr('offset', '100%')
    .attr('stop-color', (d) => color(names[d.target.index]))

  // add groups, labels, and group ticks
  const group = svg.append('g').selectAll().data(chords.groups).join('g')

  group
    .append('path')
    .attr('fill', (d) => color(names[d.index]))
    .classed('selected', false)
    .attr('d', arc)
    .on('mouseover', (_e, d) => {
      if (selectedGroupIndex === null) fade(0.1, d)
    })
    .on('mouseout', (_e, d) => {
      if (selectedGroupIndex === null) fade(opacityDefault, d)
    })
    .on('click', (e, d) => {
      if (selectedGroupIndex === null || selectedGroupIndex !== d.index) {
        // select group
        selectedGroupIndex = d.index
        fade(0.1, d)
      } else {
        // deselect group
        selectedGroupIndex = null
        fade(opacityDefault, d)
      }
    })

  group
    .append('title')
    .text((d) => `${names[d.index]}\n${formatValue(d.value)}`)

  const groupTick = group
    .append('g')
    .selectAll()
    .data((d) => groupTicks(d, tickStep))
    .join('g')
    .attr(
      'transform',
      (d) =>
        `rotate(${(d.angle * 180) / Math.PI - 90}) translate(${outerRadius},0)`,
    )

  groupTick.append('line').attr('stroke', 'currentColor').attr('x2', 6)

  groupTick
    .append('text')
    .attr('x', 8)
    .attr('dy', '0.35em')
    .attr('transform', (d) =>
      d.angle > Math.PI ? 'rotate(180) translate(-16)' : null,
    )
    .attr('text-anchor', (d) => (d.angle > Math.PI ? 'end' : null))
    .text((d) => formatValue(d.value))

  group
    .select('text')
    .attr('font-weight', 'bold')
    .text(function (d) {
      return this.getAttribute('text-anchor') === 'end'
        ? `↑ ${names[d.index]}`
        : `${names[d.index]} ↓`
    })

  // add ribbons
  svg
    .append('g')
    .attr('fill-opacity', opacityDefault)
    .selectAll('path')
    .data(chords)
    .join('path')
    .classed('ribbon', true)
    .style('mix-blend-mode', 'multiply')
    .style('fill', (d) => 'url(#' + getGradID(d) + ')')
    .attr('d', ribbon)
    .append('title')
    .text(
      (d) =>
        `${formatValue(d.source.value)} ${names[d.target.index]} → ${
          names[d.source.index]
        }${
          d.source.index === d.target.index
            ? ''
            : `\n${formatValue(d.target.value)} ${names[d.source.index]} → ${
                names[d.target.index]
              }`
        }`,
    )

  /**
   * Fade all ribbons not connected to the given group datum (used on hover/click)
   *
   * @param {number} opacity - opacity to transition unrelated ribbons to
   * @param {Object} datum - the group datum whose connected ribbons stay unaffected
   * @returns {void}
   */
  function fade(opacity, datum) {
    svg
      .selectAll('path.ribbon')
      .filter(
        (d) => d.source.index != datum.index && d.target.index !== datum.index,
      )
      .transition()
      .style('opacity', opacity)
  }

  return svg.node()
}

/**
 * Compute tick angle/value pairs along a chord group's arc, for rendering
 * axis ticks
 *
 * @param {Object} d - a chord group datum with `startAngle`/`endAngle`/`value`
 * @param {number} step - the value interval between ticks
 * @returns {Object[]} an array of `{value, angle}` tick descriptors
 */
function groupTicks(d, step) {
  const k = (d.endAngle - d.startAngle) / d.value
  return d3.range(0, d.value, step).map((value) => {
    return { value: value, angle: value * k + d.startAngle }
  })
}
