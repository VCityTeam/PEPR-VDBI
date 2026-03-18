---
toc: true
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
  aap2_laboratories: /data/phase2-laboratories.tsv
  aap2_socioeconomic_partners: /data/phase2-socioeconomic_partners.tsv
  aap2_project_by_keyword: /data/phase2-project_by_keyword.tsv
  aap2_project_by_discipline: /data/phase2-project_by_discipline.tsv
  aap2_project_by_cnu: /data/phase2-project_by_cnu.tsv
  aap2_project_by_institutions: /data/phase2-project_by_institutions.tsv
  aap2_project_by_laboratories: /data/phase2-project_by_laboratories.tsv
  aap2_project_by_socioeconomic_partners: /data/phase2-project_by_socioeconomic_partners.tsv
  # aap2_laboratories_by_domains_erc: /data/phase2-laboratories_by_domains_erc.tsv
  # aap2_laboratories_by_disciplines_erc: /data/phase2-laboratories_by_disciplines_erc.tsv
  # aap2_laboratories_by_domains_hceres: /data/phase2-laboratories_by_domains_hceres.tsv
  # aap2_laboratories_by_disciplines_hceres: /data/phase2-laboratories_by_disciplines_hceres.tsv
  aap2_institutions: /data/phase2-institutions.tsv
---

# AAP Data

<div class="warning">
  There are known data quality errors in the data sources.
  This page is largely for debugging purposes only.
</div>

```js
import { downloadTableButton } from '/components/utilities.js'
```

## AAP 1+2

### Projects

```sql
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
  from aap2_projects
)
```

### Laboratories

```sql
(
  select
    id,
    -- umr,
    lab as labels,
    -- name,
    -- institution,
    -- domain_erc,
    -- domain_hceres
  from aap1_laboratories
) union (
  select
    id,
    -- null as umr,
    labels,
    -- null as name,
  from aap2_laboratories
)
```

### Laboratory ERC domains

```sql

```

### Laboratory ERC disciplines

```sql

```

### Laboratory HCERES domains

```sql

```

### Laboratory HCERES disciplines

```sql

```

### Institutions

```sql
(
  select
    null as id,
    name as labels,
  from aap1_institutions
) union (
  select
    id,
    labels,
  from aap2_institutions
)
```

### Socioeconomic partners

```sql
(
  select
    null as id,
    label as labels,
    null as activities,
  from aap1_socioeconomic_partners
) union (
  select
    id,
    labels,
    activities,
  from aap2_socioeconomic_partners
)
```

### Researchers

```sql

```

### Researchers by keyword

```sql

```

### Project by keyword

```sql
(
  select
    acronyme,
    keyword,
  from aap1_project_by_keyword
) union (
  select
    acronyme,
    keyword,
  from aap2_project_by_keyword
)
```

### Project institutions

```sql
(
  select
    project,
    university as institution,
  from aap1_project_by_institutions
) union (
  select
    project,
    institution_id as institution
  from aap2_project_by_institutions
)
```

### Project Laboratories

```sql
(
  select
    project,
    lab
  from aap1_project_by_laboratories
) union (
  select
    project,
    unit_id as lab
  from aap2_project_by_laboratories
)
```

### Project socioeconomic partners

```sql
(
  select
    project,
    partner
  from aap1_project_by_socioeconomic_partners
) union (
  select
    project,
    partner_id as partner
  from aap2_project_by_socioeconomic_partners
)
```

## AAP 1

<div class="card">
  <h2>Projects</h2>
  </br>
  ${aap1_projects_search_input}
  <!-- $ -->
  </br>
  ${Inputs.table(aap1_projects_search, {
    layout: "auto",
  })}
  <!-- $ -->
  </br>
  ${downloadTableButton(() => aap1_projects_search)}
  <!-- $ -->
</div>

<div class="card">
  <h2>Laboratories</h2>
  </br>
  ${aap1_laboratories_search_input}
  <!-- $ -->
  </br>
  ${Inputs.table(aap1_laboratories_search, {
    layout: "auto",
  })}
  <!-- $ -->
  </br>
  ${downloadTableButton(() => aap1_laboratories_search)}
  <!-- $ -->
