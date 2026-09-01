---
sql:
  phase1_projects: /data/phase1-projects.tsv
  phase1_laboratories: /data/phase1-laboratories.tsv
  phase1_researchers: /data/phase1-researchers.tsv
  phase1_institutions: /data/phase1-institutions.tsv
  # general_partners: /data/partners_general.csv
  # aap_partners: /data/private/partenaires_aap2023.csv
  terrains: /data/project_terrains.tsv
  project_summary: /data/private/project_summary.csv
---

# Phase 1 Overview

> [!CAUTION]
> Some partner data sources are currently deprecated.

<div class="warning" label="Data visualization notice">
  Data visualizations are unverified and errors may exist. Regard these data
  visualizations as estimations and not a "ground truth".
</div>

<div class="grid grid-cols-4">
  <div class="card">
    <h2>Project count <span class="muted">(Total / Auditioned / Financed)</span></h2>
    <span class="big">
      <span class="muted">${project_data.length.toLocaleString()}</span> /
      <span class="muted">${auditioned_project_count.toLocaleString()}</span> /
      ${financed_project_count.toLocaleString()}
    </span>

  </div>
  <div class="card">
    <h2>University count <span class="muted">(Total / Auditioned / Financed)</span></h2>
    <span class="big">
      <span class="muted">${university_data.size.toLocaleString()}</span> /
      <span class="muted">${auditioned_university_data.size.toLocaleString()}</span>
      / ${financed_university_data.size.toLocaleString()}
    </span>

  </div>
  <div class="card">
    <h2>Laboratory count <span class="muted">(Total / Auditioned / Financed)</span></h2>
    <span class="big">
      <span class="muted">${laboratory_data.size.toLocaleString()}</span> /
      <span class="muted">${auditioned_laboratory_data.size.toLocaleString()}</span>
      / ${financed_laboratory_data.size.toLocaleString()}
    </span>

  </div>
  <div class="card">
    <h2>Partner count <span class="muted">(Total / Auditioned / Financed)</span></h2>
    <span class="big">
      <span class="muted">${partner_data.size.toLocaleString()}</span> /
      <span class="muted">${auditioned_partner_data.size.toLocaleString()}</span>
      / ${financed_partner_data.size.toLocaleString()}
    </span>

  </div>
</div>
<div class="grid grid-cols-3">
  <div class="card">
    <h2>University count by Project</h2>
    ${project_universities_auditioned_input}
    ${project_universities_financed_input}
    ${project_universities_sort_input}
    ${resize((width) => countPlot(
      width,
      "University count",
      filtered_projects_universities,
      project_universities_sort,
      (d) => d.institutions.length
    ))}
  </div>
  <div class="card">
    <h2>Laboratory count by Project</h2>
    ${project_laboratories_auditioned_input}
    ${project_laboratories_financed_input}
    ${project_laboratories_sort_input}
    ${resize((width) => countPlot(
      width,
      "Laboratory count",
      filtered_projects_laboratories,
      project_laboratories_sort,
      (d) => d.labs.length
    ))}
  </div>
  <div class="card">
    <h2>Partner count by Project</h2>
    ${project_partners_auditioned_input}
    ${project_partners_financed_input}
    ${project_partners_sort_input}
    ${resize((width) => countPlot(
      width,
      "Socio-economic partner count",
      filtered_projects_partners,
      project_partners_sort,
      (d) => d.partners.length
    ))}
  </div>
</div>

