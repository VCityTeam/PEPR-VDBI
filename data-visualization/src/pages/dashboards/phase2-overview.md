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
  aap2_project_by_cnu: /data/phase2-project_by_cnu.tsv
  aap2_project_by_cnu_labels: /data/phase2-project_by_cnu_labels.tsv
  # aap2_laboratories_by_domains_erc: /data/phase2-laboratories_by_domains_erc.tsv
  # aap2_laboratories_by_disciplines_erc: /data/phase2-laboratories_by_disciplines_erc.tsv
  # aap2_laboratories_by_domains_hceres: /data/phase2-laboratories_by_domains_hceres.tsv
  # aap2_laboratories_by_disciplines_hceres: /data/phase2-laboratories_by_disciplines_hceres.tsv
  aap2_project_by_socioeconomic_partners: /data/phase2-project_by_socioeconomic_partners.tsv
---

# Survol des Appels à Projets

## Phase 1 et 2

```js
import * as overview from './aap-overview.js'
import * as disciplines from './aap-disciplines.js'
import * as cnu from '../../components/cnu.js'
import * as color from '../../components/color.js'
import { cropText } from '../../components/utilities.js'
import { bubbleChartX } from '../../components/bubble-chart.js'
import { donutChart } from '../../components/pie-chart.js'
```

<div class="warning" label="Notice sur les données">
  Les visualisations de données n'ont pas été vérifiées et peuvent contenir des
  erreurs. Considérez ces visualisations comme des estimations et non comme une
  « réalité absolue ».
</div>

## Chiffres clés

<div class="grid grid-cols-4">
  <div class="card">
    <h2>N° Projets AAP 1 <span class="muted">(Totale / Lauréats)</span></h2>
    <span class="big">
      <span class="muted">
        ${[...await sql`select count(*) as count from aap1_projects`][0].count.toLocaleString()}
        <!-- $ -->
      </span> /
      ${[...await sql`select count(*) as count from aap1_projects where financed`][0].count.toLocaleString()}
      <!-- $ -->
    </span>
  </div>
  <div class="card">
    <h2>N° Intitutions AAP 1 <span class="muted">(Totale / Lauréats)</span></h2>
    <span class="big">
      <span class="muted">
        ${[...await sql`select count(*) as count from aap1_institutions`][0].count.toLocaleString()}
        <!-- $ -->
      </span> /
      ${[...await sql`
        select count(*) as count
        from aap1_project_by_institutions
        join aap1_projects
        on aap1_project_by_institutions.project = aap1_projects.acronyme
        where financed
      `][0].count.toLocaleString()}
      <!-- $ -->
    </span>
  </div>
  <div class="card">
    <h2>N° Unités AAP 1 <span class="muted">(Totale / Lauréats)</span></h2>
    <span class="big">
      <span class="muted">
        ${[...await sql`select count(*) as count from aap1_laboratories`][0].count.toLocaleString()}
        <!-- $ -->
      </span> /
      ${[...await sql`
        select count(*) as count
        from aap1_project_by_laboratories
        join aap1_projects
        on aap1_project_by_laboratories.project = aap1_projects.acronyme
        where financed
      `][0].count.toLocaleString()}
      <!-- $ -->
    </span>
  </div>
  <div class="card">
    <h2>N° Partenaires AAP 1 <span class="muted">(Totale / Lauréats)</span></h2>
    <span class="big">
      <span class="muted">
        ${[...await sql`select count(*) as count from aap1_socioeconomic_partners`][0].count.toLocaleString()}
        <!-- $ -->
      </span> /
      ${[...await sql`
        select count(*) as count
        from aap1_project_by_socioeconomic_partners
        join aap1_projects
        on aap1_project_by_socioeconomic_partners.project = aap1_projects.acronyme
        where financed
      `][0].count.toLocaleString()}
      <!-- $ -->
    </span>
  </div>
</div>

