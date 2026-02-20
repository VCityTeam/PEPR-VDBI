import * as Inputs from 'npm:@observablehq/inputs'
import * as Plot from 'npm:@observablehq/plot'

const laureateCheckbox = () =>
  Inputs.toggle({
    value: false,
    label: 'Laureates only?',
  })

const sortSelect = (label = 'Label') =>
  Inputs.select(
    new Map([
      [`${label} ⇧`, 'x'],
      [`${label} ⇩`, '-x'],
      [`Occurrences ⇧`, 'y'],
      [`Occurrences ⇩`, '-y'],
    ]),
    {
      value: 'x',
      label: 'Sort by',
    },
  )

const projectCountPlot = (
  data,
  {
    width,
    marginLeft = 150,
    x_label,
    y_label,
    sort_value,
    x_accessor,
    y_accessor,
  } = {},
) =>
  Plot.plot({
    width: width,
    height: width,
    x: {
      label: x_label,
      grid: true,
    },
    y: {
      tickRotate: -10,
      label: y_label,
      nice: true,
      type: 'band',
    },
    marginLeft: marginLeft,
    color: {
      scheme: 'Blues',
      zero: true,
    },
    marks: [
      Plot.barX(data, {
        x: x_accessor,
        y: y_accessor,
        fill: x_accessor,
        sort: { y: sort_value },
        tip: {
          format: {
            fill: false,
          },
        },
      }),
    ],
  })

export { laureateCheckbox, sortSelect, projectCountPlot }