<div class="grid grid-cols-2">
  <div class="card">
    ${
      resize((width) =>
        Plot.plot({
          title: "Project locations",
          width: width,
          height: width,
          projection: {
            type: 'equal-earth',
            domain: d3.geoCircle().center([2, 47]).radius(5)(),
          },
          marks: [
            Plot.geo(regions, {
              stroke: 'white',
              strokeOpacity: 0.5,
              fill: vdbi_color_scheme.blue,
              fillOpacity: 0.3,
            }),
            Plot.geo(departements, {
              stroke: "white",
              strokeOpacity: 0.1,
            }),
            Plot.dot(
              filtered_terrain_data,
              {
                x: "longitude",
                y: "latitude",
                r: 3,
                fill: 'black',
                //stroke: vdbi_color_scheme.orange,
                //fillOpacity: 0.5,
                channels: {
                  entity: {
                    value: "terrain",
                    label: 'City',
                  },
                  count: {
                    value: (d) => 1,
                    label: 'Occurences',
                  },
                  longitude: {
                    value: "longitude",
                    label: 'Lon',
                  },
                  latitude: {
                    value: "latitude",
                    label: 'Lat',
                  },
                  projects: {
                    value: (d) => d.projects.toJSON(),
                    label: 'Projects',
                  },
                },
                tip: {
                  format: {
                    longitude: false,
                    latitude: false,
                    count: false,
                    x: false,
                    y: false,
                    r: false,
                  }
                },
              }
            ),
            // legend marks //
            Plot.link(
              terrain_tip_dots,
              {
                x1: (tip_datum) =>
                  terrain_legend.find(
                    (legend_datum) => legend_datum[0] === tip_datum.projects.toLocaleUpperCase()
                  )[2],
                y1: (tip_datum) =>
                  terrain_legend.find(
                    (legend_datum) => legend_datum[0] === tip_datum.projects.toLocaleUpperCase()
                  )[3],
                x2: "longitude",
                y2: "latitude",
                stroke: (d) => project_color_scale(d.projects.toLocaleUpperCase()),
                markerEnd: "arrow",
                curve: "bump-y",
              }
            ),
            Plot.dot(
              terrain_legend,
              {
                x: (d) => d[2],
                y: (d) => d[3],
                r: 5,
                fill: (d) => d[1],
              }
            ),
            Plot.text(
              terrain_legend,
              {
                x: (d) => d[2],
                y: (d) => d[3],
                dy: -12,
                text: (d) => d[0].toLocaleUpperCase(),
              }
            ),
            // tip marks //
            terrain_tips,
            Plot.sphere(),
          ],
        }),
      )
    }

  </div>
  <div class="card">
    <h2>Project Knowledge Graph</h2>
    <div style="padding-bottom: 5px;">${project_triples_predicate_select_input}</div>
    <div style="overflow: auto;">
      ${resize((width) =>
        new Graph(
          filtered_project_triples,
          {
            id: "project_force_graph",
            width: width,
            height: width - 50,
            color: color,
          }
        ).getSVG()
      )}
      <!-- $ -->
    </div>
  </div>
</div>

<div class="grid grid-cols-2">
  <div class="card">
    <h2>Project Financing</h2>
    ${project_search_input}
    ${project_grade_input}
    ${project_challenge_input}
    ${project_table}
  </div>
  <div class="card">
    <h2>Project summaries</h2>
    ${resize((width, height) => Inputs.table(
      sql`select * from project_summary`,
      {
        width: width,
        layout: "auto"
      }
    ))}

  </div>
</div>

```js
import { countEntities, sparkbar } from '/components/utilities.js'
import { Graph, mapTableToTriples } from '/components/graph.js'
import { projectionMap } from '/components/projection-map.js'
import { vdbi_color_scheme, project_color_scale } from '/components/color.js'
import { getColumnOptions, filterOnInput } from '/components/plot.js'
```

```js
// which terrain results are outside mainland france bbox?
const mainland_france_bbox = {
  min_x: -5.273438,
  max_x: 8.833008,
  min_y: 42.228517,
  max_y: 51.261915,
}

;[...terrain_data]
  .filter((d) => !inBBox(d.longitude, d.latitude, mainland_france_bbox))
  .forEach((d) => console.warn('terrain outside of france?', d.toJSON()))
```

<!-- Initial data integration -->

```sql id=terrain_data
-- clean and group terrain data
update terrains
set terrain = replace(terrain, 'Commune de ', '')
where starts_with(terrain, 'Commune de ');
update terrains
set terrain = replace(terrain, 'Ville de ', '')
where starts_with(terrain, 'Ville de ');
-- update terrains
-- set terrain = replace(terrain, 'Métropole d''', '')
-- where starts_with(terrain, 'Métropole d''');
-- update terrains
-- set terrain = replace(terrain, 'Métropole européenne de ', '')
-- where starts_with(terrain, 'Métropole européenne de ');

select
  terrain,
  list(project) as projects,
  first(latitude) as latitude,
  first(longitude) as longitude,
from terrains
group by all
```

```js
const regions = FileAttachment('/data/france_regions.json').json()
```

```js
const departements = FileAttachment('/data/france_departements.json').json()
```

```js
const project_data = [...(await sql`select * from phase1_projects`)]
const financed_project_data = [
  ...(await sql`select * from phase1_projects where financed`),
]
```

