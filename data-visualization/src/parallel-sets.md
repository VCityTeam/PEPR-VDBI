---
sql:
  annex_partners: ./data/partners_by_project_annex.csv
  general_partners: ./data/partners_general.csv
  aap_partners: ./data/partners_aap2023.csv
  cjn1: data/cj_septembre_2022_n1.csv
  cjn2: data/cj_septembre_2022_n2.csv
  cjn3: data/cj_septembre_2022_n3.csv
---

<div style="color: grey; font: 13px/25.5px var(--sans-serif); text-transform: uppercase;"><h1 style="display: none;">Parallel sets</h1><a href="https://d3js.org/">D3</a> › <a href="/@d3/gallery">Gallery</a></div>

# Parallel sets

Example imported from https://observablehq.com/@d3/parallel-sets and adapted for the Observable Framework.

[Parallel sets](https://eagereyes.org/publications/Bendix-InfoVis-2005) are like [parallel coordinates](/@d3/parallel-coordinates), but for categorical dimensions. The thickness of each curved line represents a quantity that is repeatedly subdivided by category. This example looks at the *Titanic* disaster of 1912.

<div class="tip">
Code was moved to <code>/src/components/sankey.js</code> in the code repository
</div>

## Test data

Data: [Robert J. MacG. Dawson](http://jse.amstat.org/v3n3/datasets.dawson.html)

### Input data

```js
const data = await FileAttachment("data/titanic.csv").csv({typed: true});
display(Inputs.table(data));
```

### Data as graph

```js
const graph = csvToGraph(data);
display(graph);
```

```js echo

/**
 * Transform csv data to a graph interoperable with the SankeyDiagram example
 */
function csvToGraph(data) {
  const keys = data.columns.slice(0, -1);
  let index = -1;
  const nodes = [];
  const nodeByKey = new d3.InternMap([], JSON.stringify);;
  const indexByKey = new d3.InternMap([], JSON.stringify);;
  const links = [];

  for (const k of keys) {
    for (const d of data) {
      const key = [k, d[k]];
      if (nodeByKey.has(key)) continue;
      const node = {name: d[k]};
      nodes.push(node);
      nodeByKey.set(key, node);
      indexByKey.set(key, ++index);
    }
  }

  for (let i = 1; i < keys.length; ++i) {
    const a = keys[i - 1];
    const b = keys[i];
    const prefix = keys.slice(0, i + 1);
    const linkByKey = new d3.InternMap([], JSON.stringify);
    for (const d of data) {
      const names = prefix.map(k => d[k]);
      const value = d.value || 1;
      let link = linkByKey.get(names);
      if (link) { link.value += value; continue; }
      link = {
        source: indexByKey.get([a, d[a]]),
        target: indexByKey.get([b, d[b]]),
        names,
        value
      };
      links.push(link);
      linkByKey.set(names, link);
    }
  }
  return {nodes, links};
}
```

## Display parallel set

```js
import * as d3_sankey from "npm:d3-sankey"
```

```js
const sankey = new SankeyDiagram(graph);
display(sankey.canvas);
```

```js echo
class SankeyDiagram {
  constructor(
    graph,
    color = d3.scaleOrdinal(["Perished"], ["#da4f81"]).unknown("#ccc")
  ) {

    const width = 928;
    const height = 720;

    const sankey = d3_sankey.sankey()
      .nodeSort(null)
      .linkSort(null)
      .nodeWidth(4)
      .nodePadding(20)
      .extent([[0, 5], [width, height - 5]])

    const svg = d3.create("svg")
      .attr("viewBox", [0, 0, width, height])
      .attr("width", width)
      .attr("height", height)
      .attr("style", "max-width: 100%; height: auto;");

    const {nodes, links} = sankey({
      nodes: graph.nodes.map(d => Object.create(d)),
      links: graph.links.map(d => Object.create(d))
    });

    svg.append("g")
      .selectAll("rect")
      .data(nodes)
      .join("rect")
        .attr("x", d => d.x0)
        .attr("y", d => d.y0)
        .attr("height", d => d.y1 - d.y0)
        .attr("width", d => d.x1 - d.x0)
      .append("title")
        .text(d => `${d.name}\n${d.value.toLocaleString()}`);

    svg.append("g")
        .attr("fill", "none")
      .selectAll("g")
      .data(links)
      .join("path")
        .attr("d", d3_sankey.sankeyLinkHorizontal())
        .attr("stroke", d => color(d.names[0]))
        .attr("stroke-width", d => d.width)
        .style("mix-blend-mode", "multiply")
      .append("title")
        .text(d => `${d.names.join(" → ")}\n${d.value.toLocaleString()}`);

    svg.append("g")
        .style("font", "10px sans-serif")
      .selectAll("text")
      .data(nodes)
      .join("text")
        .attr("x", d => d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6)
        .attr("y", d => (d.y1 + d.y0) / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", d => d.x0 < width / 2 ? "start" : "end")
        .text(d => d.name)
      .append("tspan")
        .attr("fill-opacity", 0.7)
        .text(d => ` ${d.value.toLocaleString()}`);
    
    this.canvas = svg.node();
  }
}
```

# Test with partner category data
Load legal nature data as a hierarchy from INSEE catégories juridiques by level (from https://www.insee.fr/fr/information/2028129)

```js
display(Inputs.table(all_partner_data))
display(Inputs.table(await sql`select * from cjn1`))
display(Inputs.table(await sql`select * from cjn2`))
display(Inputs.table(await sql`select * from cjn3`))
```

```js
import {
  project_colors
} from "./components/color.js";
```

```sql id=all_partner_data echo
-- Clean tables
UPDATE general_partners
  SET project_name = 'RESILIENCE'
    WHERE project_name = 'RÉSILIENCE';
  UPDATE general_partners
    SET project_name = 'NEO'
    WHERE project_name = 'NÉO';

-- merge tables
WITH
  union_all AS (
    SELECT *
    FROM aap_partners
    UNION
    SELECT *
    FROM annex_partners
    UNION
    SELECT *
    FROM general_partners
  ),
  aggregate_partners as (
    SELECT
      -- siret,
      -- siren,
      project_name,
      nom_complet,
      nature_juridique,
      -- libelle_commune,
      -- commune,
      -- latitude,
      -- longitude,
      -- code_postal,
      -- region,
      -- list(project_coordinator) AS project_coordinator,
      -- list(source) AS sources,
      -- list(source_label) AS source_labels,
      count() as count,
    FROM union_all
    GROUP BY all
  )
SELECT
  aggregate_partners.project_name,
  aggregate_partners.nom_complet,
  aggregate_partners.nature_juridique,
  cjn3."Libellé" as "cjn3_label",
  cjn3."Code" as "cjn3_code",
  cjn2."Libellé" as "cjn2_label",
  cjn2."Code" as "cjn2_code",
  cjn1."Libellé" as "cjn1_label",
  cjn1."Code" as "cjn1_code",
  aggregate_partners.count as "value",
from aggregate_partners
join cjn3
on cjn3.Code = aggregate_partners.nature_juridique
join cjn2
on cjn2.Code = floor(aggregate_partners.nature_juridique / 100)
join cjn1
on cjn1.Code = floor(aggregate_partners.nature_juridique / 1000)
```

## Partners by category data

```js
display(Inputs.table(partners_by_category_data))
display(partner_graph)
```

```js echo
const partners_by_category_data = await [...all_partner_data].map((d) => {
  const datum = {...d};
  datum.category_3 = `(${datum.cjn3_code}) ${datum.cjn3_label}`
  datum.category_2 = `(${datum.cjn2_code}) ${datum.cjn2_label}`
  datum.category_1 = `(${datum.cjn1_code}) ${datum.cjn1_label}`
  return datum;
})

const partner_csv_data = Object.assign(
  partners_by_category_data,
  {
    columns: [
      "category_1",
      "category_2",
      // "category_3",
      'project_name',
      // "cjn3_label",
      // "cjn2_label",
      // "cjn1_label",
      // "cjn3_code",
      // "cjn2_code",
      // "cjn1_code",
      // 'nom_complet',
      // 'nature_juridique'
      "value",
    ]
  }
);
const partner_graph = csvToGraph(partner_csv_data);
```

```js
// const color = d3.scaleOrdinal(
//   project_colors.keys(),
//   project_colors.values(),
// )
const color = d3.scaleOrdinal(
  [
    "(0) Organisme de placement collectif en valeurs mobilières sans personnalité morale",
    "(1) Entrepreneur individuel",
    "(2) Groupement de droit privé non doté de la personnalité morale",
    "(3) Personne morale de droit étranger",
    "(4) Personne morale de droit public soumise au droit commercial",
    "(5) Société commerciale",
    "(6) Autre personne morale immatriculée au RCS",
    "(7) Personne morale et organisme soumis au droit administratif",
    "(8) Organisme privé spécialisé",
    "(9) Groupement de droit privé",
  ],
  d3.schemeSet3,
).unknown("#ccc")

display(Plot.legend({
  color: {
    type: "categorical",
    scheme: "set3",
  }
}))
display(new SankeyDiagram(partner_graph, color).canvas);
```
