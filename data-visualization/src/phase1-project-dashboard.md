---
title: Phase 1 Project Dashboard
theme: [dashboard, light]
---

# Project Disciplines

```js
import {
  countEntities,
  cropText,
  exclude
} from "./components/utilities.js";
import {
  extractPhase2Workbook,
} from "./components/phase1-dashboard.js";
import {
  donutChart
} from "./components/pie-chart.js";
import {
  cnu_category_map
} from './components/cnu.js';
import {
  getCategoryFromCNU,
  colorCNU
} from "./components/color.js";
```

<div class="warning" label="Data visualization notice">
  <ul>
    <li>Researchers with multiple disciplines are counted once per discipline.</li>
    <li>Missing researcher data is not visualized by default.</li>
    <li>Data has not yet been verified. Some visualizations may be incorrect.</li>
    <li>Bar charts use graded coloring based on a logarithmic scale (see CNU color legend).</li>
  </ul>
</div>

```js
function generateCnuPlotLegend({
  width = 300,
  marginLeft = 0,
  domain = [1, 10],
  range = [0.4, 1],
} = {}) {

  return [
    Plot.legend({
      label: 'Droit, économie et gestion',
      marginLeft: marginLeft,
      width: width,
      color: {
        domain: domain,
        range: range,
        type: "log",
        scheme: "Reds"
      }
    }),
    Plot.legend({
      label: 'Lettres et sciences humaines',
      marginLeft: marginLeft,
      width: width,
      color: {
        domain: domain,
        range: range,
        type: "log",
        scheme: "Oranges"
      }
    }),
    Plot.legend({
      label: 'Sciences',
      marginLeft: marginLeft,
      width: width,
      color: {
        domain: domain,
        range: range,
        type: "log",
        scheme: "Blues"
      }
    }),
    Plot.legend({
      label: 'Pluridisciplinaire',
      marginLeft: marginLeft,
      width: width,
      color: {
        domain: domain,
        range: range,
        type: "log",
        scheme: "Purples"
      }
    }),
    Plot.legend({
      label: 'Sections de santé',
      marginLeft: marginLeft,
      width: width,
      color: {
        domain: domain,
        range: range,
        type: "log",
        scheme: "Greens"
      }
    }),
    Plot.legend({
      label: 'Other',
      marginLeft: marginLeft,
      width: width,
      color: {
        domain: domain,
        range: range,
        type: "log",
        scheme: "Greys"
      }
    }),
  ]
}
```

<h3>CNU color legend</h3>
<div>${generateCnuPlotLegend()[0]}</div>
<div>${generateCnuPlotLegend()[1]}</div>
<div>${generateCnuPlotLegend()[2]}</div>
<div>${generateCnuPlotLegend()[3]}</div>
<div>${generateCnuPlotLegend()[4]}</div>
<div>${generateCnuPlotLegend()[5]}</div>

```js
const workbook1 = FileAttachment(
  // "./data/private/250120 PEPR_VBDI_analyse modifiée JYT.xlsx" //outdated
  "./data/private/250120 PEPR_VBDI_analyse modifiée JYT_financed_redacted.xlsx"
).xlsx();

// /**
//  * Given a string starting with a CNU number, return the number
//  *
//  * @param {String} cnu - The CNU full name
//  * @returns {Number} The CNU number
//  */
// function getCnuNumber(cnu) {
//   return Number(cnu.trim().substring(0, 2));
// }


// detect if a CNU is SHS ( 7 <= cnu <= 24)
// function isSHSCNU(cnu) {
//   const cnu_number = getCnuNumber(cnu);
//   return cnu_number >= 7 && cnu_number <= 24;
// };

const cnu_category_plot_options = {
  width: 800,
  height: 450,
  legendLeftMargin: 60,
  keyMap: (d) => d[0],
  valueMap: (d) => d[1],
  colorMap: (d) => d[0],
  color: d3
    .scaleOrdinal(d3.schemeCategory10)
    .domain(cnu_category_map.keys())
    .unknown("grey"),
};

function generateCnuPlotOptions(data, sort="y", height=350) {
  return {
    // width: 500,
    height: height,
    marginTop: 50,
    marginLeft: 200,
    y: {
      label: "CNU",
      tickRotate: 10,
      tickFormat: (d) => cropText(d, 40),
    },
    x: {
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
        sort: {y: sort},
        tip: {
          format: {
            fill: false,
          },
          lineWidth: 25,
          textOverflow: "ellipsis-end"
        }
      }),
      Plot.barX(
        data, 
        Plot.pointerY({
          x: (d) => d[1],
          y: (d) => d[0],
          fill: "white",
          opacity: 0.5,
        }),
      ),
      Plot.text(data, {
        x: 0,
        y: (d) => d[1],
      })
    ],
  }   
};

const cnu_plot_sort_values = new Map([
  ['CNU', 'y'],
  ['Occurrences', '-x'],
]);
const cnu_plot_sort_options = {
  label: "Sorted by",
};

// const shs_cnu_plot_options = {
//   width: 800,
//   height: 450,
//   keyMap: (d) => d[0],
//   valueMap: (d) => d[1],
//   legendLeftMargin: 110,
// };

const erc_category_colors = new Map([
  ['PE - Sciences & Technologies', d3.schemeCategory10[0]],
  ['LS - Vie & Santé', d3.schemeCategory10[2]],
  ['SH - Sciences Humaines & Sociales', "OrangeRed"],
  ['non chercheur', "grey"],
]);

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
  legendLeftMargin: 110,
};
```

