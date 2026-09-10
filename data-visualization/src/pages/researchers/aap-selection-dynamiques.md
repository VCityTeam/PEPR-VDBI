# Scientific disciplines

## Phase 1 scientific disciplines and research interests

```js
import {
  exclude,
  downloadTableButton,
  downloadSVGButton,
} from '/components/utilities.js'
import { quantized_cnu_color, cnu_dark_color_map } from '/components/color.js'
import { getGroupFromCNU } from '/components/cnu.js'
import { chordDiagram } from '/components/chord.js'
import * as page from './aap-disciplines.js'
import { sankeyDiagram, parallelSet } from '/components/sankey.js'
```

<div class="warning" label="Data visualization notice">
  <ul>
    <li>Researchers with multiple disciplines or keywords are counted once per
    item unless otherwise specified</li>
    <li>Missing researcher data is not visualized by default.</li>
    <li>Data has not yet been verified. Some visualizations may be incorrect.</li>
    <li>
      Bar charts use graded coloring based on a logarithmic scale
      (see CNU color legend).
    </li>
  </ul>
</div>

```js
const phase_1_data = await FileAttachment('/data/phase1-workbook.json').json()
console.debug('phase_1_data', phase_1_data)
```

```js
const auditioned_projects = phase_1_data.projects
  .filter((d) => d.auditioned)
  .map((d) => d.acronyme)
const financed_projects = phase_1_data.projects
  .filter((d) => d.financed)
  .map((d) => d.acronyme)

console.debug('auditioned_projects', auditioned_projects)
console.debug('financed_projects', financed_projects)
```

## Call for project dynamics

<div class="card">
  ${resize((width) => sankeyDiagram(project_aap_dynamics, {
      width: width,
      height: 300,
      nodeFill: () => 'rgba(1,1,1,0.9)',
      linkStroke: (d) =>
        page.aap_state_color_scale.unknown('lightgrey')(d.path.slice(-2).join('-')),
    })
  )}
  <!-- $ -->
</div>

### CNU categories by AAP status

<div class="card">
  ${resize((width) => sankeyDiagram(cnu_categories_by_aap_status_graph, {
      width: width,
      height: cnu_categories_by_aap_status_graph.nodes.length * 50,
      nodeFill: () => 'rgba(1,1,1,0.9)',
      linkStroke: (d) =>
        page.cnu_category_link_color_scale(d),
    })
  )}
  <!-- $ -->
</div>

<div class="card grid grid-cols-3">

  <div class="grid-rowspan-2">
    ${resize((width) => sankeyDiagram(
      cnu_letters_aap_dynamics,
      page.cnu_sankey_config(cnu_letters_aap_dynamics, width))
    )}
    <!-- $ -->
  </div>
  <div class="grid-rowspan-2">
    ${resize((width) => sankeyDiagram(
      cnu_health_aap_dynamics,
      page.cnu_sankey_config(cnu_health_aap_dynamics, width))
    )}
    <!-- $ -->
  </div>
  <div class="grid-rowspan-3">
    ${resize((width) => sankeyDiagram(
      cnu_sciences_aap_dynamics,
      page.cnu_sankey_config(cnu_sciences_aap_dynamics, width))
    )}
    <!-- $ -->
  </div>
  <div>
    ${resize((width) => sankeyDiagram(
      cnu_law_aap_dynamics,
      page.cnu_sankey_config(cnu_law_aap_dynamics, width))
    )}
    <!-- $ -->
  </div>
  <div>
    ${resize((width) => sankeyDiagram(
      cnu_multidisciplinary_aap_dynamics,
      page.cnu_sankey_config(cnu_multidisciplinary_aap_dynamics, width))
    )}
    <!-- $ -->
  </div>
</div>

```js
const project_aap_dynamics = page.projects_by_aap_status_graph(
  phase_1_data.projects,
)
```

```js
const researcher_by_aap_status = page.researcher_by_aap_status(
  phase_1_data.researchers,
  phase_1_data.projects,
)
```

```js
const cnu_by_aap_status = page.cnu_by_aap_status(researcher_by_aap_status)
```

```js
const cnu_aap_dynamics = page.cnu_by_aap_status_graph(cnu_by_aap_status)

const cnu_letters_aap_dynamics = page.cnu_category_by_aap_status_graph(
  cnu_by_aap_status,
  'Lettres et sciences humaines',
)
const cnu_health_aap_dynamics = page.cnu_category_by_aap_status_graph(
  cnu_by_aap_status,
  'Sections de santé',
)
const cnu_sciences_aap_dynamics = page.cnu_category_by_aap_status_graph(
  cnu_by_aap_status,
  'Sciences',
)
const cnu_law_aap_dynamics = page.cnu_category_by_aap_status_graph(
  cnu_by_aap_status,
  'Droit, économie et gestion',
)
const cnu_multidisciplinary_aap_dynamics =
  page.cnu_category_by_aap_status_graph(cnu_by_aap_status, 'Pluridisciplinaire')

const cnu_categories_by_aap_status_graph =
  page.cnu_categories_by_aap_status_graph(cnu_by_aap_status)
```