</div>

<div class="card">
  <h2>Laboratory ERC domains</h2>
  </br>
  ${aap1_laboratories_by_domains_erc_search_input}
  <!-- $ -->
  </br>
  ${Inputs.table(aap1_laboratories_by_domains_erc_search, {
    layout: "auto",
  })}
  <!-- $ -->
  </br>
  ${downloadTableButton(() => aap1_laboratories_by_domains_erc_search)}
  <!-- $ -->
</div>

<div class="card">
  <h2>Laboratory ERC disciplines</h2>
  </br>
  ${aap1_laboratories_by_disciplines_erc_search_input}
  <!-- $ -->
  </br>
  ${Inputs.table(aap1_laboratories_by_disciplines_erc_search, {
    layout: "auto",
  })}
  <!-- $ -->
  </br>
  ${downloadTableButton(() => aap1_laboratories_by_disciplines_erc_search)}
  <!-- $ -->
</div>

<div class="card">
  <h2>Laboratory HCERES domains</h2>
  </br>
  ${aap1_laboratories_by_domains_hceres_search_input}
  <!-- $ -->
  </br>
  ${Inputs.table(aap1_laboratories_by_domains_hceres_search, {
    layout: "auto",
  })}
  <!-- $ -->
  </br>
  ${downloadTableButton(() => aap1_laboratories_by_domains_hceres_search)}
  <!-- $ -->
</div>

<div class="card">
  <h2>Laboratory HCERES disciplines</h2>
  </br>
  ${aap1_laboratories_by_disciplines_hceres_search_input}
  <!-- $ -->
  </br>
  ${Inputs.table(aap1_laboratories_by_disciplines_hceres_search, {
    layout: "auto",
  })}
  <!-- $ -->
  </br>
  ${downloadTableButton(() => aap1_laboratories_by_disciplines_hceres_search)}
  <!-- $ -->
</div>

<div class="card">
  <h2>Institutions</h2>
  </br>
  ${aap1_institutions_search_input}
  <!-- $ -->
  </br>
  ${Inputs.table(aap1_institutions_search, {
    layout: "auto",
  })}
  <!-- $ -->
  </br>
  ${downloadTableButton(() => aap1_institutions_search)}
  <!-- $ -->
</div>

<div class="card">
  <h2>Researchers</h2>
  </br>
  ${aap1_researchers_search_input}
  <!-- $ -->
  </br>
  ${Inputs.table(aap1_researchers_search, {
    layout: "auto",
  })}
  <!-- $ -->
  </br>
  ${downloadTableButton(() => aap1_researchers_search)}
  <!-- $ -->
</div>

<div class="card">
  <h2>Researchers by keyword</h2>
  </br>
  ${aap1_researcher_by_keywords_search_input}
  <!-- $ -->
  </br>
  ${Inputs.table(aap1_researcher_by_keywords_search, {
    layout: "auto",
  })}
  <!-- $ -->
  </br>
  ${downloadTableButton(() => aap1_researcher_by_keywords_search)}
  <!-- $ -->
</div>

<div class="card">
  <h2>Project institutions</h2>
  </br>
  ${aap1_project_by_institutions_search_input}
  <!-- $ -->
  </br>
  ${Inputs.table(aap1_project_by_institutions_search, {
    layout: "auto",
  })}
  <!-- $ -->
  </br>
  ${downloadTableButton(() => aap1_project_by_institutions_search)}
  <!-- $ -->
</div>

<div class="card">
  <h2>Project Laboratories</h2>
  </br>
  ${aap1_project_by_laboratories_search_input}
  <!-- $ -->
  </br>
  ${Inputs.table(aap1_project_by_laboratories_search, {
    layout: "auto",
  })}
  <!-- $ -->
  </br>
  ${downloadTableButton(() => aap1_project_by_laboratories_search)}
  <!-- $ -->
</div>

