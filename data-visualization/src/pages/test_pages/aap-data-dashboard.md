---
sql:
  aap1_projects: /data/phase1-projects.tsv
  aap1_researchers: /data/phase1-researchers.tsv
  aap1_researcher_by_keywords: /data/phase1-researcher_by_keywords.tsv
  aap1_laboratories: /data/phase1-laboratories.tsv
  aap1_socioeconomic_partners: /data/phase1-socioeconomic_partners.tsv
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
  aap2_project_by_institutions: /data/phase2-project_by_institutions.tsv
  aap2_project_by_laboratories: /data/phase2-project_by_laboratories.tsv
  # aap2_laboratories_by_domains_erc: /data/phase2-laboratories_by_domains_erc.tsv
  # aap2_laboratories_by_disciplines_erc: /data/phase2-laboratories_by_disciplines_erc.tsv
  # aap2_laboratories_by_domains_hceres: /data/phase2-laboratories_by_domains_hceres.tsv
  # aap2_laboratories_by_disciplines_hceres: /data/phase2-laboratories_by_disciplines_hceres.tsv
  aap2_institutions: /data/phase2-institutions.tsv
  aap2_project_by_socioeconomic_partners: /data/phase2-project_by_socioeconomic_partners.tsv
---

# AAP Data

<div class="warning">
  There are known data quality errors in the data sources.
  This page is largely for debugging purposes only.
</div>

```js
import { downloadTableButton } from '/components/utilities.js'
```

<div class="card">
  <h2>Projects</h2>
  </br>
  ${projects_search_input}
  <!-- $ -->
  </br>
  ${Inputs.table(projects_search, {
    layout: "auto",
  })}
  <!-- $ -->
  </br>
  ${downloadTableButton(() => projects_search)}
  <!-- $ -->
</div>

<div class="card">
  <h2>Project institutions</h2>
  </br>
  ${project_by_institutions_search_input}
  <!-- $ -->
  </br>
  ${Inputs.table(project_by_institutions_search, {
    layout: "auto",
  })}
  <!-- $ -->
  </br>
  ${downloadTableButton(() => project_by_institutions_search)}
  <!-- $ -->
</div>

<div class="card">
  <h2>Project Laboratories</h2>
  </br>
  ${project_by_laboratories_search_input}
  <!-- $ -->
  </br>
  ${Inputs.table(project_by_laboratories_search, {
    layout: "auto",
  })}
  <!-- $ -->
  </br>
  ${downloadTableButton(() => project_by_laboratories_search)}
  <!-- $ -->
</div>

<div class="card">
  <h2>Laboratories</h2>
  </br>
  ${laboratories_search_input}
  <!-- $ -->
  </br>
  ${Inputs.table(laboratories_search, {
    layout: "auto",
  })}
  <!-- $ -->
  </br>
  ${downloadTableButton(() => laboratories_search)}
  <!-- $ -->
</div>

<div class="card">
  <h2>Laboratory ERC domains</h2>
  </br>
  ${laboratories_by_domains_erc_search_input}
  <!-- $ -->
  </br>
  ${Inputs.table(laboratories_by_domains_erc_search, {
    layout: "auto",
  })}
  <!-- $ -->
  </br>
  ${downloadTableButton(() => laboratories_by_domains_erc_search)}
  <!-- $ -->
</div>

<div class="card">
  <h2>Laboratory ERC disciplines</h2>
  </br>
  ${laboratories_by_disciplines_erc_search_input}
  <!-- $ -->
  </br>
  ${Inputs.table(laboratories_by_disciplines_erc_search, {
    layout: "auto",
  })}
  <!-- $ -->
  </br>
  ${downloadTableButton(() => laboratories_by_disciplines_erc_search)}
  <!-- $ -->
</div>

<div class="card">
  <h2>Laboratory HCERES domains</h2>
  </br>
  ${laboratories_by_domains_hceres_search_input}
  <!-- $ -->
  </br>
  ${Inputs.table(laboratories_by_domains_hceres_search, {
    layout: "auto",
  })}
  <!-- $ -->
  </br>
  ${downloadTableButton(() => laboratories_by_domains_hceres_search)}
  <!-- $ -->
</div>

<div class="card">
  <h2>Laboratory HCERES disciplines</h2>
  </br>
  ${laboratories_by_disciplines_hceres_search_input}
  <!-- $ -->
  </br>
  ${Inputs.table(laboratories_by_disciplines_hceres_search, {
    layout: "auto",
  })}
  <!-- $ -->
  </br>
  ${downloadTableButton(() => laboratories_by_disciplines_hceres_search)}
  <!-- $ -->
</div>

<div class="card">
  <h2>Institutions</h2>
  </br>
  ${institutions_search_input}
  <!-- $ -->
  </br>
  ${Inputs.table(institutions_search, {
    layout: "auto",
  })}
  <!-- $ -->
  </br>
  ${downloadTableButton(() => institutions_search)}
  <!-- $ -->