### CNU section as ERC discipline by AAP status

<div class="card">
  ${resize((width) => sankeyDiagram(
    custom_discipline_by_aap_status_graph,
    page.erc_sankey_config(custom_discipline_by_aap_status_graph, width),
  ))}
  <!-- $ -->
</div>

<div class="card grid grid-cols-3">
    ${resize((width) => sankeyDiagram(
      cnu_CNRS_SHS_category_by_aap_status_graph,
      page.cnrs_sankey_config(cnu_CNRS_SHS_category_by_aap_status_graph, width))
    )}
    <!-- $ -->
    ${resize((width) => sankeyDiagram(
      cnu_health_aap_dynamics,
      page.cnrs_sankey_config(cnu_health_aap_dynamics, width))
    )}
    <!-- $ -->
    ${resize((width) => sankeyDiagram(
      cnu_sciences_aap_dynamics,
      page.cnrs_sankey_config(cnu_sciences_aap_dynamics, width))
    )}
    <!-- $ -->
</div>

```js
const custom_discipline_by_aap_status_graph =
  page.custom_discipline_by_aap_status_graph(cnu_by_aap_status)

const cnu_CNRS_SHS_category_by_aap_status_graph =
  page.cnu_CNRS_SHS_category_by_aap_status_graph(cnu_by_aap_status)
```

### ERC by AAP status

<div class="card">
  ${resize((width) => sankeyDiagram(
    erc_aap_dynamics,
    page.erc_sankey_config(erc_aap_dynamics, width))
  )}
  <!-- $ -->
</div>

<div class="card grid grid-cols-3">
    ${resize((width) => sankeyDiagram(
      erc_discipline_LS_by_aap_status_graph,
      page.erc_disciplines_sankey_config(
        erc_discipline_LS_by_aap_status_graph,
        width
      )
    ))}
    <!-- $ -->
    ${resize((width) => sankeyDiagram(
      erc_discipline_PE_by_aap_status_graph,
      page.erc_disciplines_sankey_config(
        erc_discipline_PE_by_aap_status_graph,
        width
      )
    ))}
    <!-- $ -->
    ${resize((width) => sankeyDiagram(
      erc_discipline_SH_by_aap_status_graph,
      page.erc_disciplines_sankey_config(
        erc_discipline_SH_by_aap_status_graph,
        width
      )
    ))}
    <!-- $ -->
</div>

```js
const lab_by_aap_status = page.lab_by_aap_status(phase_1_data)
```

```js
display(lab_by_aap_status)
```

```js
const erc_by_aap_status = page.erc_by_aap_status(lab_by_aap_status)

const erc_aap_dynamics = page.erc_by_aap_status_graph(erc_by_aap_status)
```

```js
const erc_disciplines_by_aap_status =
  page.erc_disciplines_by_aap_status(lab_by_aap_status)

const erc_disciplines_aap_dynamics = page.erc_disciplines_by_aap_status_graph(
  erc_disciplines_by_aap_status,
)

const erc_discipline_LS_by_aap_status_graph =
  page.erc_discipline_category_by_aap_status_graph(
    erc_disciplines_by_aap_status,
    'LS',
  )
const erc_discipline_PE_by_aap_status_graph =
  page.erc_discipline_category_by_aap_status_graph(
    erc_disciplines_by_aap_status,
    'PE',
  )
const erc_discipline_SH_by_aap_status_graph =
  page.erc_discipline_category_by_aap_status_graph(
    erc_disciplines_by_aap_status,
    'SH',
  )
```

### HCERES by AAP status

<div class="card">
  ${resize((width) => sankeyDiagram(
    hceres_aap_dynamics,
    page.hceres_sankey_config(hceres_aap_dynamics, width))
  )}
  <!-- $ -->
</div>

<div class="card grid grid-cols-3">
    ${resize((width) => sankeyDiagram(
      hceres_discipline_SHS_by_aap_status_graph,
      page.hceres_disciplines_sankey_config(
        hceres_discipline_SHS_by_aap_status_graph,
        width
      )
    ))}
    <!-- $ -->
    ${resize((width) => sankeyDiagram(
      hceres_discipline_ST_by_aap_status_graph,
      page.hceres_disciplines_sankey_config(
        hceres_discipline_ST_by_aap_status_graph,
        width
      )
    ))}
    <!-- $ -->
    ${resize((width) => sankeyDiagram(
      hceres_discipline_SVE_by_aap_status_graph,
      page.hceres_disciplines_sankey_config(
        hceres_discipline_SVE_by_aap_status_graph,
        width
      )
    ))}
    <!-- $ -->