```js
// format data
const phase_2_data = extractPhase2Workbook(workbook1, false);
console.debug('phase_2_data', phase_2_data);

const financed_projects = phase_2_data.projects
  .filter((d) => d.financed)
  .map((d) => d.acronyme);
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
// console.debug('financed_projects', financed_projects);

function isFinanced(projects) {
  for (let index = 0; index < projects.length; index++) {
    if (financed_projects.includes(projects[index]))
      return true;
  }
  return false;
};

// Get relevant data by project,
// set financed flag to true if filtering out non-financed project data
function formatResearcherDataByProject(project, financed=false) {
  // filter by project if project, otherwise keep everything
  const filtered_researchers = phase_2_data.researchers.filter(
    (d) => (
      project ?
        d.project.includes(project) :
        true
    ) &&
    (
      financed ?
        d.project.some((researcher_project) =>
          financed_projects.includes(researcher_project)) :
        true
    )
  );

  const discipline_erc_count = countEntities(
    filtered_researchers,
    (d) => d.discipline_erc
  )
  .filter((d) => exclude(d[0]))
  .sort((a, b) => d3.descending(a[1], b[1]));

  const cnu_count = d3.rollups(
      filtered_researchers,
      (d) => d.length,
      (d) => d.cnu
    )
    .filter((d) => exclude(d[0]))
    .sort((a, b) => d3.descending(a[1], b[1]));

  // const shs_cnu_count = cnu_count
  //   .filter((d) => isSHSCNU(d[0]));

  // const shs_cnu_percent = d3.rollups(
  //   cnu_count,
  //   (D) => D.length,
  //   (d) => isSHSCNU(d[0]) ? 'SHS' : 'non-SHS'
  // );

  const cnu_count_by_category = d3.rollups(
    filtered_researchers,
    (D) => D.length,
    (d) => d.cnu ? getCategoryFromCNU(d.cnu) : null
  ).filter((d) => !!d[0]); //TODO: add missing information to data quality check
  // debugger;

  return {
    discipline_erc_count: discipline_erc_count,
    cnu_count: cnu_count,
    // shs_cnu_count: shs_cnu_count,
    // shs_cnu_percent: shs_cnu_percent,
    cnu_count_by_category: cnu_count_by_category,
  }
};
```

## All Projects
```js
const all_project_researcher_data = formatResearcherDataByProject();
// console.debug('all_project_researcher_data', all_project_researcher_data);
```

```js
const discipline_erc_pie = donutChart(
  all_project_researcher_data.discipline_erc_count,
  discipline_erc_pie_options
);
```

<!-- ```js
const shs_cnu_plot = donutChart(
  all_project_researcher_data.shs_cnu_count,
  shs_cnu_plot_options
);
``` -->

```js
const cnu_category_plot = donutChart(
  all_project_researcher_data.cnu_count_by_category,
  cnu_category_plot_options
);
```

```js
const cnu_plot_sort_input = Inputs.select(
  cnu_plot_sort_values,
  cnu_plot_sort_options
);

const cnu_plot_sort = Generators.input(cnu_plot_sort_input);

const all_project_cnu_max = Math.max(
  ...all_project_researcher_data.cnu_count.map((d) => d[1])
);
```

```js
const cnu_plot = Plot.plot(
  generateCnuPlotOptions(all_project_researcher_data.cnu_count, cnu_plot_sort, 800)
);
```

<div class="grid grid-cols-2">
  <div class="card grid-colspan-1">
    <h2>CNU Categories</h2>
    <div>${cnu_category_plot}</div>
  </div>
  <div class="card grid-colspan-1 grid-rowspan-2">
    <h2>Detailed CNUs</h2>
    <div style="padding: 5px;">${cnu_plot_sort_input}</div>
    <!-- <h3 style="padding-left: 200px;">Legend</h3> -->
    <!-- <div>${generateCnuPlotLegend(all_project_cnu_max)[0]}</div> -->
    <!-- <div>${generateCnuPlotLegend(all_project_cnu_max)[1]}</div> -->
    <!-- <div>${generateCnuPlotLegend(all_project_cnu_max)[2]}</div> -->
    <!-- <div>${generateCnuPlotLegend(all_project_cnu_max)[3]}</div> -->
    <!-- <div>${generateCnuPlotLegend(all_project_cnu_max)[4]}</div> -->
    <!-- <div>${generateCnuPlotLegend(all_project_cnu_max)[5]}</div> -->
    <div style="max-height: 950px;">${cnu_plot}</div>
  </div>
  <!-- <div class="card grid-colspan-1">
    <h2>CNUs SHS</h2>
    <div>${shs_cnu_plot}</div>
  </div> -->
  <div class="card grid-colspan-1">
    <h2>ERC Disciplines</h2>
    <div>${discipline_erc_pie}</div>
  </div>
</div>


## Financed Projects
```js
const financed_project_researcher_data = formatResearcherDataByProject(undefined, true);
// console.debug('financed_project_researcher_data', financed_project_researcher_data);
```

```js
const financed_discipline_erc_pie = donutChart(
  financed_project_researcher_data.discipline_erc_count,
  discipline_erc_pie_options
);
```

