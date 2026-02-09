# Scientific disciplines

## Phase 1 scientific disciplines and research interests

```js
import {
  exclude,
  downloadTableButton,
  downloadSVGButton,
} from '/components/utilities.js'
import { extractPhase1Workbook } from '/components/phase1-workbook.js'
import { getCategoryFromCNU } from '/components/color.js'
import { chordDiagram } from '/components/chord.js'
import * as page from './phase1-disciplines.js'
import { sankeyDiagram, parallelSet } from '/components/sankey.js'
```

<div class="warning" label="Data visualization notice">
  <ul>
    <li>Researchers with multiple disciplines are counted once per discipline.</li>
    <li>Missing researcher data is not visualized by default.</li>
    <li>Data has not yet been verified. Some visualizations may be incorrect.</li>
    <li>
      Bar charts use graded coloring based on a logarithmic scale
      (see CNU color legend).
    </li>
  </ul>
</div>

```js
const workbook1 = await FileAttachment(
  '/data/private/251127 VDBI Base Connaissance vdef jyt.xlsx',
).xlsx()

const phase_1_data = extractPhase1Workbook(workbook1, false)
console.debug('phase_1_data', phase_1_data)
```

```js
const selected_project = view(
  Inputs.select(discipline_data_by_project.keys(), {
    label: 'Select Project',
    value: 'Financed Projects',
  }),
)
```

## ${selected_project} Disciplines by CNU and ERC

<div class="grid grid-cols-2">
  <div class="card grid-colspan-1 grid-rowspan-2">
    <h2>Researcher CNU sections</h2>
    <div id="cnu-legend">
      <h3>CNU group legend</h3>
      ${resize((width) => page.cnu_plot_legend(width))}
      ${downloadSVGButton("#cnu-legend svg")}<!-- $ -->
    </div>
    <div>${cnu_plot_sort_input}</div>
    <div id="cnu-container">
      ${resize((width) => page.cnu_plot(selected_project_data, width, cnu_plot_sort))}
      <!-- $ -->
      ${downloadTableButton(() => selected_project_data.cnu_count)}
      <!-- $ -->
      ${downloadSVGButton("#cnu-container svg")}
      <!-- $ -->
    </div>
  </div>
  <div id="cnu-group-container" class="card">
    <h2>Researcher CNU groups</h2>
    <!-- <h2>Chercheurs PEPR VDBI par groupe CNU</h2> -->
    ${resize((width) => page.cnu_group_donut(selected_project_data, width))}
    <!-- $ -->
    <h3>*Groups are defined by the CNU</h3>
    <!-- <h3>*Les regroupements des sections est définis par le CNU</h3> -->
    ${downloadTableButton(() => selected_project_data.cnu_count_by_category)}
    <!-- $ -->
    ${downloadSVGButton("#cnu-group-container svg:nth-of-type(1)")}
    <!-- $ -->
  </div>
  <div id="erc-container" class="card">
    <h2>Researcher ERC discipline</h2>
    ${resize((width) => page.erc_donut(selected_project_data, width))}
    <!-- $ -->
    ${downloadTableButton(() => selected_project_data.discipline_erc_count)}
    <!-- $ -->
    ${downloadSVGButton("#erc-container svg:nth-of-type(1)")}
    <!-- $ -->
  </div>
</div>

### Percent Summary

<div class="grid grid-cols-2">
  <div class="card grid-colspan-1">${overview_table_erc}</div>
  <div class="card grid-colspan-1">${overview_table_cnu}</div>
</div>

```js
// Table //
const overview_data = []

discipline_data_by_project
  .entries()
  .forEach(([key, value]) =>
    overview_data.push(page.formatDomainPercents(key, value)),
  )

console.debug('overview_data', overview_data)

const overview_table_erc = Inputs.table(
  overview_data,
  page.overview_table_erc_config,
)

const overview_table_cnu = Inputs.table(
  overview_data,
  page.overview_table_cnu_config,
)
```