</div>

```js
const hceres_by_aap_status = page.hceres_by_aap_status(lab_by_aap_status)

const hceres_aap_dynamics =
  page.hceres_by_aap_status_graph(hceres_by_aap_status)
```

```js
const hceres_disciplines_by_aap_status =
  page.hceres_disciplines_by_aap_status(lab_by_aap_status)

const hceres_disciplines_aap_dynamics =
  page.hceres_disciplines_by_aap_status_graph(hceres_disciplines_by_aap_status)

const hceres_discipline_SHS_by_aap_status_graph =
  page.hceres_discipline_category_by_aap_status_graph(
    hceres_disciplines_by_aap_status,
    'SHS',
  )
const hceres_discipline_ST_by_aap_status_graph =
  page.hceres_discipline_category_by_aap_status_graph(
    hceres_disciplines_by_aap_status,
    'ST',
  )
const hceres_discipline_SVE_by_aap_status_graph =
  page.hceres_discipline_category_by_aap_status_graph(
    hceres_disciplines_by_aap_status,
    'SVE',
  )
```

### Keyword by AAP status

<div class="card">
  ${resize((width) => sankeyDiagram(
    keyword_aap_dynamics,
    page.keyword_sankey_config(keyword_aap_dynamics, width))
  )}
  <!-- $ -->
</div>

```js
const keyword_by_aap_status = page.keyword_by_aap_status(
  researcher_by_aap_status,
)

const keyword_aap_dynamics = page.keyword_by_aap_status_graph(
  keyword_by_aap_status,
)
```

## Data quality metrics

<div class="grid grid-cols-4">
  <div class="card">
    <h2>Unspecified total researcher CNU data</h2>
    <span class="big">${(missing_cnu_value * 100).toPrecision(3)}%</span>
  </div>
  <div class="card">
    <h2>Unspecified total ERC Discipline data</h2>
    <span class="big">${(missing_discipline_erc_value * 100).toPrecision(3)}%</span>
  </div>
  <div class="card">
    <h2>Unspecified financed researcher CNU data</h2>
    <span class="big">${(missing_financed_cnu_value * 100).toPrecision(3)}%</span>
  </div>
  <div class="card">
    <h2>Unspecified financed ERC Discipline data</h2>
    <span class="big">${(missing_financed_discipline_erc_value * 100).toPrecision(3)}%</span>
  </div>
</div>

```js
// missing count //
const missing_discipline_erc_count = d3.rollup(
  phase_1_data.researchers,
  (D) => D.length,
  (d) => (exclude(d.discipline_erc) ? 'found_erc' : 'missing_erc'),
)

const missing_cnu_count = d3.rollup(
  phase_1_data.researchers,
  (D) => D.length,
  (d) => (exclude(d.cnu) ? 'found_cnu' : 'missing_cnu'),
)

const missing_financed_discipline_erc_count = d3.rollup(
  phase_1_data.researchers.filter((d) =>
    page.isFinanced(d.project, financed_projects),
  ),
  (D) => D.length,
  (d) => (exclude(d.discipline_erc) ? 'found_erc' : 'missing_erc'),
)

const missing_financed_cnu_count = d3.rollup(
  phase_1_data.researchers.filter((d) =>
    page.isFinanced(d.project, financed_projects),
  ),
  (D) => D.length,
  (d) => (exclude(d.cnu) ? 'found_cnu' : 'missing_cnu'),
)

// TODO: this is way simpler

// const cnu_categorization = d3.rollup(
//   phase_1_data.researchers,
//   (D) => D.length,
//   (d) => Boolean(getGroupFromCNU(d.cnu))
// )

// const cnu_categorization_value = cnu_categorization.get(false) / phase_1_data.researchers.length

const missing_cnu_value =
  (missing_cnu_count.get('missing_cnu') || 0) /
  ((missing_cnu_count.get('missing_cnu') || 0) +
    (missing_cnu_count.get('found_cnu') || 0))

const missing_discipline_erc_value =
  (missing_discipline_erc_count.get('missing_erc') || 0) /
  ((missing_discipline_erc_count.get('missing_erc') || 0) +
    (missing_discipline_erc_count.get('found_erc') || 0))

const missing_financed_cnu_value =
  (missing_financed_cnu_count.get('missing_cnu') || 0) /
  ((missing_financed_cnu_count.get('missing_cnu') || 0) +
    (missing_financed_cnu_count.get('found_cnu') || 0))

const missing_financed_discipline_erc_value =
  (missing_financed_discipline_erc_count.get('missing_erc') || 0) /
  ((missing_financed_discipline_erc_count.get('missing_erc') || 0) +
    (missing_financed_discipline_erc_count.get('found_erc') || 0))
```
