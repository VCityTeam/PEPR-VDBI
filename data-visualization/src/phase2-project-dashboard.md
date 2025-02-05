---
title: Phase 2 Project Dashboard
theme: dashboard
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
    <li>
      Missing researcher data is not visualized by default.
      This includes researchers that could not be geolocated.
    </li>
    <li>Data has not yet been verified. Some visualizations may be incorrect.</li>
  </ul>
</div>

```js
// function for filtering out unknown values
const exclude = (d) => ![
  null,
  "non renseignée",
  "Non connue",
  "non connues",
  "Non Renseigné"
].includes(d);


function isSHSCNU(cnu) {
  const cnu_number = Number(cnu.trim().substr(0, 2));
  return cnu_number >= 7 && cnu_number <= 24;
};


function isFinanced(projects) {
  const financed_projects = [
    "NÉO",
    "RÉSILIENCE",
    "TRACES",
    "VF++",
    "VILLEGARDEN",
    "WHAOU",
    "inteGREEN",
    "URBHEALTH",
  ];
  for (let index = 0; index < projects.length; index++) {
    if (financed_projects.includes(projects[index]))
      return true;
  }
  return false;
}

const workbook1 = FileAttachment(
  "./data/250120 PEPR_VBDI_analyse modifiée JYT.xlsx"
).xlsx();
```

```js
// format data
const phase_2_data = extractPhase2Workbook(workbook1, false);
```

```js
// ERC Discipline count //
const discipline_erc_count = countEntities(
    phase_2_data.researchers,
    (d) => d.discipline_erc
  )
  .filter((d) => exclude(d.entity))
  .sort((a, b) => d3.descending(a.count, b.count));

const discipline_erc_pie = donutChart(discipline_erc_count, {
  width: 800,
  height: 450,
  legendLeftMargin: 110,
  fontSize: 18,
});
```

```js
// CNU count //
const cnu_count = d3.rollups(
    phase_2_data.researchers,
    (d) => d.length,
    (d) => d.cnu
  )
  .filter((d) => exclude(d[0]))
  .sort((a, b) => d3.descending(a[1], b[1]));
const shs_cnu_count = cnu_count
  .filter((d) => isSHSCNU(d[0]));
const shs_cnu_percent = d3.rollups(
  cnu_count,
  (D) => D.length,
  (d) => isSHSCNU(d[0]) ? 'SHS' : 'non-SHS'
);
```

```js
const cnu_plot = Plot.plot({
  // width: 500,
  marginTop: 50,
  marginLeft: 200,
  color: {
    scheme: "Plasma",
  },
  y: {
    label: "CNU",
    tickRotate: 0,
    tickFormat: (d) => cropText(d, 35),
  },
  x: {
    grid: true,
    axis: "top",
    label: "Occurences",
  },
  marks: [
    Plot.barX(cnu_count, {
      y: (d) => d[0],
      x: (d) => d[1],
      fill: (d) => d[1],
      sort: {y: "-x"},
      tip: {
        format: {
          fill: false
        },
        lineWidth: 25,
        textOverflow: "ellipsis-end"
      }
    }),
    Plot.barX(
      cnu_count, 
      Plot.pointerY({x: (d) => d[1], y: (d) => d[0]}),
    ),
  ],
});

const shs_cnu_plot = donutChart(shs_cnu_count, {
  width: 800,
  height: 450,
  legendLeftMargin: 110,
  fontSize: 18,
  keyMap: (d) => d[0],
  valueMap: (d) => d[1],
});


const shs_cnu_percent_plot = donutChart(shs_cnu_percent, {
  width: 800,
  height: 450,
  legendLeftMargin: 60,
  fontSize: 18,
  keyMap: (d) => d[0],
  valueMap: (d) => d[1],
  majorLabelBackgroundWidth: (d) => `${cropText(d.data[0], 30).length}em`,
  majorLabelBackgroundX: (d) => `-${cropText(d.data[0], 30).length / 2}em`,
});

// const shs_cnu_plot = Plot.plot({
//   width: 450,
//   marginTop: 50,
//   marginLeft: 100,
//   color: {
//     scheme: "Plasma",
//   },
//   y: {
//     label: "CNU",
//     tickRotate: 30,
//     tickFormat: (d) => cropText(d),
//   },
//   x: {
//     grid: true,
//     axis: "top",
//     label: "Occurences",
//   },
//   marks: [
//     Plot.barX(shs_cnu_count, {
//       y: (d) => d[0],
//       x: (d) => d[1],
//       fill: (d) => d[1],
//       sort: {y: "-x"},
//       tip: {
//         format: {
//           fill: false
//         },
//         lineWidth: 25,
//         textOverflow: "ellipsis-end"
//       }
//     }),
//     Plot.barX(
//       shs_cnu_count, 
//       Plot.pointerY({x: (d) => d[1], y: (d) => d[0]}),
//     ),
//   ],
// });
```

## All Projects
<div class="grid grid-cols-2">
  <div class="card grid-colspan-1">
    <h2>CNUs</h2>
    <div>${shs_cnu_percent_plot}</div>
  </div>
  <div class="card grid-colspan-1">
    <h2>Detailed CNUs</h2>
    <div style="max-height: 350px; overflow: auto">${cnu_plot}</div>
  </div>
  <div class="card grid-colspan-1">
    <h2>CNUs SHS<h2>
    <div>${shs_cnu_plot}</div>
  </div>
  <div class="card grid-colspan-1">
    <h2>ERC Disciplines</h2>
    <div>${discipline_erc_pie}</div>
  </div>
</div>

```js
// ERC Discipline count //
const financed_discipline_erc_count = countEntities(
    phase_2_data.researchers.filter((d) => isFinanced(d.project)),
    (d) => d.discipline_erc
  )
  .filter((d) => exclude(d.entity))
  .sort((a, b) => d3.descending(a.count, b.count));

const financed_discipline_erc_pie = donutChart(financed_discipline_erc_count, {
  width: 800,
  height: 450,
  legendLeftMargin: 110,
  fontSize: 18,
});
```

```js
// CNU count //
const financed_cnu_count = d3.rollups(
    phase_2_data.researchers.filter((d) => isFinanced(d.project)),
    (d) => d.length,
    (d) => d.cnu
  )
  .filter((d) => exclude(d[0]))
  .sort((a, b) => d3.descending(a[1], b[1]));
const shs_financed_cnu_count = financed_cnu_count
  .filter((d) => isSHSCNU(d[0]));
const shs_financed_cnu_percent = d3.rollups(
  financed_cnu_count,
  (D) => D.length,
  (d) => isSHSCNU(d[0]) ? 'SHS' : 'non-SHS'
);
```