## Subjects, themes, and research interests

```js
display('phase_1_data')
display(phase_1_data)
display('selected_project_data')
display(selected_project_data)
```

<div class="grid grid-cols-3">
  <div id="theme-container" class="card grid-rowspan-2">
    <h2>Researcher subjects, themes, and research interests</h2>
    <div>${theme_plot_search_input}</div>
    <div>${theme_plot_sort_input}</div>
    <div style="max-height: 2400px; overflow: auto;">
      ${resize((width) => page.theme_plot(theme_plot_search_results, width, theme_plot_sort))}
      <!-- $ -->
    </div>
    ${downloadTableButton(() => selected_project_data.theme_count)}
    <!-- $ -->
    ${downloadSVGButton("#theme-container svg")}
    <!-- $ -->
  </div>
  <div id="theme-chord-container" class="card grid-colspan-2">
    ${resize((width) =>
      chordDiagram(
        selected_project_data.theme_project_matrix,
        selected_project_data.theme_projects,
        d3.scaleOrdinal(selected_project_data.theme_projects, d3.schemeCategory10).range(),
        { width: width, height: width, margin: 100 }
      )
    )}<!-- $ -->
    ${downloadTableButton(() => selected_project_data.theme_count)}
    <!-- $ -->
    ${downloadSVGButton("#theme-chord-container svg")}
    <!-- $ -->
  </div>
  <div id="cnu-chord-container" class="card grid-colspan-2">
    ${resize((width) =>
      chordDiagram(
        selected_project_data.cnu_project_matrix,
        selected_project_data.cnu_projects,
        d3.scaleOrdinal(selected_project_data.cnu_projects, d3.schemeCategory10).range(),
        { width: width, height: width, margin: 100 }
      )
    )}<!-- $ -->
    ${downloadTableButton(() => selected_project_data.theme_count)}
    <!-- $ -->
    ${downloadSVGButton("#cnu-chord-container svg")}
    <!-- $ -->
  </div>
</div>

```js
const selected_project_data = discipline_data_by_project.get(selected_project)
console.debug('selected_project_data', selected_project_data)
```

```js
const cnu_plot_sort_input = Inputs.select(
  new Map([
    ['CNU', 'y'],
    ['Occurrences', '-x'],
  ]),
  {
    label: 'Sort by',
  },
)

const cnu_plot_sort = Generators.input(cnu_plot_sort_input)

const theme_plot_sort_input = Inputs.select(
  new Map([
    ['Theme', 'y'],
    ['Occurrences', '-x'],
  ]),
  {
    label: 'Sort by',
    value: '-x',
  },
)

const theme_plot_sort = Generators.input(theme_plot_sort_input)
```

```js
const theme_plot_search_input = Inputs.search(
  selected_project_data.theme_count,
  {
    placeholder: 'Search themes...',
  },
)

const theme_plot_search_results = Generators.input(theme_plot_search_input)
```

