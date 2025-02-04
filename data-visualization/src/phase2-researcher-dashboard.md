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
  forceGraph,
  mapTableToPropertyGraphLinks,
  sortNodes,
  mapTableToTriples,
} from "./components/graph.js";
```

```js
// function for filtering out unknown values
const exclude = (d) => ![
  null,
  "non renseignée",
  "Non connue",
  "non connues",
  "Non Renseigné"
].includes(d);

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

// join researchers and site tables
phase_2_data.researchers.forEach((researcher) => {
  // join on Sites
  const locale = geocoded_researcher_sites.find((d) => d.Sites === researcher.site);
  if (!locale) return;

  // join coordinates, result_name, result_score, and result_status
  researcher.latitude = locale.latitude;
  researcher.longitude = locale.longitude;
  researcher.geo_result_name = locale.result_name;
  researcher.geo_result_status = locale.result_status;
  researcher.geo_result_score = locale.result_score;
});

// console.debug("phase_2_data.researchers", phase_2_data.researchers);
// console.debug("geocoded_researcher_sites", geocoded_researcher_sites);


// Filter financed
const financed_input = Inputs.toggle(phase_2_data.researchers, {
  label: "Filter Financed Projects",
  value: true
});

const financed = Generators.input(financed_input);
```
```js
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

// console.debug("discipline_erc_count", discipline_erc_count);
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

// console.debug("discipline_count", discipline_count);
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

// console.debug("cnu_count", cnu_count);
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

// console.debug("position_count", position_count);
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
const ok_geocoded_researcher_sites = d3.groups(
  global_search.filter(
    (d) => d.geo_result_status == "ok" &&
    exclude(d.site) &&
    d.geo_result_score > 0.5
  ),
  (d) => d.site
);

const researcher_sites_projection = projectionMap(
  ok_geocoded_researcher_sites,
  {
    width: 700,
    height: 750,
    borderList: [
      topojson.feature(world, world.objects.land),
      topojson.mesh(world, world.objects.countries, (a, b) => a !== b)
    ],
  }
);

// console.debug("ok_geocoded_researcher_sites", ok_geocoded_researcher_sites);
```

```js
// researcher arcs //
const graph_columns = new Map([
  // ["Fullname", "fullname"],
  // ["Project", "project"],
  ["Disciplines", "disciplines"],
  ["ERC Discipline", "discipline_erc"],
  ["Position", "position"],
  ["CNU", "cnu"],
  ["Site", "site"],
]);
const arc_value_maps = new Map([
  ["fullname", (d) => d.fullname],
  ["project", (d) => d.project],
  ["disciplines", (d) => d.disciplines[0]], // for property values of Array, just use the first item. This will determine node/arc color
  ["discipline_erc", (d) => d.discipline_erc[0]],
  ["position", (d) => d.position],
  ["cnu", (d) => d.cnu],
  ["site", (d) => d.site],
]);

const researcher_arcs_by_project_select_input = Inputs.select(
  global_search.flatMap((d) => d.project),
  {
    label: "Select project",
    sort: true,
    unique: true,
  }
);

const researcher_arcs_by_project_select = Generators.input(
  researcher_arcs_by_project_select_input
);

const researcher_arcs_by_property_select_input = Inputs.select(
  graph_columns,
  {
    label: "Select relationship",
    sort: true,
    unique: true,
  }
);

const researcher_arcs_by_property_select = Generators.input(
  researcher_arcs_by_property_select_input
);
```

```js
const researcher_arcs_by_project = global_search.filter(
  (d) => d.project.includes(researcher_arcs_by_project_select)
);
const researcher_property_links = mapTableToPropertyGraphLinks(
  researcher_arcs_by_project,
  {
    id_key: "fullname",
    column: [...graph_columns.values()],
  }
).filter((d) => d.label == researcher_arcs_by_property_select && d.value != null);

// console.debug("researcher_arcs_by_project", researcher_arcs_by_project);
// console.debug("researcher_property_links", researcher_property_links);
```

```js
const arc_sort_map = sortNodes(
  {
    nodes: researcher_arcs_by_project,
    links: researcher_property_links
  },
  {
    keyMap: (d) => d.fullname,
    valueMap: arc_value_maps.get(researcher_arcs_by_property_select)
  }
);

