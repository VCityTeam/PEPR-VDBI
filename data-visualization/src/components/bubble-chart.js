import * as Plot from 'npm:@observablehq/plot'
import * as d3 from 'npm:d3'

// adapted from https://github.com/observablehq/framework/blob/main/examples/us-dams/src/index.md

/**
 * Build a 2-D Observable Plot bubble chart, with x/y position, radius, and
 * color channels derived from raw data
 *
 * @param {Object[]} data - dataset to plot
 * @param {Object} [options] - chart configuration
 * @param {number} [options.width] - chart width
 * @param {number} [options.height] - chart height
 * @param {string} [options.x_label] - x axis label
 * @param {Array} [options.x_domain] - x axis domain
 * @param {Function} [options.x_accessor] - accessor for the x value of each datum
 * @param {string} [options.y_label] - y axis label
 * @param {Array} [options.y_domain] - y axis domain
 * @param {Function} [options.y_accessor] - accessor for the y value of each datum
 * @param {string} [options.r_label] - radius legend label
 * @param {Function} [options.r_accessor] - accessor for the radius value of each datum
 * @param {Array} [options.color_range] - color scale range
 * @returns {SVGElement} the rendered bubble chart
 */
export const bubbleChartXY = (
  data,
  {
    width,
    height,
    x_label,
    x_domain,
    x_accessor,
    y_label,
    y_domain,
    y_accessor,
    r_label,
    r_accessor,
    color_range,
  } = {},
) =>
  Plot.plot({
    width,
    height: height - 30,
    marginLeft: 100,
    marginBottom: 40,
    marginTop: 0,
    grid: true,
    x: { domain: x_domain, label: x_label },
    y: { domain: y_domain, label: y_label },
    r: { range: [3, 25], label: r_label },
    color: {
      domain: x_domain,
      range: color_range,
      label: x_label,
    },
    marks: [
      Plot.dot(
        data,
        Plot.group(
          { r: r_accessor },
          {
            x: x_accessor,
            y: y_accessor,
            fill: x_accessor,
            tip: true,
            stroke: 'currentColor',
            strokeWidth: 0.5,
          },
        ),
      ),
    ],
  })

/**
 * Build a 1-D Observable Plot bubble chart, with dots sized by radius and
 * positioned along the x axis only
 *
 * @param {Object[]} data - dataset to plot
 * @param {Object} [options] - chart configuration
 * @param {number} [options.width=600] - chart width
 * @param {number} [options.height=300] - chart height
 * @param {number} [options.marginBottom=40] - chart bottom margin
 * @param {string} [options.title] - chart title
 * @param {string} [options.subtitle] - chart subtitle
 * @param {string} [options.caption] - chart caption
 * @param {string} [options.x_label=''] - x axis label
 * @param {Function} [options.x_accessor] - accessor for the x value of each datum
 * @param {Array} [options.x_domain] - x axis domain
 * @param {string} [options.r_label=''] - radius legend label
 * @param {Function} [options.r_accessor] - accessor for the radius value of each datum
 * @param {number} [options.r_max] - maximum dot radius
 * @param {Array} [options.color_range=d3.schemeTableau10] - color scale range
 * @returns {SVGElement} the rendered bubble chart
 */
export const bubbleChartX = (
  data,
  {
    width = 600,
    height = 300,
    marginBottom = 40,
    title,
    subtitle,
    caption,
    x_label = '',
    x_accessor = (d) => d[0],
    x_domain = new Set([...data].map(x_accessor)),
    r_label = '',
    r_accessor = (d) => d[1],
    r_max = Math.min(width / [...data].length, height) / 2 - 20,
    color_range = d3.schemeTableau10,
  } = {},
) =>
  Plot.plot({
    width,
    height,
    title,
    subtitle,
    caption,
    marginBottom,
    grid: true,
    x: { domain: x_domain, label: x_label },
    r: { range: [0, r_max], label: r_label },
    color: {
      domain: x_domain,
      range: color_range,
      label: x_label,
    },
    marks: [
      Plot.dot(data, {
        x: x_accessor,
        r: r_accessor,
        fill: x_accessor,
        tip: true,
        stroke: 'currentColor',
        strokeWidth: 0.5,
      }),
    ],
  })
