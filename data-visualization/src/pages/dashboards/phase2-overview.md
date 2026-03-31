---
sql:
  aap1_projects: /data/phase1-projects.tsv
  aap1_researchers: /data/phase1-researchers.tsv
  aap1_researcher_by_keywords: /data/phase1-researcher_by_keywords.tsv
  aap1_laboratories: /data/phase1-laboratories.tsv
  aap1_socioeconomic_partners: /data/phase1-socioeconomic_partners.tsv
  aap1_project_by_keyword: /data/phase1-project_by_keyword.tsv
  aap1_project_by_challenge: /data/phase1-project_by_challenge.tsv
  # aap1_project_by_cnu: /data/phase1-project_by_cnu.tsv
  # aap1_project_by_cnu_labels: /data/phase1-project_by_cnu_labels.tsv
  aap1_project_by_institutions: /data/phase1-project_by_institutions.tsv
  aap1_project_by_laboratories: /data/phase1-project_by_laboratories.tsv
  aap1_project_by_researchers: /data/phase1-project_by_researchers.tsv
  aap1_laboratories_by_domains_erc: /data/phase1-laboratories_by_domains_erc.tsv
  aap1_laboratories_by_disciplines_erc: /data/phase1-laboratories_by_disciplines_erc.tsv
  aap1_laboratories_by_domains_hceres: /data/phase1-laboratories_by_domains_hceres.tsv
  aap1_laboratories_by_disciplines_hceres: /data/phase1-laboratories_by_disciplines_hceres.tsv
  aap1_institutions: /data/phase1-institutions.tsv
  aap1_project_by_socioeconomic_partners: /data/phase1-project_by_socioeconomic_partners.tsv
  aap2_projects: /data/phase2-projects.tsv
  aap2_researchers: /data/phase2-researchers.tsv
  # aap2_researcher_by_keywords: /data/phase2-researcher_by_keywords.tsv
  aap2_researcher_by_cnu: /data/phase2-researcher_by_cnu.tsv
  aap2_institutions: /data/phase2-institutions.tsv
  aap2_laboratories: /data/phase2-laboratories.tsv
  aap2_socioeconomic_partners: /data/phase2-socioeconomic_partners.tsv
  aap2_project_by_keyword: /data/phase2-project_by_keyword.tsv
  # aap2_project_by_challenge: /data/phase2-project_by_challenge.tsv
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

# Résumé des projets PEPR VDBI

## Appels de la phase 1 et 2

```js
import * as overview from './aap-overview.js'
import * as disciplines from './aap-disciplines.js'
import * as cnu from '../../components/cnu.js'
import * as color from '../../components/color.js'
import { cropText } from '../../components/utilities.js'
import { bubbleChartX } from '../../components/bubble-chart.js'
import { donutChart } from '../../components/pie-chart.js'
import {
  choroplethFrance,
  mainland_france_departements_geojson,
} from '../../components/projection-map.js'
```

<div class="warning" label="Avertissement sur la qualité des données">
  Les visualisations de données n'ont pas été vérifiées et peuvent contenir des
  erreurs. Considérez ces visualisations comme des estimations et non comme une
  « réalité absolue ».
</div>

<div class="note" label="Notice">
  Les chiffres des partenaires socio-économiques comptent également les parties
  prenantes dans ce page.
</div>

## Chiffres clés

<div class="grid grid-cols-4">
  <div class="card">
    <h2>Nombre de projets AAP 1 <br/><span class="muted">(Soumis / Lauréats)</span></h2>
    <span class="big">
      <span class="muted">
        ${[...await sql`
          select count(*) as count from aap1_projects
        `][0].count.toLocaleString()}
        <!-- $ -->
      </span> /
      ${[...await sql`
        select count(*) as count from aap1_projects where financed
      `][0].count.toLocaleString()}
      <!-- $ -->
    </span>
  </div>
  <div class="card">
    <h2>Nombre d'intitutions AAP 1 <br/><span class="muted">(Soumis / Lauréats)</span></h2>
    <span class="big">
      <span class="muted">
        ${[...await sql`
          select count(*) as count from aap1_institutions
        `][0].count.toLocaleString()}
        <!-- $ -->
      </span> /
      ${[...await sql`
        select count(*) as count
        from aap1_institutions
        where label in (
          select university
          from aap1_project_by_institutions
          where project in (
            select acronyme
            from aap1_projects
            where financed
          )
        )
      `][0].count.toLocaleString()}
      <!-- $ -->
    </span>
  </div>
  <div class="card">
    <h2>Nombre d'unités AAP 1 <br/><span class="muted">(Soumis / Lauréats)</span></h2>
    <span class="big">
      <span class="muted">
        ${[...await sql`
          select count(*) as count from aap1_laboratories
        `][0].count.toLocaleString()}
        <!-- $ -->
      </span> /
      ${[...await sql`
        select count(*) as count
        from aap1_laboratories
        where label in (
          select lab
          from aap1_project_by_laboratories
          where project in (
            select acronyme
            from aap1_projects
            where financed
          )
        )
      `][0].count.toLocaleString()}
      <!-- $ -->
    </span>
  </div>
  <div class="card">
    <h2>
      Nombre de partenaires socioéconomiques AAP 1
      <br/><span class="muted">(Soumis / Lauréats)</span>
    </h2>
    <span class="big">
      <span class="muted">
        ${[...await sql`
          select count(*) as count from aap1_socioeconomic_partners`][
        0].count.toLocaleString()}
        <!-- $ -->
      </span> /
      ${[...await sql`
        select count(*) as count
        from aap1_socioeconomic_partners
        where label in (
          select partner
          from aap1_project_by_socioeconomic_partners
          where project in (
            select acronyme
            from aap1_projects
            where financed
          )
        )
      `][0].count.toLocaleString()}
      <!-- $ -->
    </span>
  </div>
</div>

<div class="grid grid-cols-4">
  <div class="card">
    <h2>Nombre de projets AAP 2 <br/><span class="muted">(Soumis / Lauréats)</span></h2>
    <span class="big">
      <span class="muted">
        ${[...await sql`
          select count(*) as count from aap2_projects
        `][0].count.toLocaleString()}
        <!-- $ -->
      </span> / 0
      <!-- ${financed_project_count.c.toLocaleString()} -->
      <!-- $ -->
    </span>
  </div>
  <div class="card">
    <h2>Nombre d'intitutions AAP 2 <br/><span class="muted">(Soumis / Lauréats)</span></h2>
    <span class="big">
      <span class="muted">
        ${[...await sql`
          select count(*) as count from aap2_institutions
        `][0].count.toLocaleString()}
        <!-- $ -->
      </span> / 0
      <!-- ${financed_university_data.size.toLocaleString()} -->
      <!-- $ -->
    </span>
  </div>
  <div class="card">
    <h2>Nombre d'unités AAP 2 <br/><span class="muted">(Soumis / Lauréats)</span></h2>
    <span class="big">
      <span class="muted">
        ${[...await sql`
          select count(*) as count from aap2_laboratories
        `][0].count.toLocaleString()}
        <!-- $ -->
      </span> / 0
      <!-- ${financed_laboratory_data.size.toLocaleString()} -->
      <!-- $ -->
    </span>
  </div>
  <div class="card">
    <h2>
      Nombre de partenaires socioéconomiques AAP 2
      <br/><span class="muted">(Soumis / Lauréats)</span>
    </h2>
    <span class="big">
      <span class="muted">
        ${[...await sql`
          select count(*) as count from aap2_socioeconomic_partners
        `][0].count.toLocaleString()}
        <!-- $ -->
      </span> / 0
      <!-- ${financed_partner_data.size.toLocaleString()} -->
      <!-- $ -->
    </span>
  </div>
</div>

## Projets par partenaires

