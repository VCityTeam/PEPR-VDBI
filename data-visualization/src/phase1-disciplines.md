---
theme: [dashboard, light]
---

```js
import {
  countEntities,
  cropText,
  exclude,
  copyTableToClipboardButton,
} from "./components/utilities.js"
```

```js
import { extractPhase1Workbook } from "./components/phase1-dashboard.js"
```

```js
import { donutChart } from "./components/pie-chart.js"
```

```js
import { cnu_category_map } from "./components/cnu.js"
```

```js
import { getCategoryFromCNU, colorCNU } from "./components/color.js"
```

# Researcher Disciplines by Project

<div class="warning" label="Data visualization notice">
  <ul>
    <li>Researchers with multiple disciplines are counted once per discipline.</li>
    <li>Missing researcher data is not visualized by default.</li>
    <li>Data has not yet been verified. Some visualizations may be incorrect.</li>
    <li>Bar charts use graded coloring based on a logarithmic scale (see CNU color legend).</li>
  </ul>
</div>

```js
const selected_project = view(
  Inputs.select(discipline_data_by_project.keys(), { label: "Select Project" })
)
```

```js
const selected_project_data = discipline_data_by_project.get(selected_project)
console.debug("selected_project_data", selected_project_data)
```

## ${selected_project}

<div class="grid grid-cols-2">
  <div class="card grid-colspan-1 grid-rowspan-2">
    <h2>Researcher CNU sections</h2>
    <div>${cnu_plot_sort_input}</div>
    ${resize((width) => Plot.plot(
      {
        width: width,
        height: 800,
        //height: selected_project_data.cnu_count.length > 10 ? 750 : 500,
        marginTop: 50,
        marginRight: cnu_plot_legend_options.marginRight,
        y: {
          label: 'CNU',
          axis: 'right',
          tickFormat: (d) => cropText(d, 70),
        },
        x: {
          reverse: true,
          grid: true,
          axis: 'both',
          label: 'Occurences',
        },
        marks: [
          Plot.barX(selected_project_data.cnu_count, {
            y: (d) => d[0],
            x: (d) => d[1],
            // fill: (d) => d3
            // .scaleOrdinal(d3.schemeCategory10)
            // .domain(cnu_category_map.keys())
            // .unknown("grey")(getCategoryFromCNU(d[0])),
            fill: (d) =>
              colorCNU(d, Math.max(...selected_project_data.cnu_count.map((d) => d[1]))),
            stroke: 'black',
            strokeOpacity: 0.1,
            // sort: {y: "y"},
            // sort: {y: "-x"},
            sort: { y: cnu_plot_sort },
            tip: {
              format: {
                fill: false,
              },
              lineWidth: 25,
              textOverflow: 'ellipsis-end',
            },
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
          // Plot.text(selected_project_data.cnu_count, {
          //   x: 0,
          //   y: (d) => d[1],
          // })
        ],
      }
    ))}
    <!-- $ -->
    <h3>CNU group color legend</h3>
    <div>${cnu_plot_legend}</div>
    ${copyTableToClipboardButton(
      selected_project_data.cnu_count,
        null,
        "Copy data to clipboard"
    )}
    <!-- $ -->
  </div>
  <div class="card">
    <h2>Researcher CNU groups</h2>
    <!-- <h2>Chercheurs PEPR VDBI par groupe CNU</h2> -->
    ${resize((width) => donutChart(
      selected_project_data.cnu_count_by_category,
      {
        width: width * 0.7,
        height: (width * 0.7) - 20,
        legendWidth: width * 0.3,
        keyMap: (d) => d[0],
        valueMap: (d) => d[1],
        colorMap: (d) => d[0],
        color: d3
          .scaleOrdinal(d3.schemeCategory10)
          .domain(cnu_category_map.keys())
          .unknown('grey'),
      }
    ))}
    <!-- $ -->
    <h3>*Groups are defined by the CNU</h3>
    <!-- <h3>*Les regroupements des sections est définis par le CNU</h3> -->
    ${copyTableToClipboardButton(
      selected_project_data.cnu_count_by_category,
      null,
      "Copy data to clipboard"
    )}
    <!-- $ -->
  </div>
  <div class="card">
    <h2>Researcher laboratory ERC disciplines</h2>
    ${resize((width) => donutChart(
      selected_project_data.discipline_erc_count,
      {
        width: width * 0.7,
        height: (width * 0.7) - 20,
        legendWidth: width * 0.3,
        keyMap: (d) => d[0],
        valueMap: (d) => d[1],
        colorMap: (d) => d[0],
        color: d3
          .scaleOrdinal(d3.schemeCategory10)
          .domain(erc_category_colors.keys())
          .range(erc_category_colors.values())
          .unknown('grey'),
      }
    ))}
    <!-- $ -->
    ${copyTableToClipboardButton(
      selected_project_data.discipline_erc_count,
      null,
      "Copy data to clipboard"
    )}
    <!-- $ -->
  </div>
</div>

```js
const cnu_plot_legend_options = {
  marginLeft: 18,
  marginRight: 360,
  domain: [10, 1],
  // domain: [1, 10],
  range: [1, 0.4],
  // range: [0.4, 1],
  type: "log",
}

const cnu_plot_legend = resize((width) => 
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
      scheme: "Oranges",
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
    label: "Pluridisciplinaire",
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
    label: "Sections de santé",
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
    label: "Other",
    marginLeft: cnu_plot_legend_options.marginLeft,
    marginRight: cnu_plot_legend_options.marginRight,
    width: width,
    color: {
      domain: cnu_plot_legend_options.domain,
      range: cnu_plot_legend_options.range,
      type: cnu_plot_legend_options.type,
      scheme: "Greys",
    },
  })}`
)
```

```js
const workbook1 = await FileAttachment(
  "./data/private/250120 PEPR_VBDI_analyse modifiée JYT.xlsx"
  // './data/private/250120 PEPR_VBDI_analyse modifiée JYT_financed_redacted.xlsx'
).xlsx()

const phase_1_data = extractPhase1Workbook(workbook1, false)
console.debug("phase_1_data", phase_1_data)
```

```js
const cnu_category_plot_options = {
  width: 800,
  height: 450,
  legendWidth: 60,
  keyMap: (d) => d[0],
  valueMap: (d) => d[1],
  colorMap: (d) => d[0],
  color: d3
    .scaleOrdinal(d3.schemeCategory10)
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
      tickFormat: (d) => cropText(d, 70),
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
        })
      ),
      // Plot.text(data, {
      //   x: 0,
      //   y: (d) => d[1],
      // })
    ],
  }
}

