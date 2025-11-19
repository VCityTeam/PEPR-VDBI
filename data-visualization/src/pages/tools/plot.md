---
style: /css/vdbi-page.css
---

# Plot Generator

Upload a csv file with the following structure:

```json
label,value
a,10
b,15
...
z,-5
```

```js
const csvfile = view(
  Inputs.file({ label: "CSV File", accept: ".csv", required: true })
)
```

```js
const selected_group = view(
  Inputs.toggle({
    label: "Group labels?",
    value: false,
  })
)
```

Uploaded data:

```js
const user_data = !selected_group
  ? await csvfile.csv({ typed: true })
  : d3
      .rollups(
        await csvfile.csv({ typed: true }),
        (D) => D.reduce((a, v) => a + v.value, 0),
        (d) => d.label
      )
      .map((d) => ({ label: d[0], value: d[1] }))
display(Inputs.table(user_data))
console.debug("user_data", user_data)
```

## ${selected_mark} Plot

```js
const selected_mark = view(
  Inputs.select(["area", "bar", "rect", "cell", "dot", "line", "rule"], {
    label: "Plot type:",
    value: "bar",
  })
)

const selected_plot_color_scheme = view(Inputs.select(["Blues", "Reds"]), {
  label: "Color scheme:",
  value: "Blues",
})
```

<div id="plot" class="card">
  ${resize(
    (width) =>
      Plot.auto(
        user_data,
        {
          x: (d) => String(d.label).trim(),
          y: (d) => Number(d.value),
          color: {
            value: (d) => String(d.label).trim(),
            scheme: selected_plot_color_scheme,
          },
          mark: selected_mark,
        }
      ).plot(
        // {color: {legend: true}}
      )
  )}<!-- $ -->
  
  ${downloadSVGButton("#plot svg")}<!-- $ -->
</div>

## Pie Chart

```js
import { donutChart } from "/components/pie-chart.js"
import { downloadSVGButton } from "/components/utilities.js"
```

```js
const selected_legendWidth = view(
  Inputs.range([0, 500], { value: 150, label: "Legend offset:" })
)
const selected_innerRadiusRatio = view(
  Inputs.range([0, 1], { value: 0.5, label: "Inner radius ratio:" })
)
const selected_outerRadiusRatio = view(
  Inputs.range([0, 1], { value: 1, label: "Outer radius ratio:" })
)
const selected_legendTextCuttoff = view(
  Inputs.range([0, 200], { value: 50, label: "Legend text cuttoff:" })
)
```

```js
const selected_pie_color_scheme = view(
  Inputs.select(
    new Map([
      ["schemeObservable10", d3.schemeObservable10],
      // ["schemeObservable9", d3.schemeObservable9],
    ]),
    {
      value: "schemeObservable10",
      label: "Color scheme:",
    }
  )
)
```

<div id="pie" class="card">
  ${resize(
    (width) =>
      donutChart(
        user_data,
        {
          width: width,
          height: width,
          keyMap: (d) => d.label,
          valueMap: (d) => d.value,
          color: d3
            .scaleOrdinal(selected_pie_color_scheme)
            .domain(user_data.map((d) => d.label))
            .unknown("grey"),
          innerRadiusRatio: selected_innerRadiusRatio,
          outerRadiusRatio: selected_outerRadiusRatio,
          majorLabelText: () => "",
          minorLabelText: () => "",
          legendWidth: selected_legendWidth,
        }
      )
  )}<!-- $ -->

${downloadSVGButton("#pie svg.donut-chart")}<!-- $ -->

</div>
