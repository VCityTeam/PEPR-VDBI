import * as Plot from 'npm:@observablehq/plot'

/**
 * Create a filtered dataset, that filters based on 2 input criteria
 *
 * @param {Array} data - dataset to filter
 * @param {Array} input_criteria - all critereon to consider
 * @param {Function[]} criteria_functions - functions to use for each critereon.
 *    Keys contain the critereon to meet and the values contain the function to
 *    execute if a critereon is met. Functions should return true or false. If 'All'
 *    is passed in as criterion, the criterion is ignored (and accepted)
 * @returns {Array} filtered dataset
 */
export function filterOnInput(data, input_criteria, criteria_functions) {
  return data.filter((d) => {
    for (let index = 0; index < input_criteria.length; index++) {
      const critereon = input_criteria[index]
      const critereon_function = criteria_functions[index]
      if (critereon_function(d) != critereon && critereon !== 'All') {
        return false
      }
    }
    return true
  })
}

/**
 * Return the possible options of a column
 *
 * @param {Object[]} data - the dataset
 * @param {string} key - the column to search in
 * @returns {String[]} an Array of the possible options found in the column
 */
export function getColumnOptions(data, key) {
  const options = new Set(['All'])
  data.forEach((d) => options.add(d[key]))
  return options
}

/**
 * Build a faceted (by `fy`), sortable horizontal bar plot for 3-dimensional
 * count data
 *
 * @param {Object[]} data - the dataset to plot
 * @param {string} [x='count'] - the data key for the bar length (count) channel
 * @param {string} [y='type'] - the data key for the y (color/group) channel
 * @param {string} [fy='entity'] - the data key for the facet channel
 * @param {number} [width=1500] - chart width
 * @param {number} [row_height=17] - height allotted per row, used to size the chart
 * @param {number} [margin_left=60] - chart left margin
 * @param {number} [margin_right=140] - chart right margin
 * @param {string} [color_scheme='Plasma'] - the Plot color scheme name
 * @param {string} [x_label='Occurrences'] - x axis label
 * @param {number} [domain_min=0] - minimum value of the x axis domain
 * @param {number} [domain_max=1] - added to the max data value to define the x axis domain max
 * @param {number} [fy_tick_format_cuttoff=25] - cut off facet tick labels after this many characters
 * @param {string} [fy_label='Entity'] - facet axis label
 * @param {string} [sort_criteria='-x'] - the Plot sort specification applied to facets
 * @param {boolean} [tip=true] - whether to show tooltips on hover
 * @returns {SVGElement} the rendered bar plot
 */
export function getSortable3DCountPlot(
  data,
  x = 'count',
  y = 'type',
  fy = 'entity',
  width = 1500,
  row_height = 17,
  margin_left = 60,
  margin_right = 140,
  color_scheme = 'Plasma',
  x_label = 'Occurrences',
  domain_min = 0,
  domain_max = 1, // added to max occurrences to define the domain max
  fy_tick_format_cuttoff = 25, // cut off label after this many characters
  fy_label = 'Entity',
  sort_criteria = '-x',
  tip = true,
) {
  return Plot.plot({
    height: data.length * row_height, // assure adequate horizontal space for each line
    width: width,
    marginLeft: margin_left,
    marginRight: margin_right,
    color: {
      scheme: color_scheme,
    },
    x: {
      grid: true,
      axis: 'top',
      label: x_label,
      // domain useful for constraining ticks between 0 and max occurrences + 1
      domain: [domain_min, Math.max(...data.map((d) => d[x])) + domain_max],
    },
    fy: {
      tickFormat: (d) =>
        d.length > fy_tick_format_cuttoff ? d.slice(0, 23).concat('...') : d, // cut off long tick labels
      label: fy_label,
    },
    marks: [
      Plot.barX(data, {
        x: x,
        y: y,
        fy: fy,
        fill: x,
        sort: { fy: sort_criteria },
        tip: tip,
      }),
    ],
  })
}

/**
 * Build a sortable horizontal bar plot for 2-mark count data. Note: the
 * x1/y1 bar mark is currently commented out in the implementation, so only
 * the x2/y2 mark renders.
 *
 * @param {Object[]} data - the dataset to plot
 * @param {string} [x1='count'] - data key for the (currently unused) first mark's bar length channel
 * @param {string} [x2='count'] - data key for the rendered mark's bar length channel
 * @param {string} [y2='type'] - data key for the rendered mark's y channel
 * @param {number} [width=1500] - chart width
 * @param {number} [row_height=17] - height allotted per row, used to size the chart
 * @param {number} [margin_left=60] - chart left margin
 * @param {number} [margin_right=140] - chart right margin
 * @param {string} [color_scheme='Plasma'] - the Plot color scheme name
 * @param {string} [x_label='Occurrences'] - x axis label
 * @param {number} [domain_min=0] - minimum value of the x axis domain
 * @param {number} [domain_max=1] - added to the max data value to define the x axis domain max
 * @param {number} [y_tick_format_cuttoff=25] - cut off y tick labels after this many characters
 * @param {string} [y_label='Entity'] - y axis label
 * @param {string} [sort_criteria='-x'] - the Plot sort specification applied to the y mark
 * @param {boolean} [tip=true] - whether to show tooltips on hover
 * @returns {SVGElement} the rendered bar plot
 */
export function getSortable2MarkCountPlot(
  data,
  x1 = 'count',
  // y1 = "type",
  x2 = 'count',
  y2 = 'type',
  width = 1500,
  row_height = 17,
  margin_left = 60,
  margin_right = 140,
  color_scheme = 'Plasma',
  x_label = 'Occurrences',
  domain_min = 0,
  domain_max = 1, // added to max occurrences to define the domain max
  y_tick_format_cuttoff = 25, // cut off label after this many characters
  y_label = 'Entity',
  sort_criteria = '-x',
  tip = true,
) {
  return Plot.plot({
    height: data.length * row_height, // assure adequate horizontal space for each line
    width: width,
    marginLeft: margin_left,
    marginRight: margin_right,
    color: {
      scheme: color_scheme,
    },
    x: {
      grid: true,
      axis: 'top',
      label: x_label,
      // domain useful for constraining ticks between 0 and max occurrences + 1
      domain: [domain_min, Math.max(...data.map((d) => d[x1])) + domain_max],
    },
    y: {
      tickFormat: (d) =>
        d.length > y_tick_format_cuttoff ? d.slice(0, 23).concat('...') : d, // cut off long tick labels
      label: y_label,
    },
    // marks: [
    //   Plot.barX(data, {
    //     x: x1,
    //     y: y1,
    //     fill: x1,
    //     sort: { y1: sort_criteria },
    //     tip: tip,
    //   }),
    // ],
    marks: [
      Plot.barX(data, {
        x: x2,
        y: y2,
        fill: x2,
        sort: { y2: sort_criteria },
        tip: tip,
      }),
    ],
  })
}