```js
const financed_cnu_plot = Plot.plot({
  // width: 500,
  marginTop: 50,
  marginLeft: 200,
  color: {
    scheme: "Plasma",
  },
  y: {
    label: "CNU",
    tickRotate: 0,
    tickFormat: (d) => cropText(d, 35),
  },
  x: {
    grid: true,
    axis: "top",
    label: "Occurences",
  },
  marks: [
    Plot.barX(financed_cnu_count, {
      y: (d) => d[0],
      x: (d) => d[1],
      fill: (d) => d[1],
      sort: {y: "-x"},
      tip: {
        format: {
          fill: false
        },
        lineWidth: 25,
        textOverflow: "ellipsis-end"
      }
    }),
    Plot.barX(
      financed_cnu_count, 
      Plot.pointerY({x: (d) => d[1], y: (d) => d[0]}),
    ),
  ],
});

const shs_financed_cnu_plot = donutChart(shs_financed_cnu_count, {
  width: 800,
  height: 450,
  legendLeftMargin: 110,
  fontSize: 18,
  keyMap: (d) => d[0],
  valueMap: (d) => d[1],
});

const shs_financed_cnu_percent_plot = donutChart(shs_financed_cnu_percent, {
  width: 800,
  height: 450,
  legendLeftMargin: 60,
  fontSize: 18,
  keyMap: (d) => d[0],
  valueMap: (d) => d[1],
  majorLabelBackgroundWidth: (d) => `${cropText(d.data[0], 30).length}em`,
  majorLabelBackgroundX: (d) => `-${cropText(d.data[0], 30).length / 2}em`,
});
// const shs_financed_cnu_plot = Plot.plot({
//   width: 450,
//   marginTop: 50,
//   marginLeft: 100,
//   color: {
//     scheme: "Plasma",
//   },
//   y: {
//     label: "CNU",
//     tickRotate: 30,
//     tickFormat: (d) => cropText(d),
//   },
//   x: {
//     grid: true,
//     axis: "top",
//     label: "Occurences",
//   },
//   marks: [
//     Plot.barX(shs_financed_cnu_count, {
//       y: (d) => d[0],
//       x: (d) => d[1],
//       fill: (d) => d[1],
//       sort: {y: "-x"},
//       tip: {
//         format: {
//           fill: false
//         },
//         lineWidth: 25,
//         textOverflow: "ellipsis-end"
//       }
//     }),
//     Plot.barX(
//       shs_financed_cnu_count, 
//       Plot.pointerY({x: (d) => d[1], y: (d) => d[0]}),
//     ),
//   ],
// });
```

## Financed Projects

<div class="grid grid-cols-2">
  <div class="card grid-colspan-1">
    <h2>CNUs</h2>
    <div>${shs_financed_cnu_percent_plot}</div>
  </div>
  <div class="card grid-colspan-1">
    <h2>Detailed CNUs</h2>
    <div style="max-height: 350px; overflow: auto">${financed_cnu_plot}</div>
  </div>
  <div class="card grid-colspan-1">
    <h2>CNUs SHS<h2>
    <div>${shs_financed_cnu_plot}</div>
  </div>
  <div class="card grid-colspan-1">
    <h2>ERC Disciplines</h2>
    <div>${financed_discipline_erc_pie}</div>
  </div>
</div>

## NÉO

```js
// ERC Discipline count //
const neo_discipline_erc_count = countEntities(
    phase_2_data.researchers.filter((d) => d.project.includes("NÉO")),
    (d) => d.discipline_erc
  )
  .filter((d) => exclude(d.entity))
  .sort((a, b) => d3.descending(a.count, b.count));

const neo_discipline_erc_pie = donutChart(neo_discipline_erc_count, {
  width: 800,
  height: 450,
  legendLeftMargin: 110,
  fontSize: 18,
});
```

```js
// CNU count //
const neo_cnu_count = d3.rollups(
    phase_2_data.researchers.filter((d) => d.project.includes("NÉO")),
    (d) => d.length,
    (d) => d.cnu
  )
  .filter((d) => exclude(d[0]))
  .sort((a, b) => d3.descending(a[1], b[1]));
const shs_neo_cnu_count = neo_cnu_count
  .filter((d) => isSHSCNU(d[0]));
const shs_neo_cnu_percent = d3.rollups(
  neo_cnu_count,
  (D) => D.length,
  (d) => isSHSCNU(d[0]) ? 'SHS' : 'non-SHS'
);
```

```js
const neo_cnu_plot = Plot.plot({
  // width: 500,
  marginTop: 50,
  marginLeft: 200,
  color: {
    scheme: "Plasma",
  },
  y: {
    label: "CNU",
    tickRotate: 0,
    tickFormat: (d) => cropText(d, 35),
  },
  x: {
    grid: true,
    axis: "top",
    label: "Occurences",
  },
  marks: [
    Plot.barX(neo_cnu_count, {
      y: (d) => d[0],
      x: (d) => d[1],
      fill: (d) => d[1],
      sort: {y: "-x"},
      tip: {
        format: {
          fill: false
        },
        lineWidth: 25,
        textOverflow: "ellipsis-end"
      }
    }),
    Plot.barX(
      neo_cnu_count, 
      Plot.pointerY({x: (d) => d[1], y: (d) => d[0]}),
    ),
  ],
});

const shs_neo_cnu_plot = donutChart(shs_neo_cnu_count, {
  width: 800,
  height: 450,
  legendLeftMargin: 110,
  fontSize: 18,
  keyMap: (d) => d[0],
  valueMap: (d) => d[1],
});

const shs_neo_cnu_percent_plot = donutChart(shs_neo_cnu_percent, {
  width: 800,
  height: 450,
  legendLeftMargin: 60,
  fontSize: 18,
  keyMap: (d) => d[0],
  valueMap: (d) => d[1],
  majorLabelBackgroundWidth: (d) => `${cropText(d.data[0], 30).length}em`,
  majorLabelBackgroundX: (d) => `-${cropText(d.data[0], 30).length / 2}em`,
});
// const shs_neo_cnu_plot = Plot.plot({
//   width: 450,
//   marginTop: 50,
//   marginLeft: 100,
//   color: {
//     scheme: "Plasma",
//   },
//   y: {
//     label: "CNU",
//     tickRotate: 30,
//     tickFormat: (d) => cropText(d),
//   },
//   x: {
//     grid: true,
//     axis: "top",
//     label: "Occurences",
//   },
//   marks: [
//     Plot.barX(shs_neo_cnu_count, {
//       y: (d) => d[0],
//       x: (d) => d[1],
//       fill: (d) => d[1],
//       sort: {y: "-x"},
//       tip: {
//         format: {
//           fill: false
//         },
//         lineWidth: 25,
//         textOverflow: "ellipsis-end"
//       }
//     }),
//     Plot.barX(
//       shs_neo_cnu_count, 
//       Plot.pointerY({x: (d) => d[1], y: (d) => d[0]}),
//     ),
//   ],
// });
```

<div class="grid grid-cols-2">
  <div class="card grid-colspan-1">
    <h2>CNUs</h2>
    <div>${shs_neo_cnu_percent_plot}</div>
  </div>
  <div class="card grid-colspan-1">
    <h2>Detailed CNUs</h2>
    <div style="max-height: 350px; overflow: auto">${neo_cnu_plot}</div>
  </div>
  <div class="card grid-colspan-1">
    <h2>CNUs SHS<h2>
    <div>${shs_neo_cnu_plot}</div>
  </div>
  <div class="card grid-colspan-1">
    <h2>ERC Disciplines</h2>
    <div>${neo_discipline_erc_pie}</div>
  </div>
</div>


## RÉSILIENCE

