---
sql:
  aap1_projects: /data/phase1-projects.tsv
  aap1_project_by_keyword: /data/phase1-project_by_keyword.tsv
  aap1_project_by_challenge: /data/phase1-project_by_challenge.tsv
  # aap1_project_by_cnu: /data/phase1-project_by_cnu.tsv
  # aap1_project_by_cnu_labels: /data/phase1-project_by_cnu_labels.tsv
  aap1_project_by_institutions: /data/phase1-project_by_institutions.tsv
  aap1_project_by_laboratories: /data/phase1-project_by_laboratories.tsv
  aap1_project_by_researchers: /data/phase1-project_by_researchers.tsv
  aap1_project_by_socioeconomic_partners: /data/phase1-project_by_socioeconomic_partners.tsv
  aap1_researchers: /data/phase1-researchers.tsv
  aap1_all_partners: /data/partners.csv
  aap1_all_projects_by_partners: /data/partners_by_project.csv
  co_researchers: /data/private/co-researchers.tsv
  aap1_researcher_by_keywords: /data/phase1-researcher_by_keywords.tsv
  aap1_laboratories: /data/phase1-laboratories.tsv
  # aap1_laboratories_by_domains_erc: /data/phase1-laboratories_by_domains_erc.tsv
  # aap1_laboratories_by_disciplines_erc: /data/phase1-laboratories_by_disciplines_erc.tsv
  # aap1_laboratories_by_domains_hceres: /data/phase1-laboratories_by_domains_hceres.tsv
  # aap1_laboratories_by_disciplines_hceres: /data/phase1-laboratories_by_disciplines_hceres.tsv
  aap1_socioeconomic_partners: /data/phase1-socioeconomic_partners.tsv
  aap1_institutions: /data/phase1-institutions.tsv
  aap2_projects: /data/phase2-projects.tsv
  aap2_researchers: /data/phase2-researchers.tsv
  # aap2_researcher_by_keywords: /data/phase2-researcher_by_keywords.tsv
  aap2_researcher_by_cnu: /data/phase2-researcher_by_cnu.tsv
  aap2_institutions: /data/private/phase2-institutions.tsv
  # aap2_institutions: /data/phase2-institutions.tsv
  aap2_laboratories: /data/private/phase2-laboratories.tsv
  # aap2_laboratories: /data/phase2-laboratories.tsv
  aap2_socioeconomic_partners: /data/private/phase2-socioeconomic_partners.tsv
  # aap2_socioeconomic_partners: /data/phase2-socioeconomic_partners.tsv
  aap2_project_by_keyword: /data/phase2-project_by_keyword.tsv
  aap2_project_by_researchers: /data/phase2-project_by_researchers.tsv
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

```js
import {
  downloadPNGButton,
  downloadTableButton,
  formTemplate,
} from '../../components/utilities.js'
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

```js
const dashboard_filter = view(
  Inputs.checkbox(
    ['AAP 1', 'AAP 2', 'Centres Opérationnels', 'Animation et Gouvernance'],
    { label: 'Include' },
  ),
)
```

## Chiffres clés

### All institutions

Count: ${[...aap_all_institutions].length}

```sql
    select *
    from aap1_all_partners
      where aap1_all_partners.type = 'ETABLISSEMENT'
```

```sql
-- select
--   id::VARCHAR as id,
--   first(label) as label,
--   list_distinct(flatten(list(projets))) as projets,
--   list(phase) as phase,
-- from (
  select distinct
    "ID primaire".replace(',', '')::BIGINT as siren,
    "ID secondaire".replace(',', '')::BIGINT as siret,
    first(label) as label,
    '1' as phase,
  from aap1_all_partners
  left join aap1_all_projects_by_partners
    on aap1_all_partners."label" = aap1_all_projects_by_partners."source_label"
  where aap1_all_partners.type = 'ETABLISSEMENT'
  group by all
  -- union
  --   select
  --     siren::INT as id,
  --     first(nom_complet) as label,
  --     '2' as phase,
  --   from aap2_institutions
  --   group by all
-- )
-- group by id
```

${downloadTableButton(() => [...aap_all_institutions])}
<!-- $ -->

```sql id=aap_all_institutions display
with selected_institutions as (
  select
    institution_id,
    list_distinct(list(project_id)) as projects,
    count(*) as count,
  from aap2_project_by_institutions
  where project_id in (
    select project_id from aap2_projects where selected
  )
  group by institution_id
)

select
  id::VARCHAR as id,
  first(label) as label,
  list_distinct(flatten(list(projets))) as projets,
  list(phase) as phase,
from (
  select
    distinct "ID primaire".replace(',', '')[:10]::BIGINT as id,
    first(label) as label,
    list_distinct(list(projet)) as projets,
    '1' as phase,
  from aap1_all_partners
  left join aap1_all_projects_by_partners
    on aap1_all_partners."label" = aap1_all_projects_by_partners."source_label"
  where aap1_all_partners.type = 'ETABLISSEMENT'
  group by all
  union
    select
      siren::INT as id,
      first(nom_complet) as label,
      flatten(list(projects))::VARCHAR as projects,
      '2' as phase,
    from aap2_institutions
    join selected_institutions
      on aap2_institutions.institution_id::VARCHAR = selected_institutions.institution_id::VARCHAR
    where siren is not null
    group by siren
)
group by id
```

### All labs

Count: ${[...aap_all_labs].length}

${downloadTableButton(() => [...out])}
<!-- $ -->

```sql id=out display
select
  numero_national_de_structure,
  list_distinct(flatten(list(labels))) as labels,
  list_distinct(flatten(list(projets))) as projets,
  -- list_distinct(list(selected)) as financed,
  list_distinct(list(financed) || list(selected)) as financed,
  list_distinct(flatten(list(label_numeros))) as label_numeros,
  list_distinct(list(phase)) as phases,
from (
  select
    numero_national_de_structure,
    list_distinct(list(label)) as labels,
    list_distinct(list(project)) as projets,
    list_distinct(flatten(list(split(label_numero, ',')))) as label_numeros,
    1 as phase,
  from aap1_project_by_laboratories
  join aap1_laboratories
    on aap1_project_by_laboratories.lab = aap1_laboratories.label
  group by numero_national_de_structure
  union
  select
    numero_national_de_structure,
    list_distinct(list(labels)) as labels,
    list_distinct(list(project_id)) as projets,
    list_distinct(flatten(list(split(label_numero, ',')))) as label_numeros,
    2 as phase,
  from aap2_project_by_laboratories
  join aap2_laboratories
    on aap2_project_by_laboratories.unit_id = aap2_laboratories.unit_id
  group by numero_national_de_structure
)
left join aap1_projects
  on aap1_projects.acronyme in projets
