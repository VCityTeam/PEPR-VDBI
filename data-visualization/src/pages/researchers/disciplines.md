# Researcher disciplines

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

<!-- DATA IMPORT -->

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

<div class="card">

```js
const selected_project = view(
  Inputs.select(discipline_data_by_project.keys(), {
    label: 'Select Project',
    value: 'Financed Projects',
  }),
)
```

</div>

## ${selected_project} Keywords

<div class="card">
  <h2>CNU group color legend</h2>
  ${Plot.legend({
    color: {
      domain: cnu_dark_color_map.keys(),
      range: cnu_dark_color_map.values(),
      type: 'ordinal',
    },
  })}
  <!-- $ -->
</div>

<div class="grid grid-cols-2">
  <div class="card grid-rowspan-2">
    <h2>Researcher CNU sections</h2>
    <div>${cnu_plot_sort_input}</div>
    <div id="cnu-container">
      ${resize((width) => page.cnu_plot(
        selected_project_data.cnu_count,
        {
          width: width,
          sort: cnu_plot_sort,
        }
      ))}
      <!-- $ -->
      ${downloadTableButton(() => selected_project_data.cnu_count)}
      <!-- $ -->
      ${downloadSVGButton("#cnu-container svg")}
      <!-- $ -->
    </div>
  </div>
  <div id="cnu-keyword-plot-container" class="card grid-rowspan-2">
    <h2>Researcher CNU by keywords</h2>
    ${resize((width, height) =>
      html`<div style="
          margin-bottom: 30px;
          max-height: ${height - 150}px;
          overflow: auto;">
        ${page.keyword_plot(
          keyword_plot_search_results,
          width,
          keyword_plot_sort,
          getKeywordColor,
        )}
        <!-- $ -->
        </div>
        ${downloadTableButton(() => selected_project_data.keyword_count)}
        <!-- $ -->
        ${downloadSVGButton("#cnu-keyword-plot-container svg")}
        <!-- $ -->
      </div>`
    )}
  </div>
  <div id="cnu-keyword-plot-container" class="card grid-rowspan-2">
    <h2>Researcher CNU by unique keywords</h2>
    ${unique_keyword_plot_search_input}
    ${resize((width, height) =>
      html`<div style="
          margin-bottom: 30px;
          max-height: ${height - 150}px;
          overflow: auto;">
        ${page.keyword_plot(
          unique_keyword_plot_search_results,
          width,
          keyword_plot_sort,
          getKeywordColor,
        )}
        <!-- $ -->
        </div>
        ${downloadTableButton(() => unique_keyword_plot_search_results)}
        <!-- $ -->
        ${downloadSVGButton("#cnu-keyword-plot-container svg")}
        <!-- $ -->
      </div>`
    )}
  </div>
  <div id="keyword-plot-container" class="card grid-rowspan-2">
    <h2>Researcher keywords by CNU</h2>
    ${keyword_plot_search_input}
    <!-- $ -->
    ${keyword_plot_sort_input}
    <!-- $ -->
    ${resize((width, height) =>
      html`<div style="
          margin-bottom: 30px;
          max-height: ${height - 150}px;
          overflow: auto;">
        ${Plot.plot({
          width: width,
          height: keyword_plot_search_results.length * 10,
          x: {
            label: 'Occurences',
            grid: true,
            axis: 'both',
            reverse: true,
            nice: true,
          },
          y: {
            // label: 'Researcher keywords',
            // tickRotate: -20,
            axis: 'right',
            lineWidth: 20,
            textOverflow: 'ellipsis',
          },
          // marginTop: 50,
          marginBottom: 10,
          marginRight: 200,
          color: {
            legend: true,
            domain: cnu_dark_color_map.keys(),
            range: cnu_dark_color_map.values(),
            type: 'ordinal',
          },
          marks: [
            Plot.barX(keyword_plot_search_results, {
              y: (d) => d.keyword,
              x: 1,
              fill: (d) =>
                cnu_dark_color_map.get(getGroupFromCNU(d.cnu)) ||
                'grey',
              sort: { y: keyword_plot_sort },
              tip: {
                lineWidth: 25,
                textOverflow: 'ellipsis-end',
                format: {
                  fill: false,
                  cnu: true,
                },
              },
            }),
          ],
        })}
        <!-- $ -->
        </div>
        ${downloadTableButton(() => selected_project_data.keyword_count)}
        <!-- $ -->
        ${downloadSVGButton("#keyword-plot-container svg")}
        <!-- $ -->
      </div>`
    )}
  </div>
  <div class="card grid-rowspan-2">
    <h2>Researcher keywords by CNU Lettres et sciences humaines</h2>
    ${resize((width, height) =>
      html`<div style="
          margin-bottom: 30px;
          max-height: ${height - 150}px;
          overflow: auto;">
        ${Plot.plot({
          width: width,
          height: keyword_plot_search_results
            .filter((d) =>
              getGroupFromCNU(d.cnu) === 'Lettres et sciences humaines')
            .length * 10,
          x: {
            label: 'Occurences',
            grid: true,
            axis: 'both',
            reverse: true,
            nice: true,
          },
          y: {
            // label: 'Researcher keywords',
            // tickRotate: -20,
            axis: 'right',
            lineWidth: 20,
            textOverflow: 'ellipsis',
          },
          marginTop: 50,
          marginBottom: 10,
          marginRight: 200,
          color: { legend: true },
          marks: [
            Plot.barX(keyword_plot_search_results
                .filter((d) =>
                  getGroupFromCNU(d.cnu) === 'Lettres et sciences humaines'), {
              y: (d) => d.keyword,
              x: 1,
              fill: 'cnu',
              sort: { y: keyword_plot_sort },
              tip: {
                lineWidth: 25,
                textOverflow: 'ellipsis-end',
                format: {
                  fill: false,
                  cnu: true,
                },
              },
            }),
          ],
        })}
        <!-- $ -->
        </div>
      </div>`
    )}
  </div>
  <div class="card grid-rowspan-2">
    <h2>Researcher keywords by CNU Sections de santé</h2>
    ${resize((width, height) =>
      html`<div style="
          margin-bottom: 30px;
          max-height: ${height - 150}px;
          overflow: auto;">
        ${Plot.plot({
          width: width,
          height: keyword_plot_search_results
            .filter((d) =>
              getGroupFromCNU(d.cnu) === 'Sections de santé')
            .length * 10,
          x: {
            label: 'Occurences',
            grid: true,
            axis: 'both',
            reverse: true,
            nice: true,
          },
          y: {
            // label: 'Researcher keywords',
            // tickRotate: -20,
            axis: 'right',
            lineWidth: 20,
            textOverflow: 'ellipsis',
          },
          marginTop: 50,
          marginBottom: 10,
          marginRight: 200,
          color: { legend: true },
          marks: [
            Plot.barX(keyword_plot_search_results
                .filter((d) =>
                  getGroupFromCNU(d.cnu) === 'Sections de santé'), {
              y: (d) => d.keyword,
              x: 1,
              fill: 'cnu',
              sort: { y: keyword_plot_sort },
              tip: {
                lineWidth: 25,
                textOverflow: 'ellipsis-end',
                format: {
                  fill: false,
                  cnu: true,
                },
              },
            }),
          ],
        })}
        <!-- $ -->
        </div>
      </div>`
    )}
  </div>
  <div class="card grid-rowspan-2">
    <h2>Researcher keywords by CNU Sciences</h2>
    ${resize((width, height) =>
      html`<div style="
          margin-bottom: 30px;
          max-height: ${height - 150}px;
          overflow: auto;">
        ${Plot.plot({
          width: width,
          height: keyword_plot_search_results
            .filter((d) =>
              getGroupFromCNU(d.cnu) === 'Sciences')
            .length * 10,
          x: {
            label: 'Occurences',
            grid: true,
            axis: 'both',
            reverse: true,
            nice: true,
          },
          y: {
            // label: 'Researcher keywords',
            // tickRotate: -20,
            axis: 'right',
            lineWidth: 20,
            textOverflow: 'ellipsis',
          },
          marginTop: 50,
          marginBottom: 10,
          marginRight: 200,
          color: { legend: true },
          marks: [
            Plot.barX(keyword_plot_search_results
                .filter((d) =>
                  getGroupFromCNU(d.cnu) === 'Sciences'), {
              y: (d) => d.keyword,
              x: 1,
              fill: 'cnu',
              sort: { y: keyword_plot_sort },
              tip: {
                lineWidth: 25,
                textOverflow: 'ellipsis-end',
                format: {
                  fill: false,
                  cnu: true,
                },
              },
            }),
          ],
        })}
        <!-- $ -->
        </div>
      </div>`
    )}
  </div>
  <div class="card">
    <h2>Researcher keywords by CNU Droit, économie et gestion</h2>
    ${resize((width, height) =>
      html`<div style="
          margin-bottom: 30px;
          max-height: ${height}px;
          overflow: auto;">
        ${Plot.plot({
          width: width,
          height: keyword_plot_search_results
            .filter((d) =>
              getGroupFromCNU(d.cnu) === 'Droit, économie et gestion')
            .length * 15,
          x: {
            label: 'Occurences',
            grid: true,
            axis: 'both',
            reverse: true,
            nice: true,
          },
          y: {
            // label: 'Researcher keywords',
            // tickRotate: -20,
            axis: 'right',
            lineWidth: 20,
            textOverflow: 'ellipsis',
          },
          marginTop: 50,
          marginBottom: 10,
          marginRight: 200,
          color: { legend: true },
          marks: [
            Plot.barX(keyword_plot_search_results
                .filter((d) =>
                  getGroupFromCNU(d.cnu) === 'Droit, économie et gestion'), {
              y: (d) => d.keyword,
              x: 1,
              fill: 'cnu',
              sort: { y: keyword_plot_sort },
              tip: {
                lineWidth: 25,
                textOverflow: 'ellipsis-end',
                format: {
                  fill: false,
                  cnu: true,
                },
              },
            }),
          ],
        })}
        <!-- $ -->
        </div>
      </div>`
    )}
  </div>
  <div class="card">
    <h2>Researcher keywords by CNU Pluridisciplinaire</h2>
    ${resize((width, height) =>
      html`<div style="
          margin-bottom: 30px;
          max-height: ${height - 150}px;
          overflow: auto;">
        ${Plot.plot({
          width: width,
          height: keyword_plot_search_results
            .filter((d) =>
              getGroupFromCNU(d.cnu) === 'Pluridisciplinaire')
            .length * 50,
          x: {
            label: 'Occurences',
            grid: true,
            axis: 'both',
            reverse: true,
            nice: true,
          },
          y: {
            // label: 'Researcher keywords',
            // tickRotate: -20,
            axis: 'right',
            lineWidth: 20,
            textOverflow: 'ellipsis',
          },
          marginTop: 50,
          marginBottom: 10,
          marginRight: 200,
          color: { legend: true },
          marks: [
            Plot.barX(keyword_plot_search_results
                .filter((d) =>
                  getGroupFromCNU(d.cnu) === 'Pluridisciplinaire'), {
              y: (d) => d.keyword,
              x: 1,
              fill: 'cnu',
              sort: { y: keyword_plot_sort },
              tip: {
                lineWidth: 25,
                textOverflow: 'ellipsis-end',
                format: {
                  fill: false,
                  cnu: true,
                },
              },
            }),
          ],
        })}
        <!-- $ -->
        </div>
      </div>`
    )}
  </div>
