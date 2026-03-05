---
style: /css/vdbi-page.css
---

# Chord diagram generator

```js
import { chordDiagram } from '/components/chord.js'
import { extractPhase1Workbook } from '/data/utilities/phase1-workbook.js'
import {
  project_color_scale,
  legal_nature_colors,
  interpolated_legal_nature_color,
} from '/components/color.js'
import { downloadSVGButton } from '/components/utilities.js'
```

```js
const generate_project_partner_chord = (matrix) =>
  chordDiagram(
    matrix,
    projects,
    projects.map((d) => project_color_scale(d)),
  )

const selected_dataset = view(
  Inputs.select(
    new Map([
      ['all project partners', project_all_intersection_matrix],
      [
        'socioeconomic project partners',
        project_socioeconomic_intersection_matrix,
      ],
      ['project labs', project_lab_intersection_matrix],
      ['project institutions', project_institute_intersection_matrix],
    ]),
  ),
)
```

<div class="card">
  ${generate_project_partner_chord(selected_dataset)}
  ${downloadSVGButton(".card svg")}
</div>

## Data view

### Input data

```js
display(phase_1_data.projects)
display(partners_by_all)
display(partners_by_labs)
display(partners_by_socioeconomic)
display(partners_by_institute)
```

### Matrix

${projects.join(", ")}
${Inputs.table(selected_dataset)}

```js
const workbook = await FileAttachment(
  '/data/private/251127 VDBI Base Connaissance vdef jyt.xlsx',
).xlsx()
const phase_1_data = extractPhase1Workbook(workbook, false, new Map(), true)

const projects = phase_1_data.projects.map((d) => d.acronyme)
```

```js
const partners_by_labs = new Map(
  phase_1_data.projects.map((d) => [d.acronyme, new Set(d.labs)]),
)
console.debug('partners_by_labs', partners_by_labs)

const total_labs = new Set(d3.merge(partners_by_labs.values())).size
console.debug('total_labs', total_labs)

const project_lab_intersection_matrix = d3
  .cross(
    partners_by_labs.values(),
    partners_by_labs.values(),
    (a, b) => a.intersection(b).size / total_labs,
  )
  // https://stackoverflow.com/questions/4492385/convert-simple-array-into-two-dimensional-array-matrix
  .reduce(
    (matrix, key, index) =>
      (index % partners_by_labs.size == 0
        ? matrix.push([key])
        : matrix[matrix.length - 1].push(key)) && matrix,
    [],
  )
console.debug('project_lab_intersection_matrix', [
  ...project_lab_intersection_matrix,
])
```

```js
const partners_by_socioeconomic = new Map(
  phase_1_data.projects.map((d) => [d.acronyme, new Set(d.partners)]),
)
console.debug('partners_by_socioeconomic', partners_by_socioeconomic)

const total_socioeconomic = new Set(
  d3.merge(partners_by_socioeconomic.values()),
).size
console.debug('total_socioeconomic', total_socioeconomic)

const project_socioeconomic_intersection_matrix = d3
  .cross(
    partners_by_socioeconomic.values(),
    partners_by_socioeconomic.values(),
    (a, b) => a.intersection(b).size / total_socioeconomic,
  )
  // https://stackoverflow.com/questions/4492385/convert-simple-array-into-two-dimensional-array-matrix
  .reduce(
    (matrix, key, index) =>
      (index % partners_by_socioeconomic.size == 0
        ? matrix.push([key])
        : matrix[matrix.length - 1].push(key)) && matrix,
    [],
  )
console.debug('project_socioeconomic_intersection_matrix', [
  ...project_socioeconomic_intersection_matrix,
])
```

```js
const partners_by_institute = new Map(
  phase_1_data.projects.map((d) => [d.acronyme, new Set(d.institutions)]),
)
console.debug('partners_by_institute', partners_by_institute)

const total_institute = new Set(d3.merge(partners_by_institute.values())).size
console.debug('total_institute', total_institute)

const project_institute_intersection_matrix = d3
  .cross(
    partners_by_institute.values(),
    partners_by_institute.values(),
    (a, b) => a.intersection(b).size / total_institute,
  )
  // https://stackoverflow.com/questions/4492385/convert-simple-array-into-two-dimensional-array-matrix
  .reduce(
    (matrix, key, index) =>
      (index % partners_by_institute.size == 0
        ? matrix.push([key])
        : matrix[matrix.length - 1].push(key)) && matrix,
    [],
  )
console.debug('project_institute_intersection_matrix', [
  ...project_institute_intersection_matrix,
])
```

```js
const partners_by_all = new Map(
  phase_1_data.projects.map((d) => [
    d.acronyme,
    new Set(d.partners).union(new Set(d.labs).union(new Set(d.institutions))),
  ]),
)
console.debug('partners_by_all', partners_by_all)

const total_all = new Set(d3.merge(partners_by_all.values())).size
console.debug('total_all', total_all)

const project_all_intersection_matrix = d3
  .cross(
    partners_by_all.values(),
    partners_by_all.values(),
    (a, b) => a.intersection(b).size / total_all,
  )
  // https://stackoverflow.com/questions/4492385/convert-simple-array-into-two-dimensional-array-matrix
  .reduce(
    (matrix, key, index) =>
      (index % partners_by_all.size == 0
        ? matrix.push([key])
        : matrix[matrix.length - 1].push(key)) && matrix,
    [],
  )
console.debug('project_all_intersection_matrix', [
  ...project_all_intersection_matrix,
])
```
