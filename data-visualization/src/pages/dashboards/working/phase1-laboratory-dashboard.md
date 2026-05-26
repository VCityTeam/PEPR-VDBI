---
sql:
  partners: /data/partners.csv
  labs: /data/labs.csv
  projects_by_partner: /data/projects_by_partner.csv
  lab_disciplines_ERC: /data/lab_disciplines_ERC.csv
  lab_disciplines_HCERES: /data/lab_disciplines_HCERES.csv
---

# PEPR VDBI laboratories

<div class="card">
  ${heatmap}
  <!-- $ -->

</div>
${downloadSVGButton(".card svg:nth-of-type(1)", "Download chart")}
<!-- $ -->
${downloadSVGButton(".card svg:nth-of-type(2)", "Download legend")}
<!-- $ -->

```js
import { project_color_scale } from '/components/color.js'
import { downloadSVGButton } from '/components/utilities.js'
```

```js
const debug = false
if (debug) {
  display('partners')
  display(Inputs.table(sql`select * from partners`))
  display('labs')
  display(Inputs.table(sql`select * from labs`))
  display('projects_by_partner')
  display(Inputs.table(sql`select * from projects_by_partner`))
  display('lab_disciplines_ERC')
  display(Inputs.table(sql`select * from lab_disciplines_ERC`))
  display('lab_disciplines_HCERES')
  display(Inputs.table(sql`select * from lab_disciplines_HCERES`))
  display('projects_by_disciplines')
  display(Inputs.table(projects_by_disciplines))
  display('projects_by_discipline count')
  display(
    Inputs.table(
      sql`select
          projet,
          regexp_extract(discipline, '[0-z]*') as discipline,
          count(),
        from lab_disciplines_ERC
        join projects_by_partner
        on lab_disciplines_ERC.lab = projects_by_partner.source_label
        group by all`,
    ),
  )
}
```

```sql id=erc_disciplines
select distinct discipline from lab_disciplines_ERC
```

```sql id=projects
select distinct projet from projects_by_partner
```

```sql id=projects_by_disciplines
select
  projet,
  regexp_extract(discipline, '[0-z]*') as discipline,
  discipline[:25] as full_discipline,
from lab_disciplines_ERC
join projects_by_partner
on lab_disciplines_ERC.lab = projects_by_partner.source_label
```

```js
function heatmapPlot() {
  return Plot.plot({
    title: 'Projets par disciplines ERC des laboratoires',
    width: 550,
    height: 600,
    marginRight: 160,
    marginBottom: 70,
    grid: true,
    x: {
      label: 'Projet',
      tickRotate: 30,
    },
    y: {
      label: 'Discipline ERC',
      axis: 'right',
      tickFormat: (d) => `${d.slice(0, 25)}...`,
    },
    color: {
      range: project_color_scale.range(),
      label: 'Project',
    },
    marks: [
      Plot.dot(
        projects_by_disciplines,
        Plot.group(
          { r: 'count' },
          {
            x: 'projet',
            y: 'full_discipline',
            fill: 'projet',
            stroke: 'black',
            strokeWidth: 0.5,
            tip: true,
          },
        ),
      ),
    ],
  })
}

// adapted from https://observablehq.com/@recifs/a-radius-legend-for-plot-665
// to resolve https://github.com/observablehq/plot/issues/236
function legendRadius(
  scale,
  {
    label = scale.label,
    ticks = 5,
    tickFormat = (d) => d,
    strokeWidth = 0.5,
    strokeDasharray = [5, 4],
    lineHeight = 8,
    gap = 20,
    style,
  } = {},
) {
  // const s = scale.scale;
  const s =
    scale.type === 'pow'
      ? d3.scalePow(scale.domain, scale.range).exponent(scale.exponent)
      : d3.scaleLinear(scale.domain, scale.range)

  const r0 = scale.range[1]
  const shiftY = label ? 10 : 0

  let h = Infinity
  const values = s
    .ticks(ticks)
    .reverse()
    .filter((t) => h - s(t) > lineHeight / 2 && (h = s(t)))

  return Plot.plot({
    width: 2 * r0 + 90,
    x: { type: 'identity', axis: null },
    r: { type: 'identity' },
    y: { type: 'identity', axis: null },
    marks: [
      Plot.link(values, {
        x1: r0 + 2,
        y1: (d) => 8 + 2 * r0 - 2 * s(d) + shiftY,
        x2: 2 * r0 + 2 + gap,
        y2: (d) => 8 + 2 * r0 - 2 * s(d) + shiftY,
        strokeWidth: strokeWidth / 2,
        strokeDasharray,
      }),
      Plot.dot(values, {
        r: s,
        x: r0 + 2,
        y: (d) => 8 + 2 * r0 - s(d) + shiftY,
        strokeWidth,
      }),
      Plot.text(values, {
        x: 2 * r0 + 2 + gap,
        y: (d) => 8 + 2 * r0 - 2 * s(d) + shiftY,
        textAnchor: 'start',
        dx: 4,
        text: tickFormat,
      }),
      Plot.text(label ? [label] : [], {
        x: 0,
        y: 6,
        textAnchor: 'start',
        fontWeight: 'bold',
        text: tickFormat,
      }),
    ],
    height: 2 * r0 + 10 + shiftY,
    style,
  })
}
```

```js
const heatmap = heatmapPlot()
```

```js
const legend = legendRadius(heatmap.scale('r'), {
  // ticks: 5,
  label: '# de disciplines',
})
heatmap.appendChild(legend)
```