</div>

## ${selected_project} CNUs

<div class="grid grid-cols-2">
  <div id="cnu-group-container" class="card">
    <!-- <h2>Researcher CNU groups</h2> -->
    <h2>Chercheurs par catégorie de section CNU</h2>
    ${resize((width) => page.cnu_group_donut(selected_project_data, width))}
    <!-- $ -->
    <!-- <h3>*Groups are defined by the CNU</h3> -->
    <h3>*Les catégories sont définis par le CNU</h3>
    ${downloadTableButton(() => selected_project_data.cnu_count_by_category)}
    <!-- $ -->
    ${downloadSVGButton("#cnu-group-container svg:nth-of-type(1)")}
    <!-- $ -->
  </div>
  <div id="erc-container" class="card">
    <!-- <h2>Researcher ERC discipline</h2> -->
    <h2>Chercheurs par section CNU: SHS, Science, et Vie et Santé</h2>
    ${resize((width) => page.erc_donut(
      selected_project_data.discipline_erc_count,
      width
    ))}
    <!-- $ -->
    ${downloadTableButton(() => selected_project_data.discipline_erc_count)}
    <!-- $ -->
    ${downloadSVGButton("#erc-container svg:nth-of-type(1)")}
    <!-- $ -->
  </div>
  <div id="custom-cnu-group-container" class="card">
    <h2>Chercheurs par section CNU: SHS, Science, et Santé</h2>
    ${resize((width) => page.custom_cnu_group_donut(
      selected_project_data.cnu_count_by_custom_category,
      width
    ))}
    <!-- $ -->
    <h3>
      Groupes CNU des chercheurs avec les sections de droit, économie, gestion,
      et pluridisciplinaire compté comme SHS. Cela suit de plus près
      le schéma disciplinaire de l'ERC.
    </h3>
    ${downloadTableButton(() => selected_project_data.cnu_count_by_category)}
    <!-- $ -->
    ${downloadSVGButton("#custom-cnu-group-container svg:nth-of-type(1)")}
    <!-- $ -->
  </div>
