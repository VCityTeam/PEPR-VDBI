---
sql:
  AAP2_template_export: /data/AAP2_template_export.csv
  AAP2_submission_metadata: /data/private/AAP2_submission_metadata.csv
---

# AAP Phase 2 - PITT

## Survol des soumissions

```js
import * as page from './aap-overview.js'
import { cropText } from '/components/utilities.js'
```

## Chiffres clés

<div class="grid grid-cols-4">
  <div class="card">
    <h2>N° Projets <span class="muted">(Totale / Lauréats)</span></h2>
    <span class="big">
      <span class="muted">
        ${total_project_count.c.toLocaleString()}
        <!-- $ -->
      </span> / 0
      <!-- ${financed_project_count.c.toLocaleString()} -->
      <!-- $ -->
    </span>
  </div>
  <div class="card">
    <h2>N° Intitutions <span class="muted">(Totale / Lauréats)</span></h2>
    <span class="big">
      <span class="muted">
        ${[...all_institutions].length.toLocaleString()}
        <!-- $ -->
      </span> / 0
      <!-- ${financed_university_data.size.toLocaleString()} -->
      <!-- $ -->
    </span>
  </div>
  <div class="card">
    <h2>N° Unités <span class="muted">(Totale / Lauréats)</span></h2>
    <span class="big">
      <span class="muted">
        ${[...all_unites].length.toLocaleString()}
        <!-- $ -->
      </span> / 0
      <!-- ${financed_laboratory_data.size.toLocaleString()} -->
      <!-- $ -->
    </span>
  </div>
  <div class="card">
    <h2>N° Partenaires <span class="muted">(Totale / Lauréats)</span></h2>
    <span class="big">
      <span class="muted">
        ${[...all_partners].length.toLocaleString()}
        <!-- $ -->
      </span> / 0
      <!-- ${financed_partner_data.size.toLocaleString()} -->
      <!-- $ -->
    </span>
  </div>
</div>

## Projets par partenaires

<div class="grid grid-cols-3">
  <div class="card">
    <h2>Top 15 projets par n° d'institutions</h2>
    ${project_universities_laureate_input}
    <!-- $ -->
    ${project_universities_sort_input}
    <!-- $ -->
    ${resize((width) => page.partnerCountPlot(
      total_projects_by_institution,
      {
        width,
        y_label: "Projets",
        x_label: "N° Institutions",
        sort_value: project_universities_sort,
        y_accessor: (d) => cropText(d[0], 25),
        x_accessor: (d) => d[1].length,
      }
    ))}
    <!-- $ -->
  </div>
  <div class="card">
    <h2>Top 15 projets par n° d'unités</h2>
    ${project_laboratories_laureate_input}
    <!-- $ -->
    ${project_laboratories_sort_input}
    <!-- $ -->
    ${resize((width) => page.partnerCountPlot(
      total_projects_by_unite,
      {
        width,
        y_label: "Projets",
        x_label: "N° Unités",
        sort_value: project_laboratories_sort,
        y_accessor: (d) => cropText(d[0], 25),
        x_accessor: (d) => d[1].length,
      }
    ))}
    <!-- $ -->
  </div>
  <div class="card">
    <h2>Top 15 projets par n° de partenaires</h2>
    ${project_partners_laureate_input}
    <!-- $ -->
    ${project_partners_sort_input}
    <!-- $ -->
    ${resize((width) => page.partnerCountPlot(
      total_projects_by_partner,
      {
        width,
        y_label: "Projets",
        x_label: "N° Partenaires",
        sort_value: project_partners_sort,
        y_accessor: (d) => cropText(d[0], 25),
        x_accessor: (d) => d[1].length,
      }
    ))}
    <!-- $ -->
  </div>
</div>

```js
const project_universities_laureate_input = page.laureateCheckbox()
const project_universities_laureate = Generators.input(
  project_universities_laureate_input,
)

const project_universities_sort_input = page.ySortSelect()
const project_universities_sort = Generators.input(
  project_universities_sort_input,
)

const project_laboratories_laureate_input = page.laureateCheckbox()
const project_laboratories_laureate = Generators.input(
  project_laboratories_laureate_input,
)

const project_laboratories_sort_input = page.ySortSelect()
const project_laboratories_sort = Generators.input(
  project_laboratories_sort_input,
)

const project_partners_laureate_input = page.laureateCheckbox()
const project_partners_laureate = Generators.input(
  project_partners_laureate_input,
)

const project_partners_sort_input = page.ySortSelect()
const project_partners_sort = Generators.input(project_partners_sort_input)
```

```js
const total_projects_by_institution = d3.groups(
  [...all_institutions_by_project],
  (d) => d.DOCID,
)
```

```js
const total_projects_by_unite = d3.groups(
  [...all_unites_by_project],
  (d) => d.DOCID,
)
```

```js
const total_projects_by_partner = d3.groups(
  [...all_partners_by_project],
  (d) => d.DOCID,
)
```

## Partenaires

