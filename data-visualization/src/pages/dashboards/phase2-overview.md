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
import { choroplethFrance } from '../../components/projection-map.js'
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
    <h2>AAP 1 projets financées par nombre de partenaires</h2>
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
    <h2>Top 15 AAP 2 projets par nombre de partenaires</h2>
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
        x_label: "Nombre d'institutions",
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
        marginLeft: 150,
        lineWidth: 13,
        y_label: "Unité (Sigle / RNSR)",
        x_label: "Nombre d'unités",
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
        x_label: "Nombre de partenaires",
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
        x_label: "Nombre d'institutions",
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
        marginLeft: 100,
        y_label: "Unité (Sigle / RNSR)",
        x_label: "Nombre d'unités",
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
        x_label: "Nombre de partenaires",
        sort_value: aap2_partners_sort,
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
  <div class="card">
    ${resize((width) => overview.stackedChallengeCountPlot(
      challenge_count_by_project_type,
      {
        width: width,
        fill_accessor: 'project_type',
        title: 'Défis par type de projet',
        subtitle: `Les défis indiqués dans les métadonnées et les templates des
          soumissions sur le site du dépôt de l'AAP 2`
      })
    )}
    <!-- $ -->
  </div>
  <div class="card grid grid-colspan-2">
    ${resize((width) => overview.challengeCountPlot(
      challenge_count_by_project_type,
      {
        width: width,
        x_accessor: 'project_type',
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
    <br/>
    ${resize((width) => donutChart(
      [...challenge_count_by_aap].filter((d) => d.aap === 'AAP 1'),
      default_defi_aap_donut_config(width)
    ))}
    <!-- $ -->
  </div>
  <div class="card">
    <h2>Répartition des défis de l'AAP 2</h2>
    <br/>
    ${resize((width) => donutChart(
      [...challenge_count_by_aap].filter((d) => d.aap === 'AAP 2'),
      default_defi_aap_donut_config(width)
    ))}
    <!-- $ -->
  </div>
  <div class="card">
    <h2>Répartition du défi 1 par AAP</h2>
    <br/>
    ${resize((width) => donutChart(
      [...challenge_count_by_aap].filter((d) => d.defi === '1'),
      default_defi_defi_donut_config(width)
    ))}
    <!-- $ -->
  </div>
  <div class="card">
    <h2>Répartition du défi 2 par AAP</h2>
    <br/>
    ${resize((width) => donutChart(
      [...challenge_count_by_aap].filter((d) => d.defi === '2'),
      default_defi_defi_donut_config(width)
    ))}
    <!-- $ -->
  </div>
  <div class="card">
    <h2>Répartition du défi 3 par AAP</h2>
    <br/>
    ${resize((width) => donutChart(
      [...challenge_count_by_aap].filter((d) => d.defi === '3'),
      default_defi_defi_donut_config(width)
    ))}
    <!-- $ -->
  </div>
  <div class="card">
    <h2>Répartition du défi 4 par AAP</h2>
    <br/>
    ${resize((width) => donutChart(
      [...challenge_count_by_aap].filter((d) => d.defi === '4'),
      default_defi_defi_donut_config(width)
    ))}
    <!-- $ -->
  </div>
  <div class="card">
    <h2>Répartition du défi 5 par AAP</h2>
    <br/>
    ${resize((width) => donutChart(
      [...challenge_count_by_aap].filter((d) => d.defi === '5'),
      default_defi_defi_donut_config(width)
    ))}
    <!-- $ -->
  </div>
  <div class="card">
    <h2>Répartition du défi 6 par AAP</h2>
    <br/>
    ${resize((width) => donutChart(
      [...challenge_count_by_aap].filter((d) => d.defi === '6'),
      default_defi_defi_donut_config(width)
    ))}
    <!-- $ -->
  </div>
</div>

```js
const default_defi_aap_donut_config = (width) => ({
  width: width - 100,
  legendWidth: width - 100,
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
(
  select
    challenge::VARCHAR as defi,
    'AAP 1' as aap,
    count(*) as count,
  from aap1_project_by_challenge
  group by challenge
  union
  select
    '1' as defi,
    'AAP 2' as aap,
    count(*) as count
  from aap2_projects
  where defi_1_1 or defi_1_2
  union
  select
    '2' as defi,
    'AAP 2' as aap,
    count(*) as count
  from aap2_projects
  where defi_2_1 or defi_2_2
  union
  select
    '3' as defi,
    'AAP 2' as aap,
    count(*) as count
  from aap2_projects
  where defi_3_1 or defi_3_2
  union
  select
    '4' as defi,
    'AAP 2' as aap,
    count(*) as count
  from aap2_projects
  where defi_4_1 or defi_4_2
  union
  select
    '5' as defi,
    'AAP 2' as aap,
    count(*) as count
  from aap2_projects
  where defi_5_1 or defi_5_2
  union
  select
    '6' as defi,
    'AAP 2' as aap,
    count(*) as count
  from aap2_projects
  where defi_6_1 or defi_6_2
)
order by defi, aap
```

```sql id=challenge_count_by_project_type
(
  select
    '1' as defi,
    TYPDOC as project_type,
    count(*) as count
  from aap2_projects
  where defi_1_1 or defi_1_2
  group by TYPDOC
  union
  select
    '2' as defi,
    TYPDOC as project_type,
    count(*) as count
  from aap2_projects
  where defi_2_1 or defi_2_2
  group by TYPDOC
  union
  select
    '3' as defi,
    TYPDOC as project_type,
    count(*) as count
  from aap2_projects
  where defi_3_1 or defi_3_2
  group by TYPDOC
  union
  select
    '4' as defi,
    TYPDOC as project_type,
    count(*) as count
  from aap2_projects
  where defi_4_1 or defi_4_2
  group by TYPDOC
  union
  select
    '5' as defi,
    TYPDOC as project_type,
    count(*) as count
  from aap2_projects
  where defi_5_1 or defi_5_2
  group by TYPDOC
  union
  select
    '6' as defi,
    TYPDOC as project_type,
    count(*) as count
  from aap2_projects
  where defi_6_1 or defi_6_2
  group by TYPDOC
)
order by defi, project_type
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

Chercheurs présents dans les projets financées de l'AAP 1 et 2

<div class="grid grid-cols-4">
  <div class="card">
    <h2>Nombre de chercheurs présents dans les projets financées de l'AAP 1 et 2</h2>
    <span class="big">
      ${[...returning_researchers].length}
      <!-- $ -->
    </span>
  </div>
  <div></div>
  <div class="card">
    <h2>
      Nombre d'encadrants de projet de l'AAP 2 présents dans les projets financées
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
    <h2>Chercheurs présents dans les projets financées de l'AAP 1 et 2</h2>
    <br/>
    ${Inputs.table(returning_researchers)}
    <!-- $ -->
  </div>
  <div class="card">
    <h2>
      Encadrants de projet de l'AAP 2 présents dans les projets financées
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

<div class="card" style="width: 32em">
  <h2>Légende des catégories CNU</h2>
  ${disciplines.erc_legend()}
  <!-- $ -->
</div>

<div class="grid grid-cols-2">
  <div class="card">
    <h2>Distribution des CNUs par catégorie de l'AAP 1</h2>
    <br/>
    ${resize((width) => disciplines.erc_donut(
      aap1_cnu_count_erc,
      width,
    ))}
    <!-- $ -->
  </div>
  <div class="card">
    <h2>Distribution des CNUs par catégorie de l'AAP 2</h2>
    <br/>
    ${resize((width) => disciplines.erc_donut(
      aap2_cnu_count_erc,
      width,
    ))}
    <!-- $ -->
  </div>
</div>

<div class="grid grid-cols-2">
  <div class="card grid-rowspan-2">
    <h2>Distribution des sections CNU de l'AAP 2</h2>
    <h3>Distribution détaillée des sections de l'AAP 2 par catégorie</h3>
    ${disciplines.erc_legend()}
    <!-- $ -->
    ${resize((width) => disciplines.cnu_plot_by_erc(
      aap2_cnu_count,
      {
        width: width,
        sort: 'y',
        x_accessor: (d) => d.count,
        y_accessor: (d) =>
          cnu.cnu_section_label_map.get(Number(d.cnu)) || String(d.cnu),
        marginTop: 20,
      }
    ))}
    <!-- $ -->
  </div>
  <div class="card grid-rowspan-2">
    <h2>Distribution des sections CNU de l'AAP 1 et 2</h2>
    <h3>Distribution détaillée des sections de l'AAP 1 et 2 par appel</h3>
    ${resize((width) => disciplines.cnu_by_aap_plot_by_erc(
      cnu_count,
      {
        width: width,
        sort: 'y',
        x_accessor: (d) => d.count,
        y_accessor: (d) =>
          cnu.cnu_section_label_map.get(Number(d.cnu)) || String(d.cnu),
        fill_accessor: (d) => String(d.aap),
        marginTop: 20,
      }
    ))}
    <!-- $ -->
  </div>
  <!-- <div class="card grid-rowspan-2">
    <h2>Distribution des sections CNU</h2>
    <h3>Distribution des sections de l'AAP 1 et 2</h3>
    ${resize((width) => disciplines.cnu_by_aap_plot_by_erc_2(
      cnu_count,
      {
        width: width,
        sort: 'y',
        x_accessor: (d) => d.count,
        fy_accessor: (d) =>
          cnu.cnu_section_label_map.get(Number(d.cnu)) || String(d.cnu),
        y_accessor: (d) => String(d.aap),
        fill_accessor: (d) => String(d.aap),
        marginTop: 20,
      }
    ))}
  </div> -->
  <!-- $ -->
</div>

```sql id=cnu_count
select * from (
  select
    cnu[:2] as cnu,
    count(*) as count,
    'AAP 1' as aap,
  from aap1_researchers
  group by cnu[:2]
  union
  select
    cnu,
    count(*) as count,
    'AAP 2' as aap,
  from aap2_project_by_cnu
  where cnu is not null and cnu::VARCHAR != ''
  group by cnu
)
where cnu[:2] similar to '[0-9]{2}'
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
  count(*) as count
from aap2_project_by_cnu
where cnu is not null and cnu::VARCHAR != ''
group by cnu
order by count desc
```

```js
const aap2_cnu_count_erc = d3.rollups(
  aap2_cnu_count,
  (v) => v.reduce((a, b) => a + b.count, 0),
  (d) => cnu.getERCFromCNU(d.cnu) || 'Non renseigné',
)
```

## Keywords

```sql
select keyword, count(*) as count from aap2_project_by_keyword
where keyword != ''
group by keyword
order by count desc
```

## Cartographies

```js

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
      ${missing_laboratories_siret.count} /
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
</div>
<div class="card grid-rowspan-2">
  <h2>Incohérences types de projet</h2>
  ${Inputs.table(project_type_inconsistencies, { rows: 3 })}
  <!-- $ -->
</div>

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

```sql id=[missing_laboratories_siret] echo
select count(*) as count
from aap2_laboratories
where numero_national_de_structure is null
```

```sql id=[missing_partner_siret] echo
select count(*) as count
from aap2_socioeconomic_partners
where siret is null or length(id) != 14
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