const cnu_plot_sort_values = new Map([
  ["CNU", "y"],
  ["Occurrences", "-x"],
])
const cnu_plot_sort_options = {
  label: "Sorted by",
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
  ["LS - Vie & Santé", d3.schemeCategory10[2]],
  ["SH - Sciences Humaines & Sociales", "OrangeRed"],
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
  cnu_plot_sort_values,
  cnu_plot_sort_options
)

const cnu_plot_sort = Generators.input(cnu_plot_sort_input)

const all_project_cnu_max = Math.max(
  ...discipline_data_by_project.get("All Projects").cnu_count.map((d) => d[1])
)
```

```js
const discipline_data_by_project = new Map([
  ["All Projects", formatResearcherDataByProject(false, false, false)],
  ["Auditioned Projects", formatResearcherDataByProject(false, true, false)],
  ["Financed Projects", formatResearcherDataByProject(false, true, true)],
  ["NÉO", formatResearcherDataByProject("NÉO", true, true)],
  ["RÉSILIENCE", formatResearcherDataByProject("RÉSILIENCE", true, true)],
  ["TRACES", formatResearcherDataByProject("TRACES", true, true)],
  ["VF++", formatResearcherDataByProject("VF++", true, true)],
  ["VILLEGARDEN", formatResearcherDataByProject("VILLEGARDEN", true, true)],
  ["WHAOU", formatResearcherDataByProject("WHAOU", true, true)],
  ["inteGREEN", formatResearcherDataByProject("inteGREEN", true, true)],
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
// [
//   "NÉO",
//   "RÉSILIENCE",
//   "TRACES",
//   "VF++",
//   "VILLEGARDEN",
//   "WHAOU",
//   "inteGREEN",
//   "URBHEALTH",
// ];
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
  financed = false
) {
  // filter by project if project, otherwise keep everything
  const filtered_researchers = phase_1_data.researchers.filter(
    (d) =>
      (project ? d.project.includes(project) : true) &&
      (auditioned
        ? d.project.some((researcher_project) =>
            auditioned_projects.includes(researcher_project)
          )
        : true) &&
      (financed
        ? d.project.some((researcher_project) =>
            financed_projects.includes(researcher_project)
          )
        : true)
  )

  const discipline_erc_count = countEntities(
    filtered_researchers,
    (d) => d.discipline_erc
  )
    .filter((d) => exclude(d[0]))
    .sort((a, b) => d3.descending(a[1], b[1]))

  const cnu_count = d3
    .rollups(
      filtered_researchers,
      (d) => d.length,
      (d) => d.cnu
    )
    .filter((d) => exclude(d[0]))
    .sort((a, b) => d3.descending(a[1], b[1]))

  // const shs_cnu_count = cnu_count
  //   .filter((d) => isSHSCNU(d[0]));

  // const shs_cnu_percent = d3.rollups(
  //   cnu_count,
  //   (D) => D.length,
  //   (d) => isSHSCNU(d[0]) ? 'SHS' : 'non-SHS'
  // );

  const cnu_count_by_category = d3
    .rollups(
      filtered_researchers,
      (D) => D.length,
      (d) => (d.cnu ? getCategoryFromCNU(d.cnu) : null)
    )
    .filter((d) => !!d[0])
    .sort((a, b) => d3.descending(a[1], b[1])) //TODO: add missing information to data quality check
  // debugger;

  return {
    discipline_erc_count: discipline_erc_count,
    cnu_count: cnu_count,
    // shs_cnu_count: shs_cnu_count,
    // shs_cnu_percent: shs_cnu_percent,
    cnu_count_by_category: cnu_count_by_category,
  }
}
```


### Percent Summary

```js
function formatDomainPercents(label, data) {
  // debugger;
  const percent = (value, total) => `${((value / total) * 100).toPrecision(3)}%`
  const getFromMapOrZero = (map, value) => (map.has(value) ? map.get(value) : 0)

  const discipline_erc_count_map = new Map(data.discipline_erc_count)
  const discipline_erc_count_total =
    getFromMapOrZero(
      discipline_erc_count_map,
      "SH - Sciences Humaines & Sociales"
    ) +
    getFromMapOrZero(discipline_erc_count_map, "PE - Sciences & Technologies") +
    getFromMapOrZero(discipline_erc_count_map, "LS - Vie & Santé") +
    getFromMapOrZero(discipline_erc_count_map, "non chercheur")

  const cnu_count_by_category_count_map = new Map(data.cnu_count_by_category)
  const cnu_count_by_category_count_total =
    getFromMapOrZero(
      cnu_count_by_category_count_map,
      "Droit, économie et gestion"
    ) +
    getFromMapOrZero(
      cnu_count_by_category_count_map,
      "Lettres et sciences humaines"
    ) +
    getFromMapOrZero(cnu_count_by_category_count_map, "Sciences") +
    getFromMapOrZero(cnu_count_by_category_count_map, "Pluridisciplinaire") +
    getFromMapOrZero(cnu_count_by_category_count_map, "Sections de santé")

  return {
    label: label,
    erc_sh_percent: percent(
      getFromMapOrZero(
        discipline_erc_count_map,
        "SH - Sciences Humaines & Sociales"
      ),
      discipline_erc_count_total
    ),
    erc_pe_percent: percent(
      getFromMapOrZero(
        discipline_erc_count_map,
        "PE - Sciences & Technologies"
      ),
      discipline_erc_count_total
    ),
    erc_ls_percent: percent(
      getFromMapOrZero(discipline_erc_count_map, "LS - Vie & Santé"),
      discipline_erc_count_total
    ),
    cnu_droit_percent: percent(
      getFromMapOrZero(
        cnu_count_by_category_count_map,
        "Droit, économie et gestion"
      ),
      cnu_count_by_category_count_total
    ),
    cnu_shs_percent: percent(
      getFromMapOrZero(
        cnu_count_by_category_count_map,
        "Lettres et sciences humaines"
      ),
      cnu_count_by_category_count_total
    ),
    cnu_science_percent: percent(
      getFromMapOrZero(cnu_count_by_category_count_map, "Sciences"),
      cnu_count_by_category_count_total
    ),
    cnu_pluri_percent: percent(
      getFromMapOrZero(cnu_count_by_category_count_map, "Pluridisciplinaire"),
      cnu_count_by_category_count_total
    ),
    cnu_sante_percent: percent(
      getFromMapOrZero(cnu_count_by_category_count_map, "Sections de santé"),
      cnu_count_by_category_count_total
    ),
  }
}

// Table //
const overview_data = []

discipline_data_by_project
  .entries()
  .forEach(([key, value]) =>
    overview_data.push(formatDomainPercents(key, value))
  )

console.debug("overview_data", overview_data)

const overview_table_erc = Inputs.table(overview_data, {
  // height: 400,
  columns: [
    "label",
    // "erc_sh_percent",
    // "erc_pe_percent",
    // "erc_ls_percent",
    "cnu_droit_percent",
    "cnu_shs_percent",
    "cnu_science_percent",
    "cnu_pluri_percent",
    "cnu_sante_percent",
  ],
  header: {
    label: "Project",
    erc_sh_percent: "% ERC SH",
    erc_pe_percent: "% ERC PE",
    erc_ls_percent: "% ERC VS",
    cnu_droit_percent: "% CNU Droit, économie et gestion",
    cnu_shs_percent: "% CNU Lettres et SH",
    cnu_science_percent: "% CNU Sciences",
    cnu_pluri_percent: "% CNU Pluridisciplinaire",
    cnu_sante_percent: "% CNU Santé",
  },
})

const overview_table_cnu = Inputs.table(overview_data, {
  // height: 400,
  columns: [
    "label",
    "erc_sh_percent",
    "erc_pe_percent",
    "erc_ls_percent",
    // "cnu_droit_percent",
    // "cnu_shs_percent",
    // "cnu_science_percent",
    // "cnu_pluri_percent",
    // "cnu_sante_percent",
  ],
  header: {
    label: "Project",
    erc_sh_percent: "% ERC SH",
    erc_pe_percent: "% ERC PE",
    erc_ls_percent: "% ERC VS",
    cnu_droit_percent: "% CNU Droit, économie et gestion",
    cnu_shs_percent: "% CNU Lettres et SH",
    cnu_science_percent: "% CNU Sciences",
    cnu_pluri_percent: "% CNU Pluridisciplinaire",
    cnu_sante_percent: "% CNU Santé",
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
  (d) => (exclude(d.discipline_erc) ? "found_erc" : "missing_erc")
)
missing_discipline_erc_count

const missing_cnu_count = d3.rollup(
  phase_1_data.researchers,
  (D) => D.length,
  (d) => (exclude(d.cnu) ? "found_cnu" : "missing_cnu")
)

const missing_financed_discipline_erc_count = d3.rollup(
  phase_1_data.researchers.filter((d) => isFinanced(d.project)),
  (D) => D.length,
  (d) => (exclude(d.discipline_erc) ? "found_erc" : "missing_erc")
)
missing_discipline_erc_count

const missing_financed_cnu_count = d3.rollup(
  phase_1_data.researchers.filter((d) => isFinanced(d.project)),
  (D) => D.length,
  (d) => (exclude(d.cnu) ? "found_cnu" : "missing_cnu")
)
```

<div class="grid grid-cols-4">
  <div class="card">
    <h2>Unspecified total researcher CNU data</h2>
    <span class="big">${`${((missing_cnu_count.get('missing_cnu') ? missing_cnu_count.get('missing_cnu') : 0) / ((missing_cnu_count.get('missing_cnu') ? missing_cnu_count.get('missing_cnu') : 0) + (missing_cnu_count.get('found_cnu') ? missing_cnu_count.get('found_cnu') : 0)) * 100)
        .toPrecision(3)
      }%`}</span>
  </div>
  <div class="card">
    <h2>Unspecified total ERC Discipline data</h2>
    <span class="big">${`${((missing_discipline_erc_count.get('missing_erc') ? missing_discipline_erc_count.get('missing_erc') : 0) / ((missing_discipline_erc_count.get('missing_erc') ? missing_discipline_erc_count.get('missing_erc') : 0) + (missing_discipline_erc_count.get('found_erc') ? missing_discipline_erc_count.get('found_erc') : 0)) * 100)
      .toPrecision(3)
    }%`}</span>
  </div>
  <div class="card">
    <h2>Unspecified financed researcher CNU data</h2>
    <span class="big">${`${((missing_financed_cnu_count.get('missing_cnu') ? missing_financed_cnu_count.get('missing_cnu') : 0) / ((missing_financed_cnu_count.get('missing_cnu') ? missing_financed_cnu_count.get('missing_cnu') : 0) + (missing_financed_cnu_count.get('found_cnu') ? missing_financed_cnu_count.get('found_cnu') : 0)) * 100)
        .toPrecision(3)
      }%`}</span>
  </div>
  <div class="card">
    <h2>Unspecified financed ERC Discipline data</h2>
    <span class="big">${`${((missing_financed_discipline_erc_count.get('missing_erc') ? missing_financed_discipline_erc_count.get('missing_erc') : 0) / ((missing_financed_discipline_erc_count.get('missing_erc') ? missing_financed_discipline_erc_count.get('missing_erc') : 0) + (missing_financed_discipline_erc_count.get('found_erc') ? missing_financed_discipline_erc_count.get('found_erc') : 0)) * 100)
      .toPrecision(3)
    }%`}</span>
  </div>
</div>