</div>

<div class="card">
  <h2>Researchers</h2>
  </br>
  ${researchers_search_input}
  <!-- $ -->
  </br>
  ${Inputs.table(researchers_search, {
    layout: "auto",
  })}
  <!-- $ -->
  </br>
  ${downloadTableButton(() => researchers_search)}
  <!-- $ -->
</div>

<div class="card">
  <h2>Researchers by keyword</h2>
  </br>
  ${researcher_by_keywords_search_input}
  <!-- $ -->
  </br>
  ${Inputs.table(researcher_by_keywords_search, {
    layout: "auto",
  })}
  <!-- $ -->
  </br>
  ${downloadTableButton(() => researcher_by_keywords_search)}
  <!-- $ -->
</div>

<div class="card">
  <h2>Project socioeconomic partners</h2>
  </br>
  ${socioeconomic_partners_search_input}
  <!-- $ -->
  </br>
  ${Inputs.table(socioeconomic_partners_search, {
    layout: "auto",
  })}
  <!-- $ -->
  </br>
  ${downloadTableButton(() => socioeconomic_partners_search)}
  <!-- $ -->
</div>

```js
const projects_search_input = Inputs.search(
  await sql`select * from aap1_projects`,
  {
    placeholder: 'Search projects',
  },
)
const projects_search = Generators.input(projects_search_input)
```

```js
const project_by_institutions_search_input = Inputs.search(
  await sql`select * from aap1_project_by_institutions`,
  {
    placeholder: 'Search project_by_institutions',
  },
)
const project_by_institutions_search = Generators.input(
  project_by_institutions_search_input,
)
```

```js
const project_by_laboratories_search_input = Inputs.search(
  await sql`select * from aap1_project_by_laboratories`,
  {
    placeholder: 'Search project_by_laboratories',
  },
)
const project_by_laboratories_search = Generators.input(
  project_by_laboratories_search_input,
)
```

```js
const laboratories_search_input = Inputs.search(
  await sql`select * from aap1_laboratories`,
  {
    placeholder: 'Search laboratories',
  },
)
const laboratories_search = Generators.input(laboratories_search_input)
```

```js
const laboratories_by_domains_erc_search_input = Inputs.search(
  await sql`select * from aap1_laboratories_by_domains_erc`,
  {
    placeholder: 'Search laboratories_by_domains_erc',
  },
)
const laboratories_by_domains_erc_search = Generators.input(
  laboratories_by_domains_erc_search_input,
)
```

```js
const laboratories_by_disciplines_erc_search_input = Inputs.search(
  await sql`select * from aap1_laboratories_by_disciplines_erc`,
  {
    placeholder: 'Search laboratories_by_disciplines_erc',
  },
)
const laboratories_by_disciplines_erc_search = Generators.input(
  laboratories_by_disciplines_erc_search_input,
)
```

```js
const laboratories_by_domains_hceres_search_input = Inputs.search(
  await sql`select * from aap1_laboratories_by_domains_hceres`,
  {
    placeholder: 'Search laboratories_by_domains_hceres',
  },
)
const laboratories_by_domains_hceres_search = Generators.input(
  laboratories_by_domains_hceres_search_input,
)
```

```js
const laboratories_by_disciplines_hceres_search_input = Inputs.search(
  await sql`select * from aap1_laboratories_by_disciplines_hceres`,
  {
    placeholder: 'Search laboratories_by_disciplines_hceres',
  },
)
const laboratories_by_disciplines_hceres_search = Generators.input(
  laboratories_by_disciplines_hceres_search_input,
)
```

```js
const institutions_search_input = Inputs.search(
  await sql`select * from aap1_institutions`,
  {
    placeholder: 'Search institutions',
  },
)
const institutions_search = Generators.input(institutions_search_input)
```

```js
const researchers_search_input = Inputs.search(
  await sql`select * from aap1_researchers`,
  {
    placeholder: 'Search researchers',
  },
)
const researchers_search = Generators.input(researchers_search_input)
```

```js
const researcher_by_keywords_search_input = Inputs.search(
  await sql`select * from aap1_researcher_by_keywords`,
  {
    placeholder: 'Search researcher_by_keywords',
  },
)
const researcher_by_keywords_search = Generators.input(
  researcher_by_keywords_search_input,
)
```

```js
const socioeconomic_partners_search_input = Inputs.search(
  await sql`select * from aap1_socioeconomic_partners`,
  {
    placeholder: 'Search socioeconomic_partners',
  },
)
const socioeconomic_partners_search = Generators.input(
  socioeconomic_partners_search_input,
)
```

```js
const project_by_socioeconomic_partners_search_input = Inputs.search(
  await sql`select * from aap1_project_by_socioeconomic_partners`,
  {
    placeholder: 'Search socioeconomic_partners',
  },
)
const project_by_socioeconomic_partners_search = Generators.input(
  project_by_socioeconomic_partners_search_input,
)
```
