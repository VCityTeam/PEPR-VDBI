---
title: Phase 2 Researcher Dashboard
theme: dashboard
---

# Phase 2 Researchers

```js
import {
  countEntities,
  cropText
} from "./components/utilities.js";
import {
  extractPhase2Workbook,
  // getColumnOptions,
  // filterOnInput,
} from "./components/phase2-dashboard.js";
import {
  donutChart
} from "./components/pie-chart.js";
import {
  projectionMap
} from "./components/projection-map.js";
import {
  arcDiagramVertical,
  mapTableToPropertyGraphLinks
} from "./components/graph.js";
```

```js
const dev_mode = view(Inputs.toggle({label: "Developer Mode", value: false}));

// function for filtering out unknown values
const exclude = (d) => ![null, "non renseignée", "Non connue", "Non Renseigné"].includes(d);

const workbook1 = FileAttachment(
  // "./data/PEPR_VBDI_analyse_210524_15h24_GGE.xlsx" //outdated
  "./data/241021 PEPR_VBDI_analyse modifiée JYT.xlsx"
).xlsx();

const geocoded_researcher_sites = FileAttachment(
  "./data/researcher_sites.geocoded.csv"
).csv();

const world = FileAttachment("./data/world.json").json();
```

```js
// format data
const phase_2_data = extractPhase2Workbook(workbook1, false);

if (dev_mode) {
  display("phase_2_data.researchers");
  display(phase_2_data.researchers);
  display("geocoded_researcher_sites");
  display(geocoded_researcher_sites);
}

// global search //
const global_search_input = Inputs.search(phase_2_data.researchers, {
  placeholder: "Search dataset..."
});

const global_search = Generators.input(global_search_input);
```

```js
// Researcher table //
const researcher_search_input = Inputs.search(global_search, {
  placeholder: "Search researchers..."
});

const researcher_search = Generators.input(researcher_search_input);
```

```js
const researcher_table = Inputs.table(researcher_search, {
  height: 350,
  columns: [
    "fullname",
    // "firstname",
    // "lastname",
    "position",
    "project",
    "gender",
    "disciplines",
    "discipline_erc",
    "cnu",
    "site",
    "orcid",
    "idhal",
    "lab",
    "notes",
  ],
  header: {
    "fullname": "Name",
    "lastname": "Lastname",
    "firstname": "Firstname",
    "position": "Position",
    "project": "Project(s)",
    "gender": "Gender",
    "disciplines": "Discipline(s)",
    "discipline_erc": "ERC discipline",
    "cnu": "CNU",
    "site": "Site",
    "orcid": "ORCiD",
    "idhal": "idHAL",
    "lab": "Laboratory",
    "notes": "Notes",
  },
});
```

```js
// ERC Discipline count //
const discipline_erc_count = countEntities(
    global_search,
    (d) => d.discipline_erc
  )
  .filter((d) => exclude(d.entity))
  .sort((a, b) => d3.descending(a.count, b.count));

const discipline_erc_pie = donutChart(discipline_erc_count, {
  width: 650,
  fontSize: 18
});

if (dev_mode) {
  display("discipline_erc_count");
  display(discipline_erc_count);
}
```

```js
// Discipline count //
const discipline_count = countEntities(
  global_search,
  (d) => d.disciplines
).sort((a, b) => d3.descending(a.count, b.count));

const discipline_search_input = Inputs.search(discipline_count, {
  placeholder: "Search disciplines..."
});

const discipline_search = Generators.input(discipline_search_input);

if (dev_mode) {
  display("discipline_count");
  display(discipline_count);
}
```

```js
const discipline_plot = Plot.plot({
  width: 450,
  height: (discipline_search.length + 1) * 20,
  marginTop: 30,
  marginLeft: 100,
  color: {
    scheme: "Plasma",
  },
  y: {
    label: "Discipline",
    tickRotate: 30,
    tickFormat: (d) => cropText(d),
  },
  x: {
    grid: true,
    axis: "top",
    label: "Occurences",
    // ticks: 5,
    // domain: [0, Math.max(...discipline_search.map((d) => d.count)) + 1],
  },
  marks: [
    Plot.barX(discipline_search, {
      y: "entity",
      x: "count",
      fill: "count",
      sort: {y: "-x"},
      tip: {format: {fill: false}}
    }),
    Plot.barX(
      discipline_search, 
      Plot.pointerY({x: "count", y: "entity"}),
    ),
  ],
});
```

```js
// CNU count //
const cnu_count = d3.rollups(
    global_search,
    (d) => d.length,
    (d) => d.cnu
  )
  .filter((d) => exclude(d[0]))
  .sort((a, b) => d3.descending(a[1], b[1]));

const cnu_search_input = Inputs.search(cnu_count, {
  placeholder: "Search CNUs..."
});

const cnu_search = Generators.input(cnu_search_input);

if (dev_mode) {
  display("cnu_count");
  display(cnu_count);
}
```

