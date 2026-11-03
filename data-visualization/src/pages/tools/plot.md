---
style: /css/vdbi-dashboard.css
---

<!-- imports -->

```js
import {
  DonutChart,
  DonutChartWithLabels,
  DonutChartWithLegend,
} from '/components/pie-chart.js'
import { downloadSVGButton, formTemplate } from '/components/utilities.js'
```

# Plot Generator

Upload a table (.csv, .tsv or .txt) to generate a chart of its values. The delimiter (comma, tab or
semicolon) is detected from the first line of the file, which must hold the column names. Each
following row is a data point, and values that look like numbers or dates are read as such. For
example:

```csv
city,year,projects
Paris,2023,12
Lyon,2023,5
Paris,2024,15
Lyon,2024,8
```

The page produces two charts from the same file:

- an **auto plot** ([Observable Plot's `auto` mark](https://observablehq.com/plot/marks/auto)): pick
  the columns for the x, y, facet and fill channels, and optionally force a mark type;
- a **pie/donut chart**: one slice per value of a category column, sized by the sum of a value
  column. The chart can be plain, have a color legend, or have labels connected to their slice, and
  its arcs can be restricted to part of the circle, e.g. a top half to draw a gauge. Labels are drawn
  outside the donut, so lower the outer radius ratio to leave them room.

```js
const file = view(
  Inputs.file({
    label: 'File',
    accept: '.csv,.tsv,.txt',
    required: true,
  }),
)
```

```js
const data = parseTable(await file.text())
console.debug('data', data)
```

```js
display(Inputs.table(data, { layout: 'auto' }))
```

## ${plot_display.mark || 'Auto'} plot

<!-- User parameters -->

<div class="card">
  ${plot_settings_form}
  <!-- $ -->
  <hr>
  ${plot_display_form}
  <!-- $ -->
</div>
<div id="plot_container" class="card">
  ${plot}
  <!-- $ -->
  <hr>
  ${plot_download_button}
  <!-- $ -->
</div>

```js
const plot = Plot.auto(data, plot_options).plot({
  width: plot_display.width,
  height: plot_display.height,
  x: { tickRotate: plot_display.xTickRotate },
  y: { tickRotate: plot_display.yTickRotate },
  marginTop: plot_display.marginTop,
  marginBottom: plot_display.marginBottom,
  marginLeft: plot_display.marginLeft,
  marginRight: plot_display.marginRight,
})
```

```js
const plot_download_button = downloadSVGButton(
  '#plot_container svg',
  'Download (.svg)',
  'plot.svg',
)
```

```js
// depends on the dataset, so these settings are reset when another file is loaded
const columnInput = (label, value = data.columns[0]) =>
  Inputs.select(data.columns.concat([null]), { label, value })

const plot_settings_form = Inputs.form(
  {
    x: columnInput('X column'),
    y: columnInput('Y column', data.columns[1] ?? null),
    fx: columnInput('FX column', null),
    fy: columnInput('FY column', null),
    fill: Inputs.text({
      label: 'Fill (column or color)',
      value: '#3558A2',
      placeholder: '#3558A2',
      datalist: data.columns,
    }),
  },
  { template: formTemplate(3) },
)
```

```js
const plot_settings = Generators.input(plot_settings_form)
```

```js
// independent of the dataset, so these settings are kept when another file is loaded
const typeInput = (label) =>
  Inputs.radio(['number', 'category'], { label, value: 'number' })
const rangeInput = (label, extent, value) =>
  Inputs.range(extent, { label, value, step: 1 })

const plot_display_form = Inputs.form(
  {
    mark: Inputs.select(
      new Map([
        ['Auto', undefined],
        ['Area', 'area'],
        ['Bar', 'bar'],
        ['Cell', 'cell'],
        ['Dot', 'dot'],
        ['Line', 'line'],
      ]),
      { label: 'Plot type' },
    ),
    xType: typeInput('X type'),
    yType: typeInput('Y type'),
    fxType: typeInput('FX type'),
    fyType: typeInput('FY type'),
    fillType: typeInput('Fill type'),
    xZero: Inputs.toggle({ label: 'X includes zero' }),
    yZero: Inputs.toggle({ label: 'Y includes zero' }),
    width: rangeInput('Width (px)', [0, 2000], 700),
    height: rangeInput('Height (px)', [0, 2000], 500),
    marginTop: rangeInput('Top margin (px)', [0, 200], 30),
    marginBottom: rangeInput('Bottom margin (px)', [0, 200], 30),
    marginLeft: rangeInput('Left margin (px)', [0, 200], 30),
    marginRight: rangeInput('Right margin (px)', [0, 200], 30),
    xTickRotate: rangeInput('X tick rotation (degrees)', [-90, 90], 0),
    yTickRotate: rangeInput('Y tick rotation (degrees)', [-90, 90], 0),
  },
  { template: formTemplate(3) },
)
```

```js
const plot_display = Generators.input(plot_display_form)
```

```js
// accessor reading a column as a number or as a category
const columnAccessor = (column, type) =>
  type === 'number' ? (d) => Number(d[column]) : (d) => String(d[column])

const plot_options = {}
for (const channel of ['x', 'y', 'fx', 'fy']) {
  const column = plot_settings[channel]
  if (!column) continue
  const value = columnAccessor(column, plot_display[`${channel}Type`])
  plot_options[channel] =
    channel === 'x' || channel === 'y'
      ? // a toggle left off lets Plot decide whether to include zero
        { value, zero: plot_display[`${channel}Zero`] || undefined }
      : value
}
if (plot_settings.fill) {
  // a column name is read as a channel, anything else as a constant color
  plot_options.color = data.columns.includes(plot_settings.fill)
    ? columnAccessor(plot_settings.fill, plot_display.fillType)
    : plot_settings.fill
}
if (plot_display.mark) {
  plot_options.mark = plot_display.mark
}
console.debug('plot_options', plot_options)
```

## Pie chart

<!-- User parameters -->

<div class="card">
  ${pie_settings_form}
  <!-- $ -->
  <hr>
  ${pie_display_form}
  <!-- $ -->
  <hr>
  ${pie_legend_form}
  <!-- $ -->
  ${pie_labels_form}
  <!-- $ -->
</div>
<div id="pie_container" class="card">
  ${pie}
  <!-- $ -->
  <hr>
  ${pie_download_button}
  <!-- $ -->
</div>

```js
const pie_charts = {
  plain: { Chart: DonutChart, options: {} },
  legend: { Chart: DonutChartWithLegend, options: pie_legend },
  labels: { Chart: DonutChartWithLabels, options: pie_labels },
}

const pie = resize((width) => {
  const { Chart, options } = pie_charts[pie_display.chart_type]
  return new Chart(pie_data, {
    width: pie_display.width || width,
    keyMap: (d) => d[0],
    valueMap: (d) => d[1],
    colorMap: (d) => d[0],
    color: d3
      .scaleOrdinal(pie_display.color_scheme)
      .domain(pie_data.map((d) => d[0]))
      .unknown('grey'),
    innerRadiusRatio: pie_display.innerRadiusRatio,
    outerRadiusRatio: pie_display.outerRadiusRatio,
    startAngle: pie_display.arc_range[0],
    endAngle: pie_display.arc_range[1],
    sort: pie_display.sort,
    ...options,
  }).render()
})
```

```js
const pie_download_button = downloadSVGButton(
  '#pie_container svg.donut-chart',
  'Download (.svg)',
  'pie-chart.svg',
)
```

```js
// depends on the dataset, so these settings are reset when another file is loaded
const pie_settings_form = Inputs.form(
  {
    category: Inputs.select(data.columns, {
      label: 'Category column (slices)',
    }),
    value: Inputs.select(data.columns, {
      label: 'Value column (summed)',
      value: data.columns[1] ?? data.columns[0],
    }),
  },
  { template: formTemplate(2) },
)
```

```js
const pie_settings = Generators.input(pie_settings_form)
```

```js
// independent of the dataset, so these settings are kept when another file is loaded
const pie_display_form = Inputs.form(
  {
    chart_type: Inputs.select(
      new Map([
        ['With legend', 'legend'],
        ['With labels', 'labels'],
        ['Plain', 'plain'],
      ]),
      { label: 'Chart type' },
    ),
    // angles in radians, clockwise from 12 o'clock
    arc_range: Inputs.select(
      new Map([
        ['Full circle', [0, 2 * Math.PI]],
        ['Top half (gauge)', [-Math.PI / 2, Math.PI / 2]],
        ['Bottom half', [Math.PI / 2, (3 * Math.PI) / 2]],
        ['Right half', [0, Math.PI]],
        ['Left half', [Math.PI, 2 * Math.PI]],
        ['Three quarters', [(-3 * Math.PI) / 4, (3 * Math.PI) / 4]],
      ]),
      { label: 'Arc range' },
    ),
    sort: Inputs.select(
      new Map([
        ['Largest first', (a, b) => d3.descending(a[1], b[1])],
        ['Alphabetical', (a, b) => d3.ascending(a[0], b[0])],
        ['Order in file', null],
      ]),
      { label: 'Slice order' },
    ),
    color_scheme: Inputs.select(
      new Map([
        ['Observable 10', d3.schemeObservable10],
        ['Category 10', d3.schemeCategory10],
        ['Tableau 10', d3.schemeTableau10],
        ['Set 3', d3.schemeSet3],
      ]),
      { label: 'Color scheme' },
    ),
    innerRadiusRatio: Inputs.range([0, 1], {
      label: 'Inner radius ratio',
      value: 0.5,
      step: 0.01,
    }),
    outerRadiusRatio: Inputs.range([0, 1], {
      label: 'Outer radius ratio',
      value: 0.9,
      step: 0.01,
    }),
    // left empty, the chart fits the page width
    width: Inputs.number([1, Infinity], {
      label: 'SVG width (px)',
      step: 1,
      placeholder: 'fit to page',
    }),
  },
  { template: formTemplate(3) },
)
```

```js
const pie_display = Generators.input(pie_display_form)
```

```js
// legend chart parameters, independent of the dataset
const pie_legend_form = Inputs.form(
  {
    legendWidthRatio: Inputs.range([0, 0.9], {
      label: 'Legend width ratio',
      value: 0.5,
      step: 0.01,
    }),
    legendFontSize: Inputs.number([1, Infinity], {
      label: 'Legend font size (px)',
      step: 1,
      value: 16,
    }),
    legendLineSeparation: Inputs.number([1, Infinity], {
      label: 'Legend line spacing (px)',
      step: 1,
      value: 25,
    }),
    legendTextLength: Inputs.number([1, Infinity], {
      label: 'Max legend text length (characters)',
      step: 1,
      value: 30,
    }),
  },
  { template: formTemplate(3) },
)
```

```js
const pie_legend = Generators.input(pie_legend_form)
```

```js
// label chart parameters, independent of the dataset
const pie_labels_form = Inputs.form(
  {
    fontSize: Inputs.number([1, Infinity], {
      label: 'Label font size (px)',
      step: 1,
      value: 18,
    }),
    labelTextLength: Inputs.number([1, Infinity], {
      label: 'Max label length (characters)',
      step: 1,
      value: 30,
    }),
    labelInnerRadiusRatio: Inputs.range([1, 2], {
      label: 'Leader line length (ratio of outer radius)',
      value: 1.05,
      step: 0.01,
    }),
    labelOuterRadiusRatio: Inputs.range([1, 2], {
      label: 'Label distance (ratio of leader line end)',
      value: 1,
      step: 0.01,
    }),
    labelTextPadding: Inputs.number([0, Infinity], {
      label: 'Label padding (px)',
      step: 1,
      value: 7,
    }),
    labelStrokeColor: Inputs.color({
      label: 'Leader line color',
      value: '#000000',
    }),
    labelStrokeWidth: Inputs.number([0, Infinity], {
      label: 'Leader line width (px)',
      step: 0.5,
      value: 2,
    }),
  },
  { template: formTemplate(3) },
)
```

```js
const pie_labels = Generators.input(pie_labels_form)
```

```js
// only show the parameters of the selected chart type
pie_legend_form.hidden = pie_display.chart_type !== 'legend'
pie_labels_form.hidden = pie_display.chart_type !== 'labels'
```

```js
// one [category, summed value] pair per category, in order of first appearance
const pie_data = d3.rollups(
  data,
  (D) => d3.sum(D, (d) => d[pie_settings.value]),
  (d) => d[pie_settings.category],
)
console.debug('pie_data', pie_data)
```

<!-- Helpers -->

```js
/**
 * Parse a delimited table, detecting the delimiter (tab, semicolon or comma)
 * from its header line and typing the values with d3.autoType.
 */
function parseTable(text) {
  const header = text.slice(0, text.search(/\r?\n|$/))
  const count = (c) => header.split(c).length - 1
  const delimiter = [',', ';', '\t'].reduce((best, c) =>
    count(c) > count(best) ? c : best,
  )
  return d3.dsvFormat(delimiter).parse(text, d3.autoType)
}
```

## Data view

### Pie slices

```js
display(
  Inputs.table(
    pie_data.map(([category, value]) => ({ category, value })),
    { layout: 'auto' },
  ),
)
```
