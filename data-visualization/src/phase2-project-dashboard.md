---
title: Phase 2 Project Dashboard
theme: [dashboard, light]
---

# Phase 2 Projects

```js
import {
  countEntities,
  cropText
} from "./components/utilities.js";
import {
  extractPhase2Workbook,
} from "./components/phase2-dashboard.js";
import {
  donutChart
} from "./components/pie-chart.js";
```

<div class="warning" label="Data visualization notice">
  <ul>
    <li>Researchers with multiple disciplines are counted once per discipline.</li>
    <li>Missing researcher data is not visualized by default.</li>
    <li>Data has not yet been verified. Some visualizations may be incorrect.</li>
  </ul>
</div>

```js
const workbook1 = FileAttachment(
  "./data/250120 PEPR_VBDI_analyse modifiée JYT.xlsx"
).xlsx();

// function for filtering out unknown values
const exclude = (d) => ![
  null,
  "non renseignée",
  "Non connue",
  "non connues",
  "Non Renseigné"
].includes(d);

function getCnuNumber(cnu) {
  return Number(cnu.trim().substr(0, 2));
}


// detect if a CNU is SHS ( 7 <= cnu <= 24)
function isSHSCNU(cnu) {
  const cnu_number = getCnuNumber(cnu);
  return cnu_number >= 7 && cnu_number <= 24;
};

const cnu_category_map = new Map([
  ['Sciences', [...Array(70).keys()].slice(25, 70).filter((d) => d <= 37 || d >= 60)],
  ['Lettres et sciences humaines', [...Array(25).keys()].slice(7, 25)],
  [
    'Sections de santé',
    [...Array(17).keys()].map((d) => d + 42)
      .concat([80, 81, 82, 83, 85, 86, 87, 90, 91, 92])
  ],
  ['Droit, économie et gestion', [...Array(7).keys()].slice(1, 7)],
  ['Pluridisciplinaire', [...Array(5).keys()].map((d) => d + 70)],
  ['Théologie', [76, 77]],
]);

function getCategoryFromCNU(cnu) {
  if (!cnu) {
    console.warn(`could not categorize cnu: ${cnu}`);
    return null;
  };
  if (cnu == 'Administratif') return cnu;

  const cnu_number = getCnuNumber(cnu);
  const category = cnu_category_map.entries()
    .find((d) => d[1].includes(cnu_number));
  
  if (!category) console.warn(`could not categorize cnu: ${cnu}`)

  return category ? category[0] : null;
}

function colorCNU(d, max) {
  // debugger;
  const cnu_category = getCategoryFromCNU(d[0]);

  const color = d3
    .scaleSequential()
    .domain([0, max])
    .unknown("grey");

  // determine color range by category
  if (cnu_category == 'Lettres et sciences humaines') {
    color.interpolator(d3.interpolateOranges);
  } else if (cnu_category == 'Sections de santé') {
    color.interpolator(d3.interpolateGreens);
  } else if (cnu_category == 'Sciences') {
    color.interpolator(d3.interpolateBlues);
  } else if (cnu_category == 'Droit, économie et gestion') {
    color.interpolator(d3.interpolateReds);
  } else if (cnu_category == 'Pluridisciplinaire') {
    color.interpolator(d3.interpolatePurples);
  } else if (cnu_category == 'Administratif' || exclude(cnu_category)) {
    // do nothing
  } else {
    console.error(`color CNU not implemented for ${d[0]}`);
  }
  return color(d[1]);
}

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

function cnu_plot_options(data) {
  // debugger;
  return {
    // width: 500,
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
        fill: (d) => d3
          .scaleOrdinal(d3.schemeCategory10)
          .domain(cnu_category_map.keys())
          .unknown("grey")(getCategoryFromCNU(d[0])),
        // fill: (d) => colorCNU(d, Math.max(...data.map((d) => d[1]))),
        sort: {y: "-x"},
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

  const shs_cnu_count = cnu_count
    .filter((d) => isSHSCNU(d[0]));

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

  return {
    discipline_erc_count: discipline_erc_count,
    cnu_count: cnu_count,
    shs_cnu_count: shs_cnu_count,
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

```js
const cnu_plot = Plot.plot(
  cnu_plot_options(all_project_researcher_data.cnu_count)
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

<div class="grid grid-cols-2">
  <div class="card grid-colspan-1">
    <h2>CNU Categories</h2>
    <div>${cnu_category_plot}</div>
  </div>
  <div class="card grid-colspan-1 grid-rowspan-2">
    <h2>Detailed CNUs</h2>
    <div style="max-height: 950px; overflow: auto">${cnu_plot}</div>
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
console.debug('financed_project_researcher_data', financed_project_researcher_data);
```

```js
const financed_discipline_erc_pie = donutChart(
  financed_project_researcher_data.discipline_erc_count,
  discipline_erc_pie_options
);
```

```js
const financed_cnu_plot = Plot.plot(
  cnu_plot_options(financed_project_researcher_data.cnu_count)
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

<div class="grid grid-cols-2">
  <div class="card grid-colspan-1">
    <h2>CNU Categories</h2>
    <div>${financed_cnu_category_plot}</div>
  </div>
  <div class="card grid-colspan-1 grid-rowspan-2">
    <h2>Detailed CNUs</h2>
    <div style="max-height: 950px; overflow: auto">${financed_cnu_plot}</div>
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

```js
const neo_cnu_plot = Plot.plot(
  cnu_plot_options(neo_project_researcher_data.cnu_count)
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

<div class="grid grid-cols-2">
  <div class="card grid-colspan-1">
    <h2>CNU Categories</h2>
    <div>${neo_cnu_category_plot}</div>
  </div>
  <div class="card grid-colspan-1 grid-rowspan-2">
    <h2>Detailed CNUs</h2>
    <div style="max-height: 950px; overflow: auto">${neo_cnu_plot}</div>
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

```js
const RESILIENCE_cnu_plot = Plot.plot(
  cnu_plot_options(RESILIENCE_project_researcher_data.cnu_count)
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

<div class="grid grid-cols-2">
  <div class="card grid-colspan-1">
    <h2>CNU Categories</h2>
    <div>${RESILIENCE_cnu_category_plot}</div>
  </div>
  <div class="card grid-colspan-1 grid-rowspan-2">
    <h2>Detailed CNUs</h2>
    <div style="max-height: 950px; overflow: auto">${RESILIENCE_cnu_plot}</div>
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

```js
const TRACES_cnu_plot = Plot.plot(
  cnu_plot_options(TRACES_project_researcher_data.cnu_count)
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

<div class="grid grid-cols-2">
  <div class="card grid-colspan-1">
    <h2>CNU Categories</h2>
    <div>${TRACES_cnu_category_plot}</div>
  </div>
  <div class="card grid-colspan-1 grid-rowspan-2">
    <h2>Detailed CNUs</h2>
    <div style="max-height: 950px; overflow: auto">${TRACES_cnu_plot}</div>
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

```js
const vfpp_cnu_plot = Plot.plot(
  cnu_plot_options(vfpp_project_researcher_data.cnu_count)
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

<div class="grid grid-cols-2">
  <div class="card grid-colspan-1">
    <h2>CNU Categories</h2>
    <div>${vfpp_cnu_category_plot}</div>
  </div>
  <div class="card grid-colspan-1 grid-rowspan-2">
    <h2>Detailed CNUs</h2>
    <div style="max-height: 950px; overflow: auto">${vfpp_cnu_plot}</div>
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

```js
const VILLEGARDEN_cnu_plot = Plot.plot(
  cnu_plot_options(VILLEGARDEN_project_researcher_data.cnu_count)
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

<div class="grid grid-cols-2">
  <div class="card grid-colspan-1">
    <h2>CNU Categories</h2>
    <div>${VILLEGARDEN_cnu_category_plot}</div>
  </div>
  <div class="card grid-colspan-1 grid-rowspan-2">
    <h2>Detailed CNUs</h2>
    <div style="max-height: 950px; overflow: auto">${VILLEGARDEN_cnu_plot}</div>
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

```js
const WHAOU_cnu_plot = Plot.plot(
  cnu_plot_options(WHAOU_project_researcher_data.cnu_count)
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

<div class="grid grid-cols-2">
  <div class="card grid-colspan-1">
    <h2>CNU Categories</h2>
    <div>${WHAOU_cnu_category_plot}</div>
  </div>
  <div class="card grid-colspan-1 grid-rowspan-2">
    <h2>Detailed CNUs</h2>
    <div style="max-height: 950px; overflow: auto">${WHAOU_cnu_plot}</div>
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

```js
const inteGREEN_cnu_plot = Plot.plot(
  cnu_plot_options(inteGREEN_project_researcher_data.cnu_count)
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

<div class="grid grid-cols-2">
  <div class="card grid-colspan-1">
    <h2>CNU Categories</h2>
    <div>${inteGREEN_cnu_category_plot}</div>
  </div>
  <div class="card grid-colspan-1 grid-rowspan-2">
    <h2>Detailed CNUs</h2>
    <div style="max-height: 950px; overflow: auto">${inteGREEN_cnu_plot}</div>
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

```js
const URBHEALTH_cnu_plot = Plot.plot(
  cnu_plot_options(URBHEALTH_project_researcher_data.cnu_count)
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

<div class="grid grid-cols-2">
  <div class="card grid-colspan-1">
    <h2>CNU Categories</h2>
    <div>${URBHEALTH_cnu_category_plot}</div>
  </div>
  <div class="card grid-colspan-1 grid-rowspan-2">
    <h2>Detailed CNUs</h2>
    <div style="max-height: 950px; overflow: auto">${URBHEALTH_cnu_plot}</div>
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


```js
function formatSHSPercents(data, label, financed=false) {
  const shs_cnu_percent_obj = Object.fromEntries(new Map(data.shs_cnu_percent));
  const discipline_erc_shs_count = d3.rollup(
    data.discipline_erc_count,
    (D) => d3.reduce(D, (p, v) => p + v[1], 0),
    (d) => d[0] == 'SH - Sciences Humaines & Sociales');
  shs_cnu_percent_obj.label = label;
  shs_cnu_percent_obj.erc_percent =
    `${
      (discipline_erc_shs_count.get(true) /
      (discipline_erc_shs_count.get(true) + discipline_erc_shs_count.get(false))
      * 100)
        .toPrecision(3)
    }%`;
  shs_cnu_percent_obj.cnu_percent =
    `${(shs_cnu_percent_obj.SHS / (shs_cnu_percent_obj.SHS + shs_cnu_percent_obj['non-SHS']) * 100)
      .toPrecision(3)
    }%`;
  return shs_cnu_percent_obj;
};

// Table //
const overview_data = [];
overview_data.push(formatSHSPercents(neo_project_researcher_data, 'NÉO'));
overview_data.push(formatSHSPercents(RESILIENCE_project_researcher_data, 'RESILIENCE'));
overview_data.push(formatSHSPercents(TRACES_project_researcher_data, 'TRACES'));
overview_data.push(formatSHSPercents(vfpp_project_researcher_data, 'vfpp'));
overview_data.push(formatSHSPercents(VILLEGARDEN_project_researcher_data, 'VILLEGARDEN'));
overview_data.push(formatSHSPercents(WHAOU_project_researcher_data, 'WHAOU'));
overview_data.push(formatSHSPercents(inteGREEN_project_researcher_data, 'inteGREEN'));
overview_data.push(formatSHSPercents(URBHEALTH_project_researcher_data, 'URBHEALTH'));
overview_data.push(formatSHSPercents(financed_project_researcher_data, 'financed'));

console.debug("overview_data", overview_data);

const overview_table = Inputs.table(overview_data, {
  // height: 400,
  columns: [
    "label",
    // "SHS",
    // "non-SHS",
    "erc_percent",
    "cnu_percent",
  ],
  header: {
    "label": "Project",
    // "SHS": "SHS",
    // "non-SHS": "Non-SHS",
    "erc_percent": "% Disciplines ERC SHS",
    "cnu_percent": "% CNU SHS",
  },
});
```

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

## Financed Project Summary

<div class="grid grid-cols-2">
  <div class="card grid-colspan-1">${overview_table}</div>
</div>


## Data quality metrics

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