left join aap2_projects
  on aap2_projects.project_id in projets
group by numero_national_de_structure
```

```sql id=aap_all_labs
with selected_labs as (
  select
    unit_id,
    list_distinct(list(project_id)) as projects,
    count(*) as count,
  from aap2_project_by_laboratories
  where project_id in (
    select project_id from aap2_projects where selected
  )
  group by unit_id
)

select
  id,
  list_distinct(list(label))[1] as label,
  list_distinct(flatten(list(projets))) as projets,
  list(phase) as phase
from (
  select
    distinct "ID primaire" as id,
    first(label) as label,
    list_distinct(list(projet)) as projets,
    '1' as phase,
  from aap1_all_partners
  left join aap1_all_projects_by_partners
    on aap1_all_partners."label" = aap1_all_projects_by_partners."source_label"
  where aap1_all_partners.type = 'LABORATOIRE'
  group by all
  union
    select
      numero_national_de_structure::VARCHAR as id,
      if(
        length(list_distinct(list(sigle))) > 0,
        list_distinct(list(sigle))[1],
        first(libelle)
      ) as label,
      flatten(list(projects)) as projects,
      '2' as phase,
    from aap2_laboratories
    join selected_labs
      on aap2_laboratories.unit_id = selected_labs.unit_id
    where numero_national_de_structure is not null
    group by numero_national_de_structure
)
group by id
```

### All socioeconomic partners

Count: ${[...aap_all_socioeconomic_partners].length}

```sql id=aap_all_socioeconomic_partners display
with selected_partners as (
  select
    partner_id,
    list_distinct(list(project_id)) as projects,
    count(*) as count,
  from aap2_project_by_socioeconomic_partners
  where project_id in (
    select project_id from aap2_projects where selected
  )
  group by partner_id
)

select
  id::VARCHAR as id,
  first(label) as label,
  list_distinct(flatten(list(projets))) as projets,
  list(phase) as phase
from (
  select
    distinct "ID primaire".replace(',', '')[:10]::BIGINT as id,
    list_distinct(list(label)) as label,
    list_distinct(list(projet)) as projets,
    '1' as phase,
  from aap1_all_partners
  left join aap1_all_projects_by_partners
    on aap1_all_partners."label" = aap1_all_projects_by_partners."source_label"
  where aap1_all_partners.type = 'SOCIOECONOMIQUE'
  group by all
  union
    select
      siren::INT as id,
      list(nom_complet)[0] as label,
      flatten(list(projects)) as projects,
      '2' as phase,
    from aap2_socioeconomic_partners
    join selected_partners
      on aap2_socioeconomic_partners.partner_id = selected_partners.partner_id
    where siren is not null
    group by siren
)
group by id
```

```sql



```

<div class="grid grid-cols-4" id="aap-key-numbers">
  <!-- ALL projects -->
  <div class="card">
    <h2>Nombre de projets totales<br/><span class="muted">(Soumis / Proposés)</span></h2>
    <span class="big">
      <span class="muted">80</span> / ${14 + 8} </span>
  </div>
  <div class="card">
    <h2>Nombre d'institutions totales<br/><span class="muted">(Soumis / Proposés)</span></h2>
    <span class="big">
      <span class="muted">
        ${[...await sql`
          select count(distinct siren) as count from (
            select siren from aap1_institutions
            union
            select siren from aap2_institutions
          )
        `][0].count.toLocaleString()}
        <!-- $ -->
      </span> /
      ${new Set([
        ...aap1_institutions_count,
        ...aap2_selected_institutions_count,
      ].map((d) => d.id))
        .size.toLocaleString()}
      <!-- $ -->
    </span>
  </div>
  <div class="card">
    <h2>Nombre d'unités totales<br/><span class="muted">(Soumis / Proposés)</span></h2>
    <span class="big">
      <span class="muted">
        ${[...await sql`
          select count(*) as count from aap2_laboratories
        `][0].count.toLocaleString()}
        <!-- $ -->
      </span> /
      ${[...aap2_selected_laboratories_count].length.toLocaleString()}
      <!-- $ -->
    </span>
  </div>
  <div class="card">
    <h2>
      Nombre de partenaires socioéconomiques totales
      <br/><span class="muted">(Soumis / Proposés)</span>
    </h2>
    <span class="big">
      <span class="muted">
        ${[...await sql`
          select count(*) as count from aap2_socioeconomic_partners
        `][0].count.toLocaleString()}
        <!-- $ -->
      </span> /
      ${[...aap2_selected_partners_count].length.toLocaleString()}
      <!-- $ -->
    </span>
  </div>
  <div class="card">
    <h2>
      Nombre de chercheurs totales
      <br/><span class="muted">(Soumis / Proposés)</span>
    </h2>
    <span class="big">
      <span class="muted">
        ${[...await sql`
          select count(distinct email) as count from aap2_researchers
        `][0].count.toLocaleString()}
        <!-- $ -->
      </span> /
      ${[...await sql`
        select count(distinct researcher_id) as count
        from aap2_project_by_researchers
        where project_id in (
            select project_id
            from aap2_projects
            where selected
          )
          and (position is null or position != 'thésard')
        group by all
        `][0].count.toLocaleString()}
      <!-- $ -->
    </span>
  </div>
  <!-- AAP1 -->
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
    <h2>Nombre d'institutions AAP 1 <br/><span class="muted">(Soumis / Lauréats)</span></h2>
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
  <div class="card">
    <h2>
      Nombre de chercheurs AAP 1
      <br/><span class="muted">(Soumis / Lauréats)</span>
    </h2>
    <span class="big">
      <span class="muted">
        XXX
        <!-- $ -->
      </span> /
      ${[...all_researchers_by_project]
        .filter((d) => d.phase.includes('1'))
        .length.toLocaleString()}
      <!-- $ -->
    </span>
  </div>
  <!-- AAP2 -->
  <div class="card">
    <h2>Nombre de projets AAP 2 <br/><span class="muted">(Soumis / Proposés)</span></h2>
    <span class="big">
      <span class="muted">
        ${[...await sql`
          select count(*) as count from aap2_projects
        `][0].count.toLocaleString()}
        <!-- $ -->
      </span> /
      ${[...await sql`
          select count(*) as count
          from aap2_projects
          where selected
        `][0].count.toLocaleString()}
      <!-- $ -->
    </span>
  </div>
  <div class="card">
    <h2>Nombre d'institutions AAP 2 <br/><span class="muted">(Soumis / Proposés)</span></h2>
    <span class="big">
      <span class="muted">
        ${[...await sql`
          select count(*) as count from aap2_institutions
        `][0].count.toLocaleString()}
        <!-- $ -->
      </span> /
      ${[...aap2_selected_institutions_count].length.toLocaleString()}
      <!-- $ -->
    </span>
  </div>
  <div class="card">
    <h2>Nombre d'unités AAP 2 <br/><span class="muted">(Soumis / Proposés)</span></h2>
    <span class="big">
      <span class="muted">
        ${[...await sql`
          select count(*) as count from aap2_laboratories
        `][0].count.toLocaleString()}
        <!-- $ -->
      </span> /
      ${[...aap2_selected_laboratories_count].length.toLocaleString()}
      <!-- $ -->
    </span>
  </div>
  <div class="card">
    <h2>
      Nombre de partenaires socioéconomiques AAP 2
      <br/><span class="muted">(Soumis / Proposés)</span>
    </h2>
    <span class="big">
      <span class="muted">
        ${[...await sql`
          select count(*) as count from aap2_socioeconomic_partners
        `][0].count.toLocaleString()}
        <!-- $ -->
      </span> /
      ${[...aap2_selected_partners_count].length.toLocaleString()}
      <!-- $ -->
    </span>
  </div>
  <div class="card">
    <h2>
      Nombre de chercheurs AAP 2
      <br/><span class="muted">(Soumis / Proposés)</span>
    </h2>
    <span class="big">
      <span class="muted">
        ${[...await sql`
          select count(distinct email) as count from aap2_researchers
        `][0].count.toLocaleString()}
        <!-- $ -->
      </span> /
      ${[...await sql`
        select count(distinct researcher_id) as count
        from aap2_project_by_researchers
        where project_id in (
            select project_id
            from aap2_projects
            where selected
          )
          and (position is null or position != 'thésard')
        group by all
        `][0].count.toLocaleString()}
      <!-- $ -->
    </span>
  </div>
</div>

```js
const aap_key_number_buttons = view(
  downloadPNGButton('aap-key-numbers', 'Download key number cards'),
)
```

## Projets par partenaires

<div class="grid grid-cols-3" id="aap-projects-by-partners">
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

```js
const aap_project_by_institutions_buttons = view(
  downloadPNGButton(
    'aap-projects-by-partners',
    'Download AAP key number cards',
  ),
)
```

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
  aap2_projects.project_id as project_id,
  first(TYPDOC) as type,
from aap2_project_by_institutions
join aap2_projects
  on aap2_project_by_institutions.project_id = aap2_projects.project_id
group by aap2_projects.project_id
```

