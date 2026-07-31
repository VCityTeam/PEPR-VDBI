---
sql:
  annex_partners: /data/partners_by_project_annex.csv
  projects_by_partner: /data/partners_by_project.tsv
  aap_partners: /data/partners.tsv
  project_terrains: /data/project_terrains.tsv
---

# Partners by Project

<!-- IMPORTS -->

```js
import {
  downloadTableButton,
  downloadSVGButton,
} from '/components/utilities.js'
import {
  all_partners_by_code,
  all_partners_by_code_group_idf,
  choroplethFrance,
  choroplethIdf,
  choroplethItaly,
} from './aap-cartography.js'
```

<!-- DATA IMPORT -->

```sql id=all_partner_data
SELECT * from aap_partners
```

<div class="warning" label="Data visualization notice">
  Data visualizations are unverified and errors may exist.
  Consider these data visualizations as estimations and not a "ground truth".
</div>

```js
const selected_partner_project = view(
  Inputs.select(['All', ...[...all_partner_data].map((d) => d.project)], {
    multiple: false,
    label: 'Optionally, select a project to focus on:',
    unique: true,
    sort: true,
    value: 'All',
  }),
)

const flatten_choropleth = view(Inputs.toggle({ label: 'Flatten choropleth?' }))

const group_idf = view(Inputs.toggle({ label: 'Group Île-de-France?' }))
```

<div style="display: flex">
  ${downloadSVGButton(
    "#choropleth-container-france svg:nth-of-type(2)",
    "Download French choropleth partner map",
    `${selected_partner_project}_france_partner_choropleth.svg`
  )}
  ${downloadSVGButton(
    "#choropleth-container-france svg:nth-of-type(1)",
    "Download legend",
    `${selected_partner_project}_france_partner_choropleth_legend.svg`
  )}
  ${downloadSVGButton(
    "#choropleth-container-idf svg:nth-of-type(2)",
    "Download Île-de-France choropleth partner map",
    `${selected_partner_project}_idf_partner_choropleth.svg`
  )}
  ${downloadSVGButton(
    "#choropleth-container-idf svg:nth-of-type(1)",
    "Download legend",
    `${selected_partner_project}_idf_partner_choropleth_legend.svg`
  )}
  <!-- ${open_choropleth_italy} -->
  <!-- $ -->
</div>
<div class="grid grid-cols-3">
  <div
    id="choropleth-container-france"
    class="card grid-colspan-2 grid-rowspan-2"
    style="padding: 12px;"
  >
    ${resize((width, height) => choroplethFrance(
      width,
      height,
      ({ properties }) => group_idf ?
        all_partners_by_code_group_idf.get(properties.code) :
        all_partners_by_code(
          all_partner_data,
          selected_partner_project,
          flatten_choropleth)
        .get(properties.code),
    ))}
    <!-- $ -->
  </div>
  <div id="choropleth-container-idf" class="card" style="padding: 12px;">
    ${resize((width) => choroplethIdf(
      width,
      ({ properties }) => all_partners_by_code(
          all_partner_data,
          selected_partner_project,
          flatten_choropleth)
        .get(properties.code),
    ))}
    <!-- $ -->
  </div>
  <!-- <div id="choropleth-container-italy" class="card" style="padding: 12px;">
    ${resize((width) => choroplethItaly(
      width,
      ({ properties }) => true
    ))}
  </div> -->
</div>

<div class="card">
  ${Inputs.table(choropleth_data, { layout: "auto" })}
  <!-- $ -->
</div>

<div>
  ${downloadTableButton(
    () => [...choropleth_data].map(d => d.toJSON()),
    { filename: `${selected_partner_project}\_partenaires.csv` })}<!-- $ -->
  ${downloadTableButton(
    () => [...all_partner_data].map((d) => d.toJSON()), {
      label: 'Download partners by project data',
      delimeter: '\t'
    })}<!-- $ -->
</div>

```js
const choropleth_data = [...all_partner_data].filter(
  (d) =>
    selected_partner_project == 'All' || d.project == selected_partner_project,
)
```