<div class="grid grid-cols-3">
  <!-- AAP 1 -->
  <div class="card">
    <h2>AAP 1 projets financées par nombre d'institutions</h2>
    <br/>
    ${aap1_project_universities_sort_input}
    <!-- $ -->
    ${resize((width) => overview.projectCountPlotAAP1(
      aap1_project_by_institutions_count,
      {
        width,
        y_label: "Projets",
        x_label: "Nombre d'institutions",
        sort_value: aap1_project_universities_sort,
        max_partner_count: max_institutions_count,
      }
    ))}
    <!-- $ -->
  </div>
  <div class="card">
    <h2>AAP 1 projets financées par nombre d'unités</h2>
    <br/>
    ${aap1_project_laboratories_sort_input}
    <!-- $ -->
    ${resize((width) => overview.projectCountPlotAAP1(
      aap1_project_by_laboratories_count,
      {
        width,
        y_label: "Projets",
        x_label: "Nombre d'unités",
        sort_value: aap1_project_laboratories_sort,
        max_partner_count: max_laboratories_count,
      }
    ))}
    <!-- $ -->
  </div>
  <div class="card">
    <h2>AAP 1 projets financées par nombre de partenaires socioeconomiques</h2>
    <br/>
    ${aap1_project_partners_sort_input}
    <!-- $ -->
    ${resize((width) => overview.projectCountPlotAAP1(
      aap1_project_by_socioeconomic_partners_count,
      {
        width,
        y_label: "Projets",
        x_label: "Nombre de partenaires",
        sort_value: aap1_project_partners_sort,
        max_partner_count: max_socioeconomic_partners_count,
      }
    ))}
    <!-- $ -->
  </div>
  <!-- AAP 2 -->
  <div class="card">
    <h2>Top 15 AAP 2 projets par nombre d'institutions</h2>
    <br/>
    ${aap2_project_universities_sort_input}
    <!-- $ -->
    ${resize((width) => overview.projectCountPlotAAP2(
      aap2_project_by_institutions_count,
      {
        width,
        y_label: "Projets",
        x_label: "Nombre d'institutions",
        sort_value: aap2_project_universities_sort,
        max_partner_count: max_institutions_count,
      }
    ))}
    <!-- $ -->
  </div>
  <div class="card">
    <h2>Top 15 AAP 2 projets par nombre d'unités</h2>
    <br/>
    ${aap2_project_laboratories_sort_input}
    <!-- $ -->
    ${resize((width) => overview.projectCountPlotAAP2(
      aap2_project_by_laboratories_count,
      {
        width,
        y_label: "Projets",
        x_label: "Nombre d'unités",
        sort_value: aap2_project_laboratories_sort,
        max_partner_count: max_laboratories_count,
      }
    ))}
    <!-- $ -->
  </div>
  <div class="card">
    <h2>Top 15 AAP 2 projets par nombre de partenaires socioeconomiques</h2>
    <br/>
    ${aap2_project_partners_sort_input}
    <!-- $ -->
    ${resize((width) => overview.projectCountPlotAAP2(
      aap2_project_by_socioeconomic_partners_count,
      {
        width,
        y_label: "Projets",
        x_label: "Nombre de partenaires",
        sort_value: aap2_project_partners_sort,
        max_partner_count: max_socioeconomic_partners_count,
      }
    ))}
    <!-- $ -->
  </div>
</div>

```sql id=aap1_project_by_institutions_count
select
  count(*) as count,
  project,
from aap1_project_by_institutions
where project in (select acronyme from aap1_projects where financed)
group by project
```

```sql id=aap1_project_by_laboratories_count
select
  count(*) as count,
  project,
from aap1_project_by_laboratories
where project in (select acronyme from aap1_projects where financed)
group by project
```

```sql id=aap1_project_by_socioeconomic_partners_count
select
  count(*) as count,
  project,
from aap1_project_by_socioeconomic_partners
where project in (select acronyme from aap1_projects where financed)
group by project
```

```sql id=aap2_project_by_institutions_count
select
  count(*) as count,
  project,
  first(TYPDOC) as type,
from aap2_project_by_institutions
join aap2_projects
  on aap2_project_by_institutions.project = aap2_projects.acronyme
group by project
```

```sql id=aap2_project_by_laboratories_count
select
  count(*) as count,
  project,
  first(TYPDOC) as type,
from aap2_project_by_laboratories
join aap2_projects
  on aap2_project_by_laboratories.project = aap2_projects.acronyme
group by project
```

```sql id=aap2_project_by_socioeconomic_partners_count
select
  count(*) as count,
  project,
  first(TYPDOC) as type,
from aap2_project_by_socioeconomic_partners
join aap2_projects
  on aap2_project_by_socioeconomic_partners.project = aap2_projects.acronyme
group by project
```

```js
const max_institutions_count = Math.max(
  ...[...aap1_project_by_institutions_count].map((d) => d.count),
  ...[...aap2_project_by_institutions_count].map((d) => d.count),
)

const max_laboratories_count = Math.max(
  ...[...aap1_project_by_laboratories_count].map((d) => d.count),
  ...[...aap2_project_by_laboratories_count].map((d) => d.count),
)

const max_socioeconomic_partners_count = Math.max(
  ...[...aap1_project_by_socioeconomic_partners_count].map((d) => d.count),
  ...[...aap2_project_by_socioeconomic_partners_count].map((d) => d.count),
)
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

<div class="warning" label="Avertissement sur la qualité des données">

Rappel : Les partenaires des AAPs ne sont donc pas prise en compte dans le cas où
leurs informations sont mal renseignées ou manquantes. Voir la section
[qualité des données](#qualité-des-données) pour plus de détails.

</div>

<div class="grid grid-cols-3">
  <!-- AAP 1 -->
  <div class="card">
    <h2>Top 15 institutions financées de l'AAP 1</h2>
    <h3>
      Top 15 institutions partenaires des projets financées de l'AAP 1 par
      nombre d'occurences
    </h3>
    ${aap1_universities_sort_input}
    <!-- $ -->
    ${resize((width) => overview.partnerCountPlot(
      aap1_institutions_count,
      {
        width,
        y_label: "Institution (label / SIRET)",
        sort_value: aap1_universities_sort,
      }
    ))}
    <!-- $ -->
  </div>
  <div class="card">
    <h2>Top 15 unités de recherche financées de l'AAP 1</h2>
    <h3>
      Top 15 unités de recherche partenaires des projets financées de l'AAP 1 par
      nombre d'occurences
    </h3>
    ${aap1_laboratories_sort_input}
    <!-- $ -->
    ${resize((width) => overview.partnerCountPlot(
      aap1_laboratories_count,
      {
        width,
        marginLeft: 170,
        lineWidth: 15,
        y_label: "Unité (Sigle / RNSR)",
        sort_value: aap1_laboratories_sort,
        textOverflow: 'ellipsis',
      }
    ))}
    <!-- $ -->
  </div>
  <div class="card">
    <h2>Top 15 partenaires socioéconomiques financés de l'AAP 1</h2>
    <h3>
      Top 15 partenaires socioéconomiques des projets financés de l'AAP 1 par
      nombre d'occurences
    </h3>
    ${aap1_partners_sort_input}
    <!-- $ -->
    ${resize((width) => overview.partnerCountPlot(
      aap1_partners_count,
      {
        width,
        y_label: "Partnaire (label / SIRET)",
        sort_value: aap1_partners_sort,
      }
    ))}
    <!-- $ -->
  </div>
  <!-- AAP2 -->
  <div class="card">
    <h2>Top 15 AAP 2 institutions par nombre d'occurences</h2>
    ${aap2_universities_sort_input}
    <!-- $ -->
    ${resize((width) => overview.partnerCountPlot(
      aap2_institutions_count,
      {
        width,
        y_label: "Institution (label / SIRET)",
        sort_value: aap2_universities_sort,
      }
    ))}
    <!-- $ -->
  </div>
  <div class="card">
    <h2>Top 15 AAP 2 unités de recherche par nombre d'occurences</h2>
    ${aap2_laboratories_sort_input}
    <!-- $ -->
    ${resize((width) => overview.partnerCountPlot(
      aap2_laboratories_count,
      {
        width,
        marginLeft: 170,
        lineWidth: 15,
        y_label: "Unité (Sigle / RNSR)",
        sort_value: aap2_laboratories_sort,
      }
    ))}
    <!-- $ -->
  </div>
  <div class="card">
    <h2>Top 15 AAP 2 partnaires par nombre d'occurences</h2>
    ${aap2_partners_sort_input}
    <!-- $ -->
    ${resize((width) => overview.partnerCountPlot(
      aap2_partners_count,
      {
        width,
        y_label: "Partnaire (label / SIRET)",
        sort_value: aap2_partners_sort,
      }
    ))}
    <!-- $ -->
  </div>
  <!-- AAP2 proposals -->
  <div class="card">
    <h2>Top 15 AAP 2 institutions preselectionnées par nombre d'occurences</h2>
    ${aap2_selected_universities_sort_input}
    <!-- $ -->
    ${resize((width) => overview.partnerCountPlot(
      aap2_selected_institutions_count,
      {
        width,
        y_label: "Institution (label / SIRET)",
        sort_value: aap2_selected_universities_sort,
      }
    ))}
    <!-- $ -->
  </div>
  <div class="card">
    <h2>Top 15 AAP 2 unités de recherche preselectionnées par nombre d'occurences</h2>
    ${aap2_selected_laboratories_sort_input}
    <!-- $ -->
    ${resize((width) => overview.partnerCountPlot(
      aap2_selected_laboratories_count,
      {
        width,
        marginLeft: 170,
        lineWidth: 15,
        y_label: "Unité (Sigle / RNSR)",
        sort_value: aap2_selected_laboratories_sort,
      }
    ))}
    <!-- $ -->
  </div>
  <div class="card">
    <h2>Top 15 AAP 2 partnaires preselectionnées par nombre d'occurences</h2>
    ${aap2_selected_partners_sort_input}
    <!-- $ -->
    ${resize((width) => overview.partnerCountPlot(
      aap2_selected_partners_count,
      {
        width,
        y_label: "Partnaire (label / SIRET)",
        sort_value: aap2_selected_partners_sort,
      }
    ))}
    <!-- $ -->
  </div>
</div>

```sql id=aap1_institutions_count
select
  siren::VARCHAR as id,
  first(nom_complet) as label,
  list_distinct(list(libelle_commune))::VARCHAR as communes,
  count(*) as count
