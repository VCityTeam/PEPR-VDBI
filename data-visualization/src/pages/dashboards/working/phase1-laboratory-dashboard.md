# PEPR VDBI laboratories

<div class="card">
  <h2>title</h2>
  <div style="height: 250px;">
    ${resize((width, height) => conditionHeatmap(width, height))}
  
  </div>
</div>

```js
import { extractPhase1Workbook } from "/components/phase1-workbook.js"
```

```js
import { project_color_scale } from "/components/color.js"
```

```js
const workbook = await FileAttachment(
  "/data/private/250120 PEPR_VBDI_analyse modifiée JYT.xlsx"
).xlsx()

const phase_1_data = extractPhase1Workbook(workbook, false, false, true)
display(phase_1_data)
```

```js
const erc_disciplines = new Set(
  phase_1_data.laboratories_by_disciplines_erc.map((d) => d.discipline)
)
const projects = new Set(phase_1_data.projects.map((d) => d.acronyme))

function conditionHeatmap(width, height) {
  return Plot.plot({
    width,
    height,
    marginRight: 10,
    marginLeft: 100,
    r: { range: [4, 20] },
    y: {
      domain: erc_disciplines,
      // domain: ["Undetermined", "Low", "Significant", "High"],
      label: "Hazard potential",
      grid: true,
      reverse: true,
    },
    x: {
      domain: projects,
      label: "Condition",
      grid: true,
    },
    color: { domain: projects, range: project_color_scale.range(), label: "Condition" },
    marks: [
      Plot.dot(
        phase_1_data.laboratories_by_disciplines_erc,
        Plot.group(
          { r: "count" },
          {
            y: "hazardPotential",
            x: "conditionAssessment",
            tip: true,
            fill: "conditionAssessment",
          }
        )
      ),
    ],
  })
}
```