```js
// ERC Discipline count //
const RESILIENCE_discipline_erc_count = countEntities(
    phase_2_data.researchers.filter((d) => d.project.includes("RÉSILIENCE")),
    (d) => d.discipline_erc
  )
  .filter((d) => exclude(d.entity))
  .sort((a, b) => d3.descending(a.count, b.count));

const RESILIENCE_discipline_erc_pie = donutChart(RESILIENCE_discipline_erc_count, {
  width: 800,
  height: 450,
  legendLeftMargin: 110,
  fontSize: 18,
});
```

```js
// CNU count //
const RESILIENCE_cnu_count = d3.rollups(
    phase_2_data.researchers.filter((d) => d.project.includes("RÉSILIENCE")),
    (d) => d.length,
    (d) => d.cnu
  )
  .filter((d) => exclude(d[0]))
  .sort((a, b) => d3.descending(a[1], b[1]));
const shs_RESILIENCE_cnu_count = RESILIENCE_cnu_count.filter((d) => isSHSCNU(d[0]));
const shs_RESILIENCE_cnu_percent = d3.rollups(
  RESILIENCE_cnu_count,
  (D) => D.length,
  (d) => isSHSCNU(d[0]) ? 'SHS' : 'non-SHS'
);
```

```js
const RESILIENCE_cnu_plot = Plot.plot({
  // width: 500,
  marginTop: 50,
  marginLeft: 200,
  color: {
    scheme: "Plasma",
  },
  y: {
    label: "CNU",
    tickRotate: 0,
    tickFormat: (d) => cropText(d, 35),
  },
  x: {
    grid: true,
    axis: "top",
    label: "Occurences",
  },
  marks: [
    Plot.barX(RESILIENCE_cnu_count, {
      y: (d) => d[0],
      x: (d) => d[1],
      fill: (d) => d[1],
      sort: {y: "-x"},
      tip: {
        format: {
          fill: false
        },
        lineWidth: 25,
        textOverflow: "ellipsis-end"
      }
    }),
    Plot.barX(
      RESILIENCE_cnu_count, 
      Plot.pointerY({x: (d) => d[1], y: (d) => d[0]}),
    ),
  ],
});

const shs_RESILIENCE_cnu_plot = donutChart(shs_RESILIENCE_cnu_count, {
  width: 800,
  height: 450,
  legendLeftMargin: 110,
  fontSize: 18,
  keyMap: (d) => d[0],
  valueMap: (d) => d[1],
});

const shs_RESILIENCE_cnu_percent_plot = donutChart(shs_RESILIENCE_cnu_percent, {
  width: 800,
  height: 450,
  legendLeftMargin: 60,
  fontSize: 18,
  keyMap: (d) => d[0],
  valueMap: (d) => d[1],
  majorLabelBackgroundWidth: (d) => `${cropText(d.data[0], 30).length}em`,
  majorLabelBackgroundX: (d) => `-${cropText(d.data[0], 30).length / 2}em`,
});
// const shs_RESILIENCE_cnu_plot = Plot.plot({
//   width: 450,
//   marginTop: 50,
//   marginLeft: 100,
//   color: {
//     scheme: "Plasma",
//   },
//   y: {
//     label: "CNU",
//     tickRotate: 30,
//     tickFormat: (d) => cropText(d),
//   },
//   x: {
//     grid: true,
//     axis: "top",
//     label: "Occurences",
//   },
//   marks: [
//     Plot.barX(shs_RESILIENCE_cnu_count, {
//       y: (d) => d[0],
//       x: (d) => d[1],
//       fill: (d) => d[1],
//       sort: {y: "-x"},
//       tip: {
//         format: {
//           fill: false
//         },
//         lineWidth: 25,
//         textOverflow: "ellipsis-end"
//       }
//     }),
//     Plot.barX(
//       shs_RESILIENCE_cnu_count, 
//       Plot.pointerY({x: (d) => d[1], y: (d) => d[0]}),
//     ),
//   ],
// });
```

<div class="grid grid-cols-2">
  <div class="card grid-colspan-1">
    <h2>CNUs</h2>
    <div>${shs_RESILIENCE_cnu_percent_plot}</div>
  </div>
  <div class="card grid-colspan-1">
    <h2>Detailed CNUs</h2>
    <div style="max-height: 350px; overflow: auto">${RESILIENCE_cnu_plot}</div>
  </div>
  <div class="card grid-colspan-1">
    <h2>CNUs SHS<h2>
    <div>${shs_RESILIENCE_cnu_plot}</div>
  </div>
  <div class="card grid-colspan-1">
    <h2>ERC Disciplines</h2>
    <div>${RESILIENCE_discipline_erc_pie}</div>
  </div>
</div>


## TRACES

```js
// ERC Discipline count //
const traces_discipline_erc_count = countEntities(
    phase_2_data.researchers.filter((d) => d.project.includes("TRACES")),
    (d) => d.discipline_erc
  )
  .filter((d) => exclude(d.entity))
  .sort((a, b) => d3.descending(a.count, b.count));

const traces_discipline_erc_pie = donutChart(traces_discipline_erc_count, {
  width: 800,
  height: 450,
  legendLeftMargin: 110,
  fontSize: 18,
});
```

```js
// CNU count //
const traces_cnu_count = d3.rollups(
    phase_2_data.researchers.filter((d) => d.project.includes("TRACES")),
    (d) => d.length,
    (d) => d.cnu
  )
  .filter((d) => exclude(d[0]))
  .sort((a, b) => d3.descending(a[1], b[1]));
const shs_traces_cnu_count = traces_cnu_count
  .filter((d) => isSHSCNU(d[0]));
const shs_traces_cnu_percent = d3.rollups(
  traces_cnu_count,
  (D) => D.length,
  (d) => isSHSCNU(d[0]) ? 'SHS' : 'non-SHS'
);
```

```js
const traces_cnu_plot = Plot.plot({
  // width: 500,
  marginTop: 50,
  marginLeft: 200,
  color: {
    scheme: "Plasma",
  },
  y: {
    label: "CNU",
    tickRotate: 0,
    tickFormat: (d) => cropText(d, 35),
  },
  x: {
    grid: true,
    axis: "top",
    label: "Occurences",
  },
  marks: [
    Plot.barX(traces_cnu_count, {
      y: (d) => d[0],
      x: (d) => d[1],
      fill: (d) => d[1],
      sort: {y: "-x"},
      tip: {
        format: {
          fill: false
        },
        lineWidth: 25,
        textOverflow: "ellipsis-end"
      }
    }),
    Plot.barX(
      traces_cnu_count, 
      Plot.pointerY({x: (d) => d[1], y: (d) => d[0]}),
    ),
  ],
});

const shs_traces_cnu_plot = donutChart(shs_traces_cnu_count, {
  width: 800,
  height: 450,
  legendLeftMargin: 110,
  fontSize: 18,
  keyMap: (d) => d[0],
  valueMap: (d) => d[1],
});
// const shs_traces_cnu_plot = Plot.plot({
const shs_traces_cnu_percent_plot = donutChart(shs_traces_cnu_percent, {
  width: 800,
  height: 450,
  legendLeftMargin: 60,
  fontSize: 18,
  keyMap: (d) => d[0],
  valueMap: (d) => d[1],
  majorLabelBackgroundWidth: (d) => `${cropText(d.data[0], 30).length}em`,
  majorLabelBackgroundX: (d) => `-${cropText(d.data[0], 30).length / 2}em`,
});
//   width: 450,
//   marginTop: 50,
//   marginLeft: 100,
//   color: {
//     scheme: "Plasma",
//   },
//   y: {
//     label: "CNU",
//     tickRotate: 30,
//     tickFormat: (d) => cropText(d),
//   },
//   x: {
//     grid: true,
//     axis: "top",
//     label: "Occurences",
//   },
//   marks: [
//     Plot.barX(shs_traces_cnu_count, {
//       y: (d) => d[0],
//       x: (d) => d[1],
//       fill: (d) => d[1],
//       sort: {y: "-x"},
//       tip: {
//         format: {
//           fill: false
//         },
//         lineWidth: 25,
//         textOverflow: "ellipsis-end"
//       }
//     }),
//     Plot.barX(
//       shs_traces_cnu_count, 
//       Plot.pointerY({x: (d) => d[1], y: (d) => d[0]}),
//     ),
//   ],
// });
```