</div>

```js
import { keyword_color_scale } from '/components/color.js'
const getKeywordColor = keyword_color_scale([
  ...new Set(selected_project_data.keywords_by_cnu.map((d) => d.keyword)),
])
```

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

## Discipline intersections

<div class="grid grid-cols-2">
  <div id="keyword-chord-container" class="card">
    <h2>Keyword intersections by project</h2>
    ${resize((width) =>
      chordDiagram(
        selected_project_data.keyword_project_matrix,
        selected_project_data.keyword_projects,
        d3.schemeCategory10,
        { ...page.chord_config, width: width, height: width }
      )
    )}<!-- $ -->
  </div>
  <div id="cnu-chord-container" class="card">
    <h2>CNU intersections by project</h2>
    ${resize((width) =>
      chordDiagram(
        selected_project_data.cnu_project_matrix,
        selected_project_data.cnu_projects,
        d3.schemeCategory10,
        { ...page.chord_config, width: width, height: width }
      )
    )}<!-- $ -->
  </div>
  <div id="cnu-group-chord-container" class="card">
    <h2>CNU group intersections by keyword</h2>
    ${resize((width) =>
      chordDiagram(
        selected_project_data.cnu_group_keyword_matrix,
        selected_project_data.cnu_group_keywords,
        d3.schemeCategory10,
        { ...page.chord_config, width: width, height: width, margin: 100 }
      )
    )}<!-- $ -->
  </div>
  <div id="cnu-chord-container" class="card">
    <h2>CNU intersections by keyword</h2>
    ${cnu_keywords_colors_input}
    <!-- $ -->
    ${resize((width) =>
      chordDiagram(
        selected_project_data.cnu_keyword_matrix,
        selected_project_data.cnu_keywords,
        selected_project_data.cnu_keywords.map((d) =>
          cnu_keywords_colors
            ? cnu_dark_color_map.get(getGroupFromCNU(d))
            : quantized_cnu_color(d)),
        { ...page.chord_config, width: width, height: width, margin: 100 }
      )
    )}<!-- $ -->
  </div>