from aap1_project_by_institutions
  left join aap1_institutions
  on aap1_project_by_institutions.university = aap1_institutions.label
where project in (select acronyme from aap1_projects where financed)
  and siren is not null
group by siren
```

```sql id=aap1_laboratories_count
select
  numero_national_de_structure::VARCHAR as id,
  if(
    length(list_distinct(list(sigle))) > 0,
    list_distinct(list(sigle))[1],
    first(libelle)
  ) as label,
  list_distinct(list(commune))::VARCHAR as communes,
  count(*) as count
from aap1_project_by_laboratories
  left join aap1_laboratories
  on aap1_project_by_laboratories.lab = aap1_laboratories.label
where project in (select acronyme from aap1_projects where financed)
  and numero_national_de_structure is not null
group by numero_national_de_structure
```

```sql id=aap1_partners_count
select
  if(siren is null, '', siren::VARCHAR) as id,
  label,
  list_distinct(list(libelle_commune))::VARCHAR as communes,
  count(*) as count,
from aap1_project_by_socioeconomic_partners
  left join aap1_socioeconomic_partners
  on aap1_project_by_socioeconomic_partners.partner = aap1_socioeconomic_partners.label
where project in (select acronyme from aap1_projects where financed)
  and label is not null
group by siren, label
```

```sql id=aap2_institutions_count
select
  siren::VARCHAR as id,
  first(nom_complet) as label,
  list_distinct(list(libelle_commune))::VARCHAR as communes,
  sum(count) as count,
from aap2_institutions
where siren is not null
group by siren
```

```sql id=aap2_laboratories_count
select
  numero_national_de_structure::VARCHAR as id,
  if(
    length(list_distinct(list(sigle))) > 0,
    list_distinct(list(sigle))[1],
    first(libelle)
  ) as label,
  list_distinct(list(commune))::VARCHAR as communes,
  sum(count) as count,
from aap2_laboratories
where numero_national_de_structure is not null
group by numero_national_de_structure
```

```sql id=aap2_partners_count
select
  siren::VARCHAR as id,
  first(nom_complet) as label,
  list_distinct(list(libelle_commune))::VARCHAR as communes,
  sum(count)::INT as count,
from aap2_socioeconomic_partners
where siren is not null
group by siren
```

```sql id=aap2_selected_institutions_count
with selected_institutions as (
  select
    institution_id,
    count(*) as count,
  from aap2_project_by_institutions
  where project in (
    select acronyme from aap2_projects where selected
  )
  group by institution_id
)

select
  siren::VARCHAR as id,
  first(nom_complet) as label,
  list_distinct(list(libelle_commune))::VARCHAR as communes,
  sum(selected_institutions.count) as count,
from aap2_institutions
join selected_institutions
  on aap2_institutions.id::VARCHAR = selected_institutions.institution_id::VARCHAR
where siren is not null
group by siren
```

```sql id=aap2_selected_laboratories_count
with selected_labs as (
  select
    unit_id,
    count(*) as count,
  from aap2_project_by_laboratories
  where project in (
    select acronyme from aap2_projects where selected
  )
  group by unit_id
)

select
  numero_national_de_structure::VARCHAR as id,
  if(
    length(list_distinct(list(sigle))) > 0,
    list_distinct(list(sigle))[1],
    first(libelle)
  ) as label,
  list_distinct(list(commune))::VARCHAR as communes,
  sum(selected_labs.count)::INT as count,
from aap2_laboratories
join selected_labs
  on aap2_laboratories.id = selected_labs.unit_id
where numero_national_de_structure is not null
group by numero_national_de_structure
```

```sql id=aap2_selected_partners_count
with selected_partners as (
  select
    partner_id,
    count(*) as count,
  from aap2_project_by_socioeconomic_partners
  where project in (
    select acronyme from aap2_projects where selected
  )
  group by partner_id
)

select
  siren::VARCHAR as id,
  first(nom_complet) as label,
  list_distinct(list(libelle_commune))::VARCHAR as communes,
  sum(selected_partners.count)::INT as count,
from aap2_socioeconomic_partners
join selected_partners
  on aap2_socioeconomic_partners.id = selected_partners.partner_id
where siren is not null
group by siren
```

```js
const aap1_universities_sort_input = overview.ySortSelect()
const aap1_universities_sort = Generators.input(aap1_universities_sort_input)

const aap1_laboratories_sort_input = overview.ySortSelect()
const aap1_laboratories_sort = Generators.input(aap1_laboratories_sort_input)

const aap1_partners_sort_input = overview.ySortSelect()
const aap1_partners_sort = Generators.input(aap1_partners_sort_input)
```

```js
const aap2_universities_sort_input = overview.ySortSelect()
const aap2_universities_sort = Generators.input(aap2_universities_sort_input)

const aap2_laboratories_sort_input = overview.ySortSelect()
const aap2_laboratories_sort = Generators.input(aap2_laboratories_sort_input)

const aap2_partners_sort_input = overview.ySortSelect()
const aap2_partners_sort = Generators.input(aap2_partners_sort_input)
```

```js
const aap2_selected_universities_sort_input = overview.ySortSelect()
const aap2_selected_universities_sort = Generators.input(
  aap2_selected_universities_sort_input,
)

const aap2_selected_laboratories_sort_input = overview.ySortSelect()
const aap2_selected_laboratories_sort = Generators.input(
  aap2_selected_laboratories_sort_input,
)

const aap2_selected_partners_sort_input = overview.ySortSelect()
const aap2_selected_partners_sort = Generators.input(
  aap2_selected_partners_sort_input,
)
```

### Les nouveaux partenaires

Les partenaires des projets de l'AAP 2 qui n'ont pas été soumises à l'AAP 1

```js
const partner_aap_comparison_table_config = {
  width: {
    SIRET: 120,
    RNSR: 90,
    sigle: 80,
  },
}
```

<div class="grid grid-cols-3">
  <div class="card">
    <h2>Nombre de nouveaux institutions</h2>
    <h3>
      Les institutions partenaires des projets de l'AAP 2 qui n'ont pas
      été soumises à l'AAP 1
    </h3>
    <span class="big">
      ${[...aap2_new_institutions].length}
      <!-- $ -->
    </span>
  </div>
  <div class="card">
    <h2>Nombre de nouveaux laboratoires</h2>
    <h3>
      Les laboratoires partenaires des projets de l'AAP 2 qui n'ont pas
      été soumises à l'AAP 1
    </h3>
    <span class="big">
      ${[...aap2_new_laboratories].length}
      <!-- $ -->
    </span>
  </div>
  <div class="card">
    <h2>Nombre de nouveaux partenaires socio-économiques</h2>
    <h3>
      Les partenaires socio-économiques des projets de l'AAP 2 qui n'ont pas
      été soumises à l'AAP 1
    </h3>
    <span class="big">
      ${[...aap2_new_socioeconomic_partners].length}
      <!-- $ -->
    </span>
  </div>
</div>

<div class="grid grid-cols-3">
  <div class="card">
    <h2>Liste des nouveaux institutions</h2>
    <h3>
      Les institutions partenaires des projets de l'AAP 2 qui n'ont pas
      été soumises à l'AAP 1
    </h3>
    <br/>
    ${resize((width) => Inputs.table(
      aap2_new_institutions,
      partner_aap_comparison_table_config
    ))}
    <!-- $ -->
  </div>
  <div class="card">
    <h2>Liste des nouveaux institutions</h2>
    <h3>
      Les laboratoires partenaires des projets de l'AAP 2 qui n'ont pas
      été soumises à l'AAP 1
    </h3>
    <br/>
    ${resize((width) => Inputs.table(
      aap2_new_laboratories,
      partner_aap_comparison_table_config
    ))}
    <!-- $ -->
  </div>
  <div class="card">
    <h2>Liste des nouveaux partenaires socio-économiques</h2>
    <h3>
      Les partenaires socio-économiques des projets de l'AAP 2 qui n'ont pas
      été soumises à l'AAP 1
    </h3>
    <br/>
    ${resize((width) => Inputs.table(
      aap2_new_socioeconomic_partners,
      partner_aap_comparison_table_config
    ))}
    <!-- $ -->
  </div>
</div>

```sql id=aap2_new_institutions
select
  first(aap2_institutions.nom_complet) as nom_complet,
  aap2_institutions.siret::VARCHAR as SIRET,
  -- aap1_institutions.source as aap1_source,
  -- aap2_institutions.source as aap2_source,
