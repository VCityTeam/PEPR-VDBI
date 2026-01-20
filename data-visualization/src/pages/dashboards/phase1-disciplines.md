# Researcher Disciplines by Project

```js
import {
  countEntities,
  cropText,
  exclude,
  downloadTableButton,
  downloadSVGButton,
  sparkbar,
} from "/components/utilities.js"
import { extractPhase1Workbook } from "/components/phase1-workbook.js"
import { donutChart } from "/components/pie-chart.js"
import { cnu_category_map } from "/components/cnu.js"
import {
  getCategoryFromCNU,
  colorCNU,
  vdbi_color_scheme,
} from "/components/color.js"
import { chordDiagram, generateIntersectionMatrix } from "/components/chord.js"
import { ForceLayoutStaticGraph, mapTableToTriples } from "/components/graph.js"
import {
  mainland_france_choropleth_marks,
  mainland_france_departements_geojson,
} from "/components/projection-map.js"
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
    label: "Select Project",
    value: "Financed Projects",
  }),
)
```

```js
const selected_project_data = discipline_data_by_project.get(selected_project)
console.debug("selected_project_data", selected_project_data)
```

## ${selected_project} Disciplines by CNU and ERC

<div class="grid grid-cols-2">
  <div class="card grid-colspan-1 grid-rowspan-2">
    <h2>Researcher CNU sections</h2>
    <div id="cnu-legend">
      <h3>CNU group legend</h3>
      ${cnu_plot_legend}
      ${downloadSVGButton("#cnu-legend svg")}<!-- $ -->
    </div>
    <div>${cnu_plot_sort_input}</div>
    <div id="cnu-container">
      ${resize((width) => Plot.plot(
        {
          width: width,
          height: 800,
          marginTop: 50,
          marginRight: cnu_plot_legend_options.marginRight,
          x: {
            reverse: true,
            grid: true,
            axis: 'both',
            label: 'Occurences',
          },
          marks: [
            Plot.axisY({
              label: 'CNU',
              anchor: 'right',
              lineWidth: 15,
              textOverflow: "ellipsis",
            }),
            Plot.barX(selected_project_data.cnu_count, {
              y: (d) => d[0],
              x: (d) => d[1],
              fill: (d) =>
                colorCNU(
                  d,
                  Math.max(...selected_project_data.cnu_count.map((d) => d[1]))
                ),
              stroke: 'black',
              strokeOpacity: 0.1,
              sort: { y: cnu_plot_sort },
              tip: true,
            }),
            Plot.barX(
              selected_project_data.cnu_count,
              Plot.pointerY({
                y: (d) => d[0],
                x: (d) => d[1],
                fill: 'white',
                opacity: 0.5,
              })
            ),
          ],
        }
      ))}
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
    ${resize((width) => donutChart(
      selected_project_data.cnu_count_by_category,
      {
        width: width * 0.6,
        legendWidth: width * 0.5,
        keyMap: (d) => d[0],
        valueMap: (d) => d[1],
        colorMap: (d) => d[0],
        color: cnu_category_plot_options.color,
        legendTextLength: 20,
        majorLabelText: () => "",
        minorLabelText: () => "",
      }
    ))}
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
    ${resize((width) => donutChart(
      selected_project_data.discipline_erc_count,
      {
        width: width * 0.6,
        legendWidth: width * 0.5,
        keyMap: (d) => d[0],
        valueMap: (d) => d[1],
        colorMap: (d) => d[0],
        color: d3
          .scaleOrdinal(d3.schemeCategory10)
          .domain(erc_category_colors.keys())
          .range(erc_category_colors.values())
          .unknown('grey'),
        legendTextLength: 20,
        legendFontSize: 12,
        //majorLabelText: () => "",
        //minorLabelText: () => "",
      }
    ))}
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
      ${resize((width) => Plot.plot(
        {
          width: width,
          height: theme_plot_search_results.length * 20,
          marginTop: 50,
          marginBottom: 10,
          marginRight: 200,
          x: {
            label: 'Occurences',
            grid: true,
            axis: 'both',
            reverse: true,
          },
          y: {
            label: 'Subjects, themes, or research interests',
            tickRotate: -20,
            axis: 'right',
            lineWidth: 20,
            textOverflow: "ellipsis",
          },
          marks: [
            Plot.barX(theme_plot_search_results, {
              y: (d) => d[0],
              x: (d) => d[1],
              stroke: 'black',
              strokeOpacity: 0.1,
              fill: vdbi_color_scheme.blue,
              sort: { y: theme_plot_sort },
              tip: {
                format: {
                  fill: false,
                },
                lineWidth: 25,
                textOverflow: 'ellipsis-end',
              },
            }),
            Plot.barX(
              theme_plot_search_results,
              Plot.pointerY({
                y: (d) => d[0],
                x: (d) => d[1],
                fill: 'white',
                opacity: 0.5,
              })
            ),
          ],
        }
      ))}
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
<div class="grid grid-cols-2">
  <div id="graph-container" class="card">
    ${Inputs.button("Stop simulation", {
      reduce: () => {
        getGraph().simulation.stop()
      }
    })}
    <!-- $ -->
    ${resize((width) =>
      setGraph(selected_project_data.theme_graph, width).getSVG()
    )}
    <!-- $ -->
    ${downloadSVGButton("#graph-container svg")}
    <!-- $ -->
  </div>
  <div id="map-container" class="card">
    ${resize((width, height) =>
      Plot.plot({
        width: width,
        height: height,
        projection: {
          type: "equal-earth",
          domain: d3.geoCircle().center([1.7, 47.1]).radius(4.7)(),
        },
        marks: mainland_france_choropleth_marks.concat([
          Plot.geo([], {
          //Plot.geo(mainland_france_departements_geojson, {
            channels: {
              Department: ({ properties }) => properties.nom,
              Code: ({ properties }) => properties.code,
              Lat: (d) => d3.geoCentroid[d](0),
              Lon: (d) => d3.geoCentroid[d](1),
            },
            tip: true,
            //fill: ({ properties }) =>
            //  (choropleth_terrain_data.get(properties.nom) || { size: null }).size,
            strokeOpacity: 0,
          }),
        ])
      })
    )}
    <!-- $ -->
  </div>