</div>

```js
const selected_project_data = discipline_data_by_project.get(selected_project)
console.debug('selected_project_data', selected_project_data)
```

```js
const cnu_keywords_colors_input = Inputs.toggle({
  label: 'Colors by CNU group?',
  value: true,
})

const cnu_keywords_colors = Generators.input(cnu_keywords_colors_input)
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

const keyword_plot_sort_input = Inputs.select(
  new Map([
    ['Keyword', 'y'],
    ['Occurrences', '-x'],
  ]),
  {
    label: 'Sort by',
    value: '-x',
  },
)

const keyword_plot_sort = Generators.input(keyword_plot_sort_input)
```

```js
const keyword_plot_search_input = Inputs.search(
  selected_project_data.keywords_by_cnu,
  {
    placeholder: 'Search keywords...',
  },
)

const keyword_plot_search_results = Generators.input(keyword_plot_search_input)
```

```js
const unique_keyword_plot_search_input = Inputs.search(
  selected_project_data.unique_keywords_by_cnu,
  {
    placeholder: 'Search keywords...',
  },
)

const unique_keyword_plot_search_results = Generators.input(
  unique_keyword_plot_search_input,
)
```

```js
const All_Projects_discipline_data_by_project = [
  'All Projects',
  page.formatResearcherDataByProject(
    phase_1_data,
    auditioned_projects,
    financed_projects,
    false,
    false,
    false,
  ),
]
```