from aap1_institutions
right join aap2_institutions
  on aap1_institutions.siret::VARCHAR = aap2_institutions.siret::VARCHAR
where aap1_institutions.source is null and aap2_institutions.siret::VARCHAR != ''
group by aap2_institutions.siret,
  aap1_institutions.source, aap2_institutions.source
```

```sql id=aap2_new_laboratories
select
  first(aap2_laboratories.libelle) as libelle,
  first(aap2_laboratories.sigle) as sigle,
  aap2_laboratories.numero_national_de_structure as RNSR,
  -- aap1_laboratories.source as aap1_source,
  -- aap2_laboratories.source as aap2_source,
from aap1_laboratories
right join aap2_laboratories
  on aap1_laboratories.numero_national_de_structure::VARCHAR
    = aap2_laboratories.numero_national_de_structure::VARCHAR
where aap1_laboratories.source is null
  and aap2_laboratories.numero_national_de_structure::VARCHAR != ''
group by aap2_laboratories.numero_national_de_structure,
  aap1_laboratories.source, aap2_laboratories.source
```

```sql id=aap2_new_socioeconomic_partners
select
  first(aap2_socioeconomic_partners.nom_complet) as nom_complet,
  aap2_socioeconomic_partners.siret::VARCHAR as SIRET,
  -- aap1_socioeconomic_partners.source as aap1_source,
  -- aap2_socioeconomic_partners.source as aap2_source,
from aap1_socioeconomic_partners
right join aap2_socioeconomic_partners
  on aap1_socioeconomic_partners.siret::VARCHAR
    = aap2_socioeconomic_partners.siret::VARCHAR
where aap1_socioeconomic_partners.source is null
  and aap2_socioeconomic_partners.siret::VARCHAR != ''
group by aap2_socioeconomic_partners.siret,
  aap1_socioeconomic_partners.source, aap2_socioeconomic_partners.source
```

### Les projets familiers

Les partenaires des projets de l'AAP 2 qui ont été financées dans l'AAP 1

<div class="grid grid-cols-3">
  <div class="card">
    <h2>Nombre de nouveaux institutions</h2>
    <h3>
      Les institutions partenaires des projets de l'AAP 2 qui ont été financées
      dans l'AAP 1
    </h3>
    <span class="big">
      ${[...aap2_old_institutions].length}
      <!-- $ -->
    </span>
  </div>
  <div class="card">
    <h2>Nombre de nouveaux laboratoires</h2>
    <h3>
      Les laboratoires partenaires des projets de l'AAP 2 qui ont été financées
      dans l'AAP 1
    </h3>
    <span class="big">
      ${[...aap2_old_laboratories].length}
      <!-- $ -->
    </span>
  </div>
  <div class="card">
    <h2>Nombre de nouveaux partenaires socio-économiques</h2>
    <h3>
      Les partenaires socio-économiques des projets de l'AAP 2 qui ont été financées
      dans l'AAP 1
    </h3>
    <span class="big">
      ${[...aap2_old_socioeconomic_partners].length}
      <!-- $ -->
    </span>
  </div>
</div>

<div class="grid grid-cols-3">
  <div class="card">
    <h2>Liste des nouveaux institutions</h2>
    <h3>
      Les institutions partenaires des projets de l'AAP 2 qui ont été financées
      dans l'AAP 1
    </h3>
    <br/>
    ${resize((width) => Inputs.table(
      aap2_old_institutions,
      partner_aap_comparison_table_config
    ))}
    <!-- $ -->
  </div>
  <div class="card">
    <h2>Liste des nouveaux institutions</h2>
    <h3>
      Les laboratoires partenaires des projets de l'AAP 2 qui ont été financées
      dans l'AAP 1
    </h3>
    <br/>
    ${resize((width) => Inputs.table(
      aap2_old_laboratories,
      partner_aap_comparison_table_config
    ))}
    <!-- $ -->
  </div>
  <div class="card">
    <h2>Liste des nouveaux partenaires socio-économiques</h2>
    <h3>
      Les partenaires socio-économiques des projets de l'AAP 2 qui ont été financées
      dans l'AAP 1
    </h3>
    <br/>
    ${resize((width) => Inputs.table(
      aap2_old_socioeconomic_partners,
      partner_aap_comparison_table_config
    ))}
    <!-- $ -->
  </div>
</div>

```sql id=aap2_old_institutions
select
  first(aap2_institutions.nom_complet) as nom_complet,
  aap2_institutions.siret::VARCHAR as SIRET,
  -- aap1_institutions.source as aap1_source,
  -- aap2_institutions.source as aap2_source,
from aap1_institutions
right join aap2_institutions
  on aap1_institutions.siret::VARCHAR = aap2_institutions.siret::VARCHAR
where aap2_institutions.siret::VARCHAR != ''
  and aap1_institutions.label in (
    select distinct university from aap1_project_by_institutions
    where project in (
      select acronyme from aap1_projects where financed
    )
  )
group by aap2_institutions.siret,
  aap1_institutions.source, aap2_institutions.source
```

```sql id=aap2_old_laboratories
select
  first(aap2_laboratories.libelle) as libelle,
  first(aap2_laboratories.sigle) as sigle,
  aap2_laboratories.numero_national_de_structure as RNSR,
  -- aap1_laboratories.source as aap1_source,
  -- aap2_laboratories.source as aap2_source,
from aap1_laboratories
right join aap2_laboratories
  on aap1_laboratories.numero_national_de_structure::VARCHAR
    = aap2_laboratories.numero_national_de_structure::VARCHAR
where aap2_laboratories.numero_national_de_structure::VARCHAR != ''
  and aap1_laboratories.label in (
    select distinct lab from aap1_project_by_laboratories
    where project in (
      select acronyme from aap1_projects where financed
    )
  )
group by aap2_laboratories.numero_national_de_structure,
  aap1_laboratories.source, aap2_laboratories.source
```

```sql id=aap2_old_socioeconomic_partners
select
  first(aap2_socioeconomic_partners.nom_complet) as nom_complet,
  aap2_socioeconomic_partners.siret::VARCHAR as SIRET,
  -- aap1_socioeconomic_partners.source as aap1_source,
  -- aap2_socioeconomic_partners.source as aap2_source,
from aap1_socioeconomic_partners
right join aap2_socioeconomic_partners
  on aap1_socioeconomic_partners.siret::VARCHAR
    = aap2_socioeconomic_partners.siret::VARCHAR
where aap2_socioeconomic_partners.siret::VARCHAR != ''
  and aap1_socioeconomic_partners.label in (
    select distinct partner from aap1_project_by_socioeconomic_partners
    where project in (
      select acronyme from aap1_projects where financed
    )
  )
group by aap2_socioeconomic_partners.siret,
  aap1_socioeconomic_partners.source, aap2_socioeconomic_partners.source
```

### Les projets pas retenues

Les partenaires des projets de l'AAP 2 qui ont été soumises à l'AAP 1 mais pas financées

<div class="grid grid-cols-3">
  <div class="card">
    <h2>Nombre de nouveaux institutions</h2>
    <h3>
      Les institutions partenaires des projets de l'AAP 2 qui ont été soumises
      à l'AAP 1 mais pas financées
    </h3>
    <span class="big">
      ${[...aap2_rejected_institutions].length}
      <!-- $ -->
    </span>
  </div>
  <div class="card">
    <h2>Nombre de nouveaux laboratoires</h2>
    <h3>
      Les laboratoires partenaires des projets de l'AAP 2 qui ont été soumises
      à l'AAP 1 mais pas financées
    </h3>
    <span class="big">
      ${[...aap2_rejected_laboratories].length}
      <!-- $ -->
    </span>
  </div>
  <div class="card">
    <h2>Nombre de nouveaux partenaires socio-économiques</h2>
    <h3>
      Les partenaires socio-économiques des projets de l'AAP 2 qui ont été soumises
      à l'AAP 1 mais pas financées
    </h3>
    <span class="big">
      ${[...aap2_rejected_socioeconomic_partners].length}
      <!-- $ -->
    </span>
  </div>
</div>

<div class="grid grid-cols-3">
  <div class="card">
    <h2>Liste des nouveaux institutions</h2>
    <h3>
      Les institutions partenaires des projets de l'AAP 2 qui ont été soumises
      à l'AAP 1 mais pas financées
    </h3>
    <br/>
    ${resize((width) => Inputs.table(
      aap2_rejected_institutions,
      partner_aap_comparison_table_config
    ))}
    <!-- $ -->
  </div>
  <div class="card">
    <h2>Liste des nouveaux institutions</h2>
    <h3>
      Les laboratoires partenaires des projets de l'AAP 2 qui ont été soumises
      à l'AAP 1 mais pas financées
    </h3>
    <br/>
    ${resize((width) => Inputs.table(
      aap2_rejected_laboratories,
      partner_aap_comparison_table_config
    ))}
    <!-- $ -->
  </div>
  <div class="card">
    <h2>Liste des nouveaux partenaires socio-économiques</h2>
    <h3>
      Les partenaires socio-économiques des projets de l'AAP 2 qui ont été soumises
      à l'AAP 1 mais pas financées
    </h3>
    <br/>
    ${resize((width) => Inputs.table(
      aap2_rejected_socioeconomic_partners,
      partner_aap_comparison_table_config
    ))}
    <!-- $ -->
  </div>
</div>

```sql id=aap2_rejected_institutions
select
  first(nom_complet) as nom_complet,
  siret::VARCHAR as SIRET,