</div>

```js
const workbook1 = await FileAttachment(
  "/data/private/251127 VDBI Base Connaissance vdef jyt.xlsx",
).xlsx()

const phase_1_data = extractPhase1Workbook(workbook1, false)
console.debug("phase_1_data", phase_1_data)
```

```js
let graph = null
const setGraph = (data, width) => {
  graph = new ForceLayoutStaticGraph(data, {
    width: width,
    height: width,
  })

  return graph
}
const getGraph = () => graph
```

```js
const cnu_plot_legend_options = {
  marginLeft: 18,
  marginRight: 175,
  domain: [1, 0],
  range: [1, 0.4],
  type: "log",
}

const cnu_plot_legend = resize(
  (width) =>
    htl.html`${Plot.legend({
      label: "Droit, économie et gestion",
      marginLeft: cnu_plot_legend_options.marginLeft,
      marginRight: cnu_plot_legend_options.marginRight,
      width: width,
      color: {
        domain: cnu_plot_legend_options.domain,
        range: cnu_plot_legend_options.range,
        type: cnu_plot_legend_options.type,
        scheme: "Reds",
      },
    })}
  ${Plot.legend({
    label: "Lettres et sciences humaines",
    marginLeft: cnu_plot_legend_options.marginLeft,
    marginRight: cnu_plot_legend_options.marginRight,
    width: width,
    color: {
      domain: cnu_plot_legend_options.domain,
      range: cnu_plot_legend_options.range,
      type: cnu_plot_legend_options.type,
      scheme: "Greens",
    },
  })}
  ${Plot.legend({
    label: "Sciences",
    marginLeft: cnu_plot_legend_options.marginLeft,
    marginRight: cnu_plot_legend_options.marginRight,
    width: width,
    color: {
      domain: cnu_plot_legend_options.domain,
      range: cnu_plot_legend_options.range,
      type: cnu_plot_legend_options.type,
      scheme: "Blues",
    },
  })}
  ${Plot.legend({
    label: "Sections de santé",
    marginLeft: cnu_plot_legend_options.marginLeft,
    marginRight: cnu_plot_legend_options.marginRight,
    width: width,
    color: {
      domain: cnu_plot_legend_options.domain,
      range: cnu_plot_legend_options.range,
      type: cnu_plot_legend_options.type,
      scheme: "Purples",
    },
  })}
  ${Plot.legend({
    label: "Pluridisciplinaire",
    marginLeft: cnu_plot_legend_options.marginLeft,
    marginRight: cnu_plot_legend_options.marginRight,
    width: width,
    color: {
      domain: cnu_plot_legend_options.domain,
      range: cnu_plot_legend_options.range,
      // range: [0.7, 0.1],
      type: cnu_plot_legend_options.type,
      // scheme: "YlOrBr",
      interpolate: d3.interpolateRgbBasis(["white", "yellow", "brown"]),
    },
  })}
  ${Plot.legend({
    label: "Autre",
    marginLeft: cnu_plot_legend_options.marginLeft,
    marginRight: cnu_plot_legend_options.marginRight,
    width: width,
    color: {
      domain: cnu_plot_legend_options.domain,
      range: cnu_plot_legend_options.range,
      type: cnu_plot_legend_options.type,
      scheme: "Greys",
    },
  })}`,
)

const cnu_category_plot_options = {
  width: 800,
  height: 450,
  legendWidth: 60,
  keyMap: (d) => d[0],
  valueMap: (d) => d[1],
  colorMap: (d) => d[0],
  color: d3
    .scaleOrdinal(d3.schemeSet1.slice(1))
    // .scaleOrdinal(d3.schemeCategory10)
    .domain(cnu_category_map.keys())
    .unknown("grey"),
}

function generateCnuPlotOptions(data, sort = "y", height = 350, width = 500) {
  return {
    width: width,
    height: height,
    marginTop: 50,
    marginRight: width / 2,
    y: {
      label: "CNU",
      tickRotate: 10,
      axis: "right",
      lineWidth: 35,
      textOverflow: "ellipsis",
    },
    x: {
      reverse: true,
      grid: true,
      axis: "top",
      label: "Occurences",
    },
    marks: [
      Plot.barX(data, {
        y: (d) => d[0],
        x: (d) => d[1],
        // fill: (d) => d3
        // .scaleOrdinal(d3.schemeCategory10)
        // .domain(cnu_category_map.keys())
        // .unknown("grey")(getCategoryFromCNU(d[0])),
        fill: (d) => colorCNU(d, Math.max(...data.map((d) => d[1]))),
        stroke: "black",
        strokeOpacity: 0.1,
        // sort: {y: "y"},
        // sort: {y: "-x"},
        sort: { y: sort },
        tip: {
          format: {
            fill: false,
          },
          lineWidth: 25,
          textOverflow: "ellipsis-end",
        },
      }),
      Plot.barX(
        data,
        Plot.pointerY({
          y: (d) => d[0],
          x: (d) => d[1],
          fill: "white",
          opacity: 0.5,
        }),
      ),
      // Plot.text(data, {
      //   x: 0,
      //   y: (d) => d[1],
      // })
    ],
  }
}

// const shs_cnu_plot_options = {
//   width: 800,
//   height: 450,
//   keyMap: (d) => d[0],
//   valueMap: (d) => d[1],
//   legendWidth: 110,
// };

const erc_category_colors = new Map([
  ["PE - Sciences & Technologies", d3.schemeCategory10[0]],
  ["LS - Vie & Santé", d3.schemeCategory10[4]],
  ["SH - Sciences Humaines & Sociales", d3.schemeCategory10[2]],
  ["non chercheur", "grey"],
])

const discipline_erc_pie_options = {
  width: 800,
  height: 450,
  keyMap: (d) => d[0],
  valueMap: (d) => d[1],
  colorMap: (d) => d[0],
  color: d3
    .scaleOrdinal(d3.schemeCategory10)
    .domain(erc_category_colors.keys())
    .range(erc_category_colors.values())
    .unknown("grey"),
  legendWidth: 110,
}
console.debug("erc_category_colors", erc_category_colors.entries())
```