<!-- ```js
const financed_shs_cnu_plot = donutChart(
  financed_project_researcher_data.shs_cnu_count,
  shs_cnu_plot_options
);
``` -->

```js
const financed_cnu_category_plot = donutChart(
  financed_project_researcher_data.cnu_count_by_category,
  cnu_category_plot_options
);
```

```js
const financed_cnu_plot_sort_input = Inputs.select(
  cnu_plot_sort_values,
  cnu_plot_sort_options
);

const financed_cnu_plot_sort = Generators.input(financed_cnu_plot_sort_input);

const financed_project_cnu_max = Math.max(
  ...financed_project_researcher_data.cnu_count.map((d) => d[1])
);
```

```js
const financed_cnu_plot = Plot.plot(
  generateCnuPlotOptions(financed_project_researcher_data.cnu_count, financed_cnu_plot_sort, 800)
);
```

<div class="grid grid-cols-2">
  <div class="card grid-colspan-1">
    <h2>CNU Categories</h2>
    <div>${financed_cnu_category_plot}</div>
  </div>
  <div class="card grid-colspan-1 grid-rowspan-2">
    <h2>Detailed CNUs</h2>
    <div style="padding: 5px;">${financed_cnu_plot_sort_input}</div>
    <!-- <h3 style="padding-left: 200px;">Legend</h3> -->
    <!-- <div>${generateCnuPlotLegend(financed_project_cnu_max)[0]}</div> -->
    <!-- <div>${generateCnuPlotLegend(financed_project_cnu_max)[1]}</div> -->
    <!-- <div>${generateCnuPlotLegend(financed_project_cnu_max)[2]}</div> -->
    <!-- <div>${generateCnuPlotLegend(financed_project_cnu_max)[3]}</div> -->
    <!-- <div>${generateCnuPlotLegend(financed_project_cnu_max)[4]}</div> -->
    <!-- <div>${generateCnuPlotLegend(financed_project_cnu_max)[5]}</div> -->
    <div style="max-height: 950px;">${financed_cnu_plot}</div>
  </div>
  <!-- <div class="card grid-colspan-1">
    <h2>CNUs SHS</h2>
    <div>${financed_shs_cnu_plot}</div>
  </div> -->
  <div class="card grid-colspan-1">
    <h2>ERC Disciplines</h2>
    <div>${financed_discipline_erc_pie}</div>
  </div>
</div>

### Financed Project Summary

```js
function formatDomainPercents(data, label) {
  // debugger;
  const percent = (value, total) => `${(value / total * 100).toPrecision(3)}%`;
  const getFromMapOrZero = (map, value) => map.has(value) ? map.get(value) : 0;

  const discipline_erc_count_map = new Map(data.discipline_erc_count);
  const discipline_erc_count_total =
    getFromMapOrZero(discipline_erc_count_map, 'SH - Sciences Humaines & Sociales') +
    getFromMapOrZero(discipline_erc_count_map, 'PE - Sciences & Technologies') + 
    getFromMapOrZero(discipline_erc_count_map, 'LS - Vie & Santé') + 
    getFromMapOrZero(discipline_erc_count_map, 'non chercheur');

  const cnu_count_by_category_count_map = new Map(data.cnu_count_by_category);
  const cnu_count_by_category_count_total =
    getFromMapOrZero(cnu_count_by_category_count_map, 'Droit, économie et gestion') +
    getFromMapOrZero(cnu_count_by_category_count_map, 'Lettres et sciences humaines') +
    getFromMapOrZero(cnu_count_by_category_count_map, 'Sciences') +
    getFromMapOrZero(cnu_count_by_category_count_map, 'Pluridisciplinaire') +
    getFromMapOrZero(cnu_count_by_category_count_map, 'Sections de santé');

  return {
    label: label,
    erc_sh_percent: percent(
      getFromMapOrZero(discipline_erc_count_map, 'SH - Sciences Humaines & Sociales'),
      discipline_erc_count_total
    ),
    erc_pe_percent: percent(
      getFromMapOrZero(discipline_erc_count_map, 'PE - Sciences & Technologies'),
      discipline_erc_count_total
    ),
    erc_ls_percent: percent(
      getFromMapOrZero(discipline_erc_count_map, 'LS - Vie & Santé'),
      discipline_erc_count_total
    ),
    cnu_droit_percent: percent(
      getFromMapOrZero(cnu_count_by_category_count_map, 'Droit, économie et gestion'),
      cnu_count_by_category_count_total
    ),
    cnu_shs_percent: percent(
      getFromMapOrZero(cnu_count_by_category_count_map, 'Lettres et sciences humaines'),
      cnu_count_by_category_count_total
    ),
    cnu_science_percent: percent(
      getFromMapOrZero(cnu_count_by_category_count_map, 'Sciences'),
      cnu_count_by_category_count_total
    ),
    cnu_pluri_percent: percent(
      getFromMapOrZero(cnu_count_by_category_count_map, 'Pluridisciplinaire'),
      cnu_count_by_category_count_total
    ),
    cnu_sante_percent: percent(
      getFromMapOrZero(cnu_count_by_category_count_map, 'Sections de santé'),
      cnu_count_by_category_count_total
    ),
  };
};

// Table //
const overview_data = [];
overview_data.push(formatDomainPercents(neo_project_researcher_data, 'NÉO'));
overview_data.push(formatDomainPercents(RESILIENCE_project_researcher_data, 'RÉSILIENCE'));
overview_data.push(formatDomainPercents(TRACES_project_researcher_data, 'TRACES'));
overview_data.push(formatDomainPercents(vfpp_project_researcher_data, 'VF++'));
overview_data.push(formatDomainPercents(VILLEGARDEN_project_researcher_data, 'VILLEGARDEN'));
overview_data.push(formatDomainPercents(WHAOU_project_researcher_data, 'WHAOU'));
overview_data.push(formatDomainPercents(inteGREEN_project_researcher_data, 'inteGREEN'));
overview_data.push(formatDomainPercents(URBHEALTH_project_researcher_data, 'URBHEALTH'));
overview_data.push(formatDomainPercents(financed_project_researcher_data, 'Total Financed'));

console.debug("overview_data", overview_data);

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
    "label": "Project",
    "erc_sh_percent": "% ERC SH",
    "erc_pe_percent": "% ERC PE",
    "erc_ls_percent": "% ERC VS",
    "cnu_droit_percent": "% CNU Droit, économie et gestion",
    "cnu_shs_percent": "% CNU Lettres et SH",
    "cnu_science_percent": "% CNU Sciences",
    "cnu_pluri_percent": "% CNU Pluridisciplinaire",
    "cnu_sante_percent": "% CNU Santé",
  },
});

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
    "label": "Project",
    "erc_sh_percent": "% ERC SH",
    "erc_pe_percent": "% ERC PE",
    "erc_ls_percent": "% ERC VS",
    "cnu_droit_percent": "% CNU Droit, économie et gestion",
    "cnu_shs_percent": "% CNU Lettres et SH",
    "cnu_science_percent": "% CNU Sciences",
    "cnu_pluri_percent": "% CNU Pluridisciplinaire",
    "cnu_sante_percent": "% CNU Santé",
  },
});
```