<div class="grid grid-cols-2">
  <div class="card grid-colspan-1">
    <h2>CNUs</h2>
    <div>${shs_traces_cnu_percent_plot}</div>
  </div>
  <div class="card grid-colspan-1">
    <h2>Detailed CNUs</h2>
    <div style="max-height: 350px; overflow: auto">${traces_cnu_plot}</div>
  </div>
  <div class="card grid-colspan-1">
    <h2>CNUs SHS<h2>
    <div>${shs_traces_cnu_plot}</div>
  </div>
  <div class="card grid-colspan-1">
    <h2>ERC Disciplines</h2>
    <div>${traces_discipline_erc_pie}</div>
  </div>
</div>

## VF++

```js
// ERC Discipline count //
const vfpp_discipline_erc_count = countEntities(
    phase_2_data.researchers.filter((d) => d.project.includes("VF++")),
    (d) => d.discipline_erc
  )
  .filter((d) => exclude(d.entity))
  .sort((a, b) => d3.descending(a.count, b.count));

const vfpp_discipline_erc_pie = donutChart(vfpp_discipline_erc_count, {
  width: 800,
  height: 450,
  legendLeftMargin: 110,
  fontSize: 18,
});
```

```js
// CNU count //
const vfpp_cnu_count = d3.rollups(
    phase_2_data.researchers.filter((d) => d.project.includes("VF++")),
    (d) => d.length,
    (d) => d.cnu
  )
  .filter((d) => exclude(d[0]))
  .sort((a, b) => d3.descending(a[1], b[1]));
const shs_vfpp_cnu_count = vfpp_cnu_count
  .filter((d) => isSHSCNU(d[0]));
const shs_vfpp_cnu_percent = d3.rollups(
  vfpp_cnu_count,
  (D) => D.length,
  (d) => isSHSCNU(d[0]) ? 'SHS' : 'non-SHS'
);
```

```js
const vfpp_cnu_plot = Plot.plot({
  // width: 500,
  marginTop: 50,
  marginLeft: 200,
  color: {
    scheme: "Plasma",
  },
  y: {
    label: "CNU",
    tickRotate: 0,
    tickFormat: (d) => cropText(d, 35),
  },
  x: {
    grid: true,
    axis: "top",
    label: "Occurences",
  },
  marks: [
    Plot.barX(vfpp_cnu_count, {
      y: (d) => d[0],
      x: (d) => d[1],
      fill: (d) => d[1],
      sort: {y: "-x"},
      tip: {
        format: {
          fill: false
        },
        lineWidth: 25,
        textOverflow: "ellipsis-end"
      }
    }),
    Plot.barX(
      vfpp_cnu_count, 
      Plot.pointerY({x: (d) => d[1], y: (d) => d[0]}),
    ),
  ],
});

const shs_vfpp_cnu_plot = donutChart(shs_vfpp_cnu_count, {
  width: 800,
  height: 450,
  legendLeftMargin: 110,
  fontSize: 18,
  keyMap: (d) => d[0],
  valueMap: (d) => d[1],
});
// const shs_vfpp_cnu_plot = Plot.plot({
const shs_vfpp_cnu_percent_plot = donutChart(shs_vfpp_cnu_percent, {
  width: 800,
  height: 450,
  legendLeftMargin: 60,
  fontSize: 18,
  keyMap: (d) => d[0],
  valueMap: (d) => d[1],
  majorLabelBackgroundWidth: (d) => `${cropText(d.data[0], 30).length}em`,
  majorLabelBackgroundX: (d) => `-${cropText(d.data[0], 30).length / 2}em`,
});
//   width: 450,
//   marginTop: 50,
//   marginLeft: 100,
//   color: {
//     scheme: "Plasma",
//   },
//   y: {
//     label: "CNU",
//     tickRotate: 30,
//     tickFormat: (d) => cropText(d),
//   },
//   x: {
//     grid: true,
//     axis: "top",
//     label: "Occurences",
//   },
//   marks: [
//     Plot.barX(shs_vfpp_cnu_count, {
//       y: (d) => d[0],
//       x: (d) => d[1],
//       fill: (d) => d[1],
//       sort: {y: "-x"},
//       tip: {
//         format: {
//           fill: false
//         },
//         lineWidth: 25,
//         textOverflow: "ellipsis-end"
//       }
//     }),
//     Plot.barX(
//       shs_vfpp_cnu_count, 
//       Plot.pointerY({x: (d) => d[1], y: (d) => d[0]}),
//     ),
//   ],
// });
```

<div class="grid grid-cols-2">
  <div class="card grid-colspan-1">
    <h2>CNUs</h2>
    <div>${shs_vfpp_cnu_percent_plot}</div>
  </div>
  <div class="card grid-colspan-1">
    <h2>Detailed CNUs</h2>
    <div style="max-height: 350px; overflow: auto">${vfpp_cnu_plot}</div>
  </div>
  <div class="card grid-colspan-1">
    <h2>CNUs SHS<h2>
    <div>${shs_vfpp_cnu_plot}</div>
  </div>
  <div class="card grid-colspan-1">
    <h2>ERC Disciplines</h2>
    <div>${vfpp_discipline_erc_pie}</div>
  </div>
</div>


## VILLEGARDEN

```js
// ERC Discipline count //
const VILLEGARDEN_discipline_erc_count = countEntities(
    phase_2_data.researchers.filter((d) => d.project.includes("VILLEGARDEN")),
    (d) => d.discipline_erc
  )
  .filter((d) => exclude(d.entity))
  .sort((a, b) => d3.descending(a.count, b.count));

const VILLEGARDEN_discipline_erc_pie = donutChart(VILLEGARDEN_discipline_erc_count, {
  width: 800,
  height: 450,
  legendLeftMargin: 110,
  fontSize: 18,
});
```

```js
// CNU count //
const VILLEGARDEN_cnu_count = d3.rollups(
    phase_2_data.researchers.filter((d) => d.project.includes("VILLEGARDEN")),
    (d) => d.length,
    (d) => d.cnu
  )
  .filter((d) => exclude(d[0]))
  .sort((a, b) => d3.descending(a[1], b[1]));
const shs_VILLEGARDEN_cnu_count = VILLEGARDEN_cnu_count
  .filter((d) => isSHSCNU(d[0]));
const shs_VILLEGARDEN_cnu_percent = d3.rollups(
  VILLEGARDEN_cnu_count,
  (D) => D.length,
  (d) => isSHSCNU(d[0]) ? 'SHS' : 'non-SHS'
);
```