```sql id=aap2_project_by_laboratories_count
select
  count(*) as count,
  aap2_projects.project_id as project_id,
  first(TYPDOC) as type,
from aap2_project_by_laboratories
join aap2_projects
  on aap2_project_by_laboratories.project_id = aap2_projects.project_id
group by aap2_projects.project_id
```

```sql id=aap2_project_by_socioeconomic_partners_count
select
  count(*) as count,
  aap2_projects.project_id as project_id,
  first(TYPDOC) as type,
from aap2_project_by_socioeconomic_partners
join aap2_projects
  on aap2_project_by_socioeconomic_partners.project_id = aap2_projects.project_id
group by aap2_projects.project_id
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

<div class="grid grid-cols-3" id="aap-partner-plots">
  <!-- AAP 1 -->
  <div class="card">
    ${aap1_universities_sort_input}
    <!-- $ -->
    <h2>Top 15 institutions financées de l'AAP 1</h2>
    <h3>
      Top 15 institutions partenaires des projets financées de l'AAP 1 par
    </h3>
      nombre d'occurences
    ${resize((width) => overview.partnerCountPlotY(
      aap1_institutions_count,
      {
        width,
        y_label: "Institution (libelle / commune(s))",
        sort_value: aap1_universities_sort,
      }
    ))}
    <!-- $ -->
  </div>
  <div class="card">
    ${aap1_laboratories_sort_input}
    <!-- $ -->
    <h2>Top 15 unités de recherche financées de l'AAP 1</h2>
    <h3>
      Top 15 unités de recherche partenaires des projets financées de l'AAP 1 par
    </h3>
      nombre d'occurences
    ${resize((width) => overview.partnerCountPlotY(
      aap1_laboratories_count,
      {
        width,
        marginLeft: 170,
        lineWidth: 15,
        y_label: "Unité (libelle / commune(s))",
        sort_value: aap1_laboratories_sort,
        textOverflow: 'ellipsis',
      }
    ))}
    <!-- $ -->
  </div>
  <div class="card">
    ${aap1_partners_sort_input}
    <!-- $ -->
    <h2>Top 15 partenaires socioéconomiques financés de l'AAP 1</h2>
    <h3>
      Top 15 partenaires socioéconomiques des projets financés de l'AAP 1 par
    </h3>
      nombre d'occurences
    ${resize((width) => overview.partnerCountPlotY(
      aap1_partners_count,
      {
        width,
        y_label: "Partnaire (libelle / commune(s))",
        sort_value: aap1_partners_sort,
      }
    ))}
    <!-- $ -->
  </div>
  <!-- AAP2 -->
  <div class="card">
    ${aap2_universities_sort_input}
    <!-- $ -->
    <h2>Top 15 AAP 2 institutions par nombre d'occurences</h2>
    ${resize((width) => overview.partnerCountPlotY(
      aap2_institutions_count,
      {
        width,
        y_label: "Institution (libelle / commune(s))",
        sort_value: aap2_universities_sort,
      }
    ))}
    <!-- $ -->
  </div>
  <div class="card">
    ${aap2_laboratories_sort_input}
    <!-- $ -->
    <h2>Top 15 AAP 2 unités de recherche par nombre d'occurences</h2>
    ${resize((width) => overview.partnerCountPlotY(
      aap2_laboratories_count,
      {
        width,
        marginLeft: 170,
        lineWidth: 15,
        y_label: "Unité (libelle / commune(s))",
        sort_value: aap2_laboratories_sort,
      }
    ))}
    <!-- $ -->
  </div>
  <div class="card">
    ${aap2_partners_sort_input}
    <!-- $ -->
    <h2>Top 15 AAP 2 partnaires socioéconomiques par nombre d'occurences</h2>
    ${resize((width) => overview.partnerCountPlotY(
      aap2_partners_count,
      {
        width,
        y_label: "Partnaire (libelle / commune(s))",
        sort_value: aap2_partners_sort,
      }
    ))}
    <!-- $ -->
  </div>
  <!-- AAP2 proposals -->
  <div class="card">
    ${aap2_selected_universities_sort_input}
    <!-- $ -->
    <h2>Top 15 AAP 2 institutions proposés par nombre d'occurences</h2>
    ${resize((width) => overview.partnerCountPlotY(
      aap2_selected_institutions_count,
      {
        width,
        y_label: "Institution (libelle / commune(s))",
        sort_value: aap2_selected_universities_sort,
      }
    ))}
    <!-- $ -->
  </div>
  <div class="card">
    ${aap2_selected_laboratories_sort_input}
    <!-- $ -->
    <h2>Top 15 AAP 2 unités de recherche proposés par nombre d'occurences</h2>
    ${resize((width) => overview.partnerCountPlotY(
      aap2_selected_laboratories_count,
      {
        width,
        marginLeft: 170,
        lineWidth: 15,
        y_label: "Unité (libelle / commune(s))",
        sort_value: aap2_selected_laboratories_sort,
      }
    ))}
    <!-- $ -->
  </div>
  <div class="card">
    ${aap2_selected_partners_sort_input}
    <!-- $ -->
    <h2>Top 15 AAP 2 partnaires socioéconomiques proposés par nombre d'occurences</h2>
    ${resize((width) => overview.partnerCountPlotY(
      aap2_selected_partners_count,
      {
        width,
        y_label: "Partnaire (libelle / commune(s))",
        sort_value: aap2_selected_partners_sort,
      }
    ))}
    <!-- $ -->
  </div>
</div>

```js
const aap_partner_button = view(
  downloadPNGButton('aap-partner-plots', 'Download partner plots'),
)
```

<!-- AAP2 all proposals -->
<div class="card" style="margin: 10px;" id="aap2-wide-institutions-plot">
  ${aap2_selected_universities_x_sort_input}
  <!-- $ -->
  <h2>AAP 2 institutions proposés par nombre d'occurences</h2>
  ${resize((width) => overview.partnerCountPlotX(
    aap2_selected_institutions_count,
    {
      width,
      x_label: "Institution (libelle / commune(s))",
      sort_value: aap2_selected_universities_x_sort,
    }
  ))}
  <!-- $ -->
</div>
<div class="card" style="margin: 10px;" id="aap2-wide-laboratories-plot">
  ${aap2_selected_laboratories_x_sort_input}
  <!-- $ -->
  <h2>AAP 2 unités de recherche proposés par nombre d'occurences</h2>
  ${resize((width) => overview.partnerCountPlotX(
    aap2_selected_laboratories_count,
    {
      width,
      marginBottom: 100,
      lineWidth: 15,
      x_label: "Unité (libelle / commune(s))",
      sort_value: aap2_selected_laboratories_x_sort,
    }
  ))}
  <!-- $ -->
</div>
<div class="card" style="margin: 10px;" id="aap2-wide-partners-plot">
  ${aap2_selected_partners_x_sort_input}
  <!-- $ -->
  <h2>AAP 2 partnaires socioéconomiques proposés par nombre d'occurences</h2>
  ${resize((width) => overview.partnerCountPlotX(
    aap2_selected_partners_count,
    {
      width,
      x_label: "Partnaire (libelle / commune(s))",
      sort_value: aap2_selected_partners_x_sort,
    }
  ))}
  <!-- $ -->
</div>

```js
const aap2_wide_partner_buttons = view(
  Inputs.form([
    downloadPNGButton(
      'aap2-wide-institutions-plot',
      'Download proposed AAP2 wide institution plot',
    ),
    downloadPNGButton(
      'aap2-wide-laboratories-plot',
      'Download proposed AAP2 wide laboratory plot',
    ),
    downloadPNGButton(
      'aap2-wide-partners-plot',
      'Download proposed AAP2 wide socioeconomic partner plot',
    ),
  ]),
)
```

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

<!-- ### aap2_institutions_count -->

```sql id=aap2_institutions_count
select
  siren::VARCHAR as id,
  first(nom_complet) as label,
  list_distinct(list(project_id))::VARCHAR as projects,
  list_distinct(list(libelle_commune))::VARCHAR as communes,
  count(*) as count,