<div class="grid grid-cols-2">
  <div class="card grid-colspan-1">${overview_table_erc}</div>
  <div class="card grid-colspan-1">${overview_table_cnu}</div>
</div>


## NÉO

```js
const neo_project_researcher_data = formatResearcherDataByProject("NÉO", true);
// console.debug('neo_project_researcher_data', neo_project_researcher_data);
```

```js
const neo_discipline_erc_pie = donutChart(
  neo_project_researcher_data.discipline_erc_count,
  discipline_erc_pie_options
);
```

<!-- ```js
const neo_shs_cnu_plot = donutChart(
  neo_project_researcher_data.shs_cnu_count,
  shs_cnu_plot_options
);
``` -->

```js
const neo_cnu_category_plot = donutChart(
  neo_project_researcher_data.cnu_count_by_category,
  cnu_category_plot_options
);
```

```js
const neo_cnu_plot_sort_input = Inputs.select(
  cnu_plot_sort_values,
  cnu_plot_sort_options
);

const neo_cnu_plot_sort = Generators.input(neo_cnu_plot_sort_input);

const neo_project_cnu_max = Math.max(
  ...neo_project_researcher_data.cnu_count.map((d) => d[1])
);
```

```js
const neo_cnu_plot = Plot.plot(
  generateCnuPlotOptions(neo_project_researcher_data.cnu_count, neo_cnu_plot_sort)
);
```

<div class="grid grid-cols-2">
  <div class="card grid-colspan-1">
    <h2>CNU Categories</h2>
    <div>${neo_cnu_category_plot}</div>
  </div>
  <div class="card grid-colspan-1 grid-rowspan-1">
    <h2>Detailed CNUs</h2>
    <div style="padding: 5px;">${neo_cnu_plot_sort_input}</div>
    <!-- <h3 style="padding-left: 200px;">Legend</h3> -->
    <!-- <div>${generateCnuPlotLegend(neo_project_cnu_max)[0]}</div> -->
    <!-- <div>${generateCnuPlotLegend(neo_project_cnu_max)[1]}</div> -->
    <!-- <div>${generateCnuPlotLegend(neo_project_cnu_max)[2]}</div> -->
    <!-- <div>${generateCnuPlotLegend(neo_project_cnu_max)[3]}</div> -->
    <!-- <div>${generateCnuPlotLegend(neo_project_cnu_max)[4]}</div> -->
    <!-- <div>${generateCnuPlotLegend(neo_project_cnu_max)[5]}</div> -->
    <div style="max-height: 950px;">${neo_cnu_plot}</div>
  </div>
  <!-- <div class="card grid-colspan-1">
    <h2>CNUs SHS</h2>
    <div>${neo_shs_cnu_plot}</div>
  </div> -->
  <div class="card grid-colspan-1">
    <h2>ERC Disciplines</h2>
    <div>${neo_discipline_erc_pie}</div>
  </div>
</div>


## RÉSILIENCE

```js
const RESILIENCE_project_researcher_data = formatResearcherDataByProject("RÉSILIENCE", true);
// console.debug('RESILIENCE_project_researcher_data', RESILIENCE_project_researcher_data);
```

```js
const RESILIENCE_discipline_erc_pie = donutChart(
  RESILIENCE_project_researcher_data.discipline_erc_count,
  discipline_erc_pie_options
);
```

<!-- ```js
const RESILIENCE_shs_cnu_plot = donutChart(
  RESILIENCE_project_researcher_data.shs_cnu_count,
  shs_cnu_plot_options
);
``` -->

