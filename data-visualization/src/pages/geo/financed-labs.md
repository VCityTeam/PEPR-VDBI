---
sql:
  annex_partners: /data/partners_by_project_annex.csv
  projects_by_partner: /data/partners_by_project.tsv
  aap_partners: /data/partners.tsv
  project_terrains: /data/project_terrains.tsv
---

# Participating Laboratories

<div class="warning" label="Data visualization notice">
  Data visualizations are unverified and errors may exist.
  Consider these data visualizations as estimations and not a "ground truth".
</div>

<!-- IMPORTS -->

```js
import {
  downloadTableButton,
  downloadSVGButton,
} from '/components/utilities.js'
import {
  choropleth_terrain_data,
  all_partners_by_code,
  all_partners_by_code_group_idf,
  lab_disciplines_by_code,
  france_terrain_data,
  ile_de_france_terrain_data,
  international_terrain_data,
  france_terrain_legend,
  idf_terrain_legend,
  italy_terrain_legend,
  world_terrain_legend,
  franceProjection,
  parisProjection,
  italyProjection,
  worldProjection,
  handleTerrainView,
  choroplethFrance,
  choroplethIdf,
  choroplethItaly,
  download_lab_choropleth_france,
  download_lab_choropleth_idf,
} from './aap-cartography.js'
```

<!-- DATA IMPORT -->

```sql id=terrain_data
select * from project_terrains
```

```sql id=labs
select
  label as "ID primaire",
  project,
  "postal_code"[0:2] as postal_code,
  -- code_panel_erc,
from aap_partners
join projects_by_partner
  on aap_partners.id = projects_by_partner.partner_id
where aap_partners.type = 'LABORATOIRE'
```

```js
const projects = [
  ...(await sql`select distinct project from project_terrains`),
].map((d) => d.project)

const selected_partner_project = view(
  Inputs.select(['All', projects], {
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
    '#lab-choropleth-container-france svg',
    'Download French choropleth lab partner map',
    `${selected_partner_project}_france_lab_partner_choropleth.svg`,
  )}
  ${downloadSVGButton(
    '#lab-choropleth-container-idf svg',
    'Download Île-de-France choropleth lab partner map',
    `${selected_partner_project}\_idf_lab_partner_choropleth.svg`,
  )}
</div>
<div class="grid grid-cols-3">
  <div
    id="lab-choropleth-container-france"
    class="card grid-colspan-2 grid-rowspan-2"
    style="padding: 12px;"
  >
    ${resize((width, height) =>
      choroplethFrance(
        width,
        height,
        ({ properties }) => lab_disciplines_by_code(
          labs,
          selected_partner_project)
        .get(properties.code),
        "- Laboratoires par département, France",
      )
    )}

  </div>
  <div id="lab-choropleth-container-idf" class="card" style="padding: 12px;">
    ${resize((width) => choroplethIdf(
      width,
      ({ properties }) => lab_disciplines_by_code(
        labs,
        selected_partner_project)
      .get(properties.code),
      "- Laboratoires par département, Île-de-France",
    ))}

  </div>
</div>
