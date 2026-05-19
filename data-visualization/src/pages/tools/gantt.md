# Gantt chart generator

<!--
created with code adapted from
https://observablehq.com/@observablehq/build-your-own-gantt-chart
-->

```js
import {
  downloadPNGButton,
  downloadJSONButton,
  formTemplate,
} from '/components/utilities.js'
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

```js
const data = await upload.json()
const tasks = data.tasks
const colors = data.colors
const width = Generators.width(document.querySelector('main'))
const parser = d3.utcParse('%Y-%m-%d')
```

<div class="card" id="gantt-settings">

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
    { template: formTemplate },
  ),
)
```

</div>

<div class="card" id="gantt-chart">${gantt(tasks, settings)}</div>

```js
display(downloadPNGButton('gantt-chart'))
display(
  downloadJSONButton(() => ({
    tasks: tasks.map((d) => ({
      task: d.task ?? undefined,
      title: d.title ?? undefined,
      group: d.group ?? undefined,
      startDate: d.startDate ?? undefined,
      endDate: d.endDate ?? undefined,
      description: d.description ?? undefined,
    })),
    colors,
  })),
)
```

<div class="card">

<h2>Add a new task</h2>

```js
const new_task = view(
  Inputs.form(
    {
      task: Inputs.text({
        value: undefined,
        label: 'Task name',
        required: true,
      }),
      title: Inputs.text({ value: undefined, label: 'Task title' }),
      group: Inputs.select(colorMap.keys(), { label: 'Group name' }),
      startDate: Inputs.date({
        value: undefined,
        label: 'Start date',
        required: true,
      }),
      endDate: Inputs.date({
        value: undefined,
        label: 'End date',
        required: true,
      }),
      description: Inputs.text({ value: undefined, label: 'Description' }),
    },
    { template: formTemplate },
  ),
)
```

```js
const add_task = view(Inputs.button('Add task', { reduce: update_tasks }))
```

---

<h2>Add a new group</h2>

```js
const new_group = view(
  Inputs.form(
    {
      group: Inputs.text({
        value: undefined,
        label: 'Group name',
        required: true,
      }),
      color: Inputs.color({ value: undefined, label: 'Group color' }),
    },
    { template: formTemplate },
  ),
)
```

```js
const add_group = view(Inputs.button('Add group', { reduce: update_groups }))
```

</div>

```js
const invalidator_2 = refresh

tasks.forEach((d) => {
  d.midpoint = new Date(
    parser(d.startDate).getTime() +
      (parser(d.endDate).getTime() - parser(d.startDate).getTime()) / 2,
  )
})

const domainByDate = tasks
  .sort((a, b) => d3.ascending(a.startDate, b.startDate))
  .map((d) => d.task)

const domainByGroup = d3
  .groups(tasks, (d) => d.group)
  .sort((a, b) => d3.ascending(a.startDate, b.startDate))
  .map((d) => d[0])

const minDate = d3.min(tasks.map((d) => parser(d.startDate)))
const maxDate = d3.max(tasks.map((d) => parser(d.endDate)))

const global_midpoint = new Date(
  minDate.getTime() + (maxDate.getTime() - minDate.getTime()) / 2,
)

const colorMap = new Map(colors.map((obj) => [obj.group, obj.color]))

const color_list = domainByGroup.map((d) => colorMap.get(d))

const titleFormat = (d) =>
  `Team: ${d.group}\nTask: ${d.task}\nDescription: ${d.description}\n` +
  `Start: ${d.startDate}\nEnd: ${d.endDate}`
```

```js
const gantt = (tasks, settings) =>
  Plot.plot({
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
      Plot.text(
        d3.filter(tasks, (d) => d.midpoint <= global_midpoint),
        {
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
        },
      ),
      Plot.text(
        d3.filter(tasks, (d) => d.midpoint > global_midpoint),
        {
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
        },
      ),
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
      axis: 'both',
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
    color: {
      domain: domainByGroup,
      range: color_list,
      unknown: 'gray',
      legend: true,
    },
  })
```

```js
const format_date = (date) => d3.timeFormat('%Y-%m-%d')(date)

const update_tasks = () => {
  tasks.push({
    task: new_task.task,
    title: new_task.title === '' ? new_task.task : new_task.title,
    group: new_task.group,
    startDate: format_date(new_task.startDate),
    endDate: format_date(new_task.endDate),
    description: new_task.description === '' ? null : new_task.description,
  })
  console.debug('tasks updated', tasks)
  flip()
}

const update_groups = () => {
  colors.push({
    group: new_group.group,
    color: new_group.color,
  })
  console.debug('colors updated', colors)
  flip()
}
```

```js
const refresh = Mutable(true)
const flip = () => (refresh.value = !refresh.value)
```