```js
const RESILIENCE_cnu_category_plot = donutChart(
  RESILIENCE_project_researcher_data.cnu_count_by_category,
  cnu_category_plot_options
);
```

```js
const RESILIENCE_cnu_plot_sort_input = Inputs.select(
  cnu_plot_sort_values,
  cnu_plot_sort_options
);

const RESILIENCE_cnu_plot_sort = Generators.input(RESILIENCE_cnu_plot_sort_input);

const RESILIENCE_project_cnu_max = Math.max(
  ...RESILIENCE_project_researcher_data.cnu_count.map((d) => d[1])
);
```

```js
const RESILIENCE_cnu_plot = Plot.plot(
  generateCnuPlotOptions(RESILIENCE_project_researcher_data.cnu_count, RESILIENCE_cnu_plot_sort)
);
```

<div class="grid grid-cols-2">
  <div class="card grid-colspan-1">
    <h2>CNU Categories</h2>
    <div>${RESILIENCE_cnu_category_plot}</div>
  </div>
  <div class="card grid-colspan-1 grid-rowspan-1">
    <h2>Detailed CNUs</h2>
    <div style="padding: 5px;">${RESILIENCE_cnu_plot_sort_input}</div>
    <!-- <h3 style="padding-left: 200px;">Legend</h3> -->
    <!-- <div>${generateCnuPlotLegend(RESILIENCE_project_cnu_max)[0]}</div> -->
    <!-- <div>${generateCnuPlotLegend(RESILIENCE_project_cnu_max)[1]}</div> -->
    <!-- <div>${generateCnuPlotLegend(RESILIENCE_project_cnu_max)[2]}</div> -->
    <!-- <div>${generateCnuPlotLegend(RESILIENCE_project_cnu_max)[3]}</div> -->
    <!-- <div>${generateCnuPlotLegend(RESILIENCE_project_cnu_max)[4]}</div> -->
    <!-- <div>${generateCnuPlotLegend(RESILIENCE_project_cnu_max)[5]}</div> -->
    <div style="max-height: 950px;">${RESILIENCE_cnu_plot}</div>
  </div>
  <!-- <div class="card grid-colspan-1">
    <h2>CNUs SHS</h2>
    <div>${RESILIENCE_shs_cnu_plot}</div>
  </div> -->
  <div class="card grid-colspan-1">
    <h2>ERC Disciplines</h2>
    <div>${RESILIENCE_discipline_erc_pie}</div>
  </div>
</div>


## TRACES

```js
const TRACES_project_researcher_data = formatResearcherDataByProject("TRACES", true);
// console.debug('TRACES_project_researcher_data', TRACES_project_researcher_data);
```

```js
const TRACES_discipline_erc_pie = donutChart(
  TRACES_project_researcher_data.discipline_erc_count,
  discipline_erc_pie_options
);
```

<!-- ```js
const TRACES_shs_cnu_plot = donutChart(
  TRACES_project_researcher_data.shs_cnu_count,
  shs_cnu_plot_options
);
``` -->

```js
const TRACES_cnu_category_plot = donutChart(
  TRACES_project_researcher_data.cnu_count_by_category,
  cnu_category_plot_options
);
```

```js
const TRACES_cnu_plot_sort_input = Inputs.select(
  cnu_plot_sort_values,
  cnu_plot_sort_options
);

const TRACES_cnu_plot_sort = Generators.input(TRACES_cnu_plot_sort_input);

const TRACES_project_cnu_max = Math.max(
  ...TRACES_project_researcher_data.cnu_count.map((d) => d[1])
);
```

```js
const TRACES_cnu_plot = Plot.plot(
  generateCnuPlotOptions(TRACES_project_researcher_data.cnu_count, TRACES_cnu_plot_sort)
);
```

<div class="grid grid-cols-2">
  <div class="card grid-colspan-1">
    <h2>CNU Categories</h2>
    <div>${TRACES_cnu_category_plot}</div>
  </div>
  <div class="card grid-colspan-1 grid-rowspan-1">
    <h2>Detailed CNUs</h2>
    <div style="padding: 5px;">${TRACES_cnu_plot_sort_input}</div>
    <!-- <h3 style="padding-left: 200px;">Legend</h3> -->
    <!-- <div>${generateCnuPlotLegend(TRACES_project_cnu_max)[0]}</div> -->
    <!-- <div>${generateCnuPlotLegend(TRACES_project_cnu_max)[1]}</div> -->
    <!-- <div>${generateCnuPlotLegend(TRACES_project_cnu_max)[2]}</div> -->
    <!-- <div>${generateCnuPlotLegend(TRACES_project_cnu_max)[3]}</div> -->
    <!-- <div>${generateCnuPlotLegend(TRACES_project_cnu_max)[4]}</div> -->
    <!-- <div>${generateCnuPlotLegend(TRACES_project_cnu_max)[5]}</div> -->
    <div style="max-height: 950px;">${TRACES_cnu_plot}</div>
  </div>
  <!-- <div class="card grid-colspan-1">
    <h2>CNUs SHS</h2>
    <div>${TRACES_shs_cnu_plot}</div>
  </div> -->
  <div class="card grid-colspan-1">
    <h2>ERC Disciplines</h2>
    <div>${TRACES_discipline_erc_pie}</div>
  </div>
</div>

## VF++

