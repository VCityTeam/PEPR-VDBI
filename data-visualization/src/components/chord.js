import * as d3 from 'd3'

/**
 * Wrap a column name into an accessor function; functions are returned as is.
 *
 * @param {string|Function} accessor - a column name or a row accessor
 * @returns {Function} a row accessor
 */
const toAccessor = (accessor) =>
  typeof accessor === 'function' ? accessor : (d) => d[accessor]

/**
 * Converts a cell value to a list of non-empty strings. Arrays are flattened,
 * strings are split on `delimiter` (when given), and any other value
 * (numbers, dates, booleans...) is treated as a string.
 *
 * @param {any} value - the cell value
 * @param {string|null} [delimiter=null] - separator for multi-valued cells
 * @returns {string[]} the trimmed, non-empty string values of the cell
 */
export function cellToStrings(value, delimiter = null) {
  if (value == null) return []
  if (Array.isArray(value))
    return value.flatMap((d) => cellToStrings(d, delimiter))
  const text = String(value)
  return (delimiter ? text.split(delimiter) : [text])
    .map((d) => d.trim())
    .filter((d) => d !== '')
}

/**
 * Groups the values of one or more columns by the value of a group column.
 *
 * Each row adds the (string) values of its `value_columns` to the set of its
 * group, so that the sets can be crossed by `generateIntersectionMatrix`.
 * Rows with an empty group are skipped.
 *
 * @param {Object[]} data - the rows to process
 * @param {string|Function} group_column - column name (or accessor) of the group,
 *   i.e. a chord diagram arc
 * @param {Array<string|Function>|string|Function} value_columns - column name(s)
 *   (or accessors) of the values shared between groups. Values of several columns
 *   are merged into the same set
 * @param {Object} [options={}]
 * @param {string|null} [options.delimiter=null] - separator for multi-valued cells
 * @returns {Map<string, Set<string>>} the set of values of each group
 */
export function columnsToSetMap(
  data,
  group_column,
  value_columns,
  { delimiter = null } = {},
) {
  const group_accessor = toAccessor(group_column)
  const value_accessors = [value_columns].flat().map(toAccessor)
  const set_map = new Map()

  for (const row of data) {
    const [group] = cellToStrings(group_accessor(row))
    if (group === undefined) continue
    if (!set_map.has(group)) set_map.set(group, new Set())
    const set = set_map.get(group)
    for (const accessor of value_accessors)
      for (const value of cellToStrings(accessor(row), delimiter))
        set.add(value)
  }

  return set_map
}

/**
 * Swaps the roles of the group and value columns: every distinct value of the
 * value columns becomes a group, whose values are the groups of the rows it
 * appears in. Returns one `{group, value}` row per (value, group) pair, ready
 * for `columnsToSetMap(rows, 'group', 'value')`.
 *
 * @param {Object[]} data - the rows to process
 * @param {string|Function} group_column - see `columnsToSetMap`
 * @param {Array<string|Function>|string|Function} value_columns - see `columnsToSetMap`
 * @param {Object} [options={}]
 * @param {string|null} [options.delimiter=null] - separator for multi-valued
 *   cells of the value columns
 * @returns {{group: string, value: string}[]} the transposed rows
 */
export function transposeGroupsAndValues(
  data,
  group_column,
  value_columns,
  { delimiter = null } = {},
) {
  return [
    ...columnsToSetMap(data, group_column, value_columns, { delimiter }),
  ].flatMap(([group, set]) =>
    [...set].map((value) => ({ group: value, value: group })),
  )
}

/**
 * Pairwise set similarity measures used to fill an intersection matrix.
 * Each one takes the two sets and the size of the superset of all sets.
 */
export const intersection_measures = {
  // share of all distinct values found in both sets (original behavior)
  superset: (a, b, superset_size) =>
    superset_size ? a.intersection(b).size / superset_size : 0,
  // raw number of values found in both sets
  count: (a, b) => a.intersection(b).size,
  // Jaccard index: share of the values of either set found in both
  jaccard: (a, b) => {
    const union_size = a.union(b).size
    return union_size ? a.intersection(b).size / union_size : 0
  },
}