<div class="card">
  <h2>Project socioeconomic partners</h2>
  </br>
  ${aap1_socioeconomic_partners_search_input}
  <!-- $ -->
  </br>
  ${Inputs.table(aap1_socioeconomic_partners_search, {
    layout: "auto",
  })}
  <!-- $ -->
  </br>
  ${downloadTableButton(() => aap1_socioeconomic_partners_search)}
  <!-- $ -->
</div>

```js
const aap1_projects_search_input = Inputs.search(
  await sql`select * from aap1_projects`,
  {
    placeholder: 'Search projects',
  },
)
const aap1_projects_search = Generators.input(aap1_projects_search_input)
```

```js
const aap1_project_by_institutions_search_input = Inputs.search(
  await sql`select * from aap1_project_by_institutions`,
  {
    placeholder: 'Search project_by_institutions',
  },
)
const aap1_project_by_institutions_search = Generators.input(
  aap1_project_by_institutions_search_input,
)
```

```js
const aap1_project_by_laboratories_search_input = Inputs.search(
  await sql`select * from aap1_project_by_laboratories`,
  {
    placeholder: 'Search project_by_laboratories',
  },
)
const aap1_project_by_laboratories_search = Generators.input(
  aap1_project_by_laboratories_search_input,
)
```

```js
const aap1_laboratories_search_input = Inputs.search(
  await sql`select * from aap1_laboratories`,
  {
    placeholder: 'Search laboratories',
  },
)
const aap1_laboratories_search = Generators.input(
  aap1_laboratories_search_input,
)
```

```js
const aap1_laboratories_by_domains_erc_search_input = Inputs.search(
  await sql`select * from aap1_laboratories_by_domains_erc`,
  {
    placeholder: 'Search laboratories_by_domains_erc',
  },
)
const aap1_laboratories_by_domains_erc_search = Generators.input(
  aap1_laboratories_by_domains_erc_search_input,
)
```

```js
const aap1_laboratories_by_disciplines_erc_search_input = Inputs.search(
  await sql`select * from aap1_laboratories_by_disciplines_erc`,
  {
    placeholder: 'Search laboratories_by_disciplines_erc',
  },
)
const aap1_laboratories_by_disciplines_erc_search = Generators.input(
  aap1_laboratories_by_disciplines_erc_search_input,
)
```

```js
const aap1_laboratories_by_domains_hceres_search_input = Inputs.search(
  await sql`select * from aap1_laboratories_by_domains_hceres`,
  {
    placeholder: 'Search laboratories_by_domains_hceres',
  },
)
const aap1_laboratories_by_domains_hceres_search = Generators.input(
  aap1_laboratories_by_domains_hceres_search_input,
)
```

```js
const aap1_laboratories_by_disciplines_hceres_search_input = Inputs.search(
  await sql`select * from aap1_laboratories_by_disciplines_hceres`,
  {
    placeholder: 'Search laboratories_by_disciplines_hceres',
  },
)
const aap1_laboratories_by_disciplines_hceres_search = Generators.input(
  aap1_laboratories_by_disciplines_hceres_search_input,
)
```

```js
const aap1_institutions_search_input = Inputs.search(
  await sql`select * from aap1_institutions`,
  {
    placeholder: 'Search institutions',
  },
)
const aap1_institutions_search = Generators.input(
  aap1_institutions_search_input,
)
```

```js
const aap1_researchers_search_input = Inputs.search(
  await sql`select * from aap1_researchers`,
  {
    placeholder: 'Search researchers',
  },
)
const aap1_researchers_search = Generators.input(aap1_researchers_search_input)
```

```js
const aap1_researcher_by_keywords_search_input = Inputs.search(
  await sql`select * from aap1_researcher_by_keywords`,
  {
    placeholder: 'Search researcher_by_keywords',
  },
)
const aap1_researcher_by_keywords_search = Generators.input(
  aap1_researcher_by_keywords_search_input,
)
```

```js
const aap1_socioeconomic_partners_search_input = Inputs.search(
  await sql`select * from aap1_socioeconomic_partners`,
  {
    placeholder: 'Search socioeconomic_partners',
  },
)
const aap1_socioeconomic_partners_search = Generators.input(
  aap1_socioeconomic_partners_search_input,
)
```