const arc_sort_input = Inputs.select(
  arc_sort_map,
  {
    label: "Sort",
    sort: true,
    unique: true,
  }
);

// const arc_sort = Generators.input(
//   arc_sort_input
// );

const arc_diagram = arcDiagramVertical(
  {
    nodes: researcher_arcs_by_project,
    links: researcher_property_links
  }, {
    width: 600,
    height: 650,
    marginLeft: 200,
    marginRight: 180,
    marginBottom: 50,
    labelRotate: -15,
    sortInitKey: arc_sort_input.value,
    keyMap: (d) => d.fullname,
    valueMap: arc_value_maps.get(researcher_arcs_by_property_select),
  }
);

arc_sort_input.addEventListener("input", () => arc_diagram.update(arc_sort_input.value));
arc_diagram.update(arc_sort_input.value);
```

```js
// researcher triples //
const researcher_triples_predicate_select_input = Inputs.select(
  // we don't use global search here in case 0 results are returned by the search 
  Object.keys(phase_2_data.researchers[0]),
  {
    label: "Select property",
    sort: true,
    unique: true,
  }
);

const researcher_triples_predicate_select = Generators.input(
  researcher_triples_predicate_select_input
);
```

```js
const researcher_triples = mapTableToTriples(
  global_search, {
    id_key: "fullname",
    column: [...graph_columns.values()],
  }
);


const filtered_researcher_triples = {
  nodes: researcher_triples.nodes.filter(
    ({ type }) => type == researcher_triples_predicate_select || type == "fullname"
  ),
  links: researcher_triples.links.filter(
    ({ label }) => label == researcher_triples_predicate_select
  )
}

const color = d3
  .scaleOrdinal()
  .domain(["fullname", researcher_triples_predicate_select])
  .range(
    d3
      .quantize(d3.interpolatePlasma, 2)
      // .reverse()
  )
  .unknown("#aaa");

console.debug("researcher_triples", researcher_triples);
console.debug("color", color);

const researcher_force_graph = forceGraph(
  filtered_researcher_triples,
  {
    id: "researcher_force_graph",
    width: 700,
    height: 400,
    color: color,
    linkLabelOpacity: 0
  }
);
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

### Dashboard Search
<div>${global_search_input}</div>

<!-- <div class="grid grid-cols-3">
  <div class="card grid-colspan-2">
    <h2>Researchers</h2>
    <div style="padding-bottom: 5px;">${researcher_search_input}</div>
    <div style="max-height: 350px;">${researcher_table}</div>
  </div>
  <div class="card grid-colspan-1">
    <h2>Position/status</h2>
    <div>${position_pie}</div>
  </div>
  <div class="card grid-colspan-1">
    <h2>CNUs</h2>
    <div style="padding-bottom: 5px;">${cnu_search_input}</div>
    <div style="max-height: 350px; overflow: auto">${cnu_plot}</div>
  </div>
  <div class="card grid-colspan-1">
    <h2>Disciplines</h2>
    <div style="padding-bottom: 5px;">${discipline_search_input}</div>
    <div style="max-height: 350px; overflow: auto;">${discipline_plot}</div>
  </div>
  <div class="card grid-colspan-1">
    <h2>ERC Disciplines</h2>
    <div>${discipline_erc_pie}</div>
  </div>
</div> -->
<div class="grid grid-cols-4">
  <!-- <div class="card grid-colspan-2 grid-rowspan-2">
    <h2>Researcher Sites</h2>
    <div>${researcher_sites_projection}</div>
  </div>
  <div class="card grid-colspan-2 grid-rowspan-2">
    <h2>Researcher Relationships by Project</h2>
    <div style="padding-bottom: 5px;">${researcher_arcs_by_project_select_input}</div>
    <div style="padding-bottom: 5px;">${researcher_arcs_by_property_select_input}</div>
    <div style="padding-bottom: 5px;">${arc_sort_input}</div>
    <div style="max-height: 700px; overflow: auto;">${arc_diagram}</div>
  </div> -->
  <div class="card grid-colspan-4 grid-rowspan-2">
    <h2>Researcher Knowledge Graph</h2>
    <div style="padding-bottom: 5px;">${researcher_triples_predicate_select_input}</div>
    <div style="overflow: auto;">${researcher_force_graph}</div>
  </div>
</div>