```js
const vfpp_project_researcher_data = formatResearcherDataByProject("VF++", true);
// console.debug('vfpp_project_researcher_data', vfpp_project_researcher_data);
```

```js
const vfpp_discipline_erc_pie = donutChart(
  vfpp_project_researcher_data.discipline_erc_count,
  discipline_erc_pie_options
);
```

<!-- ```js
const vfpp_shs_cnu_plot = donutChart(
  vfpp_project_researcher_data.shs_cnu_count,
  shs_cnu_plot_options
);
``` -->

```js
const vfpp_cnu_category_plot = donutChart(
  vfpp_project_researcher_data.cnu_count_by_category,
  cnu_category_plot_options
);
```

```js
const vfpp_cnu_plot_sort_input = Inputs.select(
  cnu_plot_sort_values,
  cnu_plot_sort_options
);

const vfpp_cnu_plot_sort = Generators.input(vfpp_cnu_plot_sort_input);

const vfpp_project_cnu_max = Math.max(
  ...vfpp_project_researcher_data.cnu_count.map((d) => d[1])
);
```

```js
const vfpp_cnu_plot = Plot.plot(
  generateCnuPlotOptions(vfpp_project_researcher_data.cnu_count, vfpp_cnu_plot_sort)
);
```

<div class="grid grid-cols-2">
  <div class="card grid-colspan-1">
    <h2>CNU Categories</h2>
    <div>${vfpp_cnu_category_plot}</div>
  </div>
  <div class="card grid-colspan-1 grid-rowspan-1">
    <h2>Detailed CNUs</h2>
    <div style="padding: 5px;">${vfpp_cnu_plot_sort_input}</div>
    <!-- <h3 style="padding-left: 200px;">Legend</h3> -->
    <!-- <div>${generateCnuPlotLegend(vfpp_project_cnu_max)[0]}</div> -->
    <!-- <div>${generateCnuPlotLegend(vfpp_project_cnu_max)[1]}</div> -->
    <!-- <div>${generateCnuPlotLegend(vfpp_project_cnu_max)[2]}</div> -->
    <!-- <div>${generateCnuPlotLegend(vfpp_project_cnu_max)[3]}</div> -->
    <!-- <div>${generateCnuPlotLegend(vfpp_project_cnu_max)[4]}</div> -->
    <!-- <div>${generateCnuPlotLegend(vfpp_project_cnu_max)[5]}</div> -->
    <div style="max-height: 950px;">${vfpp_cnu_plot}</div>
  </div>
  <!-- <div class="card grid-colspan-1">
    <h2>CNUs SHS</h2>
    <div>${vfpp_shs_cnu_plot}</div>
  </div> -->
  <div class="card grid-colspan-1">
    <h2>ERC Disciplines</h2>
    <div>${vfpp_discipline_erc_pie}</div>
  </div>
</div>


## VILLEGARDEN

```js
const VILLEGARDEN_project_researcher_data = formatResearcherDataByProject("VILLEGARDEN", true);
// console.debug('VILLEGARDEN_project_researcher_data', VILLEGARDEN_project_researcher_data);
```

```js
const VILLEGARDEN_discipline_erc_pie = donutChart(
  VILLEGARDEN_project_researcher_data.discipline_erc_count,
  discipline_erc_pie_options
);
```

<!-- ```js
const VILLEGARDEN_shs_cnu_plot = donutChart(
  VILLEGARDEN_project_researcher_data.shs_cnu_count,
  shs_cnu_plot_options
);
``` -->

```js
const VILLEGARDEN_cnu_category_plot = donutChart(
  VILLEGARDEN_project_researcher_data.cnu_count_by_category,
  cnu_category_plot_options
);
```

```js
const VILLEGARDEN_cnu_plot_sort_input = Inputs.select(
  cnu_plot_sort_values,
  cnu_plot_sort_options
);

const VILLEGARDEN_cnu_plot_sort = Generators.input(VILLEGARDEN_cnu_plot_sort_input);

const VILLEGARDEN_project_cnu_max = Math.max(
  ...VILLEGARDEN_project_researcher_data.cnu_count.map((d) => d[1])
);
```

```js
const VILLEGARDEN_cnu_plot = Plot.plot(
  generateCnuPlotOptions(VILLEGARDEN_project_researcher_data.cnu_count, VILLEGARDEN_cnu_plot_sort)
);
```

<div class="grid grid-cols-2">
  <div class="card grid-colspan-1">
    <h2>CNU Categories</h2>
    <div>${VILLEGARDEN_cnu_category_plot}</div>
  </div>
  <div class="card grid-colspan-1 grid-rowspan-1">
    <h2>Detailed CNUs</h2>
    <div style="padding: 5px;">${VILLEGARDEN_cnu_plot_sort_input}</div>
    <!-- <h3 style="padding-left: 200px;">Legend</h3> -->
    <!-- <div>${generateCnuPlotLegend(VILLEGARDEN_project_cnu_max)[0]}</div> -->
    <!-- <div>${generateCnuPlotLegend(VILLEGARDEN_project_cnu_max)[1]}</div> -->
    <!-- <div>${generateCnuPlotLegend(VILLEGARDEN_project_cnu_max)[2]}</div> -->
    <!-- <div>${generateCnuPlotLegend(VILLEGARDEN_project_cnu_max)[3]}</div> -->
    <!-- <div>${generateCnuPlotLegend(VILLEGARDEN_project_cnu_max)[4]}</div> -->
    <!-- <div>${generateCnuPlotLegend(VILLEGARDEN_project_cnu_max)[5]}</div> -->
    <div style="max-height: 950px;">${VILLEGARDEN_cnu_plot}</div>
  </div>
  <!-- <div class="card grid-colspan-1">
    <h2>CNUs SHS</h2>
    <div>${VILLEGARDEN_shs_cnu_plot}</div>
  </div> -->
  <div class="card grid-colspan-1">
    <h2>ERC Disciplines</h2>
    <div>${VILLEGARDEN_discipline_erc_pie}</div>
  </div>