<div class="grid grid-cols-3">
  <div class="card">
    <h2>Top 15 institutions par n° d'occurences</h2>
    ${universities_sort_input}
    <!-- $ -->
    ${resize((width) => page.partnerCountPlot(
      [...all_institutions],
      {
        width,
        y_label: "Institution",
        x_label: "N° Occurences",
        sort_value: universities_sort,
        y_accessor: "id",
        x_accessor: "count",
      }
    ))}
    <!-- $ -->
  </div>
  <div class="card">
    <h2>Top 15 unités de recherche par n° d'occurences</h2>
    ${laboratories_sort_input}
    <!-- $ -->
    ${resize((width) => page.partnerCountPlot(
      [...all_unites],
      {
        width,
        y_label: "Unité",
        x_label: "N° Occurences",
        sort_value: laboratories_sort,
        y_accessor: "id",
        x_accessor: "count",
      }
    ))}
    <!-- $ -->
  </div>
  <div class="card">
    <h2>Top 15 partnaires par n° d'occurences</h2>
    ${partners_sort_input}
    <!-- $ -->
    ${resize((width) => page.partnerCountPlot(
      [...all_partners],
      {
        width,
        y_label: "Partnaire",
        x_label: "N° Occurences",
        sort_value: partners_sort,
        y_accessor: "id",
        x_accessor: "count",
      }
    ))}
    <!-- $ -->
  </div>
</div>

```js
const universities_sort_input = page.ySortSelect()
const universities_sort = Generators.input(universities_sort_input)

const laboratories_sort_input = page.ySortSelect()
const laboratories_sort = Generators.input(laboratories_sort_input)

const partners_sort_input = page.ySortSelect()
const partners_sort = Generators.input(partners_sort_input)
```

## Défis

<div class="grid grid-cols-2">
  <div class="card">
    ${resize((width) => bubbleChartX(
      [...challenge_count_1],
      {
        width: width,
        height: 150,
        title: "Défis des métadonnées des soumissions",
        subtitle: `Les défis indiqués dans les métadonnées des soumissions sur
          le site du dépôt`,
        x_accessor: (d) => page.challenge_map.get(d[0]),
        x_label: "Défis",
        r_accessor: (d) => d[1],
        r_label: "Occurences",
      }
    ))}
    <!-- $ -->
  </div>
  <div class="card">
    ${resize((width) => bubbleChartX(
      [...challenge_count_2],
      {
        width: width,
        height: 150,
        title: "Défis des templates des soumissions",
        subtitle: "Les défis indiqués dans les templates (.PDFs) des soumissions",
        x_accessor: (d) => page.challenge_map.get(d[0]),
        x_label: "Défis",
        r_accessor: (d) => d[1],
        r_label: "Occurences",
      }
    ))}
    <!-- $ -->
  </div>
</div>

```js
import { bubbleChartX } from '../../components/bubble-chart.js'

const challenge_count_1 = new Map([
  [
    'defi_1',
    d3
      .rollup(
        projects,
        (D) => D.length,
        (d) => d.defi_1_1,
      )
      .get(true) || 0,
  ],
  [
    'defi_2',
    d3
      .rollup(
        projects,
        (D) => D.length,
        (d) => d.defi_2_1,
      )
      .get(true) || 0,
  ],
  [
    'defi_3',
    d3
      .rollup(
        projects,
        (D) => D.length,
        (d) => d.defi_3_1,
      )
      .get(true) || 0,
  ],
  [
    'defi_4',
    d3
      .rollup(
        projects,
        (D) => D.length,
        (d) => d.defi_4_1,
      )
      .get(true) || 0,
  ],
  [
    'defi_5',
    d3
      .rollup(
        projects,
        (D) => D.length,
        (d) => d.defi_5_1,
      )
      .get(true) || 0,
  ],
  [
    'defi_6',
    d3
      .rollup(
        projects,
        (D) => D.length,
        (d) => d.defi_6_1,
      )
      .get(true) || 0,
  ],
])

const challenge_count_2 = new Map([
  [
    'defi_1',
    d3
      .rollup(
        projects,
        (D) => D.length,
        (d) => d.defi_1_2,
      )
      .get(true) || 0,
  ],
  [
    'defi_2',
    d3
      .rollup(
        projects,
        (D) => D.length,
        (d) => d.defi_2_2,
      )
      .get(true) || 0,
  ],
  [
    'defi_3',
    d3
      .rollup(
        projects,
        (D) => D.length,
        (d) => d.defi_3_2,
      )
      .get(true) || 0,
  ],
  [
    'defi_4',
    d3
      .rollup(
        projects,
        (D) => D.length,
        (d) => d.defi_4_2,
      )
      .get(true) || 0,
  ],
  [
    'defi_5',
    d3
      .rollup(
        projects,
        (D) => D.length,
        (d) => d.defi_5_2,
      )
      .get(true) || 0,
  ],
  [
    'defi_6',
    d3
      .rollup(
        projects,
        (D) => D.length,
        (d) => d.defi_6_2,
      )
      .get(true) || 0,
  ],
])
```

## Data quality