```js
const discipline_data_by_project = page.generateDisciplineDataByProject(
  phase_1_data,
  auditioned_projects,
  financed_projects,
)
console.debug('discipline_data_by_project', discipline_data_by_project)
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

<div class="grid grid-cols-3">

  <div class="card grid-rowspan-2">
    ${resize((width) => sankeyDiagram(
      cnu_letters_aap_dynamics,
      page.cnu_sankey_config(cnu_letters_aap_dynamics, width, total_cnu_count))
    )}
    <!-- $ -->
  </div>
  <div class="card grid-rowspan-2">
    ${resize((width) => sankeyDiagram(
      cnu_health_aap_dynamics,
      page.cnu_sankey_config(cnu_health_aap_dynamics, width, total_cnu_count))
    )}
    <!-- $ -->
  </div>
  <div class="card grid-rowspan-3">
    ${resize((width) => sankeyDiagram(
      cnu_sciences_aap_dynamics,
      page.cnu_sankey_config(cnu_sciences_aap_dynamics, width, total_cnu_count))
    )}
    <!-- $ -->
  </div>
  <div class="card">
    ${resize((width) => sankeyDiagram(
      cnu_law_aap_dynamics,
      page.cnu_sankey_config(cnu_law_aap_dynamics, width, total_cnu_count))
    )}
    <!-- $ -->
  </div>
  <div class="card">
    ${resize((width) => sankeyDiagram(
      cnu_multidisciplinary_aap_dynamics,
      page.cnu_sankey_config(cnu_multidisciplinary_aap_dynamics, width, total_cnu_count))
    )}
    <!-- $ -->
  </div>
  <div class="card grid-rowspan-2">
    ${resize((width) => sankeyDiagram(
      cnu_CNRS_SHS_category_by_aap_status_graph,
      page.cnu_sankey_config(cnu_CNRS_SHS_category_by_aap_status_graph, width, total_cnu_count))
    )}
    <!-- $ -->
  </div>
</div>

```js
const total_cnu_count = Math.max(
  ...d3
    .rollups(
      phase_1_data.researchers,
      (d) => d.length,
      (d) => d.cnu,
    )
    .map((d) => d[1]),
)

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

<div class="grid grid-cols-3">
  <div class="card">
    ${resize((width) => sankeyDiagram(
      erc_discipline_LS_by_aap_status_graph,
      page.erc_disciplines_sankey_config(
        erc_discipline_LS_by_aap_status_graph,
        width
      )
    ))}
    <!-- $ -->
  </div>
  <div class="card">
    ${resize((width) => sankeyDiagram(
      erc_discipline_PE_by_aap_status_graph,
      page.erc_disciplines_sankey_config(
        erc_discipline_PE_by_aap_status_graph,
        width
      )
    ))}
    <!-- $ -->
  </div>
  <div class="card">
    ${resize((width) => sankeyDiagram(
      erc_discipline_SH_by_aap_status_graph,
      page.erc_disciplines_sankey_config(
        erc_discipline_SH_by_aap_status_graph,
        width
      )
    ))}
    <!-- $ -->
  </div>
</div>

```js
const lab_by_aap_status = page.lab_by_aap_status(
  phase_1_data.laboratories,
  phase_1_data.projects,
  phase_1_data.laboratories_by_disciplines_erc,
  phase_1_data.laboratories_by_disciplines_hceres,
)
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

<div class="grid grid-cols-3">
  <div class="card">
    ${resize((width) => sankeyDiagram(
      hceres_discipline_SHS_by_aap_status_graph,
      page.hceres_disciplines_sankey_config(
        hceres_discipline_SHS_by_aap_status_graph,
        width
      )
    ))}
    <!-- $ -->
  </div>
  <div class="card">
    ${resize((width) => sankeyDiagram(
      hceres_discipline_ST_by_aap_status_graph,
      page.hceres_disciplines_sankey_config(
        hceres_discipline_ST_by_aap_status_graph,
        width
      )
    ))}
    <!-- $ -->
  </div>
  <div class="card">
    ${resize((width) => sankeyDiagram(
      hceres_discipline_SVE_by_aap_status_graph,
      page.hceres_disciplines_sankey_config(
        hceres_discipline_SVE_by_aap_status_graph,
        width
      )
    ))}
    <!-- $ -->
  </div>
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

### Theme by AAP status

<div class="card">
  ${resize((width) => sankeyDiagram(
    theme_aap_dynamics,
    page.theme_sankey_config(theme_aap_dynamics, width))
  )}
  <!-- $ -->
</div>

```js
const theme_by_aap_status = page.theme_by_aap_status(researcher_by_aap_status)

const theme_aap_dynamics = page.theme_by_aap_status_graph(theme_by_aap_status)
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
//   (d) => Boolean(getCategoryFromCNU(d.cnu))
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
