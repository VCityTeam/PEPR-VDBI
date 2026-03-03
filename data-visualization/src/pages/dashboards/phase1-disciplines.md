# Scientific disciplines

## Phase 1 scientific disciplines and research interests

```js
import {
  exclude,
  downloadTableButton,
  downloadSVGButton,
} from '/components/utilities.js'
import { extractPhase1Workbook } from '/components/phase1-workbook.js'
import {
  getGroupFromCNU,
  quantized_cnu_color,
  cnu_dark_color_map,
} from '/components/color.js'
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

### CNU group color legend

${Plot.legend({
color: {
domain: cnu_dark_color_map.keys(),
range: cnu_dark_color_map.values(),
type: "ordinal"},
})}

<!-- $ -->

```js
const workbook1 = await FileAttachment(
  '/data/private/251127 VDBI Base Connaissance vdef jyt.xlsx',
).xlsx()

const phase_1_data = extractPhase1Workbook(workbook1, false)
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

```js
const selected_project = view(
  Inputs.select(discipline_data_by_project.keys(), {
    label: 'Select Project',
    value: 'Financed Projects',
  }),
)
```

## ${selected_project} Disciplines

<div class="grid grid-cols-2">
  <div class="card grid-rowspan-2">
    <h2>Researcher CNU sections</h2>
    <div>${cnu_plot_sort_input}</div>
    <div id="cnu-container">
      ${resize((width) => page.cnu_plot(
        selected_project_data,
        width,
        cnu_plot_sort,
      ))}
      <!-- $ -->
      ${downloadTableButton(() => selected_project_data.cnu_count)}
      <!-- $ -->
      ${downloadSVGButton("#cnu-container svg")}
      <!-- $ -->
    </div>
  </div>
  <div id="cnu-theme-plot-container" class="card grid-rowspan-2">
    <h2>Researcher CNU by keywords</h2>
    ${resize((width, height) =>
      html`<div style="
          margin-bottom: 30px;
          max-height: ${height - 150}px;
          overflow: auto;">
        ${page.theme_plot(
          theme_plot_search_results,
          width,
          theme_plot_sort,
          getThemeColor,
        )}
        <!-- $ -->
        </div>
        ${downloadTableButton(() => selected_project_data.theme_count)}
        <!-- $ -->
        ${downloadSVGButton("#cnu-theme-plot-container svg")}
        <!-- $ -->
      </div>`
    )}
  </div>
  <div id="cnu-theme-plot-container" class="card grid-rowspan-2">
    <h2>Researcher CNU by unique keywords</h2>
    ${unique_theme_plot_search_input}
    ${resize((width, height) =>
      html`<div style="
          margin-bottom: 30px;
          max-height: ${height - 150}px;
          overflow: auto;">
        ${page.theme_plot(
          unique_theme_plot_search_results,
          width,
          theme_plot_sort,
          getThemeColor,
        )}
        <!-- $ -->
        </div>
        ${downloadTableButton(() => unique_theme_plot_search_results)}
        <!-- $ -->
        ${downloadSVGButton("#cnu-theme-plot-container svg")}
        <!-- $ -->
      </div>`
    )}
  </div>
  <div id="theme-plot-container" class="card grid-rowspan-2">
    <h2>Researcher keywords by CNU</h2>
    ${theme_plot_search_input}
    <!-- $ -->
    ${theme_plot_sort_input}
    <!-- $ -->
    ${resize((width, height) =>
      html`<div style="
          margin-bottom: 30px;
          max-height: ${height - 150}px;
          overflow: auto;">
        ${Plot.plot({
          width: width,
          height: theme_plot_search_results.length * 10,
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
            Plot.barX(theme_plot_search_results, {
              y: (d) => d.theme,
              x: 1,
              fill: (d) =>
                cnu_dark_color_map.get(getGroupFromCNU(d.cnu)) ||
                'grey',
              sort: { y: theme_plot_sort },
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
        ${downloadTableButton(() => selected_project_data.theme_count)}
        <!-- $ -->
        ${downloadSVGButton("#theme-plot-container svg")}
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
          height: theme_plot_search_results
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
            Plot.barX(theme_plot_search_results
                .filter((d) =>
                  getGroupFromCNU(d.cnu) === 'Lettres et sciences humaines'), {
              y: (d) => d.theme,
              x: 1,
              fill: 'cnu',
              sort: { y: theme_plot_sort },
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
          height: theme_plot_search_results
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
            Plot.barX(theme_plot_search_results
                .filter((d) =>
                  getGroupFromCNU(d.cnu) === 'Sections de santé'), {
              y: (d) => d.theme,
              x: 1,
              fill: 'cnu',
              sort: { y: theme_plot_sort },
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
          height: theme_plot_search_results
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
            Plot.barX(theme_plot_search_results
                .filter((d) =>
                  getGroupFromCNU(d.cnu) === 'Sciences'), {
              y: (d) => d.theme,
              x: 1,
              fill: 'cnu',
              sort: { y: theme_plot_sort },
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
          height: theme_plot_search_results
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
            Plot.barX(theme_plot_search_results
                .filter((d) =>
                  getGroupFromCNU(d.cnu) === 'Droit, économie et gestion'), {
              y: (d) => d.theme,
              x: 1,
              fill: 'cnu',
              sort: { y: theme_plot_sort },
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
          height: theme_plot_search_results
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
            Plot.barX(theme_plot_search_results
                .filter((d) =>
                  getGroupFromCNU(d.cnu) === 'Pluridisciplinaire'), {
              y: (d) => d.theme,
              x: 1,
              fill: 'cnu',
              sort: { y: theme_plot_sort },
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

```js
import { keyword_color_scale } from '/components/color.js'
const getThemeColor = keyword_color_scale([
  ...new Set(selected_project_data.themes_by_cnu.map((d) => d.theme)),
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
  <div id="theme-chord-container" class="card">
    <h2>Theme intersections by project</h2>
    ${resize((width) =>
      chordDiagram(
        selected_project_data.theme_project_matrix,
        selected_project_data.theme_projects,
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
  selected_project_data.themes_by_cnu,
  {
    placeholder: 'Search themes...',
  },
)

const theme_plot_search_results = Generators.input(theme_plot_search_input)
```

```js
const unique_theme_plot_search_input = Inputs.search(
  selected_project_data.unique_themes_by_cnu,
  {
    placeholder: 'Search themes...',
  },
)

const unique_theme_plot_search_results = Generators.input(
  unique_theme_plot_search_input,
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