```js
const cnu_plot_sort_input = Inputs.select(
  new Map([
    ["CNU", "y"],
    ["Occurrences", "-x"],
  ]),
  {
    label: "Sort by",
  },
)

const cnu_plot_sort = Generators.input(cnu_plot_sort_input)

const theme_plot_sort_input = Inputs.select(
  new Map([
    ["Theme", "y"],
    ["Occurrences", "-x"],
  ]),
  {
    label: "Sort by",
    value: "-x",
  },
)

const theme_plot_sort = Generators.input(theme_plot_sort_input)
```

```js
const theme_plot_search_input = Inputs.search(
  selected_project_data.theme_count,
  {
    placeholder: "Search themes...",
  },
)

const theme_plot_search_results = Generators.input(theme_plot_search_input)
```

```js
// debugger
const discipline_data_by_project = new Map([
  ["All Projects", formatResearcherDataByProject(false, false, false)],
  ["Auditioned Projects", formatResearcherDataByProject(false, true, false)],
  ["Financed Projects", formatResearcherDataByProject(false, true, true)],
  ["NEO", formatResearcherDataByProject("NEO", true, true)],
  ["RESILIENCE", formatResearcherDataByProject("RESILIENCE", true, true)],
  ["TRACES", formatResearcherDataByProject("TRACES", true, true)],
  ["VF++", formatResearcherDataByProject("VF++", true, true)],
  ["VILLEGARDEN", formatResearcherDataByProject("VILLEGARDEN", true, true)],
  ["WHAOU", formatResearcherDataByProject("WHAOU", true, true)],
  ["INTEGREEN", formatResearcherDataByProject("INTEGREEN", true, true)],
  ["URBHEALTH", formatResearcherDataByProject("URBHEALTH", true, true)],
])

console.debug("discipline_data_by_project", discipline_data_by_project)
```

