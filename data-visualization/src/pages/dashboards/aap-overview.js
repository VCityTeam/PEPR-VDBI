import { format } from 'd3'
import * as Inputs from 'npm:@observablehq/inputs'
import * as Plot from 'npm:@observablehq/plot'
// import * as d3 from 'npm:d3'

export const challenge_map = new Map([
  ['defi_1', 'Défi 1'],
  ['defi_2', 'Défi 2'],
  ['defi_3', 'Défi 3'],
  ['defi_4', 'Défi 4'],
  ['defi_5', 'Défi 5'],
  ['defi_6', 'Défi 6'],
])

export const detailed_challenge_map = new Map([
  ['defi_1', 'Changement climatique et préservation de la biodiversité'],
  ['defi_2', 'Vers des villes et/ou des bâtiments résilient(e)s'],
  ['defi_3', 'Villes et/ou bâtiments sobres et frugaux'],
  ['defi_4', 'Vers des villes et/ou bâtiments inclusifs et équitables'],
  ['defi_5', 'Villes et/ou bâtiments durable, santé et bien-être'],
  ['defi_6', 'Défis émergents'],
])

export const laureateCheckbox = () =>
  Inputs.toggle({
    value: false,
    label: 'Laureates only?',
  })

export const xSortSelect = (label = 'Label') =>
  Inputs.select(
    new Map([
      [`${label} ⇧`, 'x'],
      [`${label} ⇩`, '-x'],
      [`Occurrences ⇧`, 'y'],
      [`Occurrences ⇩`, '-y'],
    ]),
    {
      value: '-y',
      label: 'Sort by',
    },
  )

export const ySortSelect = (label = 'Label') =>
  Inputs.select(
    new Map([
      [`${label} ⇧`, 'y'],
      [`${label} ⇩`, '-y'],
      [`Occurrences ⇧`, 'x'],
      [`Occurrences ⇩`, '-x'],
    ]),
    {
      value: '-x',
      label: 'Sort by',
    },
  )

export const projectCountPlot = (
  data,
  {
    width,
    height = 400,
    marginLeft = 140,
    limit = 15,
    x_label,
    y_label,
    sort_value,
    x_accessor,
    y_accessor,
  } = {},
) =>
  Plot.plot({
    width: width,
    height: height,
    x: {
      label: x_label,
      grid: true,
    },
    y: {
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
        sort: { y: sort_value, limit: limit },
        tip: true,
      }),
    ],
  })

export const partnerCountPlot = (
  data,
  {
    width,
    height = 400,
    marginLeft = 125,
    limit = 15,
    x_label,
    y_label,
    sort_value,
    x_accessor,
    y_accessor,
  } = {},
) =>
  Plot.plot({
    width: width,
    height: height,
    x: {
      label: x_label,
      grid: true,
    },
    y: {
      label: y_label,
      nice: true,
      type: 'band',
    },
    marginLeft: marginLeft,
    // color: {
    //   scheme: 'Blues',
    //   zero: true,
    // },
    id: {
      value: 'id',
    },
    marks: [
      Plot.barX(data, {
        x: x_accessor,
        y: y_accessor,
        fill: 'var(--theme-foreground-focus-alt)',
        channels: {
          id: 'id',
        },
        sort: { y: sort_value, limit: limit },
        tip: true,
      }),
      Plot.text(data, {
        x: x_accessor,
        y: y_accessor,
        text: 'label',
        fill: 'white',
        textAnchor: 'end',
        textOverflow: 'ellipsis-middle',
        dx: -5,
        sort: { y: sort_value, limit: limit },
      }),
    ],
  })
