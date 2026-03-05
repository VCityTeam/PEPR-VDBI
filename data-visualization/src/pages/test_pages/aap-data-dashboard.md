---
style: /css/vdbi-page.css
---

# AAP Data

<div class="warning">
  There are known data quality errors in the data sources.
  This page is largely for debugging purposes only.
</div>

```js
import { downloadTableButton } from '/components/utilities.js'
import {
  extractPhase1Workbook,
  getColumnOptions,
  filterOnInput,
} from '/data/utilities/phase1-workbook.js'
```

```js
const workbook = FileAttachment(
  '/data/private/251127 VDBI Base Connaissance vdef jyt.xlsx',
).xlsx()
```

```js
const financed_only = view(
  Inputs.toggle({ label: 'Only financed projects?', value: true }),
)
```

```js
const phase_1_data = extractPhase1Workbook(
  workbook,
  false,
  false,
  financed_only,
)

display(phase_1_data)
```

```js
const projects_search_input = Inputs.search(phase_1_data.projects, {
  placeholder: 'Search projects',
})
const projects_search = Generators.input(projects_search_input)

const project_by_universities_search_input = Inputs.search(
  phase_1_data.project_by_universities,
  {
    placeholder: 'Search project_by_universities',
  },
)
const project_by_universities_search = Generators.input(
  project_by_universities_search_input,
)

const project_by_laboratories_search_input = Inputs.search(
  phase_1_data.project_by_laboratories,
  {
    placeholder: 'Search project_by_laboratories',
  },
)
const project_by_laboratories_search = Generators.input(
  project_by_laboratories_search_input,
)

const laboratories_search_input = Inputs.search(phase_1_data.laboratories, {
  placeholder: 'Search laboratories',
})
const laboratories_search = Generators.input(laboratories_search_input)

const laboratories_by_domains_erc_search_input = Inputs.search(
  phase_1_data.laboratories_by_domains_erc,
  {
    placeholder: 'Search laboratories_by_domains_erc',
  },
)
const laboratories_by_domains_erc_search = Generators.input(
  laboratories_by_domains_erc_search_input,
)

const laboratories_by_disciplines_erc_search_input = Inputs.search(
  phase_1_data.laboratories_by_disciplines_erc,
  {
    placeholder: 'Search laboratories_by_disciplines_erc',
  },
)
const laboratories_by_disciplines_erc_search = Generators.input(
  laboratories_by_disciplines_erc_search_input,
)

const laboratories_by_domains_hceres_search_input = Inputs.search(
  phase_1_data.laboratories_by_domains_hceres,
  {
    placeholder: 'Search laboratories_by_domains_hceres',
  },
)
const laboratories_by_domains_hceres_search = Generators.input(
  laboratories_by_domains_hceres_search_input,
)

const laboratories_by_disciplines_hceres_search_input = Inputs.search(
  phase_1_data.laboratories_by_disciplines_hceres,
  {
    placeholder: 'Search laboratories_by_disciplines_hceres',
  },
)
const laboratories_by_disciplines_hceres_search = Generators.input(
  laboratories_by_disciplines_hceres_search_input,
)
const universities_search_input = Inputs.search(phase_1_data.universities, {
  placeholder: 'Search universities',
})
const universities_search = Generators.input(universities_search_input)

const researchers_search_input = Inputs.search(phase_1_data.researchers, {
  placeholder: 'Search researchers',
})
const researchers_search = Generators.input(researchers_search_input)

const socioeconomic_partners_search_input = Inputs.search(
  phase_1_data.socioeconomic_partners,
  {
    placeholder: 'Search socioeconomic_partners',
  },
)
const socioeconomic_partners_search = Generators.input(
  socioeconomic_partners_search_input,
)
```

<div class="card">
  <h2>Projects</h2>
  <div>
    ${projects_search_input}
    <!-- $ -->
    ${Inputs.table(projects_search, {
      layout: "auto",
    })}
    <!-- $ -->
  </div>
  </br>
  ${downloadTableButton(() => projects_search)}
  <!-- $ -->