```js
const aap1_project_by_socioeconomic_partners_search_input = Inputs.search(
  await sql`select * from aap1_project_by_socioeconomic_partners`,
  {
    placeholder: 'Search socioeconomic_partners',
  },
)
const aap1_project_by_socioeconomic_partners_search = Generators.input(
  aap1_project_by_socioeconomic_partners_search_input,
)
```

## AAP 2

<div class="card">
  <h2>Projects</h2>
  </br>
  ${aap2_projects_search_input}
  <!-- $ -->
  </br>
  ${Inputs.table(aap2_projects_search, {
    layout: "auto",
  })}
  <!-- $ -->
  </br>
  ${downloadTableButton(() => aap2_projects_search)}
  <!-- $ -->
</div>

<div class="card">
  <h2>Projects by keyword</h2>
  </br>
  ${aap2_project_by_keyword_search_input}
  <!-- $ -->
  </br>
  ${Inputs.table(aap2_project_by_keyword_search, {
    layout: "auto",
  })}
  <!-- $ -->
  </br>
  ${downloadTableButton(() => aap2_project_by_keyword_search)}
  <!-- $ -->
</div>

<div class="card">
  <h2>Projects by discipline</h2>
  </br>
  ${aap2_project_by_discipline_search_input}
  <!-- $ -->
  </br>
  ${Inputs.table(aap2_project_by_discipline_search, {
    layout: "auto",
  })}
  <!-- $ -->
  </br>
  ${downloadTableButton(() => aap2_project_by_discipline_search)}
  <!-- $ -->
</div>

<div class="card">
  <h2>Projects by CNU</h2>
  </br>
  ${aap2_project_by_cnu_search_input}
  <!-- $ -->
  </br>
  ${Inputs.table(aap2_project_by_cnu_search, {
    layout: "auto",
  })}
  <!-- $ -->
  </br>
  ${downloadTableButton(() => aap2_project_by_cnu_search)}
  <!-- $ -->
</div>

<div class="card">
  <h2>Laboratories</h2>
  </br>
  ${aap2_laboratories_search_input}
  <!-- $ -->
  </br>
  ${Inputs.table(aap2_laboratories_search, {
    layout: "auto",
  })}
  <!-- $ -->
  </br>
  ${downloadTableButton(() => aap2_laboratories_search)}
  <!-- $ -->
</div>

<div class="card">
  <h2>Laboratory ERC domains</h2>
  </br>
  ${aap2_laboratories_by_domains_erc_search_input}
  <!-- $ -->
  </br>
  ${Inputs.table(aap2_laboratories_by_domains_erc_search, {
    layout: "auto",
  })}
  <!-- $ -->
  </br>
  ${downloadTableButton(() => aap2_laboratories_by_domains_erc_search)}
  <!-- $ -->
</div>

<div class="card">
  <h2>Laboratory ERC disciplines</h2>
  </br>
  ${aap2_laboratories_by_disciplines_erc_search_input}
  <!-- $ -->
  </br>
  ${Inputs.table(aap2_laboratories_by_disciplines_erc_search, {
    layout: "auto",
  })}
  <!-- $ -->
  </br>
  ${downloadTableButton(() => aap2_laboratories_by_disciplines_erc_search)}
  <!-- $ -->
</div>

<div class="card">
  <h2>Laboratory HCERES domains</h2>
  </br>
  ${aap2_laboratories_by_domains_hceres_search_input}
  <!-- $ -->
  </br>
  ${Inputs.table(aap2_laboratories_by_domains_hceres_search, {
    layout: "auto",
  })}
  <!-- $ -->
  </br>
  ${downloadTableButton(() => aap2_laboratories_by_domains_hceres_search)}
  <!-- $ -->
</div>

<div class="card">
  <h2>Laboratory HCERES disciplines</h2>
  </br>
  ${aap2_laboratories_by_disciplines_hceres_search_input}
  <!-- $ -->
  </br>
  ${Inputs.table(aap2_laboratories_by_disciplines_hceres_search, {
    layout: "auto",
  })}
  <!-- $ -->
  </br>
  ${downloadTableButton(() => aap2_laboratories_by_disciplines_hceres_search)}
  <!-- $ -->