```js
const researcher_data = await FileAttachment(
  '/data/phase1-researchers.tsv',
).tsv({ typed: true })
const financed_researcher_data = researcher_data.filter((d) => d.financed)
```

```js
const laboratory_data = [...(await sql`select * from phase1_laboratories`)]
const auditioned_laboratory_data = [
  ...(await sql`select * from phase1_laboratories where auditioned`),
]
const financed_laboratory_data = [
  ...(await sql`select * from phase1_laboratories where financed`)
)]
```

```js
const university_data = new Set(
  d3.merge(project_data.map((d) => d.institutions)).sort(),
)
const auditioned_university_data = new Set(
  d3
    .merge(project_data.filter((d) => d.auditioned).map((d) => d.institutions))
    .sort(),
)
const financed_university_data = new Set(
  d3.merge(financed_project_data.map((d) => d.institutions)).sort(),
)
// const university_data = resolveInstitutionEntities(
//   getInstitutionSheet(workbook1),
//   anonymize,
//   anonymizeDict
// );
```

```js
const partner_data = new Set(
  d3.merge(project_data.map((d) => d.partners)).sort(),
)
```

```js
const auditioned_partner_data = new Set(
  d3
    .merge(project_data.filter((d) => d.auditioned).map((d) => d.partners))
    .sort(),
)
```

```js
const financed_partner_data = new Set(
  d3.merge(financed_project_data.map((d) => d.partners)).sort(),
)
```

```js
// project counts
const auditioned_project_count = d3.reduce(
  project_data,
  (p, v) => p + (v.auditioned ? 1 : 0),
  0,
)
const financed_project_count = d3.reduce(
  project_data,
  (p, v) => p + (v.financed ? 1 : 0),
  0,
)
```

<!-- DETAILED COUNTS -->

```js
// helper functions to access input field criteria
const critera_functions = [(d) => d.auditioned, (d) => d.financed]
const auditioned_options = getColumnOptions(project_data, 'auditioned')
const financed_options = getColumnOptions(project_data, 'financed')

const auditionedInput = () =>
  Inputs.select(auditioned_options, {
    value: true,
    label: 'Auditioned?',
  })

const financedInput = () =>
  Inputs.select(financed_options, {
    value: true,
    label: 'Financed?',
  })

const sortInput = (label = '') =>
  Inputs.select(
    new Map([
      ['Project name ⇧', 'x'],
      ['Project name ⇩', '-x'],
      [`${label} count ⇧`, 'y'],
      [`${label} count ⇩`, '-y'],
    ]),
    {
      value: 'x',
      label: 'Sort by',
    },
  )

const countPlot = (width, label, data, sort_value, accessor_function) => {
  return Plot.plot({
    width: width,
    height: width,
    marginBottom: 70,
    color: {
      scheme: 'Blues',
    },
    x: {
      tickRotate: -30,
      label: 'Project',
    },
    y: {
      grid: true,
      label: label,
      nice: true,
    },
    marks: [
      Plot.barY(data, {
        x: 'acronyme',
        y: accessor_function,
        fill: accessor_function,
        sort: { x: sort_value },
        tip: true,
      }),
    ],
  })
}
```

<!-- LABORATORY COUNT -->

```js
// project_laboratories by project filter select inputs
const project_laboratories_auditioned_input = auditionedInput()
const project_laboratories_financed_input = financedInput()

const project_laboratories_auditioned = Generators.input(
  project_laboratories_auditioned_input,
)
const project_laboratories_financed = Generators.input(
  project_laboratories_financed_input,
)

// project_laboratories by project sort select inputs
const project_laboratories_sort_input = sortInput('Laboratory')
const project_laboratories_sort = Generators.input(
  project_laboratories_sort_input,
)
```

```js
const filtered_projects_laboratories = filterOnInput(
  project_data,
  [project_laboratories_auditioned, project_laboratories_financed],
  critera_functions,
)

console.debug('filtered_projects_laboratories', filtered_projects_laboratories)
```

<!-- UNIVERSITY COUNT -->

```js
// project_universities by project filter select inputs
const project_universities_auditioned_input = auditionedInput()
const project_universities_financed_input = financedInput()

const project_universities_auditioned = Generators.input(
  project_universities_auditioned_input,
)
const project_universities_financed = Generators.input(
  project_universities_financed_input,
)

// project_universities by project sort select inputs
const project_universities_sort_input = sortInput('University')
const project_universities_sort = Generators.input(
  project_universities_sort_input,
)
```