from (
  select
    siret,
    nom_complet,
  from aap1_institutions
  where siret::VARCHAR != ''
    and label in (
      select university
      from aap1_project_by_institutions
      group by university
      having not (
        list(project) &&
        (
          select list(acronyme)
          from aap1_projects
          where financed
        )
      )
    )
  union
  select
    siret,
    nom_complet
  from aap2_institutions
  where siret::VARCHAR != ''
)
group by siret
```

```sql id=aap2_rejected_laboratories
select
  first(libelle) as libelle,
  first(sigle) as sigle,
  numero_national_de_structure as RNSR,
from (
  select
    numero_national_de_structure,
    libelle,
    sigle,
  from aap1_laboratories
  where numero_national_de_structure::VARCHAR != ''
    and label in (
    select lab
    from aap1_project_by_laboratories
    group by lab
    having not (
      list(project) &&
      (
        select list(acronyme)
        from aap1_projects
        where financed
      )
    )
  )
  union
  select
    numero_national_de_structure,
    libelle,
    sigle,
  from aap2_laboratories
  where numero_national_de_structure::VARCHAR != ''
)
group by numero_national_de_structure
```

```sql id=aap2_rejected_socioeconomic_partners
select
  first(nom_complet) as nom_complet,
  siret::VARCHAR as SIRET,
from (
  select
    siret,
    nom_complet,
  from aap1_socioeconomic_partners
  where siret::VARCHAR != ''
    and label in (
      select partner
      from aap1_project_by_socioeconomic_partners
      group by partner
      having not (
        list(project) &&
        (
          select list(acronyme)
          from aap1_projects
          where financed
        )
      )
    )
  union
  select
    siret,
    nom_complet,
  from aap2_socioeconomic_partners
  where siret::VARCHAR != ''
)
group by siret
```

## Défis

<div class="grid grid-cols-3">
  <!-- AAP 1 + 2 -->
  <div class="card">
    ${resize((width) => overview.stackedChallengeCountPlot(
      challenge_count_by_aap,
      { width })
    )}
    <!-- $ -->
  </div>
  <div class="card grid grid-colspan-2">
    ${resize((width) => overview.challengeCountPlot(
      challenge_count_by_aap,
      { width })
    )}
    <!-- $ -->
  </div>
  <!-- AAP 2 by project type -->
  <div class="card">
    ${resize((width) => overview.stackedChallengeCountPlot(
      aap2_challenge_count,
      {
        width: width,
        fill_accessor: 'project_type',
        color_range: overview.projectTypeColorScale.range(),
        title: 'Défis par type de projet',
        subtitle: `Les défis indiqués dans les métadonnées et les templates des
          soumissions sur le site du dépôt de l'AAP 2`
      })
    )}
    <!-- $ -->
  </div>
  <div class="card grid grid-colspan-2">
    ${resize((width) => overview.challengeCountPlot(
      aap2_challenge_count,
      {
        width: width,
        x_accessor: 'project_type',
        color_range: overview.projectTypeColorScale.range(),
        title: 'Défis par type de projet',
        subtitle: `Les défis indiqués dans les métadonnées et les templates des
          soumissions sur le site du dépôt de l'AAP 2`
      })
    )}
    <!-- $ -->
  </div>
</div>

<div class="grid grid-cols-4">
  <div class="card">
    <h2>Répartition des défis de l'AAP 1</h2>
    <h3>Les sections plus grandes représentent les défis financés</h3>
    <div class="grid grid-cols-3">
      <div class="grid-colspan-2 grid-rowspan-2">
        ${resize((width, height) => donutChart(
          d3.group(
              [...challenge_count_by_aap],
              (d) => d.aap,
            )
            .get('AAP 1').sort((a, b) => a.defi - b.defi),
          {
            ...default_defi_aap_donut_config(width),
            width: width,
            sort: (a, b) => a.defi - b.defi,
            legend: false,
            outerRadiusRatio: (d) => d.data.financed
              ? width * 0.5
              : width * 0.48,
          }
        ))}
        <!-- $ -->
      </div>
      ${resize((width) => donutChart(
        d3.rollups(
          [...challenge_count_by_aap].filter((d) => d.aap === 'AAP 1'),
          (v) => v.map((d) => d.count).reduce((a, b) => a + b),
          (d) => d.defi,
        ),
        {
          ...default_defi_aap_donut_config(),
          width: 1,
          legendWidth: 1,
          keyMap: (d) => 'défi ' + d[0],
          valueMap: (d) => d[1],
          sort: (a, b) => a.defi - b.defi,
          innerRadiusRatio: 0,
          outerRadiusRatio: 0,
        }
      ))}
      <!-- $ -->
    </div>
  </div>
  <div class="card">
    <h2>Répartition des défis de l'AAP 2</h2>
    <h3>Les sections plus grandes représentent les défis préselectionnés</h3>
    <div class="grid grid-cols-3">
      <div class="grid-colspan-2 grid-rowspan-2">
        ${resize((width) => donutChart(
          [...challenge_count_by_aap]
            .filter((d) => d.aap === 'AAP 2'),
          {
            ...default_defi_aap_donut_config(width),
            width: width,
            sort: (a, b) => a.defi - b.defi,
            legend: false,
            outerRadiusRatio: (d) => d.data.selected
              ? width * 0.5
              : width * 0.48,
          },
        ))}
        <!-- $ -->
      </div>
      ${resize((width) => donutChart(
        d3.rollups(
          [...challenge_count_by_aap].filter((d) => d.aap === 'AAP 2'),
          (v) => v.map((d) => d.count).reduce((a, b) => a + b),
          (d) => d.defi,
        ),
        {
          ...default_defi_aap_donut_config(),
          width: 1,
          legendWidth: 1,
          keyMap: (d) => 'défi ' + d[0],
          valueMap: (d) => d[1],
          sort: (a, b) => a.defi - b.defi,
          innerRadiusRatio: 0,
          outerRadiusRatio: 0,
        },
      ))}
      <!-- $ -->
    </div>
  </div>
  <div class="card">
    <h2>Répartition des défis financés de l'AAP 1</h2>
    <br/>
    ${resize((width) => donutChart(
      d3.group(
          [...challenge_count_by_aap],
          (d) => d.aap,
          (d) => d.financed
        )
        .get('AAP 1')
        .get(true),
      default_defi_aap_donut_config(width)
    ))}
    <!-- $ -->
  </div>
  <div class="card">
    <h2>Répartition des défis sélectionnés de l'AAP 2</h2>
    <br/>
    ${resize((width) => donutChart(
      d3.group(
          [...challenge_count_by_aap],
          (d) => d.aap,
          (d) => d.selected
        )
        .get('AAP 2')
        .get(true),
      default_defi_aap_donut_config(width)
    ))}
    <!-- $ -->
  </div>
</div>

```js
const default_defi_aap_donut_config = (width) => ({
  width: width - 150,
  legendWidth: width - 150,
  keyMap: (d) => `défi ${d.defi}`,
  valueMap: (d) => d.count,
  color: overview.defiColorScale.domain([
    'défi 1',
    'défi 2',
    'défi 3',
    'défi 4',
    'défi 5',
    'défi 6',
  ]),
})

const default_defi_defi_donut_config = (width) => ({
  width: width - 100,
  legendWidth: width - 70,
  keyMap: (d) => d.aap,
  valueMap: (d) => d.count,
  color: overview.aapColorScale,
})
```