from aap2_project_by_institutions
left join aap2_institutions
  on aap2_project_by_institutions.institution_id::VARCHAR =
     aap2_institutions.institution_id::VARCHAR
where siren is not null
group by siren
```

<!-- ### aap2_laboratories_count -->

```sql id=aap2_laboratories_count
select
  numero_national_de_structure::VARCHAR as id,
  if(
    length(list_distinct(list(sigle))) > 0,
    list_distinct(list(sigle))[1],
    first(libelle)
  ) as label,
  list_distinct(list(project_id))::VARCHAR as projects,
  list_distinct(list(commune))::VARCHAR as communes,
  count(*) as count,
from aap2_project_by_laboratories
  left join aap2_laboratories
  on aap2_project_by_laboratories.unit_id::VARCHAR =
     aap2_laboratories.unit_id::VARCHAR
where numero_national_de_structure is not null
group by numero_national_de_structure
```

<!-- ### aap2_partners_count -->

```sql id=aap2_partners_count
select
  siren::VARCHAR as id,
  first(nom_complet) as label,
  list_distinct(list(project_id))::VARCHAR as projects,
  list_distinct(list(libelle_commune))::VARCHAR as communes,
  count(*) as count,
from aap2_project_by_socioeconomic_partners
  left join aap2_socioeconomic_partners
  on aap2_project_by_socioeconomic_partners.partner_id::VARCHAR =
     aap2_socioeconomic_partners.partner_id::VARCHAR
