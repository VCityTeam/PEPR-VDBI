---
style: /css/vdbi-dashboard.css
---

<!--
created with code adapted from
https://observablehq.com/@observablehq/build-your-own-gantt-chart
-->

<!-- imports -->

```js
import {
  downloadPNGButton,
  downloadJSONButton,
  formTemplate,
} from '/components/utilities.js'
```

# Gantt chart generator

Upload a JSON file (.json) of tasks and groups to generate a gantt chart. Each task is drawn as a bar
from its `startDate` to its `endDate`, labelled with its `title` (or its `task` id when it has no
title) and colored by its `group`. Each group sets the color, and optionally the legend `title`, of
its tasks:

```json
{
  "tasks": [
    {
      "task": "task_id",
      "title": "Task title",
      "group": "group_id",
      "startDate": "YYYY-MM-DD",
      "endDate": "YYYY-MM-DD",
      "description": "Task description"
    },
    ...
  ],
  "colors": [
    {
      "group": "group_id",
      "title": "Group title",
      "color": "(css friendly) color"
    },
    ...
  ]
}
```

Tasks and groups can be added to the chart below it, and the edited chart downloaded back as a JSON
file.

```js
const json_file = view(Inputs.file({ accept: '.json', required: true }))
```

```js
const gantt_data = json_file.json()
```

```js
display(Inputs.table(gantt_data.tasks, { layout: 'auto' }))
display(Inputs.table(gantt_data.colors, { layout: 'auto' }))
```

<!-- User parameters -->

<div class="card">
  ${settings_form}
  <!-- $ -->
  <br>
  ${display_form}
  <!-- $ -->
</div>
<div id="gantt-chart" class="card">
  ${resize((width) => gantt(tasks, { ...settings, ...display_settings, width }))}
  <!-- $ -->
</div>
<div>
  ${png_button}
  <!-- $ -->
  ${json_button}
  <!-- $ -->
</div>

```js
const png_button = downloadPNGButton('gantt-chart')
```

```js
const json_button = downloadJSONButton(
  () => ({
    tasks: tasks.map((d) => ({
      task: d.task ?? undefined,
      title: d.title ?? undefined,
      group: d.group ?? undefined,
      startDate: d.startDate ?? undefined,
      endDate: d.endDate ?? undefined,
      description: d.description ?? undefined,
    })),
    colors,
  }),
  { filename: 'gantt.json' },
)
```

```js
// copied, so that added tasks and groups do not modify the uploaded data
const tasks = gantt_data.tasks.map((d) => ({ ...d }))
const colors = gantt_data.colors.map((d) => ({ ...d }))
const parser = d3.utcParse('%Y-%m-%d')
```

```js
// depends on the dataset, so these settings are reset when another file is loaded
const settings_form = Inputs.form(
  {
    plotHeight: Inputs.range([15 * tasks.length, 100 * tasks.length], {
      label: 'Plot height',
      step: 1,
      value: 50 * tasks.length,
    }),
  },
  { template: formTemplate() },
)
```

```js
const settings = Generators.input(settings_form)
```

```js
// independent of the dataset, so these settings are kept when another file is loaded
const display_form = Inputs.form(
  {
    // left empty, the chart fits the page width
    plotWidth: Inputs.number([100, Infinity], {
      label: 'Plot width (px)',
      step: 1,
      placeholder: 'fit to page',
    }),
    barHeight: Inputs.range([0, 20], {
      label: 'Adjust bar height',
      step: 1,
      value: 1,
    }),
    textPositionX: Inputs.range([-50, 50], {
      label: 'Label X dodge',
      step: 1,
      value: 5,
    }),
    textPositionY: Inputs.range([-50, 50], {
      label: 'Label Y dodge',
      step: 1,
      value: 0,
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
    marginLeft: Inputs.range([0, 100], {
      label: 'Left Margin',
      step: 1,
      value: 20,
    }),
    marginRight: Inputs.range([0, 100], {
      label: 'Right Margin',
      step: 1,
      value: 20,
    }),
  },
  { template: formTemplate(3) },
)
```

```js
const display_settings = Generators.input(display_form)
```

## Edit the chart

<div class="card">
  <h2>Add a new task</h2>
  ${new_task_form}
  <!-- $ -->
  ${Inputs.button('Add task', { reduce: update_tasks })}
  <!-- $ -->
  <hr>
  <h2>Add a new group</h2>
  ${new_group_form}
  <!-- $ -->
  ${Inputs.button('Add group', { reduce: update_groups })}
  <!-- $ -->
</div>

```js
const new_task_form = Inputs.form(
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
  { template: formTemplate() },
)
```

```js
const new_task = Generators.input(new_task_form)
```

```js
const new_group_form = Inputs.form(
  {
    group: Inputs.text({
      value: undefined,
      label: 'Group name',
      required: true,
    }),
    color: Inputs.color({ value: undefined, label: 'Group color' }),
  },
  { template: formTemplate() },
)
```

```js
const new_group = Generators.input(new_group_form)
```

```js
const invalidator_2 = refresh

const getGroupTitle = (d) => {
  const color = colors.find((c) => c.group === d.group)
  return color.title ? color.title : color.group
}

tasks.forEach((d) => {
  d.midpoint = new Date(
    parser(d.startDate).getTime() +
      (parser(d.endDate).getTime() - parser(d.startDate).getTime()) / 2,
  )
})

const domainByGroup = d3
  .groups(tasks, (d) => getGroupTitle(d))
  .sort((a, b) => d3.ascending(a.startDate, b.startDate))
  .map((d) => d[0])

const minDate = d3.min(tasks.map((d) => parser(d.startDate)))
const maxDate = d3.max(tasks.map((d) => parser(d.endDate)))

const global_midpoint = new Date(
  minDate.getTime() + (maxDate.getTime() - minDate.getTime()) / 2,
)

const colorMap = new Map(
  colors.map((obj) => [obj.title ? obj.title : obj.group, obj.color]),
)

const color_list = domainByGroup.map((d) => colorMap.get(d))

const titleFormat = (d) =>
  `Team: ${d.group}\nTask: ${d.task}\nDescription: ${d.description}\n` +
  `Start: ${d.startDate}\nEnd: ${d.endDate}`
```

```js
const gantt = (tasks, settings) =>
  Plot.plot({
    height: settings.plotHeight,
    // an emptied number field is NaN
    width: settings.plotWidth || settings.width,
    marginLeft: settings.marginLeft,
    marginRight: settings.marginRight,
    x: {
      axis: 'both',
      grid:
        (settings.gridlines == 'x') | (settings.gridlines == 'both')
          ? true
          : null,
    },
    y: {
      domain: tasks
        .sort((a, b) => d3.ascending(a.startDate, b.startDate))
        .map((d) => d.task),
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
    marks: [
      Plot.barX(tasks, {
        y: 'task',
        x1: (d) => parser(d.startDate),
        x2: (d) =>
          d.startDate === d.endDate
            ? parser(d.endDate).setDate(parser(d.endDate).getDate() + 1)
            : parser(d.endDate),
        fill: (d) => getGroupTitle(d),
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