</div>

<div class="card">
  <h2>Institutions</h2>
  </br>
  ${aap2_institutions_search_input}
  <!-- $ -->
  </br>
  ${Inputs.table(aap2_institutions_search, {
    layout: "auto",
  })}
  <!-- $ -->
  </br>
  ${downloadTableButton(() => aap2_institutions_search)}
  <!-- $ -->
</div>

<div class="card">
  <h2>Researchers</h2>
  </br>
  ${aap2_researchers_search_input}
  <!-- $ -->
  </br>
  ${Inputs.table(aap2_researchers_search, {
    layout: "auto",
  })}
  <!-- $ -->
  </br>
  ${downloadTableButton(() => aap2_researchers_search)}
  <!-- $ -->
</div>

<div class="card">
  <h2>Researchers by keyword</h2>
  </br>
  ${aap2_researcher_by_keywords_search_input}
  <!-- $ -->
  </br>
  ${Inputs.table(aap2_researcher_by_keywords_search, {
    layout: "auto",
  })}
  <!-- $ -->
  </br>
  ${downloadTableButton(() => aap2_researcher_by_keywords_search)}
  <!-- $ -->
</div>

<div class="card">
  <h2>Project institutions</h2>
  </br>
  ${aap2_project_by_institutions_search_input}
  <!-- $ -->
  </br>
  ${Inputs.table(aap2_project_by_institutions_search, {
    layout: "auto",
  })}
  <!-- $ -->
  </br>
  ${downloadTableButton(() => aap2_project_by_institutions_search)}
  <!-- $ -->
</div>

<div class="card">
  <h2>Project Laboratories</h2>
  </br>
  ${aap2_project_by_laboratories_search_input}
  <!-- $ -->
  </br>
  ${Inputs.table(aap2_project_by_laboratories_search, {
    layout: "auto",
  })}
  <!-- $ -->
  </br>
  ${downloadTableButton(() => aap2_project_by_laboratories_search)}
  <!-- $ -->
</div>

<div class="card">
  <h2>Socioeconomic partners</h2>
  </br>
  ${aap2_socioeconomic_partners_search_input}
  <!-- $ -->
  </br>
  ${Inputs.table(aap2_socioeconomic_partners_search, {
    layout: "auto",
  })}
  <!-- $ -->
  </br>
  ${downloadTableButton(() => aap2_socioeconomic_partners_search)}
  <!-- $ -->
</div>

<div class="card">
  <h2>Projects by socioeconomic partners</h2>
  </br>
  ${aap2_project_by_socioeconomic_partners_search_input}
  <!-- $ -->
  </br>
  ${Inputs.table(aap2_project_by_socioeconomic_partners_search, {
    layout: "auto",
  })}
  <!-- $ -->
  </br>
  ${downloadTableButton(() => aap2_project_by_socioeconomic_partners_search)}
  <!-- $ -->
</div>

```js
const aap2_projects_search_input = Inputs.search(
  await sql`select * from aap2_projects`,
  {
    placeholder: 'Search projects',
  },
)
const aap2_projects_search = Generators.input(aap2_projects_search_input)
```

```js
const aap2_project_by_keyword_search_input = Inputs.search(
  await sql`select * from aap2_project_by_keyword`,
  {
    placeholder: 'Search project_by_keyword',
  },
)
const aap2_project_by_keyword_search = Generators.input(
  aap2_project_by_keyword_search_input,
)
```

```js
const aap2_project_by_discipline_search_input = Inputs.search(
  await sql`select * from aap2_project_by_discipline`,
  {
    placeholder: 'Search project_by_discipline',
  },
)
const aap2_project_by_discipline_search = Generators.input(
  aap2_project_by_discipline_search_input,
)
```

```js
const aap2_project_by_cnu_search_input = Inputs.search(
  await sql`select * from aap2_project_by_cnu`,
  {
    placeholder: 'Search project_by_cnu',
  },
)
const aap2_project_by_cnu_search = Generators.input(
  aap2_project_by_cnu_search_input,
)
```