```js
const filtered_projects_universities = filterOnInput(
  project_data,
  [project_universities_auditioned, project_universities_financed],
  critera_functions,
)

console.debug('filtered_projects_universities', filtered_projects_universities)
```

<!-- PARTNER COUNT -->

```js
// project_partners by project filter select inputs
const project_partners_auditioned_input = auditionedInput()
const project_partners_financed_input = financedInput()

const project_partners_auditioned = Generators.input(
  project_partners_auditioned_input,
)
const project_partners_financed = Generators.input(
  project_partners_financed_input,
)

// project_partners by project sort select inputs
const project_partners_sort_input = sortInput('Socio-economic partner')
const project_partners_sort = Generators.input(project_partners_sort_input)
```

```js
const filtered_projects_partners = filterOnInput(
  project_data,
  [project_partners_auditioned, project_partners_financed],
  critera_functions,
)

console.debug('filtered_projects_partners', filtered_projects_partners)
```

<!-- Project terrain map -->

```js
// point in bbox?
const inBBox = (
  longitude,
  latitude,
  { min_x = -180, max_x = 180, min_y = -180, max_y = 180 },
) =>
  min_x < longitude && longitude < max_x && min_y < latitude && latitude < max_y
```

```js
const ile_de_france_bbox = {
  min_x: 1.4425891164457563,
  max_x: 3.559891742088918,
  min_y: 48.120414136323795,
  max_y: 49.24342474094858,
}

const filtered_terrain_data = [...terrain_data]
  .filter(
    (d) =>
      d.terrain &&
      d.longitude &&
      d.latitude &&
      inBBox(d.longitude, d.latitude, mainland_france_bbox),
  )
  .map((d) => {
    // TODO: just add idf terrain, then update the project data
    const datum = { ...d }
    if (inBBox(d.longitude, d.latitude, ile_de_france_bbox)) {
      datum.terrain = 'Île-de-France'
      datum.longitude =
        (ile_de_france_bbox.max_x - ile_de_france_bbox.min_x) / 2 +
        ile_de_france_bbox.min_x
      datum.latitude =
        (ile_de_france_bbox.max_y - ile_de_france_bbox.min_y) / 2 +
        ile_de_france_bbox.min_y
    }
    return datum
  })

const filterIdfTerrains = [...terrain_data].filter((d) =>
  inBBox(d.longitude, d.latitude, ile_de_france_bbox),
)

const terrain_anchor_map = new Map([
  ['Saclay Cachan', 'top-right'],
  ['Lyon', 'top-right'],
  ['Plauzat', 'top-right'],
  ['Marseille', 'top-left'],
  ['Paris', 'top-left'],
  ["Métropole d'Aix Marseille Provence", 'bottom-left'],
  ['Villeurbanne', 'bottom-left'],
])

const terrain_tips = filtered_terrain_data.map((d) => {
  let tip_anchor = 'bottom'

  if (terrain_anchor_map.has(d.terrain)) {
    tip_anchor = terrain_anchor_map.get(d.terrain)
  }

  return Plot.tip([d.terrain], {
    x: d.longitude,
    y: d.latitude,
    textPadding: 1,
    strokeOpacity: 0,
    fillOpacity: 0.5,
    fontSize: 12,
    fontWeight: 'bold',
    anchor: tip_anchor,
  })
})

const terrain_tip_dots_float_left = [
  'Lyon',
  'Thiers',
  'Plauzat',
  'Saclay Cachan',
]

const terrain_tip_dots = filtered_terrain_data
  .flatMap((d) => {
    const indexed_projects = []
    const projects = d.projects.toJSON()

    for (let index = 0; index < projects.length; index++) {
      const data = { ...d }
      data.projects = projects[index]
      data.project_index = index
      data.x = terrain_tip_dots_float_left.includes(data.terrain)
        ? data.longitude - 0.2 - index * 0.2
        : data.longitude + 0.2 + index * 0.2
      data.y = data.latitude
      indexed_projects.push(data)
    }

    return indexed_projects
  })
  .filter((d) => !!d)

const terrain_legend = d3.zip(
  project_color_scale.domain(),
  project_color_scale.range(),
)

const mapToFranceLongitude = (index, subdivisions) =>
  d3.scaleLinear([0, subdivisions], [-4, 9.5])(index)

for (let index = 0; index < terrain_legend.length; index++) {
  terrain_legend[index].push(mapToFranceLongitude(index, terrain_legend.length))
  terrain_legend[index].push(52)
}

console.debug('terrain_tip_dots', terrain_tip_dots)
console.debug('terrain_legend', terrain_legend)
```