</div>
<div class="card">
  <h2>Project universities</h2>
  <div>
    ${project_by_universities_search_input}
    <!-- $ -->
    ${Inputs.table(project_by_universities_search, {
      layout: "auto",
    })}
    <!-- $ -->
  </div>
  </br>
  ${downloadTableButton(() => project_by_universities_search)}
  <!-- $ -->
</div>
<div class="card">
  <h2>Project Laboratories</h2>
  <div>
    ${project_by_laboratories_search_input}
    <!-- $ -->
    ${Inputs.table(project_by_laboratories_search, {
      layout: "auto",
    })}
    <!-- $ -->
  </div>
  </br>
  ${downloadTableButton(() => project_by_laboratories_search)}
  <!-- $ -->
</div>
<div class="card">
  <h2>Laboratories</h2>
  <div>
    ${laboratories_search_input}
    <!-- $ -->
    ${Inputs.table(laboratories_search, {
      layout: "auto",
    })}
    <!-- $ -->
  </div>
  </br>
  ${downloadTableButton(() => laboratories_search)}
  <!-- $ -->
</div>
<div class="card">
  <h2>Laboratory ERC domains</h2>
  <div>
    ${laboratories_by_domains_erc_search_input}
    <!-- $ -->
    ${Inputs.table(laboratories_by_domains_erc_search, {
      layout: "auto",
    })}
    <!-- $ -->
  </div>
  </br>
  ${downloadTableButton(() => laboratories_by_domains_erc_search)}
  <!-- $ -->
</div>
<div class="card">
  <h2>Laboratory ERC disciplines</h2>
  <div>
    ${laboratories_by_disciplines_erc_search_input}
    <!-- $ -->
    ${Inputs.table(laboratories_by_disciplines_erc_search, {
      layout: "auto",
    })}
    <!-- $ -->
  </div>
  </br>
  ${downloadTableButton(() => laboratories_by_disciplines_erc_search)}
  <!-- $ -->
</div>
<div class="card">
  <h2>Laboratory HCERES domains</h2>
  <div>
    ${laboratories_by_domains_hceres_search_input}
    <!-- $ -->
    ${Inputs.table(laboratories_by_domains_hceres_search, {
      layout: "auto",
    })}
    <!-- $ -->
  </div>
  </br>
  ${downloadTableButton(() => laboratories_by_domains_hceres_search)}
  <!-- $ -->
</div>
<div class="card">
  <h2>Laboratory HCERES disciplines</h2>
  <div>
    ${laboratories_by_disciplines_hceres_search_input}
    <!-- $ -->
    ${Inputs.table(laboratories_by_disciplines_hceres_search, {
      layout: "auto",
    })}
    <!-- $ -->
  </div>
  </br>
  ${downloadTableButton(() => laboratories_by_disciplines_hceres_search)}
  <!-- $ -->
</div>
<div class="card">
  <h2>Universities</h2>
  <div>
    ${universities_search_input}
    <!-- $ -->
    ${Inputs.table(universities_search, {
      layout: "auto",
    })}
    <!-- $ -->
  </div>
  </br>
  ${downloadTableButton(() => universities_search)}
  <!-- $ -->
</div>
<div class="card">
  <h2>Researchers</h2>
  <div>
    ${researchers_search_input}
    <!-- $ -->
    ${Inputs.table(researchers_search, {
      layout: "auto",
    })}
    <!-- $ -->
  </div>
  </br>
  ${downloadTableButton(() => researchers_search)}
  <!-- $ -->
</div>
<div class="card">
  <h2>Project socioeconomic partners</h2>
  <div>
    ${socioeconomic_partners_search_input}
    <!-- $ -->
    ${Inputs.table(socioeconomic_partners_search, {
      layout: "auto",
    })}
    <!-- $ -->
  </div>
  </br>
  ${downloadTableButton(() => socioeconomic_partners_search)}
  <!-- $ -->
</div>