```js
const Auditioned_Projects_discipline_data_by_project = [
  'Auditioned Projects',
  page.formatResearcherDataByProject(
    phase_1_data,
    auditioned_projects,
    financed_projects,
    false,
    true,
    false,
  ),
]
```

```js
const Financed_Projects_discipline_data_by_project = [
  'Financed Projects',
  page.formatResearcherDataByProject(
    phase_1_data,
    auditioned_projects,
    financed_projects,
    false,
    true,
    true,
  ),
]
```

```js
const NEO_discipline_data_by_project = [
  'NEO',
  page.formatResearcherDataByProject(
    phase_1_data,
    auditioned_projects,
    financed_projects,
    'NEO',
    true,
    true,
  ),
]
```

```js
const RESILIENCE_discipline_data_by_project = [
  'RESILIENCE',
  page.formatResearcherDataByProject(
    phase_1_data,
    auditioned_projects,
    financed_projects,
    'RESILIENCE',
    true,
    true,
  ),
]
```

```js
const TRACES_discipline_data_by_project = [
  'TRACES',
  page.formatResearcherDataByProject(
    phase_1_data,
    auditioned_projects,
    financed_projects,
    'TRACES',
    true,
    true,
  ),
]
```

```js
const VFpp_discipline_data_by_project = [
  'VF++',
  page.formatResearcherDataByProject(
    phase_1_data,
    auditioned_projects,
    financed_projects,
    'VF++',
    true,
    true,
  ),
]
```

```js
const VILLEGARDEN_discipline_data_by_project = [
  'VILLEGARDEN',
  page.formatResearcherDataByProject(
    phase_1_data,
    auditioned_projects,
    financed_projects,
    'VILLEGARDEN',
    true,
    true,
  ),
]
```

```js
const WHAOU_discipline_data_by_project = [
  'WHAOU',
  page.formatResearcherDataByProject(
    phase_1_data,
    auditioned_projects,
    financed_projects,
    'WHAOU',
    true,
    true,
  ),
]
```

```js
const INTEGREEN_discipline_data_by_project = [
  'INTEGREEN',
  page.formatResearcherDataByProject(
    phase_1_data,
    auditioned_projects,
    financed_projects,
    'INTEGREEN',
    true,
    true,
  ),
]
```

```js
const URBHEALTH_discipline_data_by_project = [
  'URBHEALTH',
  page.formatResearcherDataByProject(
    phase_1_data,
    auditioned_projects,
    financed_projects,
    'URBHEALTH',
    true,
    true,
  ),
]
```

```js
const discipline_data_by_project = new Map([
  All_Projects_discipline_data_by_project,
  Auditioned_Projects_discipline_data_by_project,
  Financed_Projects_discipline_data_by_project,
  NEO_discipline_data_by_project,
  RESILIENCE_discipline_data_by_project,
  TRACES_discipline_data_by_project,
  VFpp_discipline_data_by_project,
  VILLEGARDEN_discipline_data_by_project,
  WHAOU_discipline_data_by_project,
  INTEGREEN_discipline_data_by_project,
  URBHEALTH_discipline_data_by_project,
])
console.debug('discipline_data_by_project', discipline_data_by_project)
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