<!-- PROJECT KNOWLEDGE GRAPH -->

```js
const project_predicates = new Map([
  ['All', ''],
  ['Laboratories', 'labs'],
  ['Partners', 'partners'],
  ['Universities', 'institutions'],
])

// project triples //
const project_triples_predicate_select_input = Inputs.select(
  // we don't use global search here in case 0 results are returned by the search
  // Object.keys(project_data[0]),
  project_predicates,
  {
    label: 'Select property',
    sort: true,
    unique: true,
  },
)

const project_triples_predicate_select = Generators.input(
  project_triples_predicate_select_input,
)
```

```js
const project_triples = mapTableToTriples(financed_project_data, {
  id_key: 'acronyme',
  column: [...project_predicates.values()],
})

const filtered_project_triples = {
  nodes: project_triples.nodes.filter(
    ({ type }) =>
      project_triples_predicate_select == '' ||
      type == project_triples_predicate_select ||
      type == 'acronyme',
  ),
  links: project_triples.links.filter(({ label }) =>
    project_triples_predicate_select == ''
      ? true
      : label == project_triples_predicate_select,
  ),
}

const color = d3
  .scaleOrdinal(d3.schemeSet2)
  .domain(['acronyme', 'institutions', 'labs', 'partners'])
  // .range(
  //   d3
  //     .quantize(d3.interpolatePlasma, 4)
  // .reverse()
  // )
  .unknown('#aaa')

console.debug('project_triples', project_triples)
console.debug('color', color)
```

<!-- PROJECT FINANCING -->

```js
// create auditioned filter input
const project_auditioned_input = Inputs.select(auditioned_options, {
  value: 'All',
  label: 'Auditioned?',
})
const projects_auditioned = Generators.input(project_auditioned_input)

// create financed filter input
const project_financed_input = Inputs.select(financed_options, {
  value: 'All',
  label: 'Financed?',
})
const projects_financed = Generators.input(project_financed_input)

// create grade filter input
const project_grade_input = Inputs.select(
  getColumnOptions(project_data, 'grade'),
  {
    value: 'All',
    label: 'Grade',
  },
)
const project_grades = Generators.input(project_grade_input)

// create challenge filter input
const project_challenge_input = Inputs.select(
  getColumnOptions(project_data, 'challenge'),
  {
    value: 'All',
    label: 'Challenge',
  },
)
const project_challenge = Generators.input(project_challenge_input)
```

```js
// filter project data based on input fields
const filtered_project_data = filterOnInput(
  project_data,
  [projects_auditioned, projects_financed, project_grades, project_challenge],
  [(d) => d.auditioned, (d) => d.financed, (d) => d.grade, (d) => d.challenge],
)
```

```js
// create search input
const project_search_input = Inputs.search(filtered_project_data, {
  placeholder: 'Search projects...',
})
const projects_search = Generators.input(project_search_input)
```

```js
const project_table = Inputs.table(projects_search, {
  rows: 9,
  columns: [
    'acronyme',
    // "name_fr",
    // "grade",
    'challenge',
    'budget',
  ],
  header: {
    acronyme: 'Project Acronyme',
    name_fr: 'Project Name',
    budget: 'Budget (M)',
    grade: 'Jury grade',
    challenge: 'Primary challenge',
  },
  width: {
    acronyme: 120,
    grade: 80,
    challenge: 80,
  },
  align: {
    grade: 'center',
    challenge: 'center',
    budget: 'left',
  },
  format: {
    budget: sparkbar(d3.max(projects_search, (d) => d.budget)),
  },
})
```

<!-- debugging info -->

```js
console.debug('project_data', project_data)
console.debug('researcher_data', researcher_data)
console.debug('laboratory_data', laboratory_data)
console.debug('university_data', university_data)
console.debug('partner_data', partner_data)
console.debug('general_partners', [
  ...(await sql`select * from general_partners`),
])
console.debug('aap_partners', [...(await sql`select * from aap_partners`)])
console.debug('terrains', [...(await sql`select * from terrains`)])
console.debug('terrain_data', [...terrain_data])
console.debug('filterIdfTerrains', filterIdfTerrains)
```
