import * as Inputs from 'npm:@observablehq/inputs'
import * as Plot from 'npm:@observablehq/plot'
import * as d3 from 'npm:d3'

export const challenge_label_map = new Map([
  ['1', 'Défi 1'],
  ['2', 'Défi 2'],
  ['3', 'Défi 3'],
  ['4', 'Défi 4'],
  ['5', 'Défi 5'],
  ['6', 'Défi 6'],
])

export const challenge_description_map_aap1 = new Map([
  ['1', 'Changement climatique et préservation de la biodiversité'],
  ['2', 'Vers des villes et/ou des bâtiments résilient(e)s'],
  ['3', 'Villes et/ou bâtiments sobres et frugaux'],
  ['4', 'Vers des villes et/ou bâtiments inclusifs et équitables'],
  ['5', 'Villes et/ou bâtiments durable, santé et bien-être'],
  ['6', 'Défis émergents'],
])

export const challenge_description_map_aap2 = new Map([
  ['1', 'Le changement climatique et la préservation de la biodiversité'],
  ['2', 'La ville résiliente'],
  ['3', 'La ville sobre et frugal'],
  ['4', 'La ville inclusive et équitable'],
  ['5', 'La ville durable, santé et bien-être'],
  ['6', 'Les défis émergents, signaux faibles, nouvelles difficultés'],
])

export const aapColorScale = d3
  .scaleOrdinal(
    ['AAP 1', 'AAP 2'],
    ['var(--theme-foreground-focus-alt)', 'var(--theme-foreground-focus)'],
  )
  .unknown('grey')

export const projectTypeColorScale = d3
  .scaleOrdinal(
    ['PITT - Trio de Thèses', 'PITT - Interdisciplinaire'],
    [d3.schemeObservable10[1], d3.schemeObservable10[0]],
  )
  .unknown('grey')

export const defiColorScale = d3
  .scaleOrdinal(['1', '2', '3', '4', '5', '6'], d3.schemeObservable10)
  .unknown('grey')

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
      label: 'Trier par',
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
      label: 'Trier par',
    },
  )

