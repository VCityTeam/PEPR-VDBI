---
sql:
  aap1_projects: /data/phase1-projects.tsv
  aap1_researchers: /data/phase1-researchers.tsv
  aap1_researcher_by_keywords: /data/phase1-researcher_by_keywords.tsv
  aap1_laboratories: /data/phase1-laboratories.tsv
  aap1_socioeconomic_partners: /data/phase1-socioeconomic_partners.tsv
  aap1_project_by_keyword: /data/phase1-project_by_keyword.tsv
  aap1_project_by_institutions: /data/phase1-project_by_institutions.tsv
  aap1_project_by_laboratories: /data/phase1-project_by_laboratories.tsv
  aap1_laboratories_by_domains_erc: /data/phase1-laboratories_by_domains_erc.tsv
  aap1_laboratories_by_disciplines_erc: /data/phase1-laboratories_by_disciplines_erc.tsv
  aap1_laboratories_by_domains_hceres: /data/phase1-laboratories_by_domains_hceres.tsv
  aap1_laboratories_by_disciplines_hceres: /data/phase1-laboratories_by_disciplines_hceres.tsv
  aap1_institutions: /data/phase1-institutions.tsv
  aap1_project_by_socioeconomic_partners: /data/phase1-project_by_socioeconomic_partners.tsv
  aap2_projects: /data/phase2-projects.tsv
  # aap2_researchers: /data/phase2-researchers.tsv
  # aap2_researcher_by_keywords: /data/phase2-researcher_by_keywords.tsv
  aap2_institutions: /data/phase2-institutions.tsv
  aap2_laboratories: /data/phase2-laboratories.tsv
  aap2_socioeconomic_partners: /data/phase2-socioeconomic_partners.tsv
  aap2_project_by_keyword: /data/phase2-project_by_keyword.tsv
  aap2_project_by_institutions: /data/phase2-project_by_institutions.tsv
  aap2_project_by_laboratories: /data/phase2-project_by_laboratories.tsv
  aap2_project_by_discipline: /data/phase2-project_by_discipline.tsv
  # aap2_laboratories_by_domains_erc: /data/phase2-laboratories_by_domains_erc.tsv
  # aap2_laboratories_by_disciplines_erc: /data/phase2-laboratories_by_disciplines_erc.tsv
  # aap2_laboratories_by_domains_hceres: /data/phase2-laboratories_by_domains_hceres.tsv
  # aap2_laboratories_by_disciplines_hceres: /data/phase2-laboratories_by_disciplines_hceres.tsv
  aap2_project_by_socioeconomic_partners: /data/phase2-project_by_socioeconomic_partners.tsv
---

# AAP Phase 2 - PITT

## Survol des soumissions

```js
import * as page from './aap-overview.js'
import { cropText } from '/components/utilities.js'
import { bubbleChartX } from '../../components/bubble-chart.js'
import { donutChart } from '../../components/pie-chart.js'
```

## Chiffres clés

