---
style: /css/vdbi-page.css
---

# Plot Generator

Upload a csv, tsv or dsv file.

```js
const file = view(
  Inputs.file({
    label: `File`,
    required: true,
  }),
)

const delimeter = view(
  Inputs.radio(['CSV', 'TSV', 'DSV'], {
    label: 'Delimeter',
    value: 'TSV',
  }),
)
```

Uploaded data:

```js
let data = []
if (delimeter === 'CSV') {
  data = await file.csv({ typed: true })
} else if (delimeter === 'TSV') {
  data = await file.tsv({ typed: true })
} else if (delimeter === 'DSV') {
  data = await file.dsv({ typed: true })
} else {
  throw new Error('Invalid delimeter')
}

display(Inputs.table(data))
console.debug('data', data)
```

## ${formatted_plot_options.mark || "Auto"} Plot

```js
const plot_config = view(
  Inputs.form(
    {
      x: Inputs.select(data.columns.concat([null]), {
        label: 'X Column:',
      }),
      xType: Inputs.radio(['number', 'category'], {
        label: 'X Type:',
      }),
      xZero: Inputs.toggle({
        label: 'X Zero:',
      }),
      y: Inputs.select(data.columns.concat([null]), {
        label: 'Y Column:',
      }),
      yType: Inputs.radio(['number', 'category'], {
        label: 'Y Type:',
      }),
      yZero: Inputs.toggle({
        label: 'Y Zero:',
      }),
      fx: Inputs.select(data.columns.concat([null]), {
        label: 'FX Column:',
        value: null,
      }),
      fxType: Inputs.radio(['number', 'category'], {
        label: 'FX Type:',
      }),
      fxZero: Inputs.toggle({
        label: 'FX Zero:',
      }),
      fy: Inputs.select(data.columns.concat([null]), {
        label: 'FY Column:',
        value: null,
      }),
      fyType: Inputs.radio(['number', 'category'], {
        label: 'FY Type:',
      }),
      fyZero: Inputs.toggle({
        label: 'FY Zero:',
      }),
      mark: Inputs.select(
        [
          undefined,
          'area',
          'bar',
          // "rect",
          'cell',
          'dot',
          'line',
          // "rule"
        ],
        {
          label: 'Plot type:',
          // value: "bar",
        },
      ),
      fill: Inputs.text({
        label: 'Fill Column:',
        value: '#3558A2',
        placeholder: '#3558A2',
        datalist: data.columns,
      }),
      fillType: Inputs.radio(['number', 'category'], {
        label: 'Fill Type:',
      }),
      width: Inputs.range([0, 2000], {
        label: 'Width:',
        value: 700,
        step: 1,
      }),
      height: Inputs.range([0, 2000], {
        label: 'Height:',
        value: 500,
        step: 1,
      }),
      marginTop: Inputs.range([0, 200], {
        label: 'Top margin:',
        value: 30,
        step: 1,
      }),
      marginBottom: Inputs.range([0, 200], {
        label: 'Bottom margin:',
        value: 30,
        step: 1,
      }),
      marginLeft: Inputs.range([0, 200], {
        label: 'Left margin:',
        value: 30,
        step: 1,
      }),
      marginRight: Inputs.range([0, 200], {
        label: 'Right margin:',
        value: 30,
        step: 1,
      }),
      xTickRotate: Inputs.range([-90, 90], {
        label: 'X tick rotate:',
        value: 0,
        step: 1,
      }),
      yTickRotate: Inputs.range([-90, 90], {
        label: 'Y tick rotate:',
        value: 0,
        step: 1,
      }),
    },
    {
      template: (inputs) =>
        html`<div
          style="
            display: flex;
            flex-flow: wrap;
            column-gap: 2em;
            columns: 3;
          "
        >
          ${Object.values(inputs)}
        </div>`,
    },
  ),
)
```