```js
const auditioned_projects = phase_1_data.projects
  .filter((d) => d.auditioned)
  .map((d) => d.acronyme)
const financed_projects = phase_1_data.projects
  .filter((d) => d.financed)
  .map((d) => d.acronyme)

console.debug("auditioned_projects", auditioned_projects)
console.debug("financed_projects", financed_projects)
```

```js
// Get relevant data by project,
// set auditioned flag to true if filtering out non-auditioned project data
// set financed flag to true if filtering out non-financed project data
function formatResearcherDataByProject(
  project,
  auditioned = false,
  financed = false,
) {
  // filter by project if project, otherwise keep everything
  const filtered_researchers = phase_1_data.researchers.filter(
    (d) =>
      (project ? d.project.includes(project) : true) &&
      (auditioned
        ? d.project.some((researcher_project) =>
            auditioned_projects.includes(researcher_project),
          )
        : true) &&
      (financed
        ? d.project.some((researcher_project) =>
            financed_projects.includes(researcher_project),
          )
        : true),
  )

  const discipline_erc_count = countEntities(
    filtered_researchers,
    (d) => d.discipline_erc,
  )
    .filter((d) => exclude(d[0]))
    .sort((a, b) => d3.descending(a[1], b[1]))

  const cnu_count = d3
    .rollups(
      filtered_researchers,
      (d) => d.length,
      (d) => d.cnu,
    )
    .filter((d) => exclude(d[0]))
    .sort((a, b) => d3.descending(a[1], b[1]))

  const cnu_count_by_category = d3
    .rollups(
      filtered_researchers,
      (D) => D.length,
      (d) => (d.cnu ? getCategoryFromCNU(d.cnu) : null),
    )
    .filter((d) => !!d[0])
    .sort((a, b) => d3.descending(a[1], b[1]))

  const theme_count = countEntities(filtered_researchers, (d) => d.themes)
    .filter((d) => !!d[0])
    .sort((a, b) => d3.descending(a[1], b[1]))

  const projects_by_theme = filtered_researchers.flatMap((researcher) =>
    researcher.project
      .filter(
        (researcher_project) =>
          (project ? researcher_project === project : true) &&
          (auditioned
            ? auditioned_projects.includes(researcher_project)
            : true) &&
          (financed ? financed_projects.includes(researcher_project) : true),
      )
      .map((project) => ({
        project,
        themes: researcher.themes,
      })),
  )

  const grouped_projects_by_theme = d3.rollup(
    projects_by_theme,
    (D) => new Set(D.flatMap((d) => d.themes)),
    (d) => d.project,
  )
  console.debug("grouped_projects_by_theme", grouped_projects_by_theme)

  const theme_project_matrix = generateIntersectionMatrix(
    grouped_projects_by_theme,
  )

  const theme_graph = {
    nodes: [
      ...new Set(
        filtered_researchers.flatMap((reasearcher) =>
          reasearcher.themes.map((theme) => ({
            id: theme,
            label: theme,
            type: "Theme",
          })),
        ),
      ),
    ],
    links: filtered_researchers.flatMap((researcher) =>
      researcher.themes.flatMap((source_theme) =>
        researcher.themes
          .map((target_theme) =>
            source_theme === target_theme
              ? null
              : {
                  source: source_theme,
                  target: target_theme,
                  label: "Shared researcher",
                },
          )
          .filter((d) => !!d),
      ),
    ),
  }

  return {
    discipline_erc_count,
    cnu_count,
    cnu_count_by_category,
    theme_count,
    theme_project_matrix,
    projects: [...grouped_projects_by_theme.keys()],
    theme_graph,
  }
}
```