```js
const VILLEGARDEN_cnu_plot = Plot.plot({
  // width: 500,
  marginTop: 50,
  marginLeft: 200,
  color: {
    scheme: "Plasma",
  },
  y: {
    label: "CNU",
    tickRotate: 0,
    tickFormat: (d) => cropText(d, 35),
  },
  x: {
    grid: true,
    axis: "top",
    label: "Occurences",
  },
  marks: [
    Plot.barX(VILLEGARDEN_cnu_count, {
      y: (d) => d[0],
      x: (d) => d[1],
      fill: (d) => d[1],
      sort: {y: "-x"},
      tip: {
        format: {
          fill: false
        },
        lineWidth: 25,
        textOverflow: "ellipsis-end"
      }
    }),
    Plot.barX(
      VILLEGARDEN_cnu_count, 
      Plot.pointerY({x: (d) => d[1], y: (d) => d[0]}),
    ),
  ],
});

const shs_VILLEGARDEN_cnu_plot = donutChart(shs_VILLEGARDEN_cnu_count, {
  width: 800,
  height: 450,
  legendLeftMargin: 110,
  fontSize: 18,
  keyMap: (d) => d[0],
  valueMap: (d) => d[1],
});
// const shs_VILLEGARDEN_cnu_plot = Plot.plot({
const shs_VILLEGARDEN_cnu_percent_plot = donutChart(shs_VILLEGARDEN_cnu_percent, {
  width: 800,
  height: 450,
  legendLeftMargin: 60,
  fontSize: 18,
  keyMap: (d) => d[0],
  valueMap: (d) => d[1],
  majorLabelBackgroundWidth: (d) => `${cropText(d.data[0], 30).length}em`,
  majorLabelBackgroundX: (d) => `-${cropText(d.data[0], 30).length / 2}em`,
});
//   width: 450,
//   marginTop: 50,
//   marginLeft: 100,
//   color: {
//     scheme: "Plasma",
//   },
//   y: {
//     label: "CNU",
//     tickRotate: 30,
//     tickFormat: (d) => cropText(d),
//   },
//   x: {
//     grid: true,
//     axis: "top",
//     label: "Occurences",
//   },
//   marks: [
//     Plot.barX(shs_VILLEGARDEN_cnu_count, {
//       y: (d) => d[0],
//       x: (d) => d[1],
//       fill: (d) => d[1],
//       sort: {y: "-x"},
//       tip: {
//         format: {
//           fill: false
//         },
//         lineWidth: 25,
//         textOverflow: "ellipsis-end"
//       }
//     }),
//     Plot.barX(
//       shs_VILLEGARDEN_cnu_count, 
//       Plot.pointerY({x: (d) => d[1], y: (d) => d[0]}),
//     ),
//   ],
// });
```

<div class="grid grid-cols-2">
  <div class="card grid-colspan-1">
    <h2>CNUs</h2>
    <div>${shs_VILLEGARDEN_cnu_percent_plot}</div>
  </div>
  <div class="card grid-colspan-1">
    <h2>Detailed CNUs</h2>
    <div style="max-height: 350px; overflow: auto">${VILLEGARDEN_cnu_plot}</div>
  </div>
  <div class="card grid-colspan-1">
    <h2>CNUs SHS<h2>
    <div>${shs_VILLEGARDEN_cnu_plot}</div>
  </div>
  <div class="card grid-colspan-1">
    <h2>ERC Disciplines</h2>
    <div>${VILLEGARDEN_discipline_erc_pie}</div>
  </div>
</div>

## WHAOU

```js
// ERC Discipline count //
const WHAOU_discipline_erc_count = countEntities(
    phase_2_data.researchers.filter((d) => d.project.includes("WHAOU")),
    (d) => d.discipline_erc
  )
  .filter((d) => exclude(d.entity))
  .sort((a, b) => d3.descending(a.count, b.count));

const WHAOU_discipline_erc_pie = donutChart(WHAOU_discipline_erc_count, {
  width: 800,
  height: 450,
  legendLeftMargin: 110,
  fontSize: 18,
});
```

```js
// CNU count //
const WHAOU_cnu_count = d3.rollups(
    phase_2_data.researchers.filter((d) => d.project.includes("WHAOU")),
    (d) => d.length,
    (d) => d.cnu
  )
  .filter((d) => exclude(d[0]))
  .sort((a, b) => d3.descending(a[1], b[1]));
const shs_WHAOU_cnu_count = WHAOU_cnu_count
  .filter((d) => isSHSCNU(d[0]));
const shs_WHAOU_cnu_percent = d3.rollups(
  WHAOU_cnu_count,
  (D) => D.length,
  (d) => isSHSCNU(d[0]) ? 'SHS' : 'non-SHS'
);
```

```js
const WHAOU_cnu_plot = Plot.plot({
  // width: 500,
  marginTop: 50,
  marginLeft: 200,
  color: {
    scheme: "Plasma",
  },
  y: {
    label: "CNU",
    tickRotate: 0,
    tickFormat: (d) => cropText(d, 35),
  },
  x: {
    grid: true,
    axis: "top",
    label: "Occurences",
  },
  marks: [
    Plot.barX(WHAOU_cnu_count, {
      y: (d) => d[0],
      x: (d) => d[1],
      fill: (d) => d[1],
      sort: {y: "-x"},
      tip: {
        format: {
          fill: false
        },
        lineWidth: 25,
        textOverflow: "ellipsis-end"
      }
    }),
    Plot.barX(
      WHAOU_cnu_count, 
      Plot.pointerY({x: (d) => d[1], y: (d) => d[0]}),
    ),
  ],
});

const shs_WHAOU_cnu_plot = donutChart(shs_WHAOU_cnu_count, {
  width: 800,
  height: 450,
  legendLeftMargin: 110,
  fontSize: 18,
  keyMap: (d) => d[0],
  valueMap: (d) => d[1],
});
// const shs_WHAOU_cnu_plot = Plot.plot({
const shs_WHAOU_cnu_percent_plot = donutChart(shs_WHAOU_cnu_percent, {
  width: 800,
  height: 450,
  legendLeftMargin: 60,
  fontSize: 18,
  keyMap: (d) => d[0],
  valueMap: (d) => d[1],
  majorLabelBackgroundWidth: (d) => `${cropText(d.data[0], 30).length}em`,
  majorLabelBackgroundX: (d) => `-${cropText(d.data[0], 30).length / 2}em`,
});
//   width: 450,
//   marginTop: 50,
//   marginLeft: 100,
//   color: {
//     scheme: "Plasma",
//   },
//   y: {
//     label: "CNU",
//     tickRotate: 30,
//     tickFormat: (d) => cropText(d),
//   },
//   x: {
//     grid: true,
//     axis: "top",
//     label: "Occurences",
//   },
//   marks: [
//     Plot.barX(shs_WHAOU_cnu_count, {
//       y: (d) => d[0],
//       x: (d) => d[1],
//       fill: (d) => d[1],
//       sort: {y: "-x"},
//       tip: {
//         format: {
//           fill: false
//         },
//         lineWidth: 25,
//         textOverflow: "ellipsis-end"
//       }
//     }),
//     Plot.barX(
//       shs_WHAOU_cnu_count, 
//       Plot.pointerY({x: (d) => d[1], y: (d) => d[0]}),
//     ),
//   ],
// });
```

