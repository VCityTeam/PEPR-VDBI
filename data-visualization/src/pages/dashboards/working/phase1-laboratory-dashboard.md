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
  ${heatmap()}
  
</div>
${downloadSVGButton(".card svg")}
<!-- $ -->

```js
import { project_color_scale } from "/components/color.js"
import { downloadSVGButton } from "/components/utilities.js"
```

```js
const debug = false
if (debug) {
  display("partners")
  display(Inputs.table(sql`select * from partners`))
  display("labs")
  display(Inputs.table(sql`select * from labs`))
  display("projects_by_partner")
  display(Inputs.table(sql`select * from projects_by_partner`))
  display("lab_disciplines_ERC")
  display(Inputs.table(sql`select * from lab_disciplines_ERC`))
  display("lab_disciplines_HCERES")
  display(Inputs.table(sql`select * from lab_disciplines_HCERES`))
  display("projects_by_disciplines")
  display(Inputs.table(projects_by_disciplines))
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
function heatmap() {
  return Plot.plot({
    title: "Projets par disciplines ERC laboratoires",
    width: 500,
    height: 600,
    marginRight: 150,
    marginLeft: 10,
    marginBottom: 70,
    grid: true,
    // r: { range: [1, 15] },
    x: {
      label: "Projet",
      tickRotate: 30,
    },
    y: {
      label: "Discipline",
      axis: "right",
    },
    color: {
      range: project_color_scale.range(),
      label: "Project",
    },
    marks: [
      Plot.dot(
        projects_by_disciplines,
        Plot.group(
          { r: "count" },
          {
            x: "projet",
            y: "full_discipline",
            fill: "projet",
            stroke: "black",
            tip: true,
          }
        )
      ),
    ],
  })
}
```