where siren is not null
group by siren
```

<!-- ### aap2_selected_institutions_count -->

```sql id=aap2_selected_institutions_count
with selected_institutions as (
  select
    institution_id,
    list_distinct(list(project_id))::VARCHAR as projects,
    count(*) as count,
  from aap2_project_by_institutions
  where project_id in (
    select project_id from aap2_projects where selected
  )
  group by institution_id
)

select
  siren::VARCHAR as id,
  first(nom_complet) as label,
  list_distinct(list(projects))::VARCHAR as projects,
  list_distinct(list(libelle_commune))::VARCHAR as communes,
  sum(selected_institutions.count)::INT as count,
from aap2_institutions
join selected_institutions
  on aap2_institutions.institution_id::VARCHAR = selected_institutions.institution_id::VARCHAR
where siren is not null
group by siren
```

<!-- ### aap2_selected_laboratories_count -->

```sql id=aap2_selected_laboratories_count
with selected_labs as (
  select
    unit_id,
    list_distinct(list(project_id))::VARCHAR as projects,
    count(*) as count,
  from aap2_project_by_laboratories
  where project_id in (
    select project_id from aap2_projects where selected
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
  list_distinct(list(projects))::VARCHAR as projects,
  list_distinct(list(commune))::VARCHAR as communes,
  sum(selected_labs.count)::INT as count,
from aap2_laboratories
join selected_labs
  on aap2_laboratories.unit_id = selected_labs.unit_id
where numero_national_de_structure is not null
group by numero_national_de_structure
```

<!-- ### aap2_selected_partners_count -->

```sql id=aap2_selected_partners_count
with selected_partners as (
  select
    partner_id,
    list_distinct(list(project_id))::VARCHAR as projects,
    count(*) as count,
  from aap2_project_by_socioeconomic_partners
  where project_id in (
    select project_id from aap2_projects where selected
  )
  group by partner_id
)

select
  siren::VARCHAR as id,
  first(nom_complet) as label,
  list_distinct(list(projects))::VARCHAR as projects,
  list_distinct(list(libelle_commune))::VARCHAR as communes,
  sum(selected_partners.count)::INT as count,
from aap2_socioeconomic_partners
join selected_partners
  on aap2_socioeconomic_partners.partner_id = selected_partners.partner_id
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

```js
const aap2_selected_universities_x_sort_input = overview.xSortSelect()
const aap2_selected_universities_x_sort = Generators.input(
  aap2_selected_universities_x_sort_input,
)

const aap2_selected_laboratories_x_sort_input = overview.xSortSelect()
const aap2_selected_laboratories_x_sort = Generators.input(
  aap2_selected_laboratories_x_sort_input,
)

const aap2_selected_partners_x_sort_input = overview.xSortSelect()
const aap2_selected_partners_x_sort = Generators.input(
  aap2_selected_partners_x_sort_input,
)
```

## Défis

<div class="grid grid-cols-3" id="challenge-plots">
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
  <!-- AAP 1 financé + AAP 2 proposé -->
  <div class="card">
    ${resize((width) => overview.stackedChallengeCountPlot(
      [...challenge_count_by_aap].filter((d) => d.financed || d.selected),
      {
        width,
        subtitle: `Les défis indiqués dans les métadonnées et les templates des
          soumissions sur le site du dépôt des projets financés ou proposés de
          l'AAP 1 et 2.`,
      })
    )}
    <!-- $ -->
  </div>
  <div class="card grid grid-colspan-2">
    ${resize((width) => overview.challengeCountPlot(
      [...challenge_count_by_aap].filter((d) => d.financed || d.selected),
      {
        width,
        subtitle: `Les défis indiqués dans les métadonnées et les templates des
          soumissions sur le site du dépôt des projets financés ou proposés de
          l'AAP 1 et 2.`,
      })
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
          soumissions sur le site du dépôt de l'AAP 2.
          Les sections proposés sont plus foncées.`
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
          soumissions sur le site du dépôt de l'AAP 2.
          Les sections proposés sont plus foncées.`
      })
    )}
    <!-- $ -->
  </div>
</div>

<div class="grid grid-cols-4" id="challenge-donuts">
  <div class="card">
    <h2>Répartition des défis de l'AAP 1</h2>
    <h3>Les sections plus épaisses représentent les défis financés</h3>
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
    <h3>Les sections plus épaisses représentent les défis préselectionnés</h3>
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
const challenge_plots_download_button = view(
  downloadPNGButton('challenge-plots', 'Download challenge plots'),
)
const challenge_donuts_download_button = view(
  downloadPNGButton('challenge-donuts', 'Download challenge donuts'),
)
```

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

<div class="grid">
  <div class="card">
    <h2>Tous les chercheurs</h2>
    <br/>
    ${researcher_search_filter_input}
    <!-- $ -->
    <br/>
    ${researcher_search_input}
    <!-- $ -->
    <br/>
    ${resize((width) => Inputs.table(
      [...researcher_search],
      {
        width: width,
        layout: 'auto',
        rows: 40,
      }
    ))}
    <!-- $ -->
    <br/>
    ${downloadTableButton(() => researcher_search)}
    <!-- $ -->
  </div>
</div>

```js
const researcher_search_input = Inputs.search(
  [...all_researchers_by_project].filter(
    (d) =>
      // (researcher_search_filter.includes('financed_projects')
      //   ? d.financed.includes(true)
      //   : true) &&
      (researcher_search_filter.includes('CO-PILOT')
        ? d.phase.includes('0')
        : true) &&
      (researcher_search_filter.includes('AAP 1')
        ? d.phase.includes('1')
        : true) &&
      (researcher_search_filter.includes('AAP 2')
        ? d.phase.includes('2')
        : true),
  ),
)
const researcher_search = Generators.input(researcher_search_input)
```

```js
const researcher_search_filter_input = Inputs.checkbox(
  [
    // 'financed_projects',
    'CO-PILOT',
    'AAP 1',
    'AAP 2',
  ],
  {
    value: [
      // 'financed_projects',
      'CO-PILOT',
      'AAP 1',
      'AAP 2',
    ],
  },
)
const researcher_search_filter = Generators.input(
  researcher_search_filter_input,
)
```

```sql id=all_researchers_by_project
select
  id,
  list_distinct(flatten(list(firstnames))) as firstnames,
  list_distinct(flatten(list(lastnames))) as lastnames,
  list_distinct(flatten(list(projects))) as projects,
  list_distinct(flatten(list(financed))) as financed,
  list_distinct(flatten(list(positions))) as positions,
  list_distinct(list(phase)) as phase,
  list_distinct(flatten(list(institutions))) as institutions,
  list_distinct(flatten(list(units))) as units,
  list_distinct(flatten(list(orcids))) as orcids,
  list_distinct(flatten(list(idhals))) as idhals,
  list_distinct(flatten(list(idrefs))) as idrefs,
  list_distinct(flatten(list(sites))) as sites,
