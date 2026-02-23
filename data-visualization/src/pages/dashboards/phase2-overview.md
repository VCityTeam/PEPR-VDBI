---
sql:
  # remember to export or reencode the template as UTF-8
  AAP2_template_export: /data/private/AAP2_template_export.csv
  AAP2_submission_metadata: /data/private/AAP2_submission_metadata.csv
---

# AAP Phase 2 - PITT

## Survol des soumissions

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
        ${total_identified_institutions.size.toLocaleString()}
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

## Projets par partenaires

<div class="grid grid-cols-3">
  <div class="card">
    <h2>University count by Project</h2>
    ${project_universities_laureate_input}
    <!-- $ -->
    ${project_universities_sort_input}
    <!-- $ -->
    ${resize((width) => page.partnerCountPlot(
      total_projects_by_institution,
      {
        width,
        y_label: "University",
        x_label: "Occurences",
        sort_value: project_universities_sort,
        y_accessor: (d) => cropText(
          [...projects].find((p) => p.DOCID == d[0]).TITLE,
          25,
        ),
        x_accessor: (d) => d[1].length,
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
    ${resize((width) => page.partnerCountPlot(
      total_projects_by_unite,
      {
        width,
        y_label: "Laboratory",
        x_label: "Occurences",
        sort_value: project_laboratories_sort,
        y_accessor: (d) => cropText(
          [...projects].find((p) => p.DOCID == d[0]).TITLE,
          25,
        ),
        x_accessor: (d) => d[1].length,
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
    ${resize((width) => page.partnerCountPlot(
      total_projects_by_partner,
      {
        width,
        y_label: "Partner",
        x_label: "Occurences",
        sort_value: project_partners_sort,
        y_accessor: (d) => cropText(
          [...projects].find((p) => p.DOCID == d[0]).TITLE,
          25,
        ),
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

```js
const total_projects_by_institution = d3.groups(
  [...all_institutions_by_project],
  (d) => d.project_id,
)
const total_projects_by_identified_institution = new Map(
  total_projects_by_institution,
)
total_projects_by_identified_institution.delete('Non renseigné')
```

```js
const total_projects_by_unite = d3.groups(
  [...all_unites_by_project],
  (d) => d.project_id,
)
const total_projects_by_unique_unite = new Map(total_projects_by_unite)
total_projects_by_unique_unite.delete('Non renseigné')
```

```js
const total_projects_by_partner = d3.groups(
  [...all_partners_by_project],
  (d) => d.project_id,
)
const total_projects_by_unique_partner = new Map(total_projects_by_partner)
total_projects_by_unique_partner.delete('Non renseigné')
```

## Partenaires

<div class="grid grid-cols-3">
  <div class="card">
    <h2>University count by Project</h2>
    ${universities_sort_input}
    <!-- $ -->
    ${resize((width) => page.partnerCountPlot(
      total_institutions,
      {
        width,
        y_label: "University",
        x_label: "Occurences",
        sort_value: universities_sort,
        y_accessor: (d) => cropText(d[1][0].label, 25),
        x_accessor: (d) => d[1].length,
      }
    ))}
    <!-- $ -->
  </div>
  <div class="card">
    <h2>Laboratory count by Project</h2>
    ${laboratories_sort_input}
    <!-- $ -->
    ${resize((width) => page.partnerCountPlot(
      total_unites,
      {
        width,
        y_label: "Laboratory",
        x_label: "Occurences",
        sort_value: laboratories_sort,
        y_accessor: (d) => cropText(d[1][0].label, 25),
        x_accessor: (d) => d[1].length,
      }
    ))}
    <!-- $ -->
  </div>
  <div class="card">
    <h2>Partner count by Project</h2>
    ${partners_sort_input}
    <!-- $ -->
    ${resize((width) => page.partnerCountPlot(
      total_partners,
      {
        width,
        y_label: "Partner",
        x_label: "Occurences",
        sort_value: partners_sort,
        y_accessor: (d) => cropText(d[1][0].label, 25),
        x_accessor: (d) => d[1].length,
      }
    ))}
    <!-- $ -->
  </div>
</div>

```js
const universities_sort_input = page.sortSelect()
const universities_sort = Generators.input(universities_sort_input)

const laboratories_sort_input = page.sortSelect()
const laboratories_sort = Generators.input(laboratories_sort_input)

const partners_sort_input = page.sortSelect()
const partners_sort = Generators.input(partners_sort_input)
```

```js
const total_institutions = d3.groups([...all_institutions], (d) => d.id)
const total_identified_institutions = new Map(total_institutions)
total_identified_institutions.delete('Non renseigné')
```

```js
const total_unites = d3.groups([...all_unites], (d) => d.id)
const total_unique_unites = new Map(total_unites)
total_unique_unites.delete('Non renseigné')
```

```js
const total_partners = d3.groups([...all_partners], (d) => d.id)
const total_unique_partners = new Map(total_partners)
total_unique_partners.delete('Non renseigné')
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

```js
import * as page from './aap-overview.js'
import { cropText } from  '/components/utilities.js'

display('projects')
display(Inputs.table(projects))
display('AAP2_submission_metadata')
display(Inputs.table(sql`select * from AAP2_submission_metadata`))
display('AAP2_template_export')
display(Inputs.table(sql`select * from AAP2_template_export`))
display('all_institutions')
display(Inputs.table(all_institutions))
display('all_unites')
display(Inputs.table(all_unites))
display('all_partners')
display(Inputs.table(all_partners))
display('all_institutions_by_project')
display(Inputs.table(all_institutions_by_project))
display('all_unites_by_project')
display(Inputs.table(all_unites_by_project))
display('all_partners_by_project')
display(Inputs.table(all_partners_by_project))
```

<!-- DATA IMPORT -->

```sql id=projects
select
  DOCID,
  -- TYPE,
  -- DATE,
  STATUT,
  TYPDOC,
  -- ABSTRACT,
  TITLE,
  -- SPEAKERS,
  -- CORRESPONDING,
  -- AUTHORS,
  -- LABOS,
  -- FILE,
  -- FILE_SRC,
  -- DATEPRODUCT,
  -- COMMENTAIRE,
  -- LANGUE,
  -- CREATEUSERID,
  -- MAIL,
  TOPIC,
  list_transform(split(MOTCLE, ';'), x -> trim(x)) as MOTCLE,
  NOTE
  -- titre,
  type_projet,
  list_transform(split(keywords, ';'), x -> trim(x)) as keywords,
  "defi-1" = 'On' as defi_1,
  "defi-2" = 'On' as defi_2,
  "defi-3" = 'On' as defi_3,
  "defi-4" = 'On' as defi_4,
  "defi-5" = 'On' as defi_5,
  "defi-6" = 'On' as defi_6,
  list_transform(split(disciplines, ';'), x -> trim(x)) as disciplines,
  filter(
    list_distinct([
      trim("cnu-0"::VARCHAR),
      trim("cnu-1"::VARCHAR),
      trim("cnu-2"::VARCHAR),
      trim("cnu-3"::VARCHAR),
      trim("cnu-4"::VARCHAR),
      trim("cnu-5"::VARCHAR),
      trim("cnu-6"::VARCHAR),
      trim("cnu-7"::VARCHAR),
      trim("cnu-8"::VARCHAR),
      trim("cnu-9"::VARCHAR),
      trim("CNU2.0"::VARCHAR),
      trim("CNU2.1"::VARCHAR),
      trim("CNU2.2"::VARCHAR),
      trim("CNU2.3"::VARCHAR),
      trim("CNU2.4"::VARCHAR),
      trim("CNU2.5"::VARCHAR),
      trim("CNU2.6"::VARCHAR),
      trim("CNU2.7"::VARCHAR),
      trim("CNU2.8"::VARCHAR),
      trim("CNU2.9"::VARCHAR),
      trim("CNU2.10"::VARCHAR),
      trim("CNU2.11"::VARCHAR),
      trim("CNU2.12"::VARCHAR),
      trim("CNU2.13"::VARCHAR),
      trim("CNU2.14"::VARCHAR),
    ]),
    x -> x is not null
  ) as cnus,
  -- "cnu-6-0" as cnu_thesis_1,
  "no ecole-0" as ed_thesis_1,
  -- "cnu-6-1" as cnu_thesis_2,
  "no ecole-1" as ed_thesis_2,
  -- "cnu-6-2" as cnu_thesis_3,
  "no ecole-2" as ed_thesis_3,
  "budget-0" as budget,
  "budget-1" as supplementary_budget,
from AAP2_submission_metadata
join AAP2_template_export
on AAP2_submission_metadata.DOCID =
  replace(AAP2_template_export.column000, '.pdf', '')
```

```js
const [total_project_count] = await sql`
  select count(*) as c
  from AAP2_submission_metadata`
```

```sql id=all_institutions
select * from(
  select distinct
    unnest(
      apply([
        "siret-0"::VARCHAR,
        "siret-1"::VARCHAR,
        "siret-2"::VARCHAR,
        "siret-3"::VARCHAR,
        "siret-4"::VARCHAR,
        "siret-5"::VARCHAR,
        "siret-6"::VARCHAR,
        "siret-7"::VARCHAR,
        "siret"::VARCHAR,
        "siret-9"::VARCHAR,
        "SIRET2.0"::VARCHAR,
        "SIRET2.1"::VARCHAR,
        "SIRET2.2"::VARCHAR,
        "SIRET2.3"::VARCHAR,
        "SIRET2.4"::VARCHAR,
        "SIRET2.5"::VARCHAR,
        "SIRET2.6"::VARCHAR,
        "SIRET2.7"::VARCHAR,
        "SIRET2.8"::VARCHAR,
        "SIRET2.9"::VARCHAR,
        "SIRET2.10"::VARCHAR,
        "SIRET2.11"::VARCHAR,
        "SIRET2.12"::VARCHAR,
        "SIRET2.13"::VARCHAR,
        "SIRET2.14"::VARCHAR,
      ],
      x -> replace(x, ' ', ''))
    ) as id,
    unnest([
      "institution-0"::VARCHAR,
      "institution-1"::VARCHAR,
      "institution-2"::VARCHAR,
      "institution-3"::VARCHAR,
      "institution-4"::VARCHAR,
      "institution-5"::VARCHAR,
      "institution-6"::VARCHAR,
      "institution-7"::VARCHAR,
      "institution-8"::VARCHAR,
      "institution-9"::VARCHAR,
      "Institution2.0"::VARCHAR,
      "Institution2.1"::VARCHAR,
      "Institution2.2"::VARCHAR,
      "Institution2.3"::VARCHAR,
      "Institution2.4"::VARCHAR,
      "Institution2.5"::VARCHAR,
      "Institution2.6"::VARCHAR,
      "Institution2.7"::VARCHAR,
      "Institution2.8"::VARCHAR,
      "Institution2.9"::VARCHAR,
      "Institution2.10"::VARCHAR,
      "Institution2.11"::VARCHAR,
      "Institution2.12"::VARCHAR,
      "Institution2.13"::VARCHAR,
      "Institution2.14"::VARCHAR,
    ]) as label,
  from AAP2_template_export
) where id is not null and label is not null
```

```sql id=all_unites
select * from(
  select distinct
    unnest(
      apply([
        "rnsr-0"::VARCHAR,
        "rnsr-1"::VARCHAR,
        "rnsr-2"::VARCHAR,
        "rnsr-3"::VARCHAR,
        "rnsr-4"::VARCHAR,
        "rnsr-5"::VARCHAR,
        "rnsr-6"::VARCHAR,
        "rnsr-7"::VARCHAR,
        "rnsr-8"::VARCHAR,
        "rnsr-9"::VARCHAR,
        "RNSR2.0"::VARCHAR,
        "RNSR2.1"::VARCHAR,
        "RNSR2.2"::VARCHAR,
        "RNSR2.3"::VARCHAR,
        "RNSR2.4"::VARCHAR,
        "RNSR2.5"::VARCHAR,
        "RNSR2.6"::VARCHAR,
        "RNSR2.7"::VARCHAR,
        "RNSR2.8"::VARCHAR,
        "RNSR2.9"::VARCHAR,
        "RNSR2.10"::VARCHAR,
        "RNSR2.11"::VARCHAR,
        "RNSR2.12"::VARCHAR,
        "RNSR2.13"::VARCHAR,
        "RNSR2.14"::VARCHAR,
      ],
      x -> replace(x, ' ', ''))
    ) as id,
    unnest([
      "unite-0"::VARCHAR,
      "unite-1"::VARCHAR,
      "unite-2"::VARCHAR,
      "unite-3"::VARCHAR,
      "unite-4"::VARCHAR,
      "unite-5"::VARCHAR,
      "unite-6"::VARCHAR,
      "unite-7"::VARCHAR,
      "unite-8"::VARCHAR,
      "unite-9"::VARCHAR,
      "Unité2.0"::VARCHAR,
      "Unité2.1"::VARCHAR,
      "Unité2.2"::VARCHAR,
      "Unité2.3"::VARCHAR,
      "Unité2.4"::VARCHAR,
      "Unité2.5"::VARCHAR,
      "Unité2.6"::VARCHAR,
      "Unité2.7"::VARCHAR,
      "Unité2.8"::VARCHAR,
      "Unité2.9"::VARCHAR,
      "Unité2.10"::VARCHAR,
      "Unité2.11"::VARCHAR,
      "Unité2.12"::VARCHAR,
      "Unité2.13"::VARCHAR,
      "Unité2.14"::VARCHAR,
    ]) as label,
  from AAP2_template_export
) where id is not null and label is not null
```

```sql id=all_partners
select * from(
  select distinct
    unnest(
      apply([
        "SIRET le cas échéant 1"::VARCHAR,
        "SIRET le cas échéant 1"::VARCHAR,
        "SIRET le cas échéant 2"::VARCHAR,
        "SIRET le cas échéant 3"::VARCHAR,
        "SIRET le cas échéant 4"::VARCHAR,
        "SIRET le cas échéant 5"::VARCHAR,
        "SIRET le cas échéant 6"::VARCHAR,
        "SIRET le cas échéant 7"::VARCHAR,
        "SIRET le cas échéant 8"::VARCHAR,
        "SIRET le cas échéant 1_2"::VARCHAR,
        "SIRET le cas échéant 2_2"::VARCHAR,
        "SIRET le cas échéant 3_2"::VARCHAR,
        "SIRET le cas échéant 4_2"::VARCHAR,
        "SIRET le cas échéant 5_2"::VARCHAR,
        "SIRET le cas échéant 6_2"::VARCHAR,
        "SIRET le cas échéant 7_2"::VARCHAR,
        "SIRET le cas échéant 8_2"::VARCHAR,
      ],
      x -> replace(x, ' ', ''))
    ) as id,
    unnest([
      "Nom 1"::VARCHAR,
      "Nom 1"::VARCHAR,
      "Nom 2"::VARCHAR,
      "Nom 3"::VARCHAR,
      "Nom 4"::VARCHAR,
      "Nom 5"::VARCHAR,
      "Nom 6"::VARCHAR,
      "Nom 7"::VARCHAR,
      "Nom 8"::VARCHAR,
      "Nom 1_2"::VARCHAR,
      "Nom 2_2"::VARCHAR,
      "Nom 3_2"::VARCHAR,
      "Nom 4_2"::VARCHAR,
      "Nom 5_2"::VARCHAR,
      "Nom 6_2"::VARCHAR,
      "Nom 7_2"::VARCHAR,
      "Nom 8_2"::VARCHAR,
    ]) as label,
    unnest([
      "Activité  secteurs dactivité 1"::VARCHAR,
      "Activité  secteurs dactivité 1"::VARCHAR,
      "Activité  secteurs dactivité 2"::VARCHAR,
      "Activité  secteurs dactivité 3"::VARCHAR,
      "Activité  secteurs dactivité 4"::VARCHAR,
      "Activité  secteurs dactivité 5"::VARCHAR,
      "Activité  secteurs dactivité 6"::VARCHAR,
      "Activité  secteurs dactivité 7"::VARCHAR,
      "Activité  secteurs dactivité 8"::VARCHAR,
      "Activité  secteurs dactivité 1_2"::VARCHAR,
      "Activité  secteurs dactivité 2_2"::VARCHAR,
      "Activité  secteurs dactivité 3_2"::VARCHAR,
      "Activité  secteurs dactivité 4_2"::VARCHAR,
      "Activité  secteurs dactivité 5_2"::VARCHAR,
      "Activité  secteurs dactivité 6_2"::VARCHAR,
      "Activité  secteurs dactivité 7_2"::VARCHAR,
      "Activité  secteurs dactivité 8_2"::VARCHAR,
    ]) as activity,
  from AAP2_template_export
) where id is not null and label is not null
```

```sql id=all_institutions_by_project
select project_id, id as institution_id from (
  select
    replace(column000, '.pdf', '') as project_id,
    unnest(
      apply([
        "siret-0"::VARCHAR,
        "siret-1"::VARCHAR,
        "siret-2"::VARCHAR,
        "siret-3"::VARCHAR,
        "siret-4"::VARCHAR,
        "siret-5"::VARCHAR,
        "siret-6"::VARCHAR,
        "siret-7"::VARCHAR,
        "siret"::VARCHAR,
        "siret-9"::VARCHAR,
        "SIRET2.0"::VARCHAR,
        "SIRET2.1"::VARCHAR,
        "SIRET2.2"::VARCHAR,
        "SIRET2.3"::VARCHAR,
        "SIRET2.4"::VARCHAR,
        "SIRET2.5"::VARCHAR,
        "SIRET2.6"::VARCHAR,
        "SIRET2.7"::VARCHAR,
        "SIRET2.8"::VARCHAR,
        "SIRET2.9"::VARCHAR,
        "SIRET2.10"::VARCHAR,
        "SIRET2.11"::VARCHAR,
        "SIRET2.12"::VARCHAR,
        "SIRET2.13"::VARCHAR,
        "SIRET2.14"::VARCHAR,
      ],
      x -> replace(x, ' ', ''))
    ) as id,
    unnest(
      apply([
        "institution-0"::VARCHAR,
        "institution-1"::VARCHAR,
        "institution-2"::VARCHAR,
        "institution-3"::VARCHAR,
        "institution-4"::VARCHAR,
        "institution-5"::VARCHAR,
        "institution-6"::VARCHAR,
        "institution-7"::VARCHAR,
        "institution-8"::VARCHAR,
        "institution-9"::VARCHAR,
        "Institution2.0"::VARCHAR,
        "Institution2.1"::VARCHAR,
        "Institution2.2"::VARCHAR,
        "Institution2.3"::VARCHAR,
        "Institution2.4"::VARCHAR,
        "Institution2.5"::VARCHAR,
        "Institution2.6"::VARCHAR,
        "Institution2.7"::VARCHAR,
        "Institution2.8"::VARCHAR,
        "Institution2.9"::VARCHAR,
        "Institution2.10"::VARCHAR,
        "Institution2.11"::VARCHAR,
        "Institution2.12"::VARCHAR,
        "Institution2.13"::VARCHAR,
        "Institution2.14"::VARCHAR,
      ],
      x -> replace(x, ' ', ''))
    ) as label,
  from AAP2_template_export
) where id is not null and label is not null
```

```sql id=all_unites_by_project
select project_id, id as unite_id from (
  select
    replace(column000, '.pdf', '') as project_id,
    unnest(
      apply([
        "rnsr-0"::VARCHAR,
        "rnsr-1"::VARCHAR,
        "rnsr-2"::VARCHAR,
        "rnsr-3"::VARCHAR,
        "rnsr-4"::VARCHAR,
        "rnsr-5"::VARCHAR,
        "rnsr-6"::VARCHAR,
        "rnsr-7"::VARCHAR,
        "rnsr-8"::VARCHAR,
        "rnsr-9"::VARCHAR,
        "RNSR2.0"::VARCHAR,
        "RNSR2.1"::VARCHAR,
        "RNSR2.2"::VARCHAR,
        "RNSR2.3"::VARCHAR,
        "RNSR2.4"::VARCHAR,
        "RNSR2.5"::VARCHAR,
        "RNSR2.6"::VARCHAR,
        "RNSR2.7"::VARCHAR,
        "RNSR2.8"::VARCHAR,
        "RNSR2.9"::VARCHAR,
        "RNSR2.10"::VARCHAR,
        "RNSR2.11"::VARCHAR,
        "RNSR2.12"::VARCHAR,
        "RNSR2.13"::VARCHAR,
        "RNSR2.14"::VARCHAR,
      ],
      x -> replace(x, ' ', ''))
    ) as id,
    unnest(
      apply([
        "unite-0"::VARCHAR,
        "unite-1"::VARCHAR,
        "unite-2"::VARCHAR,
        "unite-3"::VARCHAR,
        "unite-4"::VARCHAR,
        "unite-5"::VARCHAR,
        "unite-6"::VARCHAR,
        "unite-7"::VARCHAR,
        "unite-8"::VARCHAR,
        "unite-9"::VARCHAR,
        "Unité2.0"::VARCHAR,
        "Unité2.1"::VARCHAR,
        "Unité2.2"::VARCHAR,
        "Unité2.3"::VARCHAR,
        "Unité2.4"::VARCHAR,
        "Unité2.5"::VARCHAR,
        "Unité2.6"::VARCHAR,
        "Unité2.7"::VARCHAR,
        "Unité2.8"::VARCHAR,
        "Unité2.9"::VARCHAR,
        "Unité2.10"::VARCHAR,
        "Unité2.11"::VARCHAR,
        "Unité2.12"::VARCHAR,
        "Unité2.13"::VARCHAR,
        "Unité2.14"::VARCHAR,
      ],
      x -> replace(x, ' ', ''))
    ) as label,
  from AAP2_template_export
) where id is not null and label is not null
```

```sql id=all_partners_by_project
select project_id, id as partner_id from (
  select
    replace(column000, '.pdf', '') as project_id,
    unnest(
      apply([
        "SIRET le cas échéant 1"::VARCHAR,
        "SIRET le cas échéant 1"::VARCHAR,
        "SIRET le cas échéant 2"::VARCHAR,
        "SIRET le cas échéant 3"::VARCHAR,
        "SIRET le cas échéant 4"::VARCHAR,
        "SIRET le cas échéant 5"::VARCHAR,
        "SIRET le cas échéant 6"::VARCHAR,
        "SIRET le cas échéant 7"::VARCHAR,
        "SIRET le cas échéant 8"::VARCHAR,
        "SIRET le cas échéant 1_2"::VARCHAR,
        "SIRET le cas échéant 2_2"::VARCHAR,
        "SIRET le cas échéant 3_2"::VARCHAR,
        "SIRET le cas échéant 4_2"::VARCHAR,
        "SIRET le cas échéant 5_2"::VARCHAR,
        "SIRET le cas échéant 6_2"::VARCHAR,
        "SIRET le cas échéant 7_2"::VARCHAR,
        "SIRET le cas échéant 8_2"::VARCHAR,
      ],
      x -> replace(x, ' ', ''))
    ) as id,
    unnest(
      apply([
        "Nom 1"::VARCHAR,
        "Nom 1"::VARCHAR,
        "Nom 2"::VARCHAR,
        "Nom 3"::VARCHAR,
        "Nom 4"::VARCHAR,
        "Nom 5"::VARCHAR,
        "Nom 6"::VARCHAR,
        "Nom 7"::VARCHAR,
        "Nom 8"::VARCHAR,
        "Nom 1_2"::VARCHAR,
        "Nom 2_2"::VARCHAR,
        "Nom 3_2"::VARCHAR,
        "Nom 4_2"::VARCHAR,
        "Nom 5_2"::VARCHAR,
        "Nom 6_2"::VARCHAR,
        "Nom 7_2"::VARCHAR,
        "Nom 8_2"::VARCHAR,
      ],
      x -> replace(x, ' ', ''))
    ) as label,
    unnest(
      apply([
        "Activité  secteurs dactivité 1"::VARCHAR,
        "Activité  secteurs dactivité 1"::VARCHAR,
        "Activité  secteurs dactivité 2"::VARCHAR,
        "Activité  secteurs dactivité 3"::VARCHAR,
        "Activité  secteurs dactivité 4"::VARCHAR,
        "Activité  secteurs dactivité 5"::VARCHAR,
        "Activité  secteurs dactivité 6"::VARCHAR,
        "Activité  secteurs dactivité 7"::VARCHAR,
        "Activité  secteurs dactivité 8"::VARCHAR,
        "Activité  secteurs dactivité 1_2"::VARCHAR,
        "Activité  secteurs dactivité 2_2"::VARCHAR,
        "Activité  secteurs dactivité 3_2"::VARCHAR,
        "Activité  secteurs dactivité 4_2"::VARCHAR,
        "Activité  secteurs dactivité 5_2"::VARCHAR,
        "Activité  secteurs dactivité 6_2"::VARCHAR,
        "Activité  secteurs dactivité 7_2"::VARCHAR,
        "Activité  secteurs dactivité 8_2"::VARCHAR,
      ],
      x -> replace(x, ' ', ''))
    ) as activity,
  from AAP2_template_export
) where id is not null and label is not null
```