```sql id=challenge_count_by_aap
select
  defi,
  aap,
  financed,
  selected,
  sum(count)::INT as count,
from (
  select
    aap1_project_by_challenge.challenge::VARCHAR as defi,
    'AAP 1' as aap,
    financed,
    null as selected,
    count(*) as count,
  from aap1_project_by_challenge
  join aap1_projects
    on aap1_project_by_challenge.acronyme = aap1_projects.acronyme
  group by aap1_project_by_challenge.challenge, financed, selected
  union
  select
    '1' as defi,
    'AAP 2' as aap,
    null as financed,
    selected,
    count(*) as count
  from aap2_projects
  where defi_1_1 or defi_1_2
  group by financed, selected,
  union
  select
    '2' as defi,
    'AAP 2' as aap,
    null as financed,
    selected,
    count(*) as count
  from aap2_projects
  where defi_2_1 or defi_2_2
  group by financed, selected,
  union
  select
    '3' as defi,
    'AAP 2' as aap,
    null as financed,
    selected,
    count(*) as count
  from aap2_projects
  where defi_3_1 or defi_3_2
  group by financed, selected,
  union
  select
    '4' as defi,
    'AAP 2' as aap,
    null as financed,
    selected,
    count(*) as count
  from aap2_projects
  where defi_4_1 or defi_4_2
  group by financed, selected,
  union
  select
    '5' as defi,
    'AAP 2' as aap,
    null as financed,
    selected,
    count(*) as count
  from aap2_projects
  where defi_5_1 or defi_5_2
  group by financed, selected,
  union
  select
    '6' as defi,
    'AAP 2' as aap,
    null as financed,
    selected,
    count(*) as count
  from aap2_projects
  where defi_6_1 or defi_6_2
  group by financed, selected,
)
group by defi, aap, financed, selected
order by defi, aap, financed, selected
```

```sql id=aap2_challenge_count
select
  defi,
  project_type,
  selected,
  sum(count)::INT as count
from (
  select
    '1' as defi,
    TYPDOC as project_type,
    selected,
    count(*) as count
  from aap2_projects
  where defi_1_1 or defi_1_2
  group by selected, TYPDOC
  union
  select
    '2' as defi,
    TYPDOC as project_type,
    selected,
    count(*) as count
  from aap2_projects
  where defi_2_1 or defi_2_2
  group by selected, TYPDOC
  union
  select
    '3' as defi,
    TYPDOC as project_type,
    selected,
    count(*) as count
  from aap2_projects
  where defi_3_1 or defi_3_2
  group by selected, TYPDOC
  union
  select
    '4' as defi,
    TYPDOC as project_type,
    selected,
    count(*) as count
  from aap2_projects
  where defi_4_1 or defi_4_2
  group by selected, TYPDOC
  union
  select
    '5' as defi,
    TYPDOC as project_type,
    selected,
    count(*) as count
  from aap2_projects
  where defi_5_1 or defi_5_2
  group by selected, TYPDOC
  union
  select
    '6' as defi,
    TYPDOC as project_type,
    selected,
    count(*) as count
  from aap2_projects
  where defi_6_1 or defi_6_2
  group by selected, TYPDOC
)
group by defi, project_type, selected
order by defi, project_type, selected
```

<!-- ## Disciplines

```sql
select discipline, count(*) as count from aap2_project_by_discipline
where discipline != ''
group by discipline
order by count desc
``` -->

## Chercheurs

<div class="note">⚠️ Projet par chercheurs à venir ⚠️</div>

### Les nouveaux chercheurs

Chercheurs de l'AAP 2 pas présents dans les projets financées de l'AAP 1

<div class="grid grid-cols-4">
  <div class="card">
    <h2>
      Nombre de chercheurs de l'AAP 2 pas présents dans les projets financées
      de l'AAP 1
    </h2>
    <span class="big">
      ${[...new_researchers].length}
      <!-- $ -->
    </span>
  </div>
  <div></div>
  <div class="card">
    <h2>
      Nombre des encadrants de l'AAP 2 pas présents dans les projets
      financées de l'AAP 1
    </h2>
    <span class="big">
      ${[...new_researchers]
        .filter((d) => [...d.positions].length > 0)
        .length}
      <!-- $ -->
    </span>
  </div>
</div>

<div class="grid grid-cols-2">
  <div class="card">
    <h2>Chercheurs de l'AAP 2 pas présents dans les projets financées de l'AAP 1</h2>
    <br/>
    ${Inputs.table([...new_researchers])}
    <!-- $ -->
  </div>
  <div class="card">
    <h2>
      Encadrants de projet de l'AAP 2 pas présents dans les projets financées
      de l'AAP 1
    </h2>
    <br/>
    ${Inputs.table(
      [...new_researchers]
        .filter((d) => [...d.positions].length > 0)
    )}
    <!-- $ -->
  </div>
</div>

```sql id=new_researchers
with new_researcher_names as (
    select
      lower(
        aap2_researchers.lastname || ' ' || aap2_researchers.firstname
      ) as fullname,
      '2' as aap,
    from aap2_researchers
    except
    select
      lower(aap1_researchers.fullname) as fullname,
      '1' as aap,
    from aap1_researchers
  ),
  new_orcids as (
    select
      orcid,
      '2' as aap,
    from aap2_researchers
    except
    select
      orcid,
      '1' as aap,
    from aap1_researchers
  ),
  new_idhals as (
    select
      idhal,
      '2' as aap,
    from aap2_researchers
    except
    select
      idhal,
      '1' as aap,
    from aap1_researchers
  )

select
  lower(lastname || ' ' || firstname) as fullname,
  orcid,
  idhal,
  list_distinct(list(position)) as positions,
  [] as projects,
from aap2_researchers
where
  lower(lastname || ' ' || firstname) in (
    select fullname from new_researcher_names
  )
  or orcid in (select orcid from new_orcids)
  or idhal in (select idhal from new_idhals)
group by
  fullname, orcid, idhal
```

### Les chercheurs familiers

Chercheurs présents dans les projets de l'AAP 1 et 2

<div class="grid grid-cols-4">
  <div class="card">
    <h2>Nombre de chercheurs présents dans les projets de l'AAP 1 et 2</h2>
    <span class="big">
      ${[...returning_researchers].length}
      <!-- $ -->
    </span>
  </div>
  <div></div>
  <div class="card">
    <h2>
      Nombre d'encadrants de projet de l'AAP 2 présents dans les projets
      de l'AAP 1
    </h2>
    <span class="big">
      ${[...returning_researchers]
        .filter((d) => [...d.positions].length > 0)
        .length}
      <!-- $ -->
    </span>
  </div>
</div>

<div class="grid grid-cols-2">
  <div class="card">
    <h2>Chercheurs présents dans les projets de l'AAP 1 et 2</h2>
    <br/>
    ${Inputs.table(returning_researchers)}
    <!-- $ -->
  </div>
  <div class="card">
    <h2>
      Encadrants de projet de l'AAP 2 présents dans les projets
      de l'AAP 1
    </h2>
    <br/>
    ${Inputs.table(
      [...returning_researchers]
        .filter((d) => [...d.positions].length > 0)
    )}
    <!-- $ -->
  </div>
</div>

```sql id=returning_researchers
with returning_researcher_names as (
    select
      lower(aap1_researchers.fullname) as fullname,
    from aap1_researchers
    intersect
    select
      lower(
        aap2_researchers.lastname || ' ' || aap2_researchers.firstname
      ) as fullname,
    from aap2_researchers
  ),
  returning_orcids as (
    select
      orcid
    from aap1_researchers
    intersect
    select
      orcid
    from aap2_researchers
  ),
  returning_idhals as (
    select
      idhal
    from aap1_researchers
    intersect
    select
      idhal
    from aap2_researchers
  )

select
  lower(lastname || ' ' || firstname) as fullname,
  orcid,
  list_distinct(list(idhal))[1] as idhal,
  list_distinct(list(position)) as positions,
  [] as projects,
from aap2_researchers
where
  lower(lastname || ' ' || firstname) in (
    select fullname from returning_researcher_names
  )
  or orcid in (select orcid from returning_orcids)
  or idhal in (select idhal from returning_idhals)
group by
  orcid, fullname
```

## CNUs

<div class="note" label="Notice">

Les sections CNU considérées comme

- _Droit, économie et gestion_
  (sections ${cnu.cnu_category_section_map.get('Droit, économie et gestion')
  .join(', ')})
- _Pluridisciplinaire_
  (sections ${cnu.cnu_category_section_map.get('Pluridisciplinaire')
  .join(', ')})
- _Théologie_
  (sections ${cnu.cnu_category_section_map.get('Théologie')
  .join(', ')})

par le Conseil National des Universités (CNU) sont catégorisées comme
_SH - Sciences Humaines & Sociales_ dans ce page.