### Percent Summary

```js
function formatDomainPercents(label, data) {
  // debugger;
  const getFromMapOrZero = (map, value) => (map.has(value) ? map.get(value) : 0)

  const discipline_erc_count_map = new Map(data.discipline_erc_count)
  const discipline_erc_count_total =
    getFromMapOrZero(
      discipline_erc_count_map,
      "SH - Sciences Humaines & Sociales",
    ) +
    getFromMapOrZero(discipline_erc_count_map, "PE - Sciences & Technologies") +
    getFromMapOrZero(discipline_erc_count_map, "LS - Vie & Santé") +
    getFromMapOrZero(discipline_erc_count_map, "non chercheur")

  const cnu_count_by_category_count_map = new Map(data.cnu_count_by_category)
  const cnu_count_by_category_count_total =
    getFromMapOrZero(
      cnu_count_by_category_count_map,
      "Droit, économie et gestion",
    ) +
    getFromMapOrZero(
      cnu_count_by_category_count_map,
      "Lettres et sciences humaines",
    ) +
    getFromMapOrZero(cnu_count_by_category_count_map, "Sciences") +
    getFromMapOrZero(cnu_count_by_category_count_map, "Pluridisciplinaire") +
    getFromMapOrZero(cnu_count_by_category_count_map, "Sections de santé")

  return {
    label: label,
    erc_sh_ratio:
      getFromMapOrZero(
        discipline_erc_count_map,
        "SH - Sciences Humaines & Sociales",
      ) / discipline_erc_count_total,
    erc_pe_ratio:
      getFromMapOrZero(
        discipline_erc_count_map,
        "PE - Sciences & Technologies",
      ) / discipline_erc_count_total,
    erc_ls_ratio:
      getFromMapOrZero(discipline_erc_count_map, "LS - Vie & Santé") /
      discipline_erc_count_total,
    cnu_droit_ratio:
      getFromMapOrZero(
        cnu_count_by_category_count_map,
        "Droit, économie et gestion",
      ) / cnu_count_by_category_count_total,
    cnu_shs_ratio:
      getFromMapOrZero(
        cnu_count_by_category_count_map,
        "Lettres et sciences humaines",
      ) / cnu_count_by_category_count_total,
    cnu_science_ratio:
      getFromMapOrZero(cnu_count_by_category_count_map, "Sciences") /
      cnu_count_by_category_count_total,
    cnu_pluri_ratio:
      getFromMapOrZero(cnu_count_by_category_count_map, "Pluridisciplinaire") /
      cnu_count_by_category_count_total,
    cnu_sante_ratio:
      getFromMapOrZero(cnu_count_by_category_count_map, "Sections de santé") /
      cnu_count_by_category_count_total,
  }
}

// Table //
const overview_data = []
const generateSparkbar = sparkbar(1, {
  format: (x) => `${(x * 100).toPrecision(3)}%`,
  float: "right",
})

discipline_data_by_project
  .entries()
  .forEach(([key, value]) =>
    overview_data.push(formatDomainPercents(key, value)),
  )

console.debug("overview_data", overview_data)

const overview_table_erc = Inputs.table(overview_data, {
  // height: 400,
  columns: [
    "label",
    // "erc_sh_ratio",
    // "erc_pe_ratio",
    // "erc_ls_ratio",
    "cnu_droit_ratio",
    "cnu_shs_ratio",
    "cnu_science_ratio",
    "cnu_pluri_ratio",
    "cnu_sante_ratio",
  ],
  header: {
    label: "Project",
    erc_sh_ratio: "% ERC SH",
    erc_pe_ratio: "% ERC PE",
    erc_ls_ratio: "% ERC VS",
    cnu_droit_ratio: "% CNU Droit, économie et gestion",
    cnu_shs_ratio: "% CNU Lettres et SH",
    cnu_science_ratio: "% CNU Sciences",
    cnu_pluri_ratio: "% CNU Pluridisciplinaire",
    cnu_sante_ratio: "% CNU Santé",
  },
  format: {
    erc_sh_ratio: generateSparkbar,
    erc_pe_ratio: generateSparkbar,
    erc_ls_ratio: generateSparkbar,
    cnu_droit_ratio: generateSparkbar,
    cnu_shs_ratio: generateSparkbar,
    cnu_science_ratio: generateSparkbar,
    cnu_pluri_ratio: generateSparkbar,
    cnu_sante_ratio: generateSparkbar,
  },
})

const overview_table_cnu = Inputs.table(overview_data, {
  // height: 400,
  columns: [
    "label",
    "erc_sh_ratio",
    "erc_pe_ratio",
    "erc_ls_ratio",
    // "cnu_droit_ratio",
    // "cnu_shs_ratio",
    // "cnu_science_ratio",
    // "cnu_pluri_ratio",
    // "cnu_sante_ratio",
  ],
  header: {
    label: "Project",
    erc_sh_ratio: "% ERC SH",
    erc_pe_ratio: "% ERC PE",
    erc_ls_ratio: "% ERC VS",
    cnu_droit_ratio: "% CNU Droit, économie et gestion",
    cnu_shs_ratio: "% CNU Lettres et SH",
    cnu_science_ratio: "% CNU Sciences",
    cnu_pluri_ratio: "% CNU Pluridisciplinaire",
    cnu_sante_ratio: "% CNU Santé",
  },
  format: {
    erc_sh_ratio: generateSparkbar,
    erc_pe_ratio: generateSparkbar,
    erc_ls_ratio: generateSparkbar,
    cnu_droit_ratio: generateSparkbar,
    cnu_shs_ratio: generateSparkbar,
    cnu_science_ratio: generateSparkbar,
    cnu_pluri_ratio: generateSparkbar,
    cnu_sante_ratio: generateSparkbar,
  },
})
```