```js
const cnu_plot = Plot.plot({
  width: 450,
  marginTop: 50,
  marginLeft: 100,
  color: {
    scheme: "Plasma",
  },
  y: {
    label: "CNU",
    tickRotate: 30,
    tickFormat: (d) => cropText(d),
  },
  x: {
    grid: true,
    axis: "top",
    label: "Occurences",
    // ticks: 5,
    // domain: [0, Math.max(...cnu_search.map((d) => d.count)) + 1],
  },
  marks: [
    Plot.barX(cnu_search, {
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
      cnu_search, 
      Plot.pointerY({x: (d) => d[1], y: (d) => d[0]}),
    ),
  ],
});
```

```js
// Position count //
const position_count = d3.rollups(
    global_search,
    (d) => d.length,
    (d) => d.position
  )
  .filter((d) => exclude(d[0]))
  .sort((a, b) => d3.descending(a[1], b[1]));

if (dev_mode) {
  display("position_count");
  display(position_count);
}
```

```js
const position_pie = donutChart(position_count, {
  width: 650,
  fontSize: 18,
  keyMap: (d) => d[0],
  valueMap: (d) => d[1],
});
```

```js
// researcher projection map //
const geocoded_researcher_sites_by_city = d3.groups(
  geocoded_researcher_sites.filter((d) => d.result_status == "ok"),
  (d) => d.result_city
);

const researcher_sites_by_city_plot = projectionMap(
  geocoded_researcher_sites_by_city,
  {
    width: 800,
    height: 800,
    borderList: [
      topojson.feature(world, world.objects.land),
      topojson.mesh(world, world.objects.countries, (a, b) => a !== b)
    ],
  }
);

if (dev_mode) {
  display("geocoded_researcher_sites_by_city");
  display(geocoded_researcher_sites_by_city);
}
```

```js
// researcher arcs //
const researcher_data_by_project_select_input = Inputs.select(
  global_search.flatMap((d) => d.project), {
    label: "Select project",
    sort: true,
    unique: true,
  }
);

const researcher_data_by_project_select = Generators.input(
  researcher_data_by_project_select_input
);

// const researcher_data_by_property_select_input = Inputs.select(
//   global_search.flatMap((d) => d.project), {
//     label: "Select relationship",
//     sort: true,
//     unique: true,
//   }
// );

// const researcher_data_by_project_select = Generators.input(
//   researcher_data_by_property_select_input
// );
```

```js
const researcher_data_by_project = global_search.filter(
  (d) => d.project.includes(researcher_data_by_project_select) && d.position != null
);
const researcher_links_by_position = mapTableToPropertyGraphLinks(
  researcher_data_by_project, {
    id_key: "fullname",
    column: [
      "fullname",
      "project",
      "disciplines",
      "discipline_erc",
      "position",
      "cnu",
      "site",
    ],
  }
).filter((d) => d.label == "position" && d.value != null);

if (dev_mode) {
  display("researcher_data_by_project");
  display(researcher_data_by_project);
  display("researcher_links_by_position");
  display(researcher_links_by_position);
}

const arc_diagram = arcDiagramVertical(
  {
    nodes: researcher_data_by_project,
    links: researcher_links_by_position
  }, {
    width: 600,
    marginLeft: 150,
    marginRight: 200,
    keyMap: (d) => d.fullname,
    valueMap: (d) => d.position
  }
);
```

<div class="warning" label="Data visualization policy">
  <ul>
    <li>Researchers with multiple disciplines are counted once per discipline.</li>
    <li>
      Missing researcher data is not visualized by default.
      This includes researchers that could not be geolocated.
    </li>
    <li>Data has not yet been verified. Some visualizations may be incorrect.</li>
  </ul>
</div>

### Dashboard Search
<div>${global_search_input}</div>

<div class="grid grid-cols-3">
  <div class="card grid-colspan-2">
    <h2>Researchers</h2>
    <div style="padding-bottom: 5px">${researcher_search_input}</div>
    <div style="max-height: 350px;">${researcher_table}</div>
  </div>
  <div class="card grid-colspan-1">
    <h2>ERC Disciplines</h2>
    <div>${discipline_erc_pie}</div>
  </div>
  <div class="card grid-colspan-1">
    <h2>CNUs</h2>
    <div style="padding-bottom: 5px">${cnu_search_input}</div>
    <div style="max-height: 350px; overflow: auto">${cnu_plot}</div>
  </div>
  <div class="card grid-colspan-2 grid-rowspan-2">
    <h2>Researcher Sites</h2>
    <div>${researcher_sites_by_city_plot}</div>
  </div>
  <div class="card grid-colspan-1">
    <h2>Position/status</h2>
    <div>${position_pie}</div>
  </div>
  <div class="card grid-colspan-2 grid-rowspan-1">
    <h2>Researcher Knowledge Graph</h2>
    <div style="padding-bottom: 5px">${researcher_data_by_project_select_input}</div>
    <div>${arc_diagram}</div>
  </div>
  <div class="card grid-colspan-1">
    <h2>Disciplines</h2>
    <div style="padding-bottom: 5px">${discipline_search_input}</div>
    <div style="max-height: 350px; overflow: auto">${discipline_plot}</div>
  </div>
</div>