</div>

## WHAOU

```js
const WHAOU_project_researcher_data = formatResearcherDataByProject("WHAOU", true);
// console.debug('WHAOU_project_researcher_data', WHAOU_project_researcher_data);
```

```js
const WHAOU_discipline_erc_pie = donutChart(
  WHAOU_project_researcher_data.discipline_erc_count,
  discipline_erc_pie_options
);
```

<!-- ```js
const WHAOU_shs_cnu_plot = donutChart(
  WHAOU_project_researcher_data.shs_cnu_count,
  shs_cnu_plot_options
);
``` -->

```js
const WHAOU_cnu_category_plot = donutChart(
  WHAOU_project_researcher_data.cnu_count_by_category,
  cnu_category_plot_options
);
```

```js
const WHAOU_cnu_plot_sort_input = Inputs.select(
  cnu_plot_sort_values,
  cnu_plot_sort_options
);

const WHAOU_cnu_plot_sort = Generators.input(WHAOU_cnu_plot_sort_input);

const WHAOU_project_cnu_max = Math.max(
  ...WHAOU_project_researcher_data.cnu_count.map((d) => d[1])
);
```

```js
const WHAOU_cnu_plot = Plot.plot(
  generateCnuPlotOptions(WHAOU_project_researcher_data.cnu_count, WHAOU_cnu_plot_sort)
);
```

<div class="grid grid-cols-2">
  <div class="card grid-colspan-1">
    <h2>CNU Categories</h2>
    <div>${WHAOU_cnu_category_plot}</div>
  </div>
  <div class="card grid-colspan-1 grid-rowspan-1">
    <h2>Detailed CNUs</h2>
    <div style="padding: 5px;">${WHAOU_cnu_plot_sort_input}</div>
    <!-- <h3 style="padding-left: 200px;">Legend</h3> -->
    <!-- <div>${generateCnuPlotLegend(WHAOU_project_cnu_max)[0]}</div> -->
    <!-- <div>${generateCnuPlotLegend(WHAOU_project_cnu_max)[1]}</div> -->
    <!-- <div>${generateCnuPlotLegend(WHAOU_project_cnu_max)[2]}</div> -->
    <!-- <div>${generateCnuPlotLegend(WHAOU_project_cnu_max)[3]}</div> -->
    <!-- <div>${generateCnuPlotLegend(WHAOU_project_cnu_max)[4]}</div> -->
    <!-- <div>${generateCnuPlotLegend(WHAOU_project_cnu_max)[5]}</div> -->
    <div style="max-height: 950px;">${WHAOU_cnu_plot}</div>
  </div>
  <!-- <div class="card grid-colspan-1">
    <h2>CNUs SHS</h2>
    <div>${WHAOU_shs_cnu_plot}</div>
  </div> -->
  <div class="card grid-colspan-1">
    <h2>ERC Disciplines</h2>
    <div>${WHAOU_discipline_erc_pie}</div>
  </div>
</div>


## inteGREEN

```js
const inteGREEN_project_researcher_data = formatResearcherDataByProject("inteGREEN", true);
// console.debug('inteGREEN_project_researcher_data', inteGREEN_project_researcher_data);
```

```js
const inteGREEN_discipline_erc_pie = donutChart(
  inteGREEN_project_researcher_data.discipline_erc_count,
  discipline_erc_pie_options
);
```

<!-- ```js
const inteGREEN_shs_cnu_plot = donutChart(
  inteGREEN_project_researcher_data.shs_cnu_count,
  shs_cnu_plot_options
);
``` -->

```js
const inteGREEN_cnu_category_plot = donutChart(
  inteGREEN_project_researcher_data.cnu_count_by_category,
  cnu_category_plot_options
);
```

```js
const inteGREEN_cnu_plot_sort_input = Inputs.select(
  cnu_plot_sort_values,
  cnu_plot_sort_options
);

const inteGREEN_cnu_plot_sort = Generators.input(inteGREEN_cnu_plot_sort_input);

const inteGREEN_project_cnu_max = Math.max(
  ...inteGREEN_project_researcher_data.cnu_count.map((d) => d[1])
);
```

```js
const inteGREEN_cnu_plot = Plot.plot(
  generateCnuPlotOptions(inteGREEN_project_researcher_data.cnu_count, inteGREEN_cnu_plot_sort)
);
```