<div class="grid grid-cols-2">
  <div class="card grid-colspan-1">${overview_table_erc}</div>
  <div class="card grid-colspan-1">${overview_table_cnu}</div>
</div>

## Data quality metrics

```js
function isFinanced(projects) {
  for (let index = 0; index < projects.length; index++) {
    if (financed_projects.includes(projects[index])) return true
  }
  return false
}
```

```js
// missing count //
const missing_discipline_erc_count = d3.rollup(
  phase_1_data.researchers,
  (D) => D.length,
  (d) => (exclude(d.discipline_erc) ? "found_erc" : "missing_erc"),
)
missing_discipline_erc_count

const missing_cnu_count = d3.rollup(
  phase_1_data.researchers,
  (D) => D.length,
  (d) => (exclude(d.cnu) ? "found_cnu" : "missing_cnu"),
)

const missing_financed_discipline_erc_count = d3.rollup(
  phase_1_data.researchers.filter((d) => isFinanced(d.project)),
  (D) => D.length,
  (d) => (exclude(d.discipline_erc) ? "found_erc" : "missing_erc"),
)
missing_discipline_erc_count

const missing_financed_cnu_count = d3.rollup(
  phase_1_data.researchers.filter((d) => isFinanced(d.project)),
  (D) => D.length,
  (d) => (exclude(d.cnu) ? "found_cnu" : "missing_cnu"),
)

// TODO: this is way simpler

// const cnu_categorization = d3.rollup(
//   phase_1_data.researchers,
//   (D) => D.length,
//   (d) => Boolean(getCategoryFromCNU(d.cnu))
// )

// const cnu_categorization_value = cnu_categorization.get(false) / phase_1_data.researchers.length

const missing_cnu_value =
  (missing_cnu_count.get("missing_cnu") || 0) /
  ((missing_cnu_count.get("missing_cnu") || 0) +
    (missing_cnu_count.get("found_cnu") || 0))

const missing_discipline_erc_value =
  (missing_discipline_erc_count.get("missing_erc") || 0) /
  ((missing_discipline_erc_count.get("missing_erc") || 0) +
    (missing_discipline_erc_count.get("found_erc") || 0))

const missing_financed_cnu_value =
  (missing_financed_cnu_count.get("missing_cnu") || 0) /
  ((missing_financed_cnu_count.get("missing_cnu") || 0) +
    (missing_financed_cnu_count.get("found_cnu") || 0))

const missing_financed_discipline_erc_value =
  (missing_financed_discipline_erc_count.get("missing_erc") || 0) /
  ((missing_financed_discipline_erc_count.get("missing_erc") || 0) +
    (missing_financed_discipline_erc_count.get("found_erc") || 0))
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
