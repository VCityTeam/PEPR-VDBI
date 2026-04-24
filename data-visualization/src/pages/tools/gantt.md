# Gantt chart generator

<!--
created with code adapted from
https://observablehq.com/@observablehq/build-your-own-gantt-chart
-->

```js
import { downloadPNGButton } from '/components/utilities.js'
```

Upload a JSON file containing the gantt tasks and color settings
using the following format:

```json
{
  "tasks": [
    {
      "task": "Task name",
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
// const upload = view(Inputs.file({ accept: '.json', required: true }))
const upload = {
  tasks: [
    {
      task: "Webinaires de présentation de la phase 2 de l'AAP",
      group: 'Webinaire',
      startDate: '2025-12-08',
      endDate: '2026-01-05',
    },
    {
      task: 'Webinaires VDBI – Projet TRACES',
      group: 'Webinaire',
      startDate: '2025-12-16',
      endDate: '2025-12-17',
    },
    {
      task: 'Webinaires VDBI – Projet NEO',
      group: 'Webinaire',
      startDate: '2025-12-02',
      endDate: '2025-12-03',
    },
    {
      task: 'Webinaires VDBI – Projet INTEGREEN',
      group: 'Webinaire',
      startDate: '2025-11-20',
      endDate: '2025-11-21',
    },
    {
      task: 'Webinaires VDBI – Projet WHAOU',
      group: 'Webinaire',
      startDate: '2025-10-07',
      endDate: '2025-10-08',
    },
    {
      task: 'Webinaires VDBI – Projet URBHEALTH',
      group: 'Webinaire',
      startDate: '2025-09-16',
      endDate: '2025-09-17',
    },
    {
      task: 'Webinaires VDBI – Projet VilleGarden',
      group: 'Webinaire',
      startDate: '2025-07-08',
      endDate: '2025-07-09',
    },
    {
      task: 'Webinaires VDBI – Projet RESILIENCE',
      group: 'Webinaire',
      startDate: '2025-06-17',
      endDate: '2025-06-18',
    },
    {
      task: 'Webinaires VDBI – Projet VF++',
      group: 'Webinaire',
      startDate: '2025-06-03',
      endDate: '2025-06-04',
    },
    {
      task: 'Webinaires VDBI – CO SIVDBI',
      group: 'Webinaire',
      startDate: '2025-05-20',
      endDate: '2025-05-21',
    },
    {
      task: 'CO MESAP : Rencontre du Forum urbain - La colère des quartiers populaires',
      group: 'Evènement',
      startDate: '2025-05-15',
      endDate: '2025-05-16',
    },
    {
      task: 'Premières rencontres scientifiques du CO MISCIB',
      group: 'Evènement',
      startDate: '2025-05-12',
      endDate: '2025-05-13',
    },
    {
      task: 'CO MESAP : La ville dans la science-fiction : quels récits des possibles urbains?',
      group: 'Evènement',
      startDate: '2025-04-17',
      endDate: '2025-04-18',
    },
    {
      task: 'Webinaires VDBI – CO MISCIB',
      group: 'Webinaire',
      startDate: '2025-03-20',
      endDate: '2025-03-21',
    },
    {
      task: '1er Colloque annuel du CO SIVDBI',
      group: 'Evènement',
      startDate: '2025-03-21',
      endDate: '2025-03-22',
    },
    {
      task: 'Rencontre MESAP',
      group: 'Evènement',
      startDate: '2025-02-20',
      endDate: '2025-02-21',
    },
    {
      task: 'Journée recherche européeen',
      group: 'Evènement',
      startDate: '2025-02-04',
      endDate: '2025-02-05',
    },
    {
      task: 'Atelier IA FRUGALE',
      group: 'Evènement',
      startDate: '2025-01-23',
      endDate: '2025-01-24',
    },
    // {
    //   task: 'Première journées scientifiques du PEPR',
    //   group: 'Evènement',
    //   startDate: '2023-10-16',
    //   endDate: '2023-10-18',
    // },
    // {
    //   task: 'Journées scientifiques 2024',
    //   group: 'Evènement',
    //   startDate: '2024-11-20',
    //   endDate: '2024-11-22',
    // },
    {
      task: 'Journées scientifiques 2025',
      group: 'Evènement',
      startDate: '2025-11-03',
      endDate: '2025-11-05',
    },
    {
      task: 'Webinaire NEO « Territoire Apprenant » – Épisode 2',
      group: 'Webinaire',
      startDate: '2026-03-30',
      endDate: '2026-03-31',
    },
    {
      task: 'Projet VF++ - Des villes plus fraîches, par et pour leurs usagers',
      group: 'Webinaire',
      startDate: '2026-04-07',
      endDate: '2026-04-08',
    },
  ],
  colors: [
    {
      group: 'Réunion Comité',
      color: 'gold',
    },
    {
      group: 'Réunion Projets',
      color: 'orange',
    },
    {
      group: 'Réunion Centres Opérationnels',
      color: 'limegreen',
    },
    {
      group: 'Evènement',
      color: '#56B4e9',
    },
    {
      group: 'Webinaire',
      color: 'tomato',
    },
  ],
}
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
        x2: (d) => parser(d.endDate),
        fill: 'group',
        rx: settings.barRoundness,
        insetTop: settings.barHeight,
        insetBottom: settings.barHeight,
      }),
      Plot.text(d3.filter(tasks, (d) => parser(d.startDate) < midpoint), {
        y: 'task',
        x: (d) => parser(d.endDate),
        text: (d) => d.task,
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
        text: (d) => d.task,
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
  ${downloadPNGButton('gantt-chart')}
  <!-- $ -->
</div>

```js
const tasks = upload.tasks
const myColors = upload.colors

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
