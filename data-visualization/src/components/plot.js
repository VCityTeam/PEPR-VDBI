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
