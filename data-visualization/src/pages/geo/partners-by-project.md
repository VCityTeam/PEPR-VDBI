---
toc: false
sql:
  aap_partners: /data/partners.tsv
  projects_by_partner: /data/partners_by_project.tsv
---

# Partners by Project

<!-- IMPORTS -->

```js
import {
  downloadTableButton,
  downloadSVGButton,
  formTemplate,
} from '/components/utilities.js'
import * as geo from './aap-cartography.js'
import * as projections from '/components/projection-map.js'
```

<!-- DATA IMPORT -->

```sql id=projects_by_partner display
SELECT
  projects_by_partner.*,
  postal_code,
from projects_by_partner
join aap_partners
  on projects_by_partner.partner_id = aap_partners.id
    and projects_by_partner.type = aap_partners.type

```

```sql id=projects
select distinct project
from projects_by_partner
where project is not null
  and financed
order by project
```

<div class="warning" label="Data visualization notice">
  Data visualizations are unverified and errors may exist.
  Consider these data visualizations as estimations and not a "ground truth".
</div>

```js
const settings = view(
  Inputs.form(
    {
      selected_partner_project: Inputs.select(
        ['All', ...[...projects].map((d) => d.project)],
        {
          label: 'Optionally, select a project to focus on',
          value: 'All',
        },
      ),
      flatten_choropleth: Inputs.toggle({ label: 'Flatten choropleth' }),
      group_idf: Inputs.toggle({ label: 'Group Île-de-France' }),
    },
    { template: formTemplate },
  ),
)
```

<div style="display: flex">
  ${downloadSVGButton(
    "#choropleth-container-france svg:nth-of-type(2)",
    "Download French choropleth partner map",
    `${settings.selected_partner_project}_france_partner_choropleth.svg`
  )}
  <!-- $ -->
  ${downloadSVGButton(
    "#choropleth-container-france svg:nth-of-type(1)",
    "Download legend",
    `${settings.selected_partner_project}_france_partner_choropleth_legend.svg`
  )}
  <!-- $ -->
  ${downloadSVGButton(
    "#choropleth-container-idf svg:nth-of-type(2)",
    "Download Île-de-France choropleth partner map",
    `${settings.selected_partner_project}_idf_partner_choropleth.svg`
  )}
  <!-- $ -->
  ${downloadSVGButton(
    "#choropleth-container-idf svg:nth-of-type(1)",
    "Download legend",
    `${settings.selected_partner_project}_idf_partner_choropleth_legend.svg`
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
    ${resize((width) => projections.choroplethFrance(
      width,
      width * 0.9,
      geo.choroplethCountByPostalCode(filtered_partners_by_project),
    ))}
    <!-- $ -->
  </div>
  <div id="choropleth-container-idf" class="card" style="padding: 12px;">
    ${resize((width) => projections.choroplethIdf(
      width,
      geo.choroplethCountByPostalCode(filtered_partners_by_project),
    ))}
    <!-- $ -->
  </div>
</div>

<div class="card">
  ${Inputs.table(filtered_partners_by_project, { layout: "auto" })}
  <!-- $ -->
</div>

<div>
  ${downloadTableButton(
    () => filtered_partners_by_project,
    { filename: `${settings.selected_partner_project}\_partenaires.csv` })}
  <!-- $ -->
</div>

```js
const filtered_partners_by_project = [...projects_by_partner]
  .map((d) => d.toJSON())
  .filter(
    (d) =>
      settings.selected_partner_project == 'All' ||
      d.project == settings.selected_partner_project,
  )
```