<div class="grid grid-cols-4">
  <div class="card">
    <h2>N° Projets <span class="muted">(Totale / Lauréats)</span></h2>
    <span class="big">
      <span class="muted">
        ${[...await sql`select count(*) as count from aap2_projects`][0].count.toLocaleString()}
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
        ${[...await sql`select count(*) as count from aap2_institutions`][0].count.toLocaleString()}
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
        ${[...await sql`select count(*) as count from aap2_laboratories`][0].count.toLocaleString()}
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
        ${[...await sql`select count(*) as count from aap2_socioeconomic_partners`][0].count.toLocaleString()}
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
    ${resize((width) => page.projectCountPlot(
      aap2_project_by_institutions_count,
      {
        width,
        y_label: "Projets",
        x_label: "N° Institutions",
        sort_value: project_universities_sort,
        y_accessor: "project",
        x_accessor: "count",
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
    ${resize((width) => page.projectCountPlot(
      aap2_project_by_laboratories_count,
      {
        width,
        y_label: "Projets",
        x_label: "N° Unités",
        sort_value: project_laboratories_sort,
        y_accessor: "project",
        x_accessor: "count",
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
    ${resize((width) => page.projectCountPlot(
      aap2_project_by_socioeconomic_partners_count,
      {
        width,
        y_label: "Projets",
        x_label: "N° Partenaires",
        sort_value: project_partners_sort,
        y_accessor: "project",
        x_accessor: "count",
      }
    ))}
    <!-- $ -->
  </div>
</div>

```sql id=aap2_project_by_institutions_count
select count(*) as count, project
from aap2_project_by_institutions
group by project
```

```sql id=aap2_project_by_laboratories_count
select count(*) as count, project
from aap2_project_by_laboratories
group by project
```

```sql id=aap2_project_by_socioeconomic_partners_count
select count(*) as count, project
from aap2_project_by_socioeconomic_partners
group by project
```

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

## Partenaires

<div class="grid grid-cols-3">
  <div class="card">
    <h2>Top 15 institutions par n° d'occurences</h2>
    ${universities_sort_input}
    <!-- $ -->
    ${resize((width) => page.partnerCountPlot(
      aap2_institutions_count,
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
      aap2_laboratories_count,
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
      aap2_partners_count,
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

```sql id=aap2_institutions_count
select
  id,
  if(nom_complet is null, split(labels, ',')[1], nom_complet) as label,
  count
from aap2_institutions
```

```sql id=aap2_laboratories_count
select
  id,
  split(labels, ',')[1] as label,
  count
from aap2_laboratories
```

```sql id=aap2_partners_count
select
  id,
  if(nom_complet is null, split(labels, ',')[1], nom_complet) as label,
  count
from aap2_socioeconomic_partners
where id is not null and length(id) = 14
```

```js
const universities_sort_input = page.ySortSelect()
const universities_sort = Generators.input(universities_sort_input)

const laboratories_sort_input = page.ySortSelect()
const laboratories_sort = Generators.input(laboratories_sort_input)

const partners_sort_input = page.ySortSelect()
const partners_sort = Generators.input(partners_sort_input)
```

## Thématiques

<div class="card">
  ${resize((width) => Plot.plot({
    width: width,
    height: 600,
    title: "Défis",
    subtitle: `Les défis indiqués dans les métadonnées et les templates des
      soumissions sur le site du dépôt`,
    grid: true,
    marks: [
      Plot.barY(challenge_count, {
        x: 'defi',
        y: 'count',
        fill: 'defi',
        tip: true,
      }),
    ],
  }))}
  <!-- $ -->
</div>

```sql id=challenge_count
select
  'défi 1' as defi,
  count(*) as count
from aap2_projects
where defi_1_1 or defi_1_2
union
select
  'défi 2' as defi,
  count(*) as count
from aap2_projects
where defi_2_1 or defi_2_2
union
select
  'défi 3' as defi,
  count(*) as count
from aap2_projects
where defi_3_1 or defi_3_2
union
select
  'défi 4' as defi,
  count(*) as count
from aap2_projects
where defi_4_1 or defi_4_2
union
select
  'défi 5' as defi,
  count(*) as count
from aap2_projects
where defi_5_1 or defi_5_2
union
select
  'défi 6' as defi,
  count(*) as count
from aap2_projects
where defi_6_1 or defi_6_2
```

## Disciplines

```sql
select discipline, count(*) as count from aap2_project_by_discipline
where discipline != ''
group by discipline
order by count desc
```

## Keywords

```sql
select keyword, count(*) as count from aap2_project_by_keyword
where keyword != ''
group by keyword
order by count desc
```

## Cartographies

TBD

## Data quality

<div class="grid grid-cols-3">
  <div class="card">
    <h3>Missing Institution SIRETs</h3>
    ${missing_institution_siret.count}
    <!-- $ -->
  </div>
  <div class="card">
    <h3>Missing Laboratories SIRETs</h3>
    ${missing_laboratories_siret.count}
    <!-- $ -->
  </div>
  <div class="card">
    <h3>Missing Partner SIRETs</h3>
    ${missing_partner_siret.count}
    <!-- $ -->
  </div>
</div>

```sql id=[missing_institution_siret]
select count(*) as count
from aap2_institutions
where siret is null
```

```sql id=[missing_laboratories_siret]
select count(*) as count
from aap2_laboratories
where numero_national_de_structure is null
```

```sql id=[missing_partner_siret]
select count(*) as count
from aap2_socioeconomic_partners
where siret is null or length(id) != 14
```

<!-- data import -->

```sql id=projects
(
  select
    acronyme,
    present,
    auditioned,
    financed,
    budget,
    null as supplementary_budget,
    grade,
    challenge,
    name_fr,
    name_en,
    1 as aap,
  from aap1_projects
) union (
  select
    acronyme,
    true as present,
    null as auditioned,
    null as financed,
    budget,
    supplementary_budget,
    null as grade,
    challenge,
    name_fr,
    null as name_en,
    2 as aap,
  from aap2_projects
)
```

```sql id=laboratories
(
  select
    id,
    -- umr,
    lab as labels,
    -- name,
    -- institution,
    -- domain_erc,
    -- domain_hceres
    1 as aap,
  from aap1_laboratories
) union (
  select
    id,
    -- null as umr,
    labels,
    -- null as name,
    2 as aap,
  from aap2_laboratories
)
```

```sql id=institutions
(
  select
    null as id,
    name as labels,
    1 as aap,
  from aap1_institutions
) union (
  select
    id,
    labels,
    2 as aap,
  from aap2_institutions
)
```

```sql id=socioeconomic_partners
(
  select
    null as id,
    label as labels,
    null as activities,
    1 as aap,
  from aap1_socioeconomic_partners
) union (
  select
    id,
    labels,
    activities,
    2 as aap,
  from aap2_socioeconomic_partners
)
```

```sql id=project_by_keyword
(
  select
    acronyme,
    keyword,
    1 as aap,
  from aap1_project_by_keyword
) union (
  select
    acronyme,
    keyword,
    2 as aap,
  from aap2_project_by_keyword
)
```

```sql id=project_institutions
(
  select
    project,
    university as institution,
    1 as aap,
  from aap1_project_by_institutions
) union (
  select
    project,
    institution_id as institution,
    2 as aap,
  from aap2_project_by_institutions
)
```

```sql id=project_laboratories
(
  select
    project,
    lab,
    1 as aap,
  from aap1_project_by_laboratories
) union (
  select
    project,
    unit_id as lab,
    2 as aap,
  from aap2_project_by_laboratories
)
```

```sql id=project_socioeconomic_partners
(
  select
    project,
    partner,
    1 as aap,
  from aap1_project_by_socioeconomic_partners
) union (
  select
    project,
    partner_id as partner,
    2 as aap,
  from aap2_project_by_socioeconomic_partners
)
```