export const projectCountPlotAAP1 = (
  data,
  {
    width,
    height = 400,
    marginLeft = 140,
    limit = 15,
    x_label,
    y_label,
    sort_value,
    x_accessor = 'count',
    y_accessor = 'project',
    max_partner_count = 25,
  } = {},
) =>
  Plot.plot({
    width: width,
    height: height,
    x: {
      label: x_label,
      grid: true,
      nice: true,
      domain: [0, max_partner_count],
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

export const projectCountPlotAAP2 = (
  data,
  {
    width,
    height = 400,
    marginLeft = 140,
    limit = 15,
    x_label,
    y_label,
    sort_value,
    x_accessor = 'count',
    y_accessor = 'project',
    fill_accessor = 'type',
    max_partner_count = 25,
  } = {},
) =>
  Plot.plot({
    width: width,
    height: height,
    x: {
      label: x_label,
      grid: true,
      nice: true,
      domain: [0, max_partner_count],
    },
    y: {
      label: y_label,
      nice: true,
      type: 'band',
    },
    marginLeft: marginLeft,
    color: {
      legend: true,
      type: 'categorical',
      // domain: [''],
      range: projectTypeColorScale.range(),
    },
    marks: [
      Plot.barX(data, {
        x: x_accessor,
        y: y_accessor,
        fill: fill_accessor,
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
    marginLeft = 230,
    limit = 15,
    lineWidth = 23,
    x_label = "Nombre d'occurences",
    y_label,
    sort_value,
    x_accessor = (d) => d.count,
    y_accessor = (d) => `${d.id};${d.label}`,
    // y_accessor = 'id',
    midpoint = Math.max(...[...data].map(x_accessor)) / 2,
    textOverflow = 'ellipsis-middle',
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
      // bars
      Plot.barX(data, {
        x: x_accessor,
        y: y_accessor,
        fill: x_accessor,
        sort: { y: sort_value, limit: limit },
        tip: true,
      }),
      // axis labels
      Plot.axisY({
        tickFormat: null,
      }),
      Plot.text(data, {
        x: 0,
        y: y_accessor,
        text: 'label',
        channels: {
          id: y_accessor,
          label: 'label',
        },
        textAnchor: 'end',
        textOverflow: textOverflow,
        lineWidth: lineWidth,
        dx: -10,
        sort: { y: sort_value, limit: limit },
      }),
      // id labels
      Plot.text(data, {
        x: x_accessor,
        y: y_accessor,
        text: (d) => (x_accessor(d) > midpoint ? d.communes.slice(1, -1) : ''),
        channels: {
          id: y_accessor,
          label: 'label',
        },
        fill: 'white',
        textAnchor: 'end',
        lineWidth: lineWidth,
        textOverflow: textOverflow,
        dx: -5,
        sort: { y: sort_value, limit: limit },
      }),
      Plot.text(data, {
        x: x_accessor,
        y: y_accessor,
        text: (d) => (x_accessor(d) > midpoint ? '' : d.communes.slice(1, -1)),
        channels: {
          id: y_accessor,
          label: 'label',
        },
        // fill: 'white',
        textAnchor: 'start',
        lineWidth: lineWidth,
        textOverflow: textOverflow,
        dx: 5,
        sort: { y: sort_value, limit: limit },
      }),
    ],
  })

export const stackedChallengeCountPlot = (
  data,
  {
    width,
    fill_accessor = 'aap',
    color_range = aapColorScale.range(),
    title = 'Défis par AAP',
    subtitle = `Les défis indiqués dans les métadonnées et les templates des
    soumissions sur le site du dépôt de l'AAP 1 et 2`,
  },
) =>
  Plot.plot({
    width: width,
    height: 400,
    marginBottom: 70,
    title: title,
    subtitle: subtitle,
    grid: true,
    x: { type: 'band' },
    color: {
      range: color_range,
      type: 'categorical',
      legend: true,
    },
    marks: [
      Plot.axisX({
        label: 'Défis',
        tickFormat: (d) => `${d}. ${challenge_description_map_aap2.get(d)}`,
        lineWidth: 8,
      }),
      Plot.barY(data, {
        x: 'defi',
        y: 'count',
        fill: fill_accessor,
        fillOpacity: (d) => (d.financed || d.selected ? 1 : 0.7),
        tip: true,
      }),
    ],
  })

export const challengeCountPlot = (
  data,
  {
    width,
    x_accessor = 'aap',
    color_range = aapColorScale.range(),
    title = 'Défis par AAP',
    subtitle = `Les défis indiqués dans les métadonnées et les templates des
  soumissions sur le site du dépôt de l'AAP 1 et 2`,
  },
) =>
  Plot.plot({
    width: width,
    height: 400,
    marginBottom: 70,
    title: title,
    subtitle: subtitle,
    grid: true,
    fx: {
      type: 'band',
    },
    x: {
      label: null,
      tickFormat: null,
      tickSize: null,
    },
    color: {
      range: color_range,
      type: 'categorical',
      legend: true,
    },
    marks: [
      Plot.axisFx({
        label: 'Défis',
        tickFormat: (d) => `${d}. ${challenge_description_map_aap2.get(d)}`,
        lineWidth: 8,
        anchor: 'bottom',
        tickSize: 5,
      }),
      Plot.barY(data, {
        x: x_accessor,
        fx: 'defi',
        y: 'count',
        fill: x_accessor,
        fillOpacity: (d) => (d.financed || d.selected ? 1 : 0.7),
        tip: true,
      }),
    ],
  })

// export const choroplethFrance = (width, height, fill) =>
//   choropleth(
//     width,
//     height,
//     fill,
//     france_projection,
//     mainland_france_departements_geojson,
//     '- Partenaires et parties prenantes des projets par département, France',
//   )