<div class="grid grid-cols-4">
  <div class="card">
    <h2>N° Projets AAP 2 <span class="muted">(Totale / Lauréats)</span></h2>
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
    <h2>N° Intitutions AAP 2 <span class="muted">(Totale / Lauréats)</span></h2>
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
    <h2>N° Unités AAP 2 <span class="muted">(Totale / Lauréats)</span></h2>
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
    <h2>N° Partenaires AAP 2 <span class="muted">(Totale / Lauréats)</span></h2>
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
    <h2>AAP 1 projets financées par n° d'institutions</h2>
    <br/>
    ${aap1_project_universities_sort_input}
    <!-- $ -->
    ${resize((width) => overview.projectCountPlot(
      aap1_project_by_institutions_count,
      {
        width,
        y_label: "Projets",
        x_label: "N° Institutions",
        sort_value: aap1_project_universities_sort,
      }
    ))}
    <!-- $ -->
  </div>
  <div class="card">
    <h2>AAP 1 projets financées par n° d'unités</h2>
    <br/>
    ${aap1_project_laboratories_sort_input}
    <!-- $ -->
    ${resize((width) => overview.projectCountPlot(
      aap1_project_by_laboratories_count,
      {
        width,
        y_label: "Projets",
        x_label: "N° Unités",
        sort_value: aap1_project_laboratories_sort,
      }
    ))}
    <!-- $ -->
  </div>
  <div class="card">
    <h2>AAP 1 projets financées par n° de partenaires</h2>
    <br/>
    ${aap1_project_partners_sort_input}
    <!-- $ -->
    ${resize((width) => overview.projectCountPlot(
      aap1_project_by_socioeconomic_partners_count,
      {
        width,
        y_label: "Projets",
        x_label: "N° Partenaires",
        sort_value: aap1_project_partners_sort,
      }
    ))}
    <!-- $ -->
  </div>
</div>

```sql id=aap1_project_by_institutions_count
select count(*) as count, project
from aap1_project_by_institutions
where project in (select acronyme from aap1_projects where financed)
group by project
```

```sql id=aap1_project_by_laboratories_count
select count(*) as count, project
from aap1_project_by_laboratories
where project in (select acronyme from aap1_projects where financed)
group by project
```

```sql id=aap1_project_by_socioeconomic_partners_count
select count(*) as count, project
from aap1_project_by_socioeconomic_partners
where project in (select acronyme from aap1_projects where financed)
group by project
```

```js
const aap1_project_universities_sort_input = overview.ySortSelect()
const aap1_project_universities_sort = Generators.input(
  aap1_project_universities_sort_input,
)

const aap1_project_laboratories_sort_input = overview.ySortSelect()
const aap1_project_laboratories_sort = Generators.input(
  aap1_project_laboratories_sort_input,
)

const aap1_project_partners_sort_input = overview.ySortSelect()
const aap1_project_partners_sort = Generators.input(
  aap1_project_partners_sort_input,
)
```