<div class="grid grid-cols-2">
  <div class="card grid-colspan-1">
    <h2>CNUs</h2>
    <div>${shs_WHAOU_cnu_percent_plot}</div>
  </div>
  <div class="card grid-colspan-1">
    <h2>Detailed CNUs</h2>
    <div style="max-height: 350px; overflow: auto">${WHAOU_cnu_plot}</div>
  </div>
  <div class="card grid-colspan-1">
    <h2>CNUs SHS<h2>
    <div>${shs_WHAOU_cnu_plot}</div>
  </div>
  <div class="card grid-colspan-1">
    <h2>ERC Disciplines</h2>
    <div>${WHAOU_discipline_erc_pie}</div>
  </div>
</div>


## inteGREEN

```js
// ERC Discipline count //
const inteGREEN_discipline_erc_count = countEntities(
    phase_2_data.researchers.filter((d) => d.project.includes("inteGREEN")),
    (d) => d.discipline_erc
  )
  .filter((d) => exclude(d.entity))
  .sort((a, b) => d3.descending(a.count, b.count));

const inteGREEN_discipline_erc_pie = donutChart(inteGREEN_discipline_erc_count, {
  width: 800,
  height: 450,
  legendLeftMargin: 110,
  fontSize: 18,
});
```

```js
// CNU count //
const inteGREEN_cnu_count = d3.rollups(
    phase_2_data.researchers.filter((d) => d.project.includes("inteGREEN")),
    (d) => d.length,
    (d) => d.cnu
  )
  .filter((d) => exclude(d[0]))
  .sort((a, b) => d3.descending(a[1], b[1]));
const shs_inteGREEN_cnu_count = inteGREEN_cnu_count
  .filter((d) => isSHSCNU(d[0]));
const shs_inteGREEN_cnu_percent = d3.rollups(
  inteGREEN_cnu_count,
  (D) => D.length,
  (d) => isSHSCNU(d[0]) ? 'SHS' : 'non-SHS'
);
```

```js
const inteGREEN_cnu_plot = Plot.plot({
  // width: 500,
  marginTop: 50,
  marginLeft: 200,
  color: {
    scheme: "Plasma",
  },
  y: {
    label: "CNU",
    tickRotate: 0,
    tickFormat: (d) => cropText(d, 35),
  },
  x: {
    grid: true,
    axis: "top",
    label: "Occurences",
  },
  marks: [
    Plot.barX(inteGREEN_cnu_count, {
      y: (d) => d[0],
      x: (d) => d[1],
      fill: (d) => d[1],
      sort: {y: "-x"},
      tip: {
        format: {
          fill: false
        },
        lineWidth: 25,
        textOverflow: "ellipsis-end"
      }
    }),
    Plot.barX(
      inteGREEN_cnu_count, 
      Plot.pointerY({x: (d) => d[1], y: (d) => d[0]}),
    ),
  ],
});

const shs_inteGREEN_cnu_plot = donutChart(shs_inteGREEN_cnu_count, {
  width: 800,
  height: 450,
  legendLeftMargin: 110,
  fontSize: 18,
  keyMap: (d) => d[0],
  valueMap: (d) => d[1],
});
// const shs_inteGREEN_cnu_plot = Plot.plot({
const shs_inteGREEN_cnu_percent_plot = donutChart(shs_inteGREEN_cnu_percent, {
  width: 800,
  height: 450,
  legendLeftMargin: 60,
  fontSize: 18,
  keyMap: (d) => d[0],
  valueMap: (d) => d[1],
  majorLabelBackgroundWidth: (d) => `${cropText(d.data[0], 30).length}em`,
  majorLabelBackgroundX: (d) => `-${cropText(d.data[0], 30).length / 2}em`,
});
//   width: 450,
//   marginTop: 50,
//   marginLeft: 100,
//   color: {
//     scheme: "Plasma",
//   },
//   y: {
//     label: "CNU",
//     tickRotate: 30,
//     tickFormat: (d) => cropText(d),
//   },
//   x: {
//     grid: true,
//     axis: "top",
//     label: "Occurences",
//   },
//   marks: [
//     Plot.barX(shs_inteGREEN_cnu_count, {
//       y: (d) => d[0],
//       x: (d) => d[1],
//       fill: (d) => d[1],
//       sort: {y: "-x"},
//       tip: {
//         format: {
//           fill: false
//         },
//         lineWidth: 25,
//         textOverflow: "ellipsis-end"
//       }
//     }),
//     Plot.barX(
//       shs_inteGREEN_cnu_count, 
//       Plot.pointerY({x: (d) => d[1], y: (d) => d[0]}),
//     ),
//   ],
// });
```

<div class="grid grid-cols-2">
  <div class="card grid-colspan-1">
    <h2>CNUs</h2>
    <div>${shs_inteGREEN_cnu_percent_plot}</div>
  </div>
  <div class="card grid-colspan-1">
    <h2>Detailed CNUs</h2>
    <div style="max-height: 350px; overflow: auto">${inteGREEN_cnu_plot}</div>
  </div>
  <div class="card grid-colspan-1">
    <h2>CNUs SHS<h2>
    <div>${shs_inteGREEN_cnu_plot}</div>
  </div>
  <div class="card grid-colspan-1">
    <h2>ERC Disciplines</h2>
    <div>${inteGREEN_discipline_erc_pie}</div>
  </div>
</div>


## URBHEALTH

```js
// ERC Discipline count //
const URBHEALTH_discipline_erc_count = countEntities(
    phase_2_data.researchers.filter((d) => d.project.includes("URBHEALTH")),
    (d) => d.discipline_erc
  )
  .filter((d) => exclude(d.entity))
  .sort((a, b) => d3.descending(a.count, b.count));

const URBHEALTH_discipline_erc_pie = donutChart(URBHEALTH_discipline_erc_count, {
  width: 800,
  height: 450,
  legendLeftMargin: 110,
  fontSize: 18,
});
```

```js
// CNU count //
const URBHEALTH_cnu_count = d3.rollups(
    phase_2_data.researchers.filter((d) => d.project.includes("URBHEALTH")),
    (d) => d.length,
    (d) => d.cnu
  )
  .filter((d) => exclude(d[0]))
  .sort((a, b) => d3.descending(a[1], b[1]));
const shs_URBHEALTH_cnu_count = URBHEALTH_cnu_count
  .filter((d) => isSHSCNU(d[0]));
const shs_URBHEALTH_cnu_percent = d3.rollups(
  URBHEALTH_cnu_count,
  (D) => D.length,
  (d) => isSHSCNU(d[0]) ? 'SHS' : 'non-SHS'
);
```

