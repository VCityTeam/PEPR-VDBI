# Scientific disciplines

## Phase 1 scientific disciplines and research interests

```js
import {
  countEntities,
  cropText,
  exclude,
  downloadTableButton,
  downloadSVGButton,
  sparkbar,
} from '/components/utilities.js'
import { extractPhase1Workbook } from '/components/phase1-workbook.js'
import { donutChart } from '/components/pie-chart.js'
import { cnu_category_map } from '/components/cnu.js'
import {
  getCategoryFromCNU,
  colorCNU,
  vdbi_color_scheme,
} from '/components/color.js'
import { chordDiagram } from '/components/chord.js'
import {
  cnu_plot,
  cnu_plot_legend,
  cnu_group_donut,
  erc_donut,
  theme_plot,
  generateDisciplineDataByProject,
  formatDomainPercents,
  overview_data,
  overview_table_erc_config,
  overview_table_cnu_config,
  isFinanced,
} from './phase1-disciplines.js'
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
const selected_project = view(
  Inputs.select(discipline_data_by_project.keys(), {
    label: 'Select Project',
    value: 'Financed Projects',
  }),
)
```

```js
const selected_project_data = discipline_data_by_project.get(selected_project)
console.debug('selected_project_data', selected_project_data)
```

## ${selected_project} Disciplines by CNU and ERC

<div class="grid grid-cols-2">
  <div class="card grid-colspan-1 grid-rowspan-2">
    <h2>Researcher CNU sections</h2>
    <div id="cnu-legend">
      <h3>CNU group legend</h3>
      ${resize((width) => cnu_plot_legend(width))}
      ${downloadSVGButton("#cnu-legend svg")}<!-- $ -->
    </div>
    <div>${cnu_plot_sort_input}</div>
    <div id="cnu-container">
      ${resize((width) => cnu_plot(selected_project_data, width, cnu_plot_sort))}
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
    ${resize((width) => cnu_group_donut(selected_project_data, width))}
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
    ${resize((width) => erc_donut(selected_project_data, width))}
    <!-- $ -->
    ${downloadTableButton(() => selected_project_data.discipline_erc_count)}
    <!-- $ -->
    ${downloadSVGButton("#erc-container svg:nth-of-type(1)")}
    <!-- $ -->
  </div>
</div>
<div class="grid grid-cols-3">
  <div id="theme-container" class="card">
    <h2>Researcher subjects, themes, and research interests</h2>
    <div>${theme_plot_search_input}</div>
    <div>${theme_plot_sort_input}</div>
    <div style="max-height: 1100px; overflow: auto;">
      ${resize((width) => theme_plot(theme_plot_search_results, width, theme_plot_sort))}
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
        selected_project_data.projects,
        d3.scaleOrdinal(selected_project_data.projects, d3.schemeCategory10).range(),
        { width: width, height: width, margin: 100 }
      )
    )}<!-- $ -->
    ${downloadTableButton(() => selected_project_data.theme_count)}
    <!-- $ -->
    ${downloadSVGButton("#theme-chord-container svg")}
    <!-- $ -->
  </div>
</div>

```js
const workbook1 = await FileAttachment(
  '/data/private/251127 VDBI Base Connaissance vdef jyt.xlsx',
).xlsx()

const phase_1_data = extractPhase1Workbook(workbook1, false)
console.debug('phase_1_data', phase_1_data)
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
const discipline_data_by_project = generateDisciplineDataByProject(
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

### Percent Summary

```js
// Table //
const overview_data = []

discipline_data_by_project
  .entries()
  .forEach(([key, value]) =>
    overview_data.push(formatDomainPercents(key, value)),
  )

console.debug('overview_data', overview_data)

const overview_table_erc = Inputs.table(
  overview_data,
  overview_table_erc_config,
)

const overview_table_cnu = Inputs.table(
  overview_data,
  overview_table_cnu_config,
)
```

<div class="grid grid-cols-2">
  <div class="card grid-colspan-1">${overview_table_erc}</div>
  <div class="card grid-colspan-1">${overview_table_cnu}</div>
</div>

## Data quality metrics

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
    isFinanced(d.project, financed_projects),
  ),
  (D) => D.length,
  (d) => (exclude(d.discipline_erc) ? 'found_erc' : 'missing_erc'),
)

const missing_financed_cnu_count = d3.rollup(
  phase_1_data.researchers.filter((d) =>
    isFinanced(d.project, financed_projects),
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