from (
  select
    email as id,
    list_distinct(list(firstname)) as firstnames,
    list_distinct(list(lastname)) as lastnames,
    list_distinct(list(aap2_projects.project_id)) as projects,
    list(selected) as financed,
    list(position) as positions,
    '2' as phase,
    list_distinct(list(institution_id)) as institutions,
    list_distinct(list(unite_id)) as units,
    list_distinct(list(orcid)) as orcids,
    list_distinct(list(idhal)) as idhals,
    list_distinct(list(idref)) as idrefs,
    list_distinct(list(site)) as sites,
  from aap2_researchers
  left join aap2_project_by_researchers
    on aap2_researchers.email = aap2_project_by_researchers.researcher_id
  left join aap2_projects
    on aap2_project_by_researchers.project_id = aap2_projects.project_id
  where selected
  group by all
  union
    select
      if(email = '' or email is null, fullname, email) as id,
      list_distinct(list(firstname)) as firstnames,
      list_distinct(list(lastname)) as lastnames,
      list_distinct(list(acronyme)) as projects,
      list(financed) as financed,
      list(position) as positions,
      '1' as phase,
      [] as institutions,
      list_distinct(list(lab)) as units,
      list_distinct(list(orcid)) as orcids,
      list_distinct(list(idhal)) as idhals,
      [] as idrefs,
      list_distinct(list(site)) as sites,
    from aap1_researchers
    left join aap1_projects
      on acronyme in aap1_researchers.project
    where financed
    group by all
    union
      select
        id,
        list_distinct(list(firstname)) as firstnames,
        list_distinct(list(lastname)) as lastnames,
        list_distinct(list(project)) as projects,
        [true] as financed,
        list(position) as positions,
        '0' as phase,
        [] as institutions,
        list_distinct(list(lab)) as units,
        list_distinct(list(orcid)) as orcids,
        list_distinct(list(idhal)) as idhals,
        [] as idrefs,
        list_distinct(list(site)) as sites,
      from co_researchers
      group by all
)
group by id
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

<div class="grid grid-cols-2">
  <div class="card">
    <h2>CNUs des chercheurs des projets proposées dans l'AAP 2</h2>
    ${aap2_cnus_search_input_researchers}
    <!-- $ -->
    <br/>
    ${resize((width) => Inputs.table(aap2_cnus_search_researchers))}
    <!-- $ -->
  </div>
  <div class="card">
    <h2>CNUs des thésards des projets proposées dans l'AAP 2</h2>
    ${aap2_cnus_search_input_phds}
    <!-- $ -->
    <br/>
    ${resize((width) => Inputs.table(aap2_cnus_search_phds))}
    <!-- $ -->
  </div>
</div>

```js
const aap2_cnus_search_input_researchers = Inputs.search(aap2_cnus_researchers)
const aap2_cnus_search_researchers = Generators.input(
  aap2_cnus_search_input_researchers,
)
const aap2_cnus_search_input_phds = Inputs.search(aap2_cnus_phds)
const aap2_cnus_search_phds = Generators.input(aap2_cnus_search_input_phds)
```

```sql id=aap2_cnus_researchers
select distinct
  aap2_researcher_by_cnu.researcher_id as researcher_id,
  cnu,
  list_distinct(list(aap2_projects.project_id)) as projects
from aap2_researcher_by_cnu
left join aap2_project_by_researchers
  on aap2_researcher_by_cnu.researcher_id = aap2_project_by_researchers.researcher_id
left join aap2_projects
  on aap2_project_by_researchers.project_id = aap2_projects.project_id
where contains(aap2_researcher_by_cnu.researcher_id, '@') and selected
group by all
```

```sql id=aap2_cnus_phds
select distinct
  aap2_researcher_by_cnu.researcher_id as researcher_id,
  cnu,
  list_distinct(list(aap2_projects.project_id)) as projects
from aap2_researcher_by_cnu
left join aap2_project_by_researchers
  on aap2_researcher_by_cnu.researcher_id = aap2_project_by_researchers.researcher_id
left join aap2_projects
  on aap2_project_by_researchers.project_id = aap2_projects.project_id
where not contains(aap2_researcher_by_cnu.researcher_id, '@') and selected
group by all
```

<div class="grid grid-cols-3" id="cnu-donuts">
  <div class="card">
    <h2>Distribution des CNUs financées par catégorie de l'AAP 1</h2>
    <h3>Les sections CNU identifiés dans les projets financés de l'AAP 1.</h3>
    ${disciplines.erc_legend()}
    <!-- $ -->
    ${resize((width) => disciplines.erc_donut(
      aap1_cnu_count_erc,
      width - 70,
      undefined,
      {
        legendTextLength: 40,
      }
    ))}
    <!-- $ -->
  </div>
  <div class="card">
    <h2>Distribution des CNUs proposés par catégorie de l'AAP 2</h2>
    <h3>Les sections CNU identifiés dans les projets proposés de l'AAP 2.</h3>
    ${disciplines.erc_legend()}
    <!-- $ -->
    <div class="grid grid-cols-2">
      <div class="grid-rowspan-2">
        ${resize((width) => donutChart(
          aap2_cnu_count_erc.filter((d) => d.selected),
          {
            ...default_cnu_aap_donut_config(width),
            width: width,
            legend: false,
          },
        ))}
        <!-- $ -->
      </div>
      ${resize((width) => donutChart(
        d3.rollups(aap2_cnu_count_erc.filter((d) => d.selected),
          (v) => v.reduce((a, b) => a + b.count, 0),
          (d) => d.group,
        ).flatMap(([group, count]) => ({
          group,
          count,
        })),
        {
          ...default_cnu_aap_donut_config(),
          width: 1,
          legendWidth: 1,
          legendTextLength: 40,
          innerRadiusRatio: 0,
          outerRadiusRatio: 0,
        },
      ))}
      <!-- $ -->
    </div>
  </div>
  <div class="card">
    <h2>Distribution des CNUs par catégorie de l'AAP 2</h2>
    <h3>
      Les sections CNU identifiés dans les projets de l'AAP 2. Les sections plus
      épaisses représentent les CNUs dans les projets proposés.
    </h3>
    ${disciplines.erc_legend()}
    <!-- $ -->
    <div class="grid grid-cols-2">
      <div class="grid-rowspan-2">
        ${resize((width) => donutChart(
          aap2_cnu_count_erc,
          {
            ...default_cnu_aap_donut_config(width),
            width: width,
            legend: false,
          },
        ))}
        <!-- $ -->
      </div>
      ${resize((width) => donutChart(
        d3.rollups(aap2_cnu_count_erc,
          (v) => v.reduce((a, b) => a + b.count, 0),
          (d) => d.group,
        ).flatMap(([group, count]) => ({
          group,
          count,
        })),
        {
          ...default_cnu_aap_donut_config(),
          width: 1,
          legendWidth: 1,
          legendTextLength: 40,
          innerRadiusRatio: 0,
          outerRadiusRatio: 0,
        },
      ))}
      <!-- $ -->
    </div>
  </div>