```js
const URBHEALTH_cnu_plot = Plot.plot({
  // width: 500,
  marginTop: 50,
  marginLeft: 200,
  color: {
    scheme: "Plasma",
  },
  y: {
    label: "CNU",
    tickRotate: 0,
    tickFormat: (d) => cropText(d, 35),
  },
  x: {
    grid: true,
    axis: "top",
    label: "Occurences",
  },
  marks: [
    Plot.barX(URBHEALTH_cnu_count, {
      y: (d) => d[0],
      x: (d) => d[1],
      fill: (d) => d[1],
      sort: {y: "-x"},
      tip: {
        format: {
          fill: false
        },
        lineWidth: 25,
        textOverflow: "ellipsis-end"
      }
    }),
    Plot.barX(
      URBHEALTH_cnu_count, 
      Plot.pointerY({x: (d) => d[1], y: (d) => d[0]}),
    ),
  ],
});

const shs_URBHEALTH_cnu_plot = donutChart(shs_URBHEALTH_cnu_count, {
  width: 800,
  height: 450,
  legendLeftMargin: 110,
  fontSize: 18,
  keyMap: (d) => d[0],
  valueMap: (d) => d[1],
});

const shs_URBHEALTH_cnu_percent_plot = donutChart(shs_URBHEALTH_cnu_percent, {
  width: 800,
  height: 450,
  legendLeftMargin: 60,
  fontSize: 18,
  keyMap: (d) => d[0],
  valueMap: (d) => d[1],
  majorLabelBackgroundWidth: (d) => `${cropText(d.data[0], 30).length}em`,
  majorLabelBackgroundX: (d) => `-${cropText(d.data[0], 30).length / 2}em`,
});

// const shs_URBHEALTH_cnu_plot = Plot.plot({
//   width: 450,
//   marginTop: 50,
//   marginLeft: 100,
//   color: {
//     scheme: "Plasma",
//   },
//   y: {
//     label: "CNU",
//     tickRotate: 30,
//     tickFormat: (d) => cropText(d),
//   },
//   x: {
//     grid: true,
//     axis: "top",
//     label: "Occurences",
//   },
//   marks: [
//     Plot.barX(shs_URBHEALTH_cnu_count, {
//       y: (d) => d[0],
//       x: (d) => d[1],
//       fill: (d) => d[1],
//       sort: {y: "-x"},
//       tip: {
//         format: {
//           fill: false
//         },
//         lineWidth: 25,
//         textOverflow: "ellipsis-end"
//       }
//     }),
//     Plot.barX(
//       shs_URBHEALTH_cnu_count, 
//       Plot.pointerY({x: (d) => d[1], y: (d) => d[0]}),
//     ),
//   ],
// });
```

<div class="grid grid-cols-2">
  <div class="card grid-colspan-1">
    <h2>CNUs</h2>
    <div>${shs_URBHEALTH_cnu_percent_plot}</div>
  </div>
  <div class="card grid-colspan-1">
    <h2>Detailed CNUs</h2>
    <div style="max-height: 350px; overflow: auto">${URBHEALTH_cnu_plot}</div>
  </div>
  <div class="card grid-colspan-1">
    <h2>CNUs SHS<h2>
    <div>${shs_URBHEALTH_cnu_plot}</div>
  </div>
  <div class="card grid-colspan-1">
    <h2>ERC Disciplines</h2>
    <div>${URBHEALTH_discipline_erc_pie}</div>
  </div>
</div>