```js
const formatted_plot_options = {}

if (plot_config.x) {
  formatted_plot_options.x = (d) =>
    plot_config.xType === 'number'
      ? Number(d[plot_config.x])
      : String(d[plot_config.x])
  formatted_plot_options.xZero = true
}

if (plot_config.y) {
  formatted_plot_options.y = (d) =>
    plot_config.yType === 'number'
      ? Number(d[plot_config.y])
      : String(d[plot_config.y])
  formatted_plot_options.yZero = true
}

if (plot_config.fx) {
  formatted_plot_options.fx = (d) =>
    plot_config.fxType === 'number'
      ? Number(d[plot_config.fx])
      : String(d[plot_config.fx])
  formatted_plot_options.fxZero = true
}

if (plot_config.fy) {
  formatted_plot_options.fy = (d) =>
    plot_config.fyType === 'number'
      ? Number(d[plot_config.fy])
      : String(d[plot_config.fy])
  formatted_plot_options.fyZero = true
}

if (plot_config.fill) {
  formatted_plot_options.color = (d) =>
    plot_config.fillType === 'number'
      ? Number(d[plot_config.fill])
      : String(d[plot_config.fill])
}

if (plot_config.mark) {
  formatted_plot_options.mark = plot_config.mark
}
```

<div id="plot" class="card">
  ${Plot.auto(data, formatted_plot_options).plot({
    width: plot_config.width,
    height: plot_config.height,
    x: { tickRotate: plot_config.xTickRotate },
    y: { tickRotate: plot_config.yTickRotate },
    marginTop: plot_config.marginTop,
    marginBottom: plot_config.marginBottom,
    marginLeft: plot_config.marginLeft,
    marginRight: plot_config.marginRight,
  })}<!-- $ -->

${downloadSVGButton("#plot svg")}<!-- $ -->

</div>

## Pie Chart

```js
import { DonutChartWithLegend } from '/components/pie-chart.js'
import { downloadSVGButton } from '/components/utilities.js'
```

```js
const pie_config = view(
  Inputs.form({
    x: Inputs.select(data.columns, {
      label: 'X Column',
    }),
    y: Inputs.select(data.columns, {
      label: 'Y Column',
    }),
    fill: Inputs.select(data.columns, {
      label: 'Fill Column',
    }),
    color_scheme: Inputs.select(
      new Map([
        ['schemeObservable10', d3.schemeObservable10],
        // ["schemeObservable9", d3.schemeObservable9],
      ]),
      {
        value: 'schemeObservable10',
        label: 'Color scheme:',
      },
    ),
    legendWidth: Inputs.range([0, 500], {
      value: 150,
      label: 'Legend offset:',
    }),
    innerRadiusRatio: Inputs.range([0, 1], {
      value: 0.5,
      label: 'Inner radius ratio:',
    }),
    outerRadiusRatio: Inputs.range([0, 1], {
      value: 1,
      label: 'Outer radius ratio:',
    }),
    // legendTextCuttoff: Inputs.range([0, 200], {
    //   value: 50,
    //   label: "Legend text cuttoff:",
    // }),
  }),
)
```

<div id="pie" class="card">
  ${resize(
    (width) =>
      new DonutChartWithLegend(
        d3.rollups(
          data,
          (D) => D.reduce((a, v) => a + v[pie_config.y], 0),
          (d) => d[pie_config.x]),
        {
          width: width,
          keyMap: (d) => d[0],
          valueMap: (d) => d[1],
          colorMap: (d) => d[0],
          color: d3
            .scaleOrdinal(pie_config.color_scheme)
            .domain(new Set(data.map((d) => d[pie_config.x])))
            .unknown("grey"),
          innerRadiusRatio: pie_config.innerRadiusRatio,
          outerRadiusRatio: pie_config.outerRadiusRatio,
          legendWidth: pie_config.legendWidth,
        }
      ).render()
  )}<!-- $ -->

${downloadSVGButton("#pie svg.donut-chart")}<!-- $ -->

</div>

```js
const refresh = Mutable(true)
const flip = () => (refresh.value = !refresh.value)
```
