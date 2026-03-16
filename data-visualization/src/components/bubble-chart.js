import * as Plot from 'npm:@observablehq/plot'
import * as d3 from 'npm:d3'

// adapted from https://github.com/observablehq/framework/blob/main/examples/us-dams/src/index.md

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