/**
 * Generates an intersection matrix for a given dataset.
 *
 * Constructs a square, symmetric matrix where each cell represents the size of
 * the intersection between two sets, measured with `options.measure`.
 * By default the size is normalized by the total number of unique elements
 * across the entire dataset.
 *
 * @param {Map<string, Set<any>>} set_map - the sets to cross, e.g. from `columnsToSetMap`
 * @param {Object} [options={}]
 * @param {'superset'|'count'|'jaccard'} [options.measure='superset'] - the
 *   similarity measure, see `intersection_measures`
 * @param {boolean} [options.diagonal=true] - whether to keep the self-intersections
 *   (each set with itself) or set them to 0
 * @returns {number[][]} A 2D array representing the intersection matrix, in the
 *   order of `set_map`
 */
export function generateIntersectionMatrix(
  set_map,
  { measure = 'superset', diagonal = true } = {},
) {
  const measureFunction = intersection_measures[measure]
  if (!measureFunction)
    throw new Error(`Unknown intersection measure: ${measure}`)

  const sets = [...set_map.values()]
  const superset_size = new Set(d3.merge(sets)).size
  const matrix = sets.map(() => new Array(sets.length).fill(0))

  // the matrix is symmetric, so only compute the upper triangle
  for (let i = 0; i < sets.length; i++) {
    for (let j = diagonal ? i : i + 1; j < sets.length; j++) {
      matrix[i][j] = matrix[j][i] = measureFunction(
        sets[i],
        sets[j],
        superset_size,
      )
    }
  }

  return matrix
}

/**
 * Generates the intersection matrix of the values of one or more columns,
 * grouped by a group column. Combines `columnsToSetMap` and
 * `generateIntersectionMatrix`.
 *
 * @param {Object[]} data - the rows to process
 * @param {string|Function} group_column - see `columnsToSetMap`
 * @param {Array<string|Function>|string|Function} value_columns - see `columnsToSetMap`
 * @param {Object} [options={}]
 * @param {string|null} [options.delimiter=null] - see `columnsToSetMap`
 * @param {string} [options.measure='superset'] - see `generateIntersectionMatrix`
 * @param {boolean} [options.diagonal=true] - see `generateIntersectionMatrix`
 * @param {number} [options.limit=Infinity] - keep only the groups with the largest sets
 * @param {boolean} [options.drop_empty=true] - drop groups without any values
 * @param {Function|null} [options.sort] - comparator of `[name, set]` entries that sets the
 *   group (matrix row) order, applied after `limit`; largest sets first by default, `null`
 *   keeps the order in which groups appear in `data`
 * @returns {{names: string[], sets: Map<string, Set<string>>, matrix: number[][]}}
 *   the group names (matrix row order), their sets, and the intersection matrix
 */
export function columnsToIntersectionMatrix(
  data,
  group_column,
  value_columns,
  {
    delimiter = null,
    measure = 'superset',
    diagonal = true,
    limit = Infinity,
    drop_empty = true,
    sort = ([, a], [, b]) => d3.descending(a.size, b.size),
  } = {},
) {
  const entries = [
    ...columnsToSetMap(data, group_column, value_columns, { delimiter }),
  ].filter(([, set]) => !drop_empty || set.size > 0)
  // the limit always keeps the largest sets, whatever the display order
  const kept = new Set(
    [...entries]
      .sort(([, a], [, b]) => d3.descending(a.size, b.size))
      .slice(0, limit),
  )
  const sorted = entries.filter((d) => kept.has(d))
  const sets = new Map(sort ? sorted.sort(sort) : sorted)

  return {
    names: [...sets.keys()],
    sets,
    matrix: generateIntersectionMatrix(sets, { measure, diagonal }),
  }
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
 * @param {Object} [options={}] - diagram configuration
 * @param {string} [options.diagram_id] - id given to the SVG element, used to scope
 *   the ribbon gradient ids; defaults to a random string
 * @param {number} [options.width=928] - width of the SVG element
 * @param {number} [options.height=width] - height of the SVG element
 * @param {number} [options.margin=50] - margin around the chord circle, in pixels
 * @param {number} [options.outerRadius] - outer radius of the group arcs
 * @param {number} [options.innerRadius=outerRadius-30] - inner radius of the group arcs,
 *   i.e. the radius the ribbons are drawn to
 * @param {number} [options.opacityDefault=0.8] - ribbon opacity when no group is selected
 * @param {number} [options.tickStep] - spacing between arc ticks, in data units
 * @param {Function} [options.formatValue] - formats a tick/tip value; percentages by default
 * @param {boolean} [options.showGroupLabels=true] - label each arc with its group name
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
    showGroupLabels = true,
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

  // replace each group's first tick label with the group name
  if (showGroupLabels)
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