```js
// Table //
const overview_data = [];


const shs_neo_cnu_percent_obj = Object.fromEntries(new Map(shs_neo_cnu_percent));
const neo_discipline_erc_shs_count = d3.rollup(neo_discipline_erc_count, (D) => d3.reduce(D, (p, v) => p + v.count, 0), (d) => d.entity == 'SH - Sciences Humaines & Sociales');
shs_neo_cnu_percent_obj.label = 'NÉO';
shs_neo_cnu_percent_obj.erc_percent = `${(neo_discipline_erc_shs_count.get(true) / (neo_discipline_erc_shs_count.get(true) + neo_discipline_erc_shs_count.get(false)) * 100)
    .toPrecision(3)
  }%`;
shs_neo_cnu_percent_obj.cnu_percent =
  `${(shs_neo_cnu_percent_obj.SHS / (shs_neo_cnu_percent_obj.SHS + shs_neo_cnu_percent_obj['non-SHS']) * 100)
    .toPrecision(3)
  }%`;
overview_data.push(shs_neo_cnu_percent_obj);

// debugger;

const shs_RESILIENCE_cnu_percent_obj = Object.fromEntries(new Map(shs_RESILIENCE_cnu_percent));
const RESILIENCE_discipline_erc_shs_count = d3.rollup(RESILIENCE_discipline_erc_count, (D) => d3.reduce(D, (p, v) => p + v.count, 0), (d) => d.entity == 'SH - Sciences Humaines & Sociales');
shs_RESILIENCE_cnu_percent_obj.label = 'RÉSILIENCE';
shs_RESILIENCE_cnu_percent_obj.erc_percent = `${(RESILIENCE_discipline_erc_shs_count.get(true) / (RESILIENCE_discipline_erc_shs_count.get(true) + RESILIENCE_discipline_erc_shs_count.get(false)) * 100)
    .toPrecision(3)
  }%`;
shs_RESILIENCE_cnu_percent_obj.cnu_percent =
  `${(shs_RESILIENCE_cnu_percent_obj.SHS / (shs_RESILIENCE_cnu_percent_obj.SHS + shs_RESILIENCE_cnu_percent_obj['non-SHS']) * 100)
    .toPrecision(3)
  }%`;
overview_data.push(shs_RESILIENCE_cnu_percent_obj);

const shs_traces_cnu_percent_obj = Object.fromEntries(new Map(shs_traces_cnu_percent));
const traces_discipline_erc_shs_count = d3.rollup(traces_discipline_erc_count, (D) => d3.reduce(D, (p, v) => p + v.count, 0), (d) => d.entity == 'SH - Sciences Humaines & Sociales');
shs_traces_cnu_percent_obj.label = 'TRACES';
shs_traces_cnu_percent_obj.erc_percent = `${(traces_discipline_erc_shs_count.get(true) / (traces_discipline_erc_shs_count.get(true) + traces_discipline_erc_shs_count.get(false)) * 100)
    .toPrecision(3)
  }%`;
shs_traces_cnu_percent_obj.cnu_percent =
  `${(shs_traces_cnu_percent_obj.SHS / (shs_traces_cnu_percent_obj.SHS + shs_traces_cnu_percent_obj['non-SHS']) * 100)
    .toPrecision(3)
  }%`;
overview_data.push(shs_traces_cnu_percent_obj);

const shs_vfpp_cnu_percent_obj = Object.fromEntries(new Map(shs_vfpp_cnu_percent));
const vfpp_discipline_erc_shs_count = d3.rollup(vfpp_discipline_erc_count, (D) => d3.reduce(D, (p, v) => p + v.count, 0), (d) => d.entity == 'SH - Sciences Humaines & Sociales');
shs_vfpp_cnu_percent_obj.label = 'VF++';
shs_vfpp_cnu_percent_obj.erc_percent = `${(vfpp_discipline_erc_shs_count.get(true) / (vfpp_discipline_erc_shs_count.get(true) + vfpp_discipline_erc_shs_count.get(false)) * 100)
    .toPrecision(3)
  }%`;
shs_vfpp_cnu_percent_obj.cnu_percent =
  `${(shs_vfpp_cnu_percent_obj.SHS / (shs_vfpp_cnu_percent_obj.SHS + shs_vfpp_cnu_percent_obj['non-SHS']) * 100)
    .toPrecision(3)
  }%`;
overview_data.push(shs_vfpp_cnu_percent_obj);

const shs_VILLEGARDEN_cnu_percent_obj = Object.fromEntries(new Map(shs_VILLEGARDEN_cnu_percent));
const VILLEGARDEN_discipline_erc_shs_count = d3.rollup(VILLEGARDEN_discipline_erc_count, (D) => d3.reduce(D, (p, v) => p + v.count, 0), (d) => d.entity == 'SH - Sciences Humaines & Sociales');
shs_VILLEGARDEN_cnu_percent_obj.label = 'VILLEGARDEN';
shs_VILLEGARDEN_cnu_percent_obj.erc_percent = `${(VILLEGARDEN_discipline_erc_shs_count.get(true) / (VILLEGARDEN_discipline_erc_shs_count.get(true) + VILLEGARDEN_discipline_erc_shs_count.get(false)) * 100)
    .toPrecision(3)
  }%`;
shs_VILLEGARDEN_cnu_percent_obj.cnu_percent =
  `${(shs_VILLEGARDEN_cnu_percent_obj.SHS / (shs_VILLEGARDEN_cnu_percent_obj.SHS + shs_VILLEGARDEN_cnu_percent_obj['non-SHS']) * 100)
    .toPrecision(3)
  }%`;
overview_data.push(shs_VILLEGARDEN_cnu_percent_obj);

const shs_WHAOU_cnu_percent_obj = Object.fromEntries(new Map(shs_WHAOU_cnu_percent));
const WHAOU_discipline_erc_shs_count = d3.rollup(WHAOU_discipline_erc_count, (D) => d3.reduce(D, (p, v) => p + v.count, 0), (d) => d.entity == 'SH - Sciences Humaines & Sociales');
shs_WHAOU_cnu_percent_obj.label = 'WHAOU';
shs_WHAOU_cnu_percent_obj.erc_percent = `${(WHAOU_discipline_erc_shs_count.get(true) / (WHAOU_discipline_erc_shs_count.get(true) + WHAOU_discipline_erc_shs_count.get(false)) * 100)
    .toPrecision(3)
  }%`;
shs_WHAOU_cnu_percent_obj.cnu_percent =
  `${(shs_WHAOU_cnu_percent_obj.SHS / (shs_WHAOU_cnu_percent_obj.SHS + shs_WHAOU_cnu_percent_obj['non-SHS']) * 100)
    .toPrecision(3)
  }%`;
overview_data.push(shs_WHAOU_cnu_percent_obj);

const shs_inteGREEN_cnu_percent_obj = Object.fromEntries(new Map(shs_inteGREEN_cnu_percent));
const inteGREEN_discipline_erc_shs_count = d3.rollup(inteGREEN_discipline_erc_count, (D) => d3.reduce(D, (p, v) => p + v.count, 0), (d) => d.entity == 'SH - Sciences Humaines & Sociales');
shs_inteGREEN_cnu_percent_obj.label = 'inteGREEN';
shs_inteGREEN_cnu_percent_obj.erc_percent = `${(inteGREEN_discipline_erc_shs_count.get(true) / (inteGREEN_discipline_erc_shs_count.get(true) + inteGREEN_discipline_erc_shs_count.get(false)) * 100)
    .toPrecision(3)
  }%`;
shs_inteGREEN_cnu_percent_obj.cnu_percent =
  `${(shs_inteGREEN_cnu_percent_obj.SHS / (shs_inteGREEN_cnu_percent_obj.SHS + shs_inteGREEN_cnu_percent_obj['non-SHS']) * 100)
    .toPrecision(3)
  }%`;
overview_data.push(shs_inteGREEN_cnu_percent_obj);

const shs_URBHEALTH_cnu_percent_obj = Object.fromEntries(new Map(shs_URBHEALTH_cnu_percent));
const URBHEALTH_discipline_erc_shs_count = d3.rollup(URBHEALTH_discipline_erc_count, (D) => d3.reduce(D, (p, v) => p + v.count, 0), (d) => d.entity == 'SH - Sciences Humaines & Sociales');
shs_URBHEALTH_cnu_percent_obj.label = 'URBHEALTH';
shs_URBHEALTH_cnu_percent_obj.erc_percent = `${(URBHEALTH_discipline_erc_shs_count.get(true) / (URBHEALTH_discipline_erc_shs_count.get(true) + URBHEALTH_discipline_erc_shs_count.get(false)) * 100)
    .toPrecision(3)
  }%`;
shs_URBHEALTH_cnu_percent_obj.cnu_percent =
  `${(shs_URBHEALTH_cnu_percent_obj.SHS / (shs_URBHEALTH_cnu_percent_obj.SHS + shs_URBHEALTH_cnu_percent_obj['non-SHS']) * 100)
    .toPrecision(3)
  }%`;
overview_data.push(shs_URBHEALTH_cnu_percent_obj);

const shs_financed_cnu_percent_obj = Object.fromEntries(new Map(shs_financed_cnu_percent));
const financed_discipline_erc_shs_count = d3.rollup(financed_discipline_erc_count, (D) => d3.reduce(D, (p, v) => p + v.count, 0), (d) => d.entity == 'SH - Sciences Humaines & Sociales');
shs_financed_cnu_percent_obj.label = 'Financed Projects';
shs_financed_cnu_percent_obj.erc_percent = `${(financed_discipline_erc_shs_count.get(true) / (financed_discipline_erc_shs_count.get(true) + financed_discipline_erc_shs_count.get(false)) * 100)
    .toPrecision(3)
  }%`;
shs_financed_cnu_percent_obj.cnu_percent =
  `${(shs_financed_cnu_percent_obj.SHS / (shs_financed_cnu_percent_obj.SHS + shs_financed_cnu_percent_obj['non-SHS']) * 100)
    .toPrecision(3)
  }%`;
overview_data.push(shs_financed_cnu_percent_obj);

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
    phase_2_data.researchers.filter((d) => isFinanced(d.project)),
    (D) => D.length,
    (d) => exclude(d.discipline_erc) ? 'found_erc': 'missing_erc'
  );
missing_discipline_erc_count

const missing_cnu_count = d3.rollup(
    phase_2_data.researchers.filter((d) => isFinanced(d.project)),
    (D) => D.length,
    (d) => exclude(d.cnu) ? 'found_cnu': 'missing_cnu'
  );

const missing_data_table = Inputs.table(
  [{
    'Missing/unspecified CNU data':
      `${((missing_cnu_count.get('missing_cnu') ? missing_cnu_count.get('missing_cnu') : 0) / ((missing_cnu_count.get('missing_cnu') ? missing_cnu_count.get('missing_cnu') : 0) + (missing_cnu_count.get('found_cnu') ? missing_cnu_count.get('found_cnu') : 0)) * 100)
        .toPrecision(3)
      }%`,
    'Missing/unspecified ERC Discipline data':
      `${((missing_discipline_erc_count.get('missing_erc') ? missing_discipline_erc_count.get('missing_erc') : 0) / ((missing_discipline_erc_count.get('missing_erc') ? missing_discipline_erc_count.get('missing_erc') : 0) + (missing_discipline_erc_count.get('found_erc') ? missing_discipline_erc_count.get('found_erc') : 0)) * 100)
        .toPrecision(3)
      }%`
  }],
  {}
);
```

## Financed Project Summary

<div class="grid grid-cols-2">
  <div class="card grid-colspan-1">${overview_table}</div>
  <div class="card grid-colspan-1">${missing_data_table}</div>

</div>