Pour plus de détails sur les sections du CNU et la catégorisation officielle,
[voir la page du CNU](https://conseil-national-des-universites.fr).

</div>

<div class="grid grid-cols-3">
  <div class="card">
    <h2>Distribution des CNUs financées par catégorie de l'AAP 1</h2>
    ${disciplines.erc_legend()}
    <!-- $ -->
    ${resize((width) => disciplines.erc_donut(
      aap1_cnu_count_erc,
      width,
    ))}
    <!-- $ -->
  </div>
  <div class="card">
    <h2>Distribution des CNUs par catégorie de l'AAP 2</h2>
    ${disciplines.erc_legend()}
    <!-- $ -->
    ${resize((width) => disciplines.erc_donut(
      aap2_cnu_count_erc,
      width,
    ))}
    <!-- $ -->
  </div>
</div>

<div class="card">
  <h2>Distribution des sections CNU de l'AAP 2</h2>
  <h3>
    Distribution détaillée des sections de l'AAP 2 par catégorie.
    Les sections préselectionnées sont plus foncées.
  </h3>
  ${disciplines.erc_legend()}
  <!-- $ -->
  ${resize((width) => disciplines.cnu_plot_y_by_erc(
    aap2_cnu_count,
    {
      width: width,
      height: 600,
      x_accessor: (d) => d.count,
      y_accessor: (d) =>
        cnu.cnu_section_label_map.get(Number(d.cnu)) || String(d.cnu),
      opacity_accessor: (d) => d.selected || d.financed ? 1 : 0.7,
    }
  ))}
  <!-- $ -->
</div>

<div class="card">

```js
const show_non_financed = view(
  Inputs.toggle({
    label: "Afficher les sections CNU non-financées de l'AAP",
  }),
)
```

  <h2>
    Distribution des sections CNU de l'AAP 1
    ${show_non_financed ? '' : '(financé)'} et 2
    <!-- $ -->
  </h2>
  <h3>
    Distribution détaillée des sections de l'AAP 1 et 2 par appel. Les sections
    ${show_non_financed ? "financées de l'AAP 1 et les sections" : ''}
    <!-- $ -->
    preselectionnées de l'AAP 2 sont plus foncées.
  </h3>
  ${resize((width) => disciplines.cnu_by_aap_plot_y_by_erc(
    [...cnu_count]
      .filter((d) => show_non_financed
        || d.aap === 'AAP 2'
        || d.aap === 'AAP 1' && d.financed
      ),
    {
      width: width,
      height: 600,
      sort: 'y',
      x_accessor: (d) => d.count,
      y_accessor: (d) =>
        cnu.cnu_section_label_map.get(Number(d.cnu)) || String(d.cnu),
      fill_accessor: (d) => String(d.aap),
      opacity_accessor: (d) => d.selected || d.financed ? 1 : 0.7,
    }
  ))}
  <!-- $ -->
</div>

```sql id=cnu_count
select * from (
  select
    cnu[:2] as cnu,
    financed,
    null as selected,
    count(*) as count,
    'AAP 1' as aap,
  from aap1_researchers
  join aap1_project_by_researchers
    on aap1_researchers.id = aap1_project_by_researchers.researcher
  join aap1_projects
    on aap1_project_by_researchers.project = aap1_projects.acronyme
  group by cnu[:2], financed
  union
  select
    cnu,
    null as financed,
    selected,
    count(*) as count,
    'AAP 2' as aap,
  from aap2_project_by_cnu
  join aap2_projects
    on aap2_projects.acronyme = aap2_project_by_cnu.acronyme
  where cnu is not null and cnu::VARCHAR != ''
  group by cnu, selected
)
where cnu[:2] similar to '[0-9]{2}'
order by cnu, selected, financed
```

```js
const cnu_count_erc = d3.rollups(
  cnu_count,
  (v) => v.reduce((a, b) => a + b.count, 0),
  (d) => cnu.getERCFromCNU(d.cnu) || 'Non renseigné',
)
```

```sql id=aap1_cnu_count
select cnu[:2] as cnu, count(*) as count
from aap1_researchers
where id in (
  select researcher from aap1_project_by_researchers
  where project in (
    select acronyme from aap1_projects where financed
  )
)
group by cnu[:2]
order by count desc
```

```js
const aap1_cnu_count_erc = d3.rollups(
  aap1_cnu_count,
  (v) => v.reduce((a, b) => a + b.count, 0),
  (d) => cnu.getERCFromCNU(d.cnu) || 'Non renseigné',
)
```

```sql id=aap2_cnu_count
select
  cnu,
  selected,
  count(*) as count
from aap2_project_by_cnu
join aap2_projects
  on aap2_projects.acronyme = aap2_project_by_cnu.acronyme
where cnu is not null and cnu::VARCHAR != ''
group by cnu, selected
order by cnu, selected
```

```js
const aap2_cnu_count_erc = d3.rollups(
  aap2_cnu_count,
  (v) => v.reduce((a, b) => a + b.count, 0),
  (d) => cnu.getERCFromCNU(d.cnu) || 'Non renseigné',
)

const aap2_cnu_count_erc_2 = d3
  .rollups(
    aap2_cnu_count,
    (v) => v.reduce((a, b) => a + b.count, 0),
    (d) => cnu.getERCFromCNU(d.cnu) || 'Non renseigné',
    (d) => d.selected,
  )
  .flatMap(([category, selected_counts]) =>
    selected_counts.map(([selected, count]) => ({
      erc: category,
      selected,
      count,
    })),
  )
```

<!--
## Keywords

```sql
select keyword, count(*) as count from aap2_project_by_keyword
where keyword != ''
group by keyword
order by count desc
```
-->

## Cartographies

```js
const map_filter = view(
  Inputs.select(
    new Map([
      ['Institutions', institution_count_by_postal_code],
      ['Laboratoires', laboratory_count_by_postal_code],
      [
        'Partenaires socio-économiques',
        socioeconomic_partner_count_by_postal_code,
      ],
    ]),
    {
      label: 'Filtrer les entités de la carte par ',
    },
  ),
)

const map_tip_map = new Map([
  [
    institution_count_by_postal_code,
    [
      get_choropleth_tip(institutions_by_postal_code, {
        min_threshold: 3,
        anchor: 'top-left',
      }),
    ],
  ],
  [
    laboratory_count_by_postal_code,
    [
      get_choropleth_tip(laboratories_by_postal_code, {
        min_threshold: 5,
        max_threshold: 10,
        anchor: 'top-right',
      }),
      get_choropleth_tip(laboratories_by_postal_code, {
        min_threshold: 10,
        anchor: 'bottom',
      }),
    ],
  ],
  [
    socioeconomic_partner_count_by_postal_code,
    [
      get_choropleth_tip(socioeconomic_partners_by_postal_code, {
        min_threshold: 12,
        max_threshold: 15,
        anchor: 'top-right',
      }),
      get_choropleth_tip(socioeconomic_partners_by_postal_code, {
        min_threshold: 15,
        max_threshold: 18,
        anchor: 'right',
      }),
      get_choropleth_tip(socioeconomic_partners_by_postal_code, {
        min_threshold: 18,
        anchor: 'bottom-left',
      }),
    ],
  ],
])
```

<div class="grid grid-cols-2">
  <div class="card">
    ${resize((width) => choroplethFrance(
      width,
      "Nombre d'institutions de l'AAP 2 par département, France",
      ({ properties }) => [...map_filter].find(
          (d) => d.departement_code === properties.code
        )?.count,
    ))}
    <!-- $ -->
  </div>
  <div class="card">
    ${resize((width) => choroplethFrance(
      width,
      "Nombre d'institutions de l'AAP 2 par département, France",
      ({ properties }) => [...map_filter].find(
          (d) => d.departement_code === properties.code
        )?.count,
      map_tip_map.get(map_filter),
    ))}
    <!-- $ -->

  </div>
</div>

```js
const default_choropleth_tip_config = {
  textPadding: 3,
  lineWidth: 25,
  textOverflow: 'ellipsis-middle',
}

const get_choropleth_tip = (
  data,
  {
    min_threshold = 0,
    max_threshold = [...data].length,
    anchor = 'top-left',
  } = {},
) =>
  Plot.tip(
    mainland_france_departements_geojson,
    Plot.geoCentroid({
      title: ({ properties }) =>
        min_threshold <
          [...data].filter((d) => d.departement_code === properties.code)
            .length &&
        [...data].filter((d) => d.departement_code === properties.code)
          .length <= max_threshold
          ? properties.nom +
            ' :\n' +
            [...data]
              .filter((d) => d.departement_code === properties.code)
              .map((d) => '• ' + d.nom_complet)
              .join('\n')
          : null,
      ...default_choropleth_tip_config,
      anchor,
    }),
  )
```

```sql id=institution_count_by_postal_code
select
  code_postal[:2] as departement_code,
  sum(count)::INT as count,
from aap2_institutions
where code_postal is not null
group by departement_code
```

```sql id=institutions_by_postal_code
select
  first(nom_complet) as nom_complet,
  first(code_postal[:2]) as departement_code,
from aap2_institutions
where code_postal is not null
group by siren
```

```sql id=laboratory_count_by_postal_code
select
  (code_postal::VARCHAR)[:2] as departement_code,
  sum(count)::INT as count,
from aap2_laboratories
where code_postal is not null
group by departement_code
```

```sql id=laboratories_by_postal_code
select
  first(libelle) as nom_complet,
  first((code_postal::VARCHAR)[:2]) as departement_code,
from aap2_laboratories
where code_postal is not null
group by numero_national_de_structure
```

```sql id=socioeconomic_partner_count_by_postal_code
select
  code_postal[:2] as departement_code,
  sum(count)::INT as count,
from aap2_socioeconomic_partners
where code_postal is not null
group by departement_code
```

```sql id=socioeconomic_partners_by_postal_code
select
  first(nom_complet) as nom_complet,
  first(code_postal[:2]) as departement_code,
from aap2_socioeconomic_partners
where code_postal is not null
group by siren
```

## Qualité des données

<div class="note" label="Notice">
  Ces indicateurs concernent uniquement l'AAP 2 (pour l'instant)
