# Gantt chart generator

<!--
created with code adapted from
https://observablehq.com/@observablehq/build-your-own-gantt-chart
-->

```js
import { downloadPNGButton } from '/components/utilities.js'
```

To get started, upload a JSON file containing the gantt tasks and color settings
using the following format:

```json
{
  "tasks": [
    {
      "task": "Task name",
      "title": "Task title",
      "group": "Group name",
      "startDate": "YYYY-MM-DD",
      "endDate": "YYYY-MM-DD",
      "description": "Task description"
    },
    ...
  ],
  "colors": [
    {
      "group": "Group name",
      "color": "color name"
    },
    ...
  ]
}
```

```js
const upload = view(Inputs.file({ accept: '.json', required: true }))
```

<div class="card" id="gantt-settings">

```js
const width = Generators.width(document.querySelector('main'))
```

```js
const settings = view(
  Inputs.form(
    {
      plotHeight: Inputs.range([15 * tasks.length, 100 * tasks.length], {
        label: 'Plot height',
        step: 1,
        value: 30 * tasks.length,
      }),
      plotWidth: Inputs.range([100, width], {
        label: 'Plot width',
        step: 1,
        value: width,
      }),
      barHeight: Inputs.range([0, 20], {
        label: 'Adjust bar height',
        step: 1,
        value: 0,
      }),
      textPositionX: Inputs.range([-50, 50], {
        label: 'Label X dodge',
        step: 1,
        value: 5,
      }),
      textPositionY: Inputs.range([-50, 50], {
        label: 'Label Y dodge',
        step: 1,
      }),
      fontSize: Inputs.range([8, 24], {
        label: 'Font size',
        step: 1,
        value: 14,
      }),
      barRoundness: Inputs.range([0, 20], {
        label: 'Bar roundness',
        step: 1,
        value: 3,
      }),
      gridlines: Inputs.radio(['x', 'y', 'both', 'none'], {
        label: 'Gridlines',
        value: 'x',
      }),
      panelBorder: Inputs.radio(['show', 'hide'], {
        label: 'Panel border',
        value: 'hide',
      }),
    },
    { template: settings_template },
  ),
)
```

</div>

<div class="card" id="gantt-chart">
  ${Plot.plot({
    marks: [
      Plot.frame({ stroke: settings.panelBorder == 'show' ? '#ccc' : null }),
      Plot.barX(tasks, {
        y: 'task',
        x1: (d) => parser(d.startDate),
        x2: (d) =>
          d.startDate === d.endDate
            ? parser(d.endDate).setDate(parser(d.endDate).getDate() + 1)
            : parser(d.endDate),
        fill: 'group',
        rx: settings.barRoundness,
        insetTop: settings.barHeight,
        insetBottom: settings.barHeight,
      }),
      Plot.text(d3.filter(tasks, (d) => parser(d.startDate) < midpoint), {
        y: 'task',
        x: (d) => parser(d.endDate),
        text: (d) => d.title ?? d.task,
        textAnchor: 'start',
        dx: settings.textPositionX,
        dy: settings.textPositionY,
        fontSize: settings.fontSize,
        stroke: 'white',
        fill: 'dimgray',
        fontWeight: 500,
      }),
      Plot.text(d3.filter(tasks, (d) => parser(d.startDate) > midpoint), {
        y: 'task',
        x: (d) => parser(d.startDate),
        text: (d) => d.title ?? d.task,
        textAnchor: 'end',
        dx: -settings.textPositionX,
        dy: settings.textPositionY,
        fontSize: settings.fontSize,
        stroke: 'white',
        fill: 'dimgray',
        fontWeight: 500,
      }),
      Plot.tip(
        tasks,
        Plot.pointerY({
          y: 'task',
          x1: (d) => parser(d.startDate),
          x2: (d) => parser(d.endDate),
          title: titleFormat,
        }),
      ),
    ],
    height: settings.plotHeight,
    width: settings.plotWidth,
    x: {
      grid:
        (settings.gridlines == 'x') | (settings.gridlines == 'both')
          ? true
          : null,
    },
    y: {
      domain: domainByDate,
      label: null,
      tickFormat: null,
      tickSize: null,
      grid:
        (settings.gridlines == 'y') | (settings.gridlines == 'both')
          ? true
          : null,
    },
    color: { domain: domainByGroup, range: colors, legend: true },
  })}
  <!-- $ -->
</div>

${downloadPNGButton('gantt-chart')}
<!-- $ -->

```js
const data = await upload.json()

const tasks = data.tasks
const myColors = data.colors

const domainByDate = tasks
  .sort((a, b) => d3.ascending(a.startDate, b.startDate))
  .map((d) => d.task)

const domainByGroup = d3
  .groups(tasks, (d) => d.group)
  .sort((a, b) => d3.ascending(a.startDate, b.startDate))
  .map((d) => d[0])

const parser = d3.utcParse('%Y-%m-%d')

const minDate = d3.min(tasks.map((d) => parser(d.startDate)))
const maxDate = d3.max(tasks.map((d) => parser(d.endDate)))

const midpoint = new Date(
  minDate.getTime() + (maxDate.getTime() - minDate.getTime()) / 2,
)

const colorMap = new Map(myColors.map((obj) => [obj.group, obj.color]))

const colors = domainByGroup.map((d) => colorMap.get(d))

const titleFormat = (d) =>
  `Team: ${d.group}\nTask: ${d.task}\nDescription: ${d.description}\n` +
  `Start: ${d.startDate}\nEnd: ${d.endDate}`

const settings_template = (inputs) =>
  html`<div class="styled">${Object.values(inputs)}</div>
    <style>
      div.styled {
        text-align: left;
        column-count: 2;
      }
      div.styled label {
        font-weight: bold;
        line-height: 200%;
      }
      div.styled label:not(div > label):after {
        content: ':';
      }
    </style>`
```