<div class="grid grid-cols-3">
  <div class="card">
    <h2>Top 15 AAP 2 projets par n° d'institutions</h2>
    <br/>
    ${aap2_project_universities_sort_input}
    <!-- $ -->
    ${resize((width) => overview.projectCountPlot(
      aap2_project_by_institutions_count,
      {
        width,
        y_label: "Projets",
        x_label: "N° Institutions",
        sort_value: aap2_project_universities_sort,
      }
    ))}
    <!-- $ -->
  </div>
  <div class="card">
    <h2>Top 15 AAP 2 projets par n° d'unités</h2>
    <br/>
    ${aap2_project_laboratories_sort_input}
    <!-- $ -->
    ${resize((width) => overview.projectCountPlot(
      aap2_project_by_laboratories_count,
      {
        width,
        y_label: "Projets",
        x_label: "N° Unités",
        sort_value: aap2_project_laboratories_sort,
      }
    ))}
    <!-- $ -->
  </div>
  <div class="card">
    <h2>Top 15 AAP 2 projets par n° de partenaires</h2>
    <br/>
    ${aap2_project_partners_sort_input}
    <!-- $ -->
    ${resize((width) => overview.projectCountPlot(
      aap2_project_by_socioeconomic_partners_count,
      {
        width,
        y_label: "Projets",
        x_label: "N° Partenaires",
        sort_value: aap2_project_partners_sort,
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
const aap2_project_universities_sort_input = overview.ySortSelect()
const aap2_project_universities_sort = Generators.input(
  aap2_project_universities_sort_input,
)

const aap2_project_laboratories_sort_input = overview.ySortSelect()
const aap2_project_laboratories_sort = Generators.input(
  aap2_project_laboratories_sort_input,
)

const aap2_project_partners_sort_input = overview.ySortSelect()
const aap2_project_partners_sort = Generators.input(
  aap2_project_partners_sort_input,
)
```

## Partenaires

<div class="grid grid-cols-3">
  <div class="card">
    <h2>Top 15 AAP 1 institutions financées par n° d'occurences</h2>
    ${aap1_universities_sort_input}
    <!-- $ -->
    ${resize((width) => overview.partnerCountPlot(
      aap1_institutions_count,
      {
        width,
        y_label: "Institution (label / SIRET)",
        x_label: "N° Occurences",
        sort_value: aap1_universities_sort,
      }
    ))}
    <!-- $ -->
  </div>
  <div class="card">
    <h2>Top 15 AAP 1 unités de recherche financées par n° d'occurences</h2>
    ${aap1_laboratories_sort_input}
    <!-- $ -->
    ${resize((width) => overview.partnerCountPlot(
      aap1_laboratories_count,
      {
        width,
        marginLeft: 150,
        lineWidth: 13,
        y_label: "Unité (Sigle / RNSR)",
        x_label: "N° Occurences",
        sort_value: aap1_laboratories_sort,
        textOverflow: 'ellipsis',
      }
    ))}
    <!-- $ -->
  </div>
  <div class="card">
    <h2>Top 15 AAP 1 partnaires financés par n° d'occurences</h2>
    ${aap1_partners_sort_input}
    <!-- $ -->
    ${resize((width) => overview.partnerCountPlot(
      aap1_partners_count,
      {
        width,
        y_label: "Partnaire (label / SIRET)",
        x_label: "N° Occurences",
        sort_value: aap1_partners_sort,
      }
    ))}
    <!-- $ -->
  </div>
</div>

```sql id=aap1_institutions_count
select
  if(siret is null, '', siret::VARCHAR) as id,
  if(nom_complet is null, university, nom_complet) as label,
  count(*) as count
from aap1_project_by_institutions
  left join aap1_institutions
  on aap1_project_by_institutions.university = aap1_institutions.label
where project in (select acronyme from aap1_projects where financed)
  and university is not null
group by siret, nom_complet, university
```

```sql id=aap1_laboratories_count
select
  if(
    numero_national_de_structure is null,
    '',
    numero_national_de_structure::VARCHAR
  ) as id,
  if(
    libelle is null,
    label[12:],
    if(
      first(sigle) is not null,
      first(sigle),
      libelle
    )
  ) as label,
  count(*) as count
from aap1_project_by_laboratories
  left join aap1_laboratories
  on aap1_project_by_laboratories.lab = aap1_laboratories.label
where project in (select acronyme from aap1_projects where financed)
  and label is not null
group by numero_national_de_structure, libelle, label
```

```sql id=aap1_partners_count
select
  -- *
  if(siret is null, '', siret::VARCHAR) as id,
  label,
  count(*) as count
from aap1_project_by_socioeconomic_partners
  left join aap1_socioeconomic_partners
  on aap1_project_by_socioeconomic_partners.partner = aap1_socioeconomic_partners.label
where project in (select acronyme from aap1_projects where financed)
  and label is not null
group by siret, label
```

```js
const aap1_universities_sort_input = overview.ySortSelect()
const aap1_universities_sort = Generators.input(aap1_universities_sort_input)

const aap1_laboratories_sort_input = overview.ySortSelect()
const aap1_laboratories_sort = Generators.input(aap1_laboratories_sort_input)

const aap1_partners_sort_input = overview.ySortSelect()
const aap1_partners_sort = Generators.input(aap1_partners_sort_input)
```

<div class="grid grid-cols-3">
  <div class="card">
    <h2>Top 15 AAP 2 institutions par n° d'occurences</h2>
    ${aap2_universities_sort_input}
    <!-- $ -->
    ${resize((width) => overview.partnerCountPlot(
      aap2_institutions_count,
      {
        width,
        y_label: "Institution (label / SIRET)",
        x_label: "N° Occurences",
        sort_value: aap2_universities_sort,
      }
    ))}
    <!-- $ -->
  </div>
  <div class="card">
    <h2>Top 15 AAP 2 unités de recherche par n° d'occurences</h2>
    ${aap2_laboratories_sort_input}
    <!-- $ -->
    ${resize((width) => overview.partnerCountPlot(
      aap2_laboratories_count,
      {
        width,
        marginLeft: 100,
        y_label: "Unité (Sigle / RNSR)",
        x_label: "N° Occurences",
        sort_value: aap2_laboratories_sort,
      }
    ))}
    <!-- $ -->
  </div>
  <div class="card">
    <h2>Top 15 AAP 2 partnaires par n° d'occurences</h2>
    ${aap2_partners_sort_input}
    <!-- $ -->
    ${resize((width) => overview.partnerCountPlot(
      aap2_partners_count,
      {
        width,
        y_label: "Partnaire (label / SIRET)",
        x_label: "N° Occurences",
        sort_value: aap2_partners_sort,
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
  if(sigle is null, split(labels, ',')[1], sigle) as label,
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
const aap2_universities_sort_input = overview.ySortSelect()
const aap2_universities_sort = Generators.input(aap2_universities_sort_input)

const aap2_laboratories_sort_input = overview.ySortSelect()
const aap2_laboratories_sort = Generators.input(aap2_laboratories_sort_input)

const aap2_partners_sort_input = overview.ySortSelect()
const aap2_partners_sort = Generators.input(aap2_partners_sort_input)
```

## Défis

<div class="grid grid-cols-3">
  <div class="card">
    ${resize((width) => overview.challengeCountPlot(challenge_count, { width }))}
    <!-- $ -->
  </div>
</div>

```sql id=challenge_count
select
  '1' as defi,
  count(*) as count
from aap2_projects
where defi_1_1 or defi_1_2
union
select
  '2' as defi,
  count(*) as count
from aap2_projects
where defi_2_1 or defi_2_2
union
select
  '3' as defi,
  count(*) as count
from aap2_projects
where defi_3_1 or defi_3_2
union
select
  '4' as defi,
  count(*) as count
from aap2_projects
where defi_4_1 or defi_4_2
union
select
  '5' as defi,
  count(*) as count
from aap2_projects
where defi_5_1 or defi_5_2
union
select
  '6' as defi,
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

## CNUs

### Legend

${disciplines.erc_legend}

<!-- $ -->

<div class="grid grid-cols-2">
  <div class="card">
    <h2>Distribution des CNUs par catégorie</h2>
    <br/>
    ${resize((width, height) => disciplines.erc_donut(
      aap2_project_by_cnu_erc,
      width,
      height - 50
    ))}
    <!-- $ -->
  </div>
  <div class="card">
    <h2>Distribution des CNUs par catégorie</h2>
    <br/>
    ${resize((width, height) => disciplines.erc_donut(
      aap2_project_by_cnu_erc,
      width,
      height - 50
    ))}
    <!-- $ -->
  </div>
  <div class="card grid-rowspan-2">
    <h2>Distribution des sections CNU</h2>
    ${resize((width) => disciplines.cnu_plot_by_erc(
      aap2_project_by_cnu,
      {
        width: width,
        sort: 'y',
        x_accessor: (d) => d.count,
        y_accessor: (d) => cnu.cnu_section_label_map.get(Number(d.cnu)) || String(d.cnu),
        marginTop: 0,
      }
    ))}
    <!-- $ -->
  </div>
</div>

```sql id=aap2_project_by_cnu
select
  cnu,
  count(*) as count
from aap2_project_by_cnu
where cnu is not null and cnu::VARCHAR != ''
group by cnu
order by count desc
```

```js
const aap2_project_by_cnu_erc = d3.rollups(
  aap2_project_by_cnu,
  (v) => v.length,
  (d) => cnu.getERCFromCNU(d.cnu),
)
```

```sql id=aap2_project_by_cnu_labels
select * from aap2_project_by_cnu_labels
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

### AAP1

TBD

### AAP2

<div class="grid grid-cols-3">
  <div class="card">
    <h3>Missing Institution SIRETs</h3>
    ${missing_institution_siret.count} /
    ${[...await sql`
      select count(*) as count from aap2_institutions
    `][0].count.toLocaleString()}
    <!-- $ -->
  </div>
  <div class="card">
    <h3>Missing Laboratories SIRETs</h3>
    ${missing_laboratories_siret.count} /
    ${[...await sql`
      select count(*) as count from aap2_laboratories
    `][0].count.toLocaleString()}
    <!-- $ -->
  </div>
  <div class="card">
    <h3>Missing Partner SIRETs</h3>
    ${missing_partner_siret.count} /
    ${[...await sql`
      select count(*) as count from aap2_socioeconomic_partners
    `][0].count.toLocaleString()}
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

```sql
select * from aap2_projects
```

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
select * from (
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