</div>

```js
const show_non_selected_aap2 = view(
  Inputs.toggle({
    label: "Afficher les sections CNU non-proposées de l'AAP 2",
  }),
)
```

<div class="card" id="aap2-cnu-plot">
  <h2>
    Distribution des sections
    ${show_non_selected_aap2 ? "" : "proposées"}
    <!-- $ -->
    CNU de l'AAP 2
  </h2>
  <h3>
    Distribution détaillée des sections
    ${show_non_selected_aap2 ? "" : "proposées"}
    <!-- $ -->
    de l'AAP 2 par catégorie.
    ${show_non_selected_aap2 ? "Les sections proposées sont plus foncées." : ""}
    <!-- $ -->
  </h3>
  ${disciplines.erc_legend()}
  <!-- $ -->
  ${resize((width) => disciplines.cnu_plot_y_by_erc(
    [...aap2_cnu_count].filter((d) => show_non_selected_aap2 || d.selected),
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

```js
const show_non_financed_aap12 = view(
  Inputs.toggle({
    label: "Afficher les sections CNU non-financées de l'AAP 1",
  }),
)
const show_non_selected_aap12 = view(
  Inputs.toggle({
    label: "Afficher les sections CNU non-proposées de l'AAP 2",
  }),
)
```

<div class="card" id="aap12-cnu-plot">
  <h2>
    Distribution des sections CNU
    ${show_non_financed_aap12 ? '' : 'financés'}
    <!-- $ -->
    de l'AAP 1 et
    ${show_non_selected_aap12 ? '' : 'proposées'}
    <!-- $ -->
    de l'AAP 2
  </h2>
  <h3>
    Distribution détaillée des sections de l'AAP 1 et 2 par appel.
    ${show_non_financed_aap12 ? "Les sections financées de l'AAP 1" : ''}
    <!-- $ -->
    ${show_non_financed_aap12 && show_non_selected_aap12 ? "et" : ''}
    <!-- $ -->
    ${show_non_selected_aap12 ? "les sections proposées de l'AAP 2" : ''}
    <!-- $ -->
    ${show_non_financed_aap12 || show_non_selected_aap12
      ? "sont plus foncées."
      : ''}
    <!-- $ -->
  </h3>
  ${resize((width) => disciplines.cnu_by_aap_plot_y_by_erc(
    [...cnu_count]
      .filter((d) => show_non_financed_aap12
        || d.aap === 'AAP 2'
        || d.aap === 'AAP 1' && d.financed
      )
      .filter((d) => show_non_selected_aap12
        || d.aap === 'AAP 1'
        || d.aap === 'AAP 2' && d.selected
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

```js
const cnu_donuts_download_button = view(
  downloadPNGButton('cnu-donuts', 'Download CNU donuts'),
)

const aap2_cnu_plot_download_button = view(
  downloadPNGButton('aap2-cnu-plot', 'Download AAP2 CNU plot'),
)

const aap12_cnu_plot_download_button = view(
  downloadPNGButton('aap12-cnu-plot', 'Download AAP12 CNU plot'),
)
```

```sql id=cnu_count
select * from (
  select
    cnu[:2] as cnu,
    financed,
    null as selected,
    count(distinct id) as count,
    'AAP 1' as aap,
  from aap1_researchers
  join aap1_projects
    on aap1_projects.acronyme in aap1_researchers.project
  group by cnu[:2], financed
  union
  select
    cnu,
    null as financed,
    selected,
    count(distinct aap2_researcher_by_cnu.researcher_id) as count,
    'AAP 2' as aap,
  from aap2_researcher_by_cnu
  left join aap2_project_by_researchers
    on aap2_researcher_by_cnu.researcher_id = aap2_project_by_researchers.researcher_id
  left join aap2_projects
    on aap2_project_by_researchers.project_id = aap2_projects.project_id
  where cnu is not null and cnu::VARCHAR != ''
  group by all
)
where cnu[:2] similar to '[0-9]{2}'
order by cnu, selected, financed
```

```sql
select * from (
  select
    cnu[:2] as cnu,
    financed,
    count(distinct id) as count,
    'AAP 1' as aap,
  from aap1_researchers
  join aap1_projects
    on aap1_projects.acronyme in aap1_researchers.project
  group by cnu[:2], financed
  union
  select
    cnu,
    selected as financed,
    count(distinct aap2_researcher_by_cnu.researcher_id) as count,
    'AAP 2' as aap,
  from aap2_researcher_by_cnu
  left join aap2_project_by_researchers
    on aap2_researcher_by_cnu.researcher_id = aap2_project_by_researchers.researcher_id
  left join aap2_projects
    on aap2_project_by_researchers.project_id = aap2_projects.project_id
  where cnu is not null and cnu::VARCHAR != ''
  group by all
)
where cnu[:2] similar to '[0-9]{2}'
  and financed
order by cnu, financed
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
  count(*) as count,
from aap2_project_by_cnu
join aap2_projects
  on aap2_projects.project_id = aap2_project_by_cnu.project_id
where cnu is not null and cnu::VARCHAR != ''
group by cnu, selected
order by cnu, selected
```

```js
const default_cnu_aap_donut_config = (width) => ({
  keyMap: (d) => d.group,
  valueMap: (d) => d.count,
  color: d3
    .scaleOrdinal(
      color.erc_category_colors.keys(),
      color.erc_category_colors.values(),
    )
    .unknown('gray'),
  sort: (a, b) => a.group - b.group,
  outerRadiusRatio: (d) => (d.data.selected ? width * 0.5 : width * 0.48),
})

const aap2_cnu_count_erc = d3
  .rollups(
    aap2_cnu_count,
    (v) => v.reduce((a, b) => a + b.count, 0),
    (d) => cnu.getERCFromCNU(d.cnu) || 'Non renseigné',
    (d) => d.selected,
  )
  .flatMap(([group, selected_map]) =>
    selected_map.map(([selected, count]) => ({
      group,
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
const carto_options = view(
  Inputs.form({
    show_labels: Inputs.toggle({
      label: 'Afficher les labels',
    }),
    map_filter: Inputs.select(
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
  }),
)
```

<div class="grid grid-cols-2" id="choropleths">
  <div class="card">
    ${resize((width) => choroplethFrance(
      width,
      label_map.get(carto_options.map_filter),
      ({ properties }) => [...carto_options.map_filter].find(
          (d) => d.departement_code === properties.code
        )?.count,
      carto_options.show_labels ? map_tip_map.get(carto_options.map_filter) : [],
    ))}
    <!-- $ -->
  </div>
</div>

```js
const choropleths_download_button = view(
  downloadPNGButton('choropleths', 'Download choropleth'),
)
```

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

const label_map = new Map([
  [
    institution_count_by_postal_code,
    "Nombre d'institutions de l'AAP 2 par département, France",
  ],
  [
    laboratory_count_by_postal_code,
    "Nombre de laboratoires de l'AAP 2 par département, France",
  ],
  [
    socioeconomic_partner_count_by_postal_code,
    "Nombre de partenaires socio-économiques de l'AAP 2 par département, France",
  ],
])

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
        min_threshold: 6,
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

```sql id=institution_count_by_postal_code
select
  code_postal[:2] as departement_code,
  count(*) as count,
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
  count(*) as count,
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
  count(*) as count,
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
<div class="grid grid-cols-2">
  <div class="card">
    <h2>Labels CNU bruts</h2>
    ${cnu_label_search_input}
    <!-- $ -->
    ${resize((width) => Inputs.table(cnu_label_search, { layout: "auto" }))}
    <!-- $ -->
  </div>
  <div class="card">
    <h2>Duplicates researcher identifiers</h2>
    <br/>
    ${resize((width) => Inputs.table(
      sql`
        select
          email,
          list_distinct(list(firstname)) as firstnames,
          list_distinct(list(lastname)) as lastnames,
          list_distinct(list(orcid)) as orcids,
          list_distinct(list(idhal)) as idhals,
          list_distinct(list(idref)) as idrefs,
          list_distinct(list(project_id)) as projects,
        from aap2_researchers
        join aap2_project_by_researchers on aap2_researchers.email
          = aap2_project_by_researchers.researcher_id
        group by all
        having length(list_distinct(list(firstname))) > 1
          or length(list_distinct(list(lastname))) > 1
          or length(list_distinct(list(orcid))) > 1
          or length(list_distinct(list(idhal))) > 1
          or length(list_distinct(list(idref))) > 1
      `,
      {
        width: width,
        layout: 'auto',
      }
    ))}
    <!-- $ -->
  </div>
  <div class="card">
    <h2>Missing institution SIRETs</h2>
    <br/>
    ${resize((width) => Inputs.table(
      sql`
        select
          source_label,
          labels,
          list_distinct(list(project_id)) as projects
        from aap2_institutions
        left join aap2_project_by_institutions
          on aap2_institutions.institution_id
            = aap2_project_by_institutions.institution_id
        where siret is null
        group by all
      `,
      {
        width: width,
        layout: 'auto',
      }
    ))}
    <!-- $ -->
  </div>
</div>

```js
const cnu_label_search_input = Inputs.search(
  await sql`select * from aap2_project_by_cnu_labels`,
)
const cnu_label_search = Generators.input(cnu_label_search_input)
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

```sql id=[missing_institution_siret] echo
select count(*) as count
from aap2_institutions
where siret is null
```

```sql display=false
select institution_id, count(*) as count
from aap2_institutions
where siret is null
group by institution_id
```

```sql id=[missing_laboratories_rnsr] echo
select count(*) as count
from aap2_laboratories
where numero_national_de_structure is null
```

```sql display=false
select unit_id, count(*) as count
from aap2_laboratories
where numero_national_de_structure is null
group by unit_id
```

```sql id=[missing_partner_siret] echo
select count(*) as count
from aap2_socioeconomic_partners
where siret is null
```

```sql display=false
select partner_id, count(*) as count
from aap2_socioeconomic_partners
where siret is null
group by partner_id
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
    acronyme as project_id,
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
    project_id,
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
    null as partner_id,
    label as labels,
    null as activities,
    1 as aap,
  from aap1_socioeconomic_partners
) union (
  select
    partner_id,
    labels,
    activities,
    2 as aap,
  from aap2_socioeconomic_partners
)
```

```sql id=project_by_keyword
(
  select
    acronyme as project_id,
    keyword,
    1 as aap,
  from aap1_project_by_keyword
) union (
  select
    project_id,
    keyword,
    2 as aap,
  from aap2_project_by_keyword
)
```

```sql id=project_institutions
(
  select
    project as project_id,
    university as institution,
    1 as aap,
  from aap1_project_by_institutions
) union (
  select
    project_id,
    institution_id as institution,
    2 as aap,
  from aap2_project_by_institutions
)
```

```sql id=project_laboratories
(
  select
    project as project_id,
    lab,
    1 as aap,
  from aap1_project_by_laboratories
) union (
  select
    project_id,
    unit_id as lab,
    2 as aap,
  from aap2_project_by_laboratories
)
```

```sql id=project_socioeconomic_partners
(
  select
    project as project_id,
    partner,
    1 as aap,
  from aap1_project_by_socioeconomic_partners
) union (
  select
    project_id,
    partner_id as partner,
    2 as aap,
  from aap2_project_by_socioeconomic_partners
)
```

</div>
