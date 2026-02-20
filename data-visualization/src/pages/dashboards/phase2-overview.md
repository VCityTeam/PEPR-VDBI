---
sql:
  # remember to export or reencode the template as UTF-8
  AAP2_template_export: /data/private/AAP2_template_export.csv
  AAP2_submission_metadata: /data/private/AAP2_submission_metadata.csv
---

# AAP Phase 2 - PITT

## Survol des soumissions

```js
import * as page from './aap-overview.js'

display('AAP2_template_export')
display(Inputs.table(sql`select * from AAP2_template_export`))
display('AAP2_submission_metadata')
display(Inputs.table(sql`select * from AAP2_submission_metadata`))
```

## Projets

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
        ${total_unique_institutions.size.toLocaleString()}
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
        ${total_unique_unites.size.toLocaleString()}
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
        ${total_unique_partners.size.toLocaleString()}
        <!-- $ -->
      </span> / 0
      <!-- ${financed_partner_data.size.toLocaleString()} -->
      <!-- $ -->
    </span>
  </div>
</div>
<div class="grid grid-cols-3">
  <div class="card">
    <h2>University count by Project</h2>
    ${project_universities_laureate_input}
    <!-- $ -->
    ${project_universities_sort_input}
    <!-- $ -->
    ${resize((width) => page.projectCountPlot(
      d3.rollups(total_institutions, v => v.length, d => d),
      {
        width,
        y_label: "University",
        x_label: "Occurences",
        sort_value: project_universities_sort,
        y_accessor: (d) => d[0],
        x_accessor: (d) => d[1]
      }
    ))}
    <!-- $ -->
  </div>
  <div class="card">
    <h2>Laboratory count by Project</h2>
    ${project_laboratories_laureate_input}
    <!-- $ -->
    ${project_laboratories_sort_input}
    <!-- $ -->
    ${resize((width) => page.projectCountPlot(
      d3.rollups(total_unites, v => v.length, d => d),
      {
        width,
        y_label: "Laboratory",
        x_label: "Occurences",
        sort_value: project_laboratories_sort,
        y_accessor: (d) => d[0],
        x_accessor: (d) => d[1]
      }
    ))}
    <!-- $ -->
  </div>
  <div class="card">
    <h2>Partner count by Project</h2>
    ${project_partners_laureate_input}
    <!-- $ -->
    ${project_partners_sort_input}
    <!-- $ -->
    ${resize((width) => page.projectCountPlot(
      d3.rollups(total_partners, v => v.length, d => String(d)),
      {
        width,
        y_label: "Partners",
        x_label: "Occurences",
        sort_value: project_partners_sort,
        y_accessor: (d) => d[0],
        x_accessor: (d) => d[1]
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

const project_universities_sort_input = page.sortSelect()
const project_universities_sort = Generators.input(
  project_universities_sort_input,
)

const project_laboratories_laureate_input = page.laureateCheckbox()
const project_laboratories_laureate = Generators.input(
  project_laboratories_laureate_input,
)

const project_laboratories_sort_input = page.sortSelect()
const project_laboratories_sort = Generators.input(
  project_laboratories_sort_input,
)

const project_partners_laureate_input = page.laureateCheckbox()
const project_partners_laureate = Generators.input(
  project_partners_laureate_input,
)

const project_partners_sort_input = page.sortSelect()
const project_partners_sort = Generators.input(project_partners_sort_input)
```

```sql id=all_institutions
select [
  "institution-0",
  "institution-1",
  "institution-2",
  "institution-3",
  "institution-4",
  "institution-5",
  "institution-6",
  "institution-7",
  "institution-8",
  "institution-9",
  "Institution2.0",
  "Institution2.1",
  "Institution2.2",
  "Institution2.3",
  "Institution2.4",
  "Institution2.5",
  "Institution2.6",
  "Institution2.7",
  "Institution2.8",
  "Institution2.9",
  "Institution2.10",
  "Institution2.11",
  "Institution2.12",
  "Institution2.13",
  "Institution2.14"
] as institutions
from AAP2_template_export
```

```sql id=all_unites
select [
  "unite-0",
  "unite-1",
  "unite-2",
  "unite-3",
  "unite-4",
  "unite-5",
  "unite-6",
  "unite-7",
  "unite-8",
  "unite-9",
  "Unité2.0",
  "Unité2.1",
  "Unité2.2",
  "Unité2.3",
  "Unité2.4",
  "Unité2.5",
  "Unité2.6",
  "Unité2.7",
  "Unité2.8",
  "Unité2.9",
  "Unité2.10",
  "Unité2.11",
  "Unité2.12",
  "Unité2.13",
  "Unité2.14"
] as unites
from AAP2_template_export
```

```sql id=all_partners
select [
  replace("siret-0"::VARCHAR, ' ', ''),
  replace("siret-1"::VARCHAR, ' ', ''),
  replace("siret-2"::VARCHAR, ' ', ''),
  replace("siret-3"::VARCHAR, ' ', ''),
  replace("siret-4"::VARCHAR, ' ', ''),
  replace("siret-5"::VARCHAR, ' ', ''),
  replace("siret-6"::VARCHAR, ' ', ''),
  replace("siret-7"::VARCHAR, ' ', ''),
  -- replace("siret-8"::VARCHAR, ' ', ''),
  replace("siret-9"::VARCHAR, ' ', ''),
  replace("SIRET2.1"::VARCHAR, ' ', ''),
  replace("SIRET2.2"::VARCHAR, ' ', ''),
  replace("SIRET2.3"::VARCHAR, ' ', ''),
  replace("SIRET2.4"::VARCHAR, ' ', ''),
  replace("SIRET2.5"::VARCHAR, ' ', ''),
  replace("SIRET2.6"::VARCHAR, ' ', ''),
  replace("SIRET2.7"::VARCHAR, ' ', ''),
  replace("SIRET2.8"::VARCHAR, ' ', ''),
  replace("SIRET2.9"::VARCHAR, ' ', ''),
  replace("SIRET2.10"::VARCHAR, ' ', ''),
  replace("SIRET2.11"::VARCHAR, ' ', ''),
  replace("SIRET2.12"::VARCHAR, ' ', ''),
  replace("SIRET2.13"::VARCHAR, ' ', ''),
  replace("SIRET2.14"::VARCHAR, ' ', ''),
  replace("SIRET le cas échéant 1"::VARCHAR, ' ', ''),
  replace("SIRET le cas échéant 1"::VARCHAR, ' ', ''),
  replace("SIRET le cas échéant 2"::VARCHAR, ' ', ''),
  replace("SIRET le cas échéant 3"::VARCHAR, ' ', ''),
  replace("SIRET le cas échéant 4"::VARCHAR, ' ', ''),
  replace("SIRET le cas échéant 5"::VARCHAR, ' ', ''),
  replace("SIRET le cas échéant 6"::VARCHAR, ' ', ''),
  replace("SIRET le cas échéant 7"::VARCHAR, ' ', ''),
  replace("SIRET le cas échéant 8"::VARCHAR, ' ', ''),
  replace("SIRET le cas échéant 1_2"::VARCHAR, ' ', ''),
  replace("SIRET le cas échéant 2_2"::VARCHAR, ' ', ''),
  replace("SIRET le cas échéant 3_2"::VARCHAR, ' ', ''),
  replace("SIRET le cas échéant 4_2"::VARCHAR, ' ', ''),
  replace("SIRET le cas échéant 5_2"::VARCHAR, ' ', ''),
  replace("SIRET le cas échéant 6_2"::VARCHAR, ' ', ''),
  replace("SIRET le cas échéant 7_2"::VARCHAR, ' ', ''),
  replace("SIRET le cas échéant 8_2"::VARCHAR, ' ', ''),
] as partners
from AAP2_template_export
```

```js
const [total_project_count] = await sql`
  select count(*) as c
  from AAP2_submission_metadata`
```

```js
const total_institutions = [...all_institutions]
  .flatMap((d) => d.institutions.toArray())
  .filter((d) => !!d)
const total_unique_institutions = new Set(total_institutions)
total_unique_institutions.delete('')
total_unique_institutions.delete(null)
```

```js
const total_unites = [...all_unites]
  .flatMap((d) => d.unites.toArray())
  .filter((d) => !!d)
const total_unique_unites = new Set(total_unites)
total_unique_unites.delete('')
total_unique_unites.delete(null)
```

```js
const total_partners = [...all_partners]
  .flatMap((d) => d.partners.toArray())
  .filter((d) => !!d)
const total_unique_partners = new Set(total_partners)
total_unique_partners.delete('')
total_unique_partners.delete(null)
```

## Défis

```js

```

## Data quality

<div class="card">
  <h2>Empty template exports</h2>
  ${Inputs.table(sql`
    SELECT column000 as "pdf_name" FROM AAP2_template_export WHERE titre IS NULL
  `)}

</div>
