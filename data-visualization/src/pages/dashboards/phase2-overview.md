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

<!-- DATA IMPORT -->

### projects

```sql id=projects display
select
  AAP2_submission_metadata.DOCID as DOCID,
  STATUT,
  TYPDOC,
  type_projet,
  '' as SHORT_TITLE,
  TITLE,
  list_contains(
    split(TOPIC, ','),
    'Changement climatique et préservation de la biodiversité'
  ) as defi_1_1,
  list_contains(
    split(TOPIC, ','),
    'Vers des villes et/ou des bâtiments résilient(e)s'
  ) as defi_2_1,
  list_contains(
    split(TOPIC, ','),
    'Villes et/ou bâtiments sobres et frugaux'
  ) as defi_3_1,
  list_contains(
    split(TOPIC, ','),
    'Vers des villes et/ou bâtiments inclusifs et équitables'
  ) as defi_4_1,
  list_contains(
    split(TOPIC, ','),
    'Villes et/ou bâtiments durable, santé et bien-être'
  ) as defi_5_1,
  list_contains(
    split(TOPIC, ','),
    'Défis émergents'
  ) as defi_6_1,
  "defi-1" = 'On' as defi_1_2,
  "defi-2" = 'On' as defi_2_2,
  "defi-3" = 'On' as defi_3_2,
  "defi-4" = 'On' as defi_4_2,
  "defi-5" = 'On' as defi_5_2,
  "defi-6" = 'On' as defi_6_2,
  list_transform(split(MOTCLE, ';'), x -> trim(x)) as MOTCLE,
  list_transform(split(keywords, ';'), x -> trim(x)) as keywords,
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
      trim("cnu-6-0"::VARCHAR),
      trim("cnu-6-1"::VARCHAR),
      trim("cnu-6-2"::VARCHAR),
      trim("cnu-6-3"::VARCHAR),
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
  NOTE,
  -- TYPE,
  -- DATE,
  -- ABSTRACT,
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
  -- titre,
from AAP2_submission_metadata
left join AAP2_template_export
on AAP2_submission_metadata.DOCID =
  AAP2_template_export.DOCID
```

```js
const [total_project_count] = await sql`
  select count(*) as c
  from AAP2_submission_metadata`
```

### all_institutions

```sql id=all_institutions display
select
  id,
  list_distinct(list(label)) as labels,
  count(*) as count,
from (
  select distinct
    unnest(
      apply(
        [
          "siret-0"::VARCHAR,
          "siret-1"::VARCHAR,
          "siret-2"::VARCHAR,
          "siret-3"::VARCHAR,
          "siret-4"::VARCHAR,
          "siret-5"::VARCHAR,
          "siret-6"::VARCHAR,
          "siret-7"::VARCHAR,
          "siret-8"::VARCHAR,
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
      apply(
        [
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
        x -> trim(x)
      )
    ) as label,
  from AAP2_template_export
) where id is not null and label is not null
group by id
```

### all_unites

```sql id=all_unites display
select
  id,
  list_distinct(list(label)) as labels,
  count(*) as count,
from (
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
      x -> regexp_replace(x, '\\W', ''))
    ) as id,
    unnest(
      apply(
        [
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
        x -> trim(x))
    ) as label,
  from AAP2_template_export
) where id is not null and label is not null
group by id
```

### all_partners

```sql id=all_partners display
select
  id,
  list_distinct(list(label)) as labels,
  list_distinct(list(activity)) as activities,
  count(*) as count,
from (
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
    unnest(
      apply(
        [
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
        x -> trim(x))
    ) as label,
    unnest(
      apply(
        [
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
        x -> trim(x))
    ) as activity,
  from AAP2_template_export
) where id is not null and label is not null
group by id
```

### all_institutions_by_project

```sql id=all_institutions_by_project display
select distinct DOCID, institution_id from (
  select
    DOCID,
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
        "siret-8"::VARCHAR,
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
    ) as institution_id,
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
      x -> trim(x))
    ) as label,
  from AAP2_template_export
) where institution_id is not null and label is not null
```

### all_unites_by_project

```sql id=all_unites_by_project display
select distinct DOCID, unite_id from (
  select
    DOCID,
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
      x -> regexp_replace(x, '\\W', ''))
    ) as unite_id,
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
      x -> trim(x))
    ) as label,
  from AAP2_template_export
) where unite_id is not null and label is not null
```

### all_partners_by_project

```sql id=all_partners_by_project display
select distinct DOCID, partner_id from (
  select
    DOCID,
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
    ) as partner_id,
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
      x -> trim(x))
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
      x -> trim(x))
    ) as activity,
  from AAP2_template_export
) where partner_id is not null and label is not null
```