</div>

### Informations manquantes ou incorrectes

<div class="grid grid-cols-4">
  <div class="card">
    <h2>SIRETs d'institutions</h2>
    <span class="big">
      ${missing_institution_siret.count} /
      <!-- $ -->
      ${[...await sql`
        select count(*) as count from aap2_institutions
      `][0].count.toLocaleString()}
      <!-- $ -->
    </span>
  </div>
  <div class="card">
    <h2>RNSRs des laboratoires</h2>
    <span class="big">
      ${missing_laboratories_rnsr.count} /
      <!-- $ -->
      ${[...await sql`
        select count(*) as count from aap2_laboratories
      `][0].count.toLocaleString()}
      <!-- $ -->
    </span>
  </div>
  <div class="card">
    <h2>SIRETs des partenaires</h2>
    <span class="big">
      ${missing_partner_siret.count} /
      <!-- $ -->
      ${[...await sql`
        select count(*) as count from aap2_socioeconomic_partners
      `][0].count.toLocaleString()}
      <!-- $ -->
    </span>
  </div>
  <div class="card">
    <h2>ORCIDs des chercheurs</h2>
    <span class="big">
      ${missing_researcher_orcid.count} /
      <!-- $ -->
      ${[...await sql`
        select count(*) as count from aap2_researchers
      `][0].count.toLocaleString()}
      <!-- $ -->
    </span>
  </div>
  <div class="card">
    <h2>IDREFs des chercheurs</h2>
    <span class="big">
      ${missing_researcher_idref.count} /
      <!-- $ -->
      ${[...await sql`
        select count(*) as count from aap2_researchers
      `][0].count.toLocaleString()}
      <!-- $ -->
    </span>
  </div>
  <div class="card">
    <h2>IDHALs des chercheurs</h2>
    <span class="big">
      ${missing_researcher_idhal.count} /
      <!-- $ -->
      ${[...await sql`
        select count(*) as count from aap2_researchers
      `][0].count.toLocaleString()}
      <!-- $ -->
    </span>
  </div>
  <div class="card">
    <h2>CNUs des chercheurs</h2>
    <span class="big">
      ${missing_researcher_cnu.length} /
      <!-- $ -->
      ${[...await sql`
        select count(*) as count from aap2_researcher_by_cnu
      `][0].count.toLocaleString()}
      <!-- $ -->
    </span>
  </div>
</div>
<div class="card grid-rowspan-2">
  <h2>Incohérences types de projet</h2>
  ${Inputs.table(project_type_inconsistencies, { rows: 3 })}
  <!-- $ -->
</div>

```sql
select
  source_label,
  labels,
  list(project) as projects
from aap2_institutions
join aap2_project_by_institutions
  on aap2_institutions.id = aap2_project_by_institutions.institution_id
where siret is null
group by source_label, labels
```

<div class="note" label="Notice">

Les indicateurs de qualité sont calculé a partir des appels à projets. Leurs
informations sont soumise sous forme des fichiers excel ou csv puis intégrées
dans ce page via des requêtes SQL dans un base de données éphémère avec `DuckDB`
et le framework d'`Observable`.

Pour l'AAP 2, deux sources d'informations sont utilisées: les informations soumise
directement sur le site de dépôt des projets et les informations soumise dans le
template PDF de dépot. Chaque source et joint pour compléter et extrait dans plusiers
tableaux SQL (pour l'instant):

- aap2_projects
- aap2_researchers
- aap2_researcher_by_cnu
- aap2_institutions
- aap2_laboratories
- aap2_socioeconomic_partners
- aap2_project_by_keyword
- aap2_project_by_institutions
- aap2_project_by_laboratories
- aap2_project_by_discipline
- aap2_project_by_cnu
- aap2_project_by_socioeconomic_partners

Puis les requêtes pour calculer les indicateurs sont les suivantes :

```sql id=project_type_inconsistencies echo
select
  acronyme,
  TYPDOC as 'type sur le site',
  type_projet as 'type dans le template'
from aap2_projects
where (TYPDOC = 'PITT - Trio de Thèses' and type_projet != 'Choice1')
or (TYPDOC = 'PITT - Interdisciplinaire' and type_projet != 'Choice2')
```

```sql id=[missing_institution_siret] echo
select count(*) as count
from aap2_institutions
where siret is null
```

```sql display=false
select id, count(*) as count
from aap2_institutions
where siret is null
group by id
```

```sql id=[missing_laboratories_rnsr] echo
select count(*) as count
from aap2_laboratories
where numero_national_de_structure is null
```

```sql display=false
select id, count(*) as count
from aap2_laboratories
where numero_national_de_structure is null
group by id
```

```sql id=[missing_partner_siret] echo
select count(*) as count
from aap2_socioeconomic_partners
where siret is null
```

```sql display=false
select id, count(*) as count
from aap2_socioeconomic_partners
where siret is null
group by id
```

```sql id=[missing_researcher_orcid] echo
select count(*) as count
from aap2_researchers
where orcid is null or length(replace(orcid, '-', '')) != 16
```

```sql id=[missing_researcher_idref] echo
select count(*) as count
from aap2_researchers
where idref is null or length(idref) != 9
```

```sql id=[missing_researcher_idhal] echo
select count(*) as count
from aap2_researchers
where idhal is null
```

```js echo
const missing_researcher_cnu = [
  ...(await sql`select * from aap2_researcher_by_cnu`),
].filter(
  (d) =>
    d.cnu === null ||
    d.cnu === '' ||
    ![...cnu.cnu_category_section_map.values()].flat().includes(Number(d.cnu)),
)
```

<!-- DATA IMPORT -->

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
    source_label,
    source,
    numero_national_de_structure,
    libelle,
    sigle,
    annee_de_creation,
    type_de_structure,
    code_de_type_de_structure,
    code_de_niveau_de_structure,
    site_web,
    adresse,
    code_postal,
    commune,
    nom_du_responsable,
    prenom_du_responsable,
    titre_du_responsable,
    label_numero,
    tutelles,
    sigles_des_tutelles,
    code_de_nature_de_tutelle,
    nature_de_tutelle,
    uai_des_tutelles,
    siret_des_tutelles,
    code_de_type_de_tutelle,
    type_de_tutelle,
    numero_de_structure_enfant,
    numero_de_structure_parent,
    numero_de_structure_historique,
    type_de_succession,
    code_de_type_de_succession,
    annee_d_effet_historique,
    code_domaine_scientifique,
    domaine_scientifique,
    code_panel_erc,
    panel_erc,
    fiche_rnsr,
  from aap1_laboratories
) union (
  select
    source_label,
    source,
    numero_national_de_structure,
    libelle,
    sigle,
    annee_de_creation,
    type_de_structure,
    code_de_type_de_structure,
    code_de_niveau_de_structure,
    site_web,
    adresse,
    code_postal,
    commune,
    nom_du_responsable,
    prenom_du_responsable,
    titre_du_responsable,
    label_numero,
    tutelles,
    sigles_des_tutelles,
    code_de_nature_de_tutelle,
    nature_de_tutelle,
    uai_des_tutelles,
    siret_des_tutelles,
    code_de_type_de_tutelle,
    type_de_tutelle,
    numero_de_structure_enfant,
    numero_de_structure_parent,
    numero_de_structure_historique,
    type_de_succession,
    code_de_type_de_succession,
    annee_d_effet_historique,
    code_domaine_scientifique,
    domaine_scientifique,
    code_panel_erc,
    panel_erc,
    fiche_rnsr,
  from aap2_laboratories
)
```

```sql id=institutions
(
  select
    siret,
    siren,
    nom_complet,
    nature_juridique,
    latitude,
    longitude,
    libelle_commune,
    commune,
    code_postal,
    region,
    source_label,
    source,
  from aap1_institutions
) union (
  select
    siret,
    siren,
    nom_complet,
    nature_juridique,
    latitude,
    longitude,
    libelle_commune,
    commune,
    code_postal,
    region,
    source_label,
    source,
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

</div>