<div class="grid grid-cols-2">
  <div class="card grid-colspan-1">
    <h2>CNU Categories</h2>
    <div>${inteGREEN_cnu_category_plot}</div>
  </div>
  <div class="card grid-colspan-1 grid-rowspan-1">
    <h2>Detailed CNUs</h2>
    <div style="padding: 5px;">${inteGREEN_cnu_plot_sort_input}</div>
    <!-- <h3 style="padding-left: 200px;">Legend</h3> -->
    <!-- <div>${generateCnuPlotLegend(inteGREEN_project_cnu_max)[0]}</div> -->
    <!-- <div>${generateCnuPlotLegend(inteGREEN_project_cnu_max)[1]}</div> -->
    <!-- <div>${generateCnuPlotLegend(inteGREEN_project_cnu_max)[2]}</div> -->
    <!-- <div>${generateCnuPlotLegend(inteGREEN_project_cnu_max)[3]}</div> -->
    <!-- <div>${generateCnuPlotLegend(inteGREEN_project_cnu_max)[4]}</div> -->
    <!-- <div>${generateCnuPlotLegend(inteGREEN_project_cnu_max)[5]}</div> -->
    <div style="max-height: 950px;">${inteGREEN_cnu_plot}</div>
  </div>
  <!-- <div class="card grid-colspan-1">
    <h2>CNUs SHS</h2>
    <div>${inteGREEN_shs_cnu_plot}</div>
  </div> -->
  <div class="card grid-colspan-1">
    <h2>ERC Disciplines</h2>
    <div>${inteGREEN_discipline_erc_pie}</div>
  </div>
</div>


## URBHEALTH

```js
const URBHEALTH_project_researcher_data = formatResearcherDataByProject("URBHEALTH", true);
// console.debug('URBHEALTH_project_researcher_data', URBHEALTH_project_researcher_data);
```

```js
const URBHEALTH_discipline_erc_pie = donutChart(
  URBHEALTH_project_researcher_data.discipline_erc_count,
  discipline_erc_pie_options
);
```

<!-- ```js
const URBHEALTH_shs_cnu_plot = donutChart(
  URBHEALTH_project_researcher_data.shs_cnu_count,
  shs_cnu_plot_options
);
``` -->

```js
const URBHEALTH_cnu_category_plot = donutChart(
  URBHEALTH_project_researcher_data.cnu_count_by_category,
  cnu_category_plot_options
);
```

```js
const URBHEALTH_cnu_plot_sort_input = Inputs.select(
  cnu_plot_sort_values,
  cnu_plot_sort_options
);

const URBHEALTH_cnu_plot_sort = Generators.input(URBHEALTH_cnu_plot_sort_input);

const URBHEALTH_project_cnu_max = Math.max(
  ...URBHEALTH_project_researcher_data.cnu_count.map((d) => d[1])
);
```

```js
const URBHEALTH_cnu_plot = Plot.plot(
  generateCnuPlotOptions(URBHEALTH_project_researcher_data.cnu_count, URBHEALTH_cnu_plot_sort)
);
```

<div class="grid grid-cols-2">
  <div class="card grid-colspan-1">
    <h2>CNU Categories</h2>
    <div>${URBHEALTH_cnu_category_plot}</div>
  </div>
  <div class="card grid-colspan-1 grid-rowspan-1">
    <h2>Detailed CNUs</h2>
    <div style="padding: 5px;">${URBHEALTH_cnu_plot_sort_input}</div>
    <!-- <h3 style="padding-left: 200px;">Legend</h3> -->
    <!-- <div>${generateCnuPlotLegend(URBHEALTH_project_cnu_max)[0]}</div> -->
    <!-- <div>${generateCnuPlotLegend(URBHEALTH_project_cnu_max)[1]}</div> -->
    <!-- <div>${generateCnuPlotLegend(URBHEALTH_project_cnu_max)[2]}</div> -->
    <!-- <div>${generateCnuPlotLegend(URBHEALTH_project_cnu_max)[3]}</div> -->
    <!-- <div>${generateCnuPlotLegend(URBHEALTH_project_cnu_max)[4]}</div> -->
    <!-- <div>${generateCnuPlotLegend(URBHEALTH_project_cnu_max)[5]}</div> -->
    <div style="max-height: 950px;">${URBHEALTH_cnu_plot}</div>
  </div>
  <!-- <div class="card grid-colspan-1">
    <h2>CNUs SHS</h2>
    <div>${URBHEALTH_shs_cnu_plot}</div>
  </div> -->
  <div class="card grid-colspan-1">
    <h2>ERC Disciplines</h2>
    <div>${URBHEALTH_discipline_erc_pie}</div>
  </div>
</div>

## Data quality metrics

```js
// missing count //
const missing_discipline_erc_count = d3.rollup(
    phase_2_data.researchers,
    (D) => D.length,
    (d) => exclude(d.discipline_erc) ? 'found_erc': 'missing_erc'
  );
missing_discipline_erc_count

const missing_cnu_count = d3.rollup(
    phase_2_data.researchers,
    (D) => D.length,
    (d) => exclude(d.cnu) ? 'found_cnu': 'missing_cnu'
  );

const missing_financed_discipline_erc_count = d3.rollup(
    phase_2_data.researchers.filter((d) => isFinanced(d.project)),
    (D) => D.length,
    (d) => exclude(d.discipline_erc) ? 'found_erc': 'missing_erc'
  );
missing_discipline_erc_count

const missing_financed_cnu_count = d3.rollup(
    phase_2_data.researchers.filter((d) => isFinanced(d.project)),
    (D) => D.length,
    (d) => exclude(d.cnu) ? 'found_cnu': 'missing_cnu'
  );
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
