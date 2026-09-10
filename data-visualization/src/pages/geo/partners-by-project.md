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

```sql id=projects_by_partner
SELECT
  projects_by_partner.*,
  postal_code,
from projects_by_partner
join aap_partners
  on projects_by_partner.partner_id = aap_partners.id
    and projects_by_partner.type = aap_partners.type
```

```sql id=projects
select distinct
  project,
  project_type
from projects_by_partner
where project is not null
  and financed
order by project
```

<div class="warning" label="Data visualization notice">
  Data visualizations are unverified and errors may exist.
  Consider these data visualizations as estimations and not a "ground truth".
</div>

<div class="card">

```js
const project_list = [...projects].map((d) => d.project)

const project_types = new Set([...projects].map((d) => d.project_type))

const partner_types = new Set([...projects_by_partner].map((d) => d.type))

const settings = view(
  Inputs.form(
    {
      selected_partner_types: Inputs.checkbox(partner_types, {
        label: 'Filter by partner type',
        value: [[...partner_types][0]],
      }),
      selected_project_types: Inputs.checkbox(project_types, {
        label: 'Filter by project type',
        value: project_types,
      }),
      // selected_project: Inputs.select(['All', ...project_list], {
      //   label: 'Filter by project',
      //   value: 'All',
      // }),
      show_tips: Inputs.toggle({ label: 'Show tips', value: true }),
      tip_cuttoff: Inputs.range([0, 100], {
        label: 'Min partner count to show tip',
        step: 1,
        value: 10,
      }),
      // flatten_choropleth: Inputs.toggle({ label: 'Flatten choropleth' }),
      group_partnerships: Inputs.toggle({
        label: 'Group by distinct partners (as opposed to n° of partnerships)',
        value: true,
      }),
      group_idf: Inputs.toggle({ label: 'Group Île-de-France' }),
    },
    { template: formTemplate() },
  ),
)
```

</div>

<div class="card grid grid-cols-3">
  <div
    id="choropleth-container-france"
    class="grid-colspan-2 grid-rowspan-2"
  >
    ${resize((width) => francePartnerMap(width))}
    <!-- $ -->
  </div>
  <div id="choropleth-container-idf">
    ${resize((width) => idfPartnerMap(width))}
    <!-- $ -->
  </div>
</div>

<div class="card">

```js
display(
  Inputs.form(
    [
      downloadSVGButton(
        '#choropleth-container-france svg:nth-of-type(2)',
        'Download French choropleth partner map',
        `${settings.selected_project}_france_partner_choropleth.svg`,
      ),
      downloadSVGButton(
        '#choropleth-container-france svg:nth-of-type(1)',
        'Download legend',
        `${settings.selected_project}_france_partner_choropleth_legend.svg`,
      ),
      downloadSVGButton(
        '#choropleth-container-idf svg:nth-of-type(2)',
        'Download Île-de-France choropleth partner map',
        `${settings.selected_project}_idf_partner_choropleth.svg`,
      ),
      downloadSVGButton(
        '#choropleth-container-idf svg:nth-of-type(1)',
        'Download legend',
        `${settings.selected_project}_idf_partner_choropleth_legend.svg`,
      ),
    ],
    { template: formTemplate(4) },
  ),
)
```

</div>

<div class="card">
  ${Inputs.table(filtered_partners_by_project, { layout: "auto" })}
  <!-- $ -->
  </br>
  ${downloadTableButton(
    () => filtered_partners_by_project,
    { filename: `${settings.selected_project}\_partenaires.csv` })}
  <!-- $ -->
</div>

```js
const filtered_partners_by_project = [...projects_by_partner]
  .map((d) => d.toJSON())
  .filter(
    (d) =>
      // (settings.selected_project == 'All' ||
      //   d.project == settings.selected_project) &&
      settings.selected_project_types.includes(d.project_type) &&
      settings.selected_partner_types.includes(d.type),
  )

const grouped_partners_by_project = [
  ...d3
    .rollup(
      filtered_partners_by_project,
      (D) => ({
        ...D[0],
        projects: D.map((d) => ({
          project: d.project,
          project_id: d.project_id,
        })),
      }),
      (d) => `${d.partner_id};${d.type}`,
    )
    .values(),
]
```

```js
// left is all false
const anchor_map = d3.group(
  [...grouped_partners_by_project],
  (d) => ['13', '75'].includes(d.postal_code?.slice(0, 2)), // right
  (d) => ['69'].includes(d.postal_code?.slice(0, 2)), // bottom-right
)

const caption = `- ${
  settings.group_partnerships ? 'Partenaires' : 'Liens partenariales'
} et parties prenantes ${settings.selected_partner_types
  .join(', ')
  .toLowerCase()} par department`

const francePartnerMap = (width) => {
  const map = projections.choroplethFrance(
    geo.choroplethCountByPostalCode(
      grouped_partners_by_project,
      settings.group_partnerships
        ? (a, v) => a + 1
        : (a, v) => a + v.projects.length,
    ),
    settings.show_tips
      ? [
          geo.francePartnerMapTips(
            anchor_map.get(false).get(false),
            settings.tip_cuttoff,
            settings.group_partnerships,
          ),
          geo.francePartnerMapTips(
            anchor_map.get(true).get(false),
            settings.tip_cuttoff,
            settings.group_partnerships,
            {
              anchor: 'right',
            },
          ),
          geo.francePartnerMapTips(
            anchor_map.get(false).get(true),
            settings.tip_cuttoff,
            settings.group_partnerships,
            {
              anchor: 'bottom-left',
            },
          ),
        ]
      : [],
    {
      width,
      height: width * 0.9,
      caption: `${caption}, France`,
    },
  )

  return html`${map.legend('opacity', projections.choropleth_color_config())}
  ${map}`
}

const idfPartnerMap = (width) => {
  const map = projections.choroplethIdf(
    geo.choroplethCountByPostalCode(
      grouped_partners_by_project,
      settings.group_partnerships
        ? (a, v) => a + 1
        : (a, v) => a + v.projects.length,
    ),
    settings.show_tips
      ? [
          geo.idfPartnerMapTips(
            grouped_partners_by_project,
            settings.tip_cuttoff,
            settings.group_partnerships,
          ),
        ]
      : [],
    {
      width,
      height: width * 0.8,
      caption: `${caption}, Île-de-France`,
    },
  )
  return html`${map.legend('opacity', projections.choropleth_color_config())}
  ${map}`
}
```