```js
const aap2_project_by_institutions_search_input = Inputs.search(
  await sql`select * from aap2_project_by_institutions`,
  {
    placeholder: 'Search project_by_institutions',
  },
)
const aap2_project_by_institutions_search = Generators.input(
  aap2_project_by_institutions_search_input,
)
```

```js
const aap2_project_by_laboratories_search_input = Inputs.search(
  await sql`select * from aap2_project_by_laboratories`,
  {
    placeholder: 'Search project_by_laboratories',
  },
)
const aap2_project_by_laboratories_search = Generators.input(
  aap2_project_by_laboratories_search_input,
)
```

```js
const aap2_laboratories_search_input = Inputs.search(
  await sql`select * from aap2_laboratories`,
  {
    placeholder: 'Search laboratories',
  },
)
const aap2_laboratories_search = Generators.input(
  aap2_laboratories_search_input,
)
```

```js
const aap2_laboratories_by_domains_erc_search_input = Inputs.search(
  await sql`select * from aap2_laboratories_by_domains_erc`,
  {
    placeholder: 'Search laboratories_by_domains_erc',
  },
)
const aap2_laboratories_by_domains_erc_search = Generators.input(
  aap2_laboratories_by_domains_erc_search_input,
)
```

```js
const aap2_laboratories_by_disciplines_erc_search_input = Inputs.search(
  await sql`select * from aap2_laboratories_by_disciplines_erc`,
  {
    placeholder: 'Search laboratories_by_disciplines_erc',
  },
)
const aap2_laboratories_by_disciplines_erc_search = Generators.input(
  aap2_laboratories_by_disciplines_erc_search_input,
)
```

```js
const aap2_laboratories_by_domains_hceres_search_input = Inputs.search(
  await sql`select * from aap2_laboratories_by_domains_hceres`,
  {
    placeholder: 'Search laboratories_by_domains_hceres',
  },
)
const aap2_laboratories_by_domains_hceres_search = Generators.input(
  aap2_laboratories_by_domains_hceres_search_input,
)
```

```js
const aap2_laboratories_by_disciplines_hceres_search_input = Inputs.search(
  await sql`select * from aap2_laboratories_by_disciplines_hceres`,
  {
    placeholder: 'Search laboratories_by_disciplines_hceres',
  },
)
const aap2_laboratories_by_disciplines_hceres_search = Generators.input(
  aap2_laboratories_by_disciplines_hceres_search_input,
)
```

```js
const aap2_institutions_search_input = Inputs.search(
  await sql`select * from aap2_institutions`,
  {
    placeholder: 'Search institutions',
  },
)
const aap2_institutions_search = Generators.input(
  aap2_institutions_search_input,
)
```

```js
const aap2_researchers_search_input = Inputs.search(
  await sql`select * from aap2_researchers`,
  {
    placeholder: 'Search researchers',
  },
)
const aap2_researchers_search = Generators.input(aap2_researchers_search_input)
```

```js
const aap2_researcher_by_keywords_search_input = Inputs.search(
  await sql`select * from aap2_researcher_by_keywords`,
  {
    placeholder: 'Search researcher_by_keywords',
  },
)
const aap2_researcher_by_keywords_search = Generators.input(
  aap2_researcher_by_keywords_search_input,
)
```

```js
const aap2_socioeconomic_partners_search_input = Inputs.search(
  await sql`select * from aap2_socioeconomic_partners`,
  {
    placeholder: 'Search socioeconomic_partners',
  },
)
const aap2_socioeconomic_partners_search = Generators.input(
  aap2_socioeconomic_partners_search_input,
)
```

```js
const aap2_project_by_socioeconomic_partners_search_input = Inputs.search(
  await sql`select * from aap2_project_by_socioeconomic_partners`,
  {
    placeholder: 'Search socioeconomic_partners',
  },
)
const aap2_project_by_socioeconomic_partners_search = Generators.input(
  aap2_project_by_socioeconomic_partners_search_input,
)
```
