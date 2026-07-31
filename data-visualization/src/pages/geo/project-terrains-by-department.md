---
sql:
  annex_partners: /data/partners_by_project_annex.csv
  projects_by_partner: /data/partners_by_project.tsv
  aap_partners: /data/partners.tsv
  project_terrains: /data/project_terrains.tsv
---

# Project terrains by department

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
  choroplethFrance,
  choroplethIdf,
  choroplethItaly,
} from './aap-cartography.js'
```

<!-- DATA IMPORT -->

```sql id=terrain_data
select * from project_terrains
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
    "#terrain-choropleth-container-france svg:nth-of-type(2)",
    "Download French terrain choropleth",
    `${selected_partner_project}_france_partner_choropleth.svg`
  )}
  ${downloadSVGButton(
    "#terrain-choropleth-container-france svg:nth-of-type(1)",
    "Download legend",
    `${selected_partner_project}_france_partner_choropleth_legend.svg`
  )}
  ${downloadSVGButton(
    "#terrain-choropleth-container-idf svg:nth-of-type(2)",
    "Download Île-de-France terrain choropleth",
    `${selected_partner_project}_idf_partner_choropleth.svg`
  )}
  ${downloadSVGButton(
    "#terrain-choropleth-container-idf svg:nth-of-type(1)",
    "Download legend",
    `${selected_partner_project}_idf_partner_choropleth_legend.svg`
  )}
  ${downloadSVGButton(
    "#terrain-choropleth-container-italy svg:nth-of-type(2)",
    "Download Italian terrain choropleth",
    `${selected_partner_project}_idf_partner_choropleth.svg`
  )}
  ${downloadSVGButton(
    "#terrain-choropleth-container-italy svg:nth-of-type(1)",
    "Download legend",
    `${selected_partner_project}_idf_partner_choropleth_legend.svg`
  )}
</div>
<div class="grid grid-cols-3">
  <div
    id="terrain-choropleth-container-france"
    class="card grid-colspan-2 grid-rowspan-2"
    style="padding: 12px;"
  >
    ${resize((width, height) => choroplethFrance(
      width,
      height,
      ({ properties }) =>
        (choropleth_terrain_data(terrain_data)
        .get(properties.nom) || { size: null })
        .size
    ))}
    <!-- $ -->
  </div>
  <div id="terrain-choropleth-container-idf" class="card" style="padding: 12px;">
    ${resize((width) => choroplethIdf(
      width,
      ({ properties }) =>
        (choropleth_terrain_data(terrain_data)
        .get(properties.nom) || { size: null })
        .size + 2
    ))}
    <!-- $ -->
  </div>
  
  <div id="terrain-choropleth-container-italy" class="card" style="padding: 12px;">
    ${resize((width) => choroplethItaly(
      width,
      ({ properties }) => true
    ))}
  </div>

</div>

<!-- <div class="card">
  ${Inputs.table(choropleth_terrain_data, { layout: "auto" })}

</div> -->

${downloadTableButton(() => [...choropleth_terrain_data(terrain_data)].map(d => d.toJSON()))}

<!-- $ -->
