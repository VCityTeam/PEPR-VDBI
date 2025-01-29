import * as d3 from "npm:d3";
import { circleLegend } from "./legend.js";
import { cropText } from "./utilities.js";

/**
 * Map the elements of an array of objects (a table) to a graph with the following rules:
 * - Each object (row) is treated as a node with the properties (columns) of the object
 * - A link is created between nodes that share the same primitive property values
 * - A link is created between nodes with Array properties that share the same elements
 * - Links contain:
 *   - a `source` property
 *   - a `target` property
 *   - a `label` property denoting the property key
 *   - a `value` property denoting the property value
 * - !Duplicate rows are treated as duplicate nodes!
 * - !`null` and undefined properties are NOT ignored!
 * @param {Array<Object>} data - input table
 * @param {Object} options - configuration options
 * @returns {Object<Array, Array>}
 */
export function mapTableToPropertyGraphLinks(
  data,
  {
    id_key = "id", // the key used to identify a row
    column, // columns NOT in this list are ignored. Use all columns by default
    reflexive = false, // if there is a link from A to B, should a link be generated from B to A?
  } = {}
) {
  const links = [];
  // create links for each "row" and add them to an array (representing the links)
  data.forEach((row) => {
    // iterate though every property of every row
    for (const [key, value] of Object.entries(row)) {
      if (column && !column.includes(key)) {
        continue; // column not whitelisted
      } else if (key == id_key) {
        continue; // skip ids
      } else if (value instanceof Array) {
        const rows_to_link = [];
        // create link if other rows contain elements from this array
        for (let index = 0; index < value.length; index++) {
          const element = value[index];
          if (!element) {
            console.warn("No element found", index, key, value);
            continue;
          }
          // get rows with intersecting elements and add them to rows_to_link
          data
            .filter((d) => d[id_key] != row[id_key] && d[key].includes(element))
            .forEach((node) => rows_to_link.push(node));
          rows_to_link.forEach((node) => {
            links.push({
              source: row[id_key],
              target: node[id_key],
              label: key,
              value: element,
            });
          });
        }
      } else if (typeof value == Object) {
        continue; // not handled (yet)
      } else {
        // value must be primitive

        // get rows with the same value
        const rows_to_link = data.filter(
          (d) => d[id_key] != row[id_key] && d[key] == row[key]
        );

        for (let index = 0; index < rows_to_link.length; index++) {
          const row_to_link = rows_to_link[index];
          if (
            !reflexive &&
            links.some(
              (l) => l.source == row_to_link[id_key] && l.target == row[id_key]
            )
          ) {
            continue; // link already exists
          }

          links.push({
            source: row[id_key],
            target: row_to_link[id_key],
            label: key,
            value: value,
          });
        }
      }
    }
  });

  return links;
}

/**
 * @deprecated
 */
export function mapProjectsToRDFGraph(projects, colorMap = {}) {
  // create triples for each project and add them to an array (representing the graph)
  const nodes = [];
  const links = [];

  // nodes.push({ id: "PEPR VDBI", color: 0 });

  projects.forEach((project) => {
    // link to root node
    // links.push({
    //   source: "PEPR VDBI",
    //   label: "hasProjet",
    //   target: project.acronyme[0],
    // });
    // iterate though every entry of each project
    for (const [key, value] of Object.entries(project)) {
      if (key == "acronyme") {
        nodes.push({ id: project.acronyme, color: colorMap.acronyme });
      } else if (typeof value == "string") {
        if (!nodes.find((d) => d.id == value)) {
          nodes.push({ id: value, color: colorMap[key] });
        }
        links.push({ source: project.acronyme, label: key, target: value });
      } else {
        // push value of project properties to graph
        for (let index = 0; index < value.length; index++) {
          const element = value[index];
          if (!element) {
            console.warn("No element found", index, key, value);
          }
          if (!nodes.find((d) => d.id == element)) {
            nodes.push({ id: element, color: colorMap[key] });
          }
          links.push({
            source: project.acronyme, // project id
            label: key, // property name
            target: element, // unique value
          });
        }
      }
    }
  });

  return { nodes: nodes, links: links };
}

export function forceGraph(
  data = {
    /**
     *  {
     *    nodes: array<{
     *      id:    string,
     *      color: number
     *    }>,
     *    links: array<{
     *      source: string,
     *      label:  string,
     *      target: string
     *    }>
     *  }
     **/
  },
  {
    id = "d3_graph_" + Math.random().toString(36).substring(7),
    typeList = {}, // list of color lables for legend
    width = 500, // canvas width
    height = 500, // canvas height
    colorScale = d3.scaleOrdinal(d3.schemeCategory10), // color scheme
    fontSize = 10, // label font size
    r = 3, // node radius
    textLength = 15, // label cutoff length
    stroke = "#111", // stroke for links
    strokeWidth = 0.5, // stroke width for links
    strokeOpacity = 0.4, // stroke opacity for links
    textColor = "black", // label color
    halo = "#fff", // color of label halo
    haloWidth = 0.25, // padding around the labels
    labelOpacity = 0.2, // default label opacity
    highlightOpacity = 0.9, // mouseover label opacity
  }
) {
  const svg = d3
    .create("svg")
    .attr("id", id)
    .attr("class", "d3_graph")
    .attr("viewBox", [-width / 2, -height / 2, width, height])
    .style("display", "hidden");

  const links = data.links.map((d) => Object.create(d));
  const nodes = data.nodes.map((d) => Object.create(d));

  const simulation = d3
    .forceSimulation(nodes)
    .force(
      "link",
      d3.forceLink(links).id((d) => d.id)
    )
    .force("charge", d3.forceManyBody())
    // .force("center", d3.forceCenter(width / 2, height / 2));
    .force("x", d3.forceX())
    .force("y", d3.forceY());

  svg.call(d3.zoom().on("zoom", handleZoom));

  const link = svg
    .append("g")
    .attr("class", "links")
    .attr("stroke", stroke)
    .attr("stroke-opacity", strokeOpacity)
    .selectAll("line")
    .data(links)
    .join("line")
    .attr("stroke-width", strokeWidth);

  const node = svg
    .append("g")
    .attr("class", "nodes")
    .selectAll("circle")
    .data(nodes)
    .join("circle")
    .attr("r", r)
    .attr("stroke-opacity", strokeOpacity)
    .attr("stroke-width", strokeWidth)
    .attr("stroke", stroke)
    .attr("fill", (d) => colorScale(d.color))
    // .on("click", (event, datum) => {
    //   console.debug("event", event);
    //   console.debug("datum", datum);
    // })
    .on("mouseover", (event, datum) => {
      event.target.style["stroke-opacity"] = highlightOpacity;
      // event.target.style["stroke"] = "white";
      // event.target.style["fill"] = colorScale(nodes[datum.index].color);
      links
        .filter(
          // get node links
          (d) => datum.index == d.source.index || datum.index == d.target.index
        )
        .forEach((d) => {
          // update node highlight
          node
            .filter(
              (_, j) =>
                datum.index != j && (j == d.source.index || j == d.target.index)
            )
            .nodes()
            .forEach((d) => {
              d.style["stroke-opacity"] = highlightOpacity;
            });
          node_label
            .filter((_, j) => j == d.source.index || j == d.target.index)
            .nodes()
            .forEach((d) => {
              d.style["opacity"] = highlightOpacity;
            });
          link
            .filter((_, j) => j == d.index)
            .nodes()
            .forEach((d) => {
              d.style["stroke-opacity"] = highlightOpacity;
            });
          link_label
            .filter((_, j) => j == d.index)
            .nodes()
            .forEach((d) => {
              d.style["opacity"] = highlightOpacity;
            });
        });
    })
    .on("mouseout", (event, datum) => {
      event.target.style["stroke-opacity"] = strokeOpacity;
      // event.target.style["stroke"] = stroke;
      // event.target.style["fill"] = colorScale(nodes[datum.index].color);
      links
        .filter(
          // get node links
          (d) => datum.index == d.source.index || datum.index == d.target.index
        )
        .forEach((d) => {
          // update node highlight
          node
            .filter((_, j) => j == d.source.index || j == d.target.index)
            .nodes()
            .forEach((d) => {
              d.style["stroke-opacity"] = strokeOpacity;
            });
          node_label
            .filter((_, j) => j == d.source.index || j == d.target.index)
            .nodes()
            .forEach((d) => {
              d.style["opacity"] = labelOpacity;
            });
          link
            .filter((_, j) => j == d.index)
            .nodes()
            .forEach((d) => {
              d.style["stroke-opacity"] = strokeOpacity;
            });
          link_label
            .filter((_, j) => j == d.index)
            .nodes()
            .forEach((d) => {
              d.style["opacity"] = labelOpacity;
            });
        });
    })
    .call(drag(simulation));

  node.append("title").text((d) => d.id);

  const node_label = svg
    .selectAll(".node_label")
    .data(nodes)
    .enter()
    .append("text")
    .text((d) =>
      d.id.length > textLength ? d.id.slice(0, textLength).concat("...") : d.id
    )
    .style("text-anchor", "middle")
    .style("font-family", "Arial")
    .style("font-size", fontSize)
    .style("fill", textColor)
    .style("opacity", labelOpacity)
    // .style('fill', 'white')
    // .style('visibility', 'hidden')
    .attr("stroke-linejoin", "round")
    .attr("stroke-width", haloWidth)
    .attr("stroke", halo)
    .attr("paint-order", "stroke")
    .style("pointer-events", "none")
    .attr("class", "node_label");

  const link_label = svg
    .selectAll(".link_label")
    .data(links)
    .enter()
    .append("text")
    .text((d) =>
      d.label.length > textLength
        ? d.label.slice(0, textLength).concat("...")
        : d.label
    )
    .style("text-anchor", "middle")
    .style("font-family", "Arial")
    .style("font-size", fontSize)
    .style("fill", textColor)
    // .style('fill', 'white')
    // .style('visibility', 'hidden')
    .style("opacity", labelOpacity)
    .attr("stroke-linejoin", "round")
    .attr("stroke-width", haloWidth)
    .attr("stroke", halo)
    .attr("paint-order", "stroke")
    .style("pointer-events", "none")
    .attr("class", "link_label");

  simulation.on("tick", () => {
    node_label.attr("x", (d) => d.x).attr("y", (d) => d.y - 10);
    link
      .attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y);
    link_label
      .attr("x", (d) => (d.source.x + d.target.x) / 2)
      .attr("y", (d) => (d.source.y + d.target.y) / 2);
    node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
  });

  // Create legend
  svg
    .append("text")
    .attr("x", -width / 2 + 12)
    .attr("y", -height / 2 + 24)
    .style("font-size", "18px")
    .style("text-decoration", "underline")
    .text("Legend")
    .style("fill", "black");

  // legend colors
  svg
    .append("g")
    .attr("stroke", "#111")
    .attr("stroke-width", 1)
    .selectAll("rect")
    .data(Object.values(typeList))
    .join("rect")
    .attr("x", -width / 2 + 12)
    .attr("y", (_, i) => -height / 2 + 32 + i * 16)
    .attr("width", 10)
    .attr("height", 10)
    .style("fill", colorScale)
    .append("title")
    .text((d) => d);

  // legend text
  svg
    .append("g")
    .selectAll("text")
    .data(Object.keys(typeList))
    .join("text")
    .attr("x", -width / 2 + 26)
    .attr("y", (_, i) => -height / 2 + 41 + i * 16)
    .text((d) => d)
    .style("fill", "black")
    .style("font-size", "14px");

  return svg.node();

  // Interface Functions ///

  /**
   * Create a drag effect for graph nodes within the context of a force simulation
   *
   * @param {d3.forceSimulation} simulation The active D3 force simulation of the graph
   * @returns {d3.drag} a D3 drag function to enable dragging nodes within the graph
   */
  function drag(simulation) {
    /**
     *
     * @param {d3.D3DragEvent} event the drag event containing information on which node is being clicked and dragged
     */
    function dragstarted(event) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    /**
     *
     * @param {d3.D3DragEvent} event the drag event containing information on which node is being clicked and dragged
     */
    function dragged(event) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    /**
     *
     * @param {d3.D3DragEvent} event the drag event containing information on which node is being clicked and dragged
     */
    function dragended(event) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return d3
      .drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);
  }

  /**
   * A handler function for selecting elements to transform during a zoom event
   *
   * @param {d3.D3ZoomEvent} event the zoom event containing information on how the svg canvas is being translated and scaled
   */
  function handleZoom(event) {
    d3.selectAll(`#${id} g.nodes`)
      .attr("height", "100%")
      .attr("width", "100%")
      .attr("transform", event.transform);

    d3.selectAll(`#${id} g.links`)
      .attr("height", "100%")
      .attr("width", "100%")
      .attr("transform", event.transform);

    d3.selectAll(`#${id} text.node_label`)
      // .style("font-size", fontSize / event.transform.k + "px")
      .attr(
        "transform",
        "translate(" +
          event.transform.x +
          "," +
          event.transform.y +
          ") scale(" +
          event.transform.k +
          ")"
      );

    d3.selectAll(`#${id} text.link_label`)
      // .style("font-size", fontSize / event.transform.k + "px")
      .attr(
        "transform",
        "translate(" +
          event.transform.x +
          "," +
          event.transform.y +
          ") scale(" +
          event.transform.k +
          ")"
      );
  }
}

export function filterLinks(graph, filterFunction) {
  const filteredGraph = {
    nodes: graph.nodes,
    links: d3.filter(graph.links, filterFunction),
  };

  filteredGraph.nodes = d3.filter(graph.nodes, (node) =>
    filteredGraph.links.find(
      (link) => link.source == node.id || link.target == node.id
    )
  );

  return filteredGraph;
}

/**
* Create an arc diagram from a graph dataset
* Adapted from: https://observablehq.com/@d3/arc-diagram
*
* @param {Object} - a graph object with properites `nodes` and `links`
# @param {Object} options - configuration options for the diagram 
* @returns {d3.node} - SVG node containing the arc diagram
*/
export function arcDiagramVertical(
  {
    nodes, // : [
    //   { id: "A", group: 1 },
    //   { id: "B", group: 2 },
    // ],
    links, // : [
    // { source: "A", target: "B" },
    // ],
  },
  {
    // Specify the chart’s dimensions.
    width = 640,
    keyMap = (d) => d.id, // the function for identifying a node
    valueMap = (d) => d.group, // the function for categorizing/classing a node
    step = 14,
    marginTop = 20,
    marginBottom = 20,
    marginLeft = 130,
    marginRight = 130, // used when placing the legend
    height = (nodes.length - 1) * step + marginTop + marginBottom,
    r = 3,
    rMouseover = 3.5,
    // sort = sortNodes({ nodes, links }, { keyMap, valueMap }).get("by degree"),
    // sort = sortNodes({ nodes, links }, { keyMap, valueMap }).get("input"),
    sort = sortNodes({ nodes, links }, { keyMap, valueMap }).get("by name"),
    // sort = sortNodes({ nodes, links }, { keyMap, valueMap }).get("by property"),
    yPosition = d3.scalePoint(sort, [marginTop, height - marginBottom]),
    fontSize = 12,
    fontFill = "white",
    fontMouseoverOpacity = 0.3,
    arcMouseoverOpacity = 0.1,
    // A color scale for the nodes and links.
    color = d3
      .scaleOrdinal()
      .domain(nodes.map((d) => valueMap(d)).sort(d3.ascending))
      .range(
        d3
          .quantize(
            d3.interpolatePlasma,
            new Set(nodes.map((d) => valueMap(d))).size
          )
          .reverse()
      )
      .unknown("#aaa"),
    // create a circle legend from possible arc values
    legend = circleLegend(color.domain(), {
      keyMap: (d) => d,
      valueMap: (d) => d,
      color: color,
      text: (d) => cropText(d, 40),
    }),
  } = {}
) {
  // A function of a link, that checks that source and target have the same group and returns
  // the group; otherwise null. Used to color the links.
  const groups = new Map(nodes.map((d) => [keyMap(d), valueMap(d)]));

  function sameGroup({ source, target }) {
    return groups.get(source) === groups.get(target)
      ? groups.get(source)
      : null;
  }

  // Create the SVG container.
  const svg = d3
    .create("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .attr("style", "max-width: 100%; height: auto;");

  // The current position, indexed by id. Will be interpolated.
  const y_positions = new Map(
    nodes.map((d) => [keyMap(d), yPosition(keyMap(d))])
  );

  // Add an arc for each link.
  // can this be done more simply with d3.arc ?
  function arc(d) {
    const y1 = y_positions.get(d.source);
    const y2 = y_positions.get(d.target);
    const r = Math.abs(y2 - y1) / 2;
    // debugger;
    return `M${marginLeft},${y1}A${r},${r} 0,0,${
      y1 < y2 ? 1 : 0
    } ${marginLeft},${y2}`;
  }
  const path = svg
    .insert("g", "*")
    .attr("fill", "none")
    .attr("stroke-opacity", 0.6)
    .attr("stroke-width", 1.5)
    .selectAll("path")
    .data(links)
    .join("path")
    .attr("stroke", (d) => color(sameGroup(d)))
    .attr("d", arc);

  // Add a text label and a dot for each node.
  const label = svg
    .append("g")
    .attr("font-family", "sans-serif")
    .attr("font-size", fontSize)
    .attr("fill", fontFill)
    .attr("text-anchor", "end")
    .selectAll("g")
    .data(nodes)
    .join("g")
    .attr(
      "transform",
      (d) => `translate(${marginLeft},${y_positions.get(keyMap(d))})`
    )
    .call((g) =>
      g
        .append("text")
        .attr("x", -6)
        .attr("dy", "0.35em")
        // .attr("fill", (d) => color(valueMap(d)))
        .text((d) => keyMap(d))
    )
    .call((g) =>
      g
        .append("circle")
        .attr("r", r)
        .attr("fill", (d) => color(valueMap(d)))
    );

  // Add invisible rects that update the class of the elements on mouseover.
  label
    .append("rect")
    .attr("fill", "none")
    .attr("width", marginLeft + 40)
    .attr("height", step)
    .attr("x", -marginLeft)
    .attr("y", -step / 2)
    .attr("fill", "none")
    .attr("pointer-events", "all")
    .on("pointerenter", (_e, d) => {
      svg.classed("hover", true);
      label.classed("primary", (n) => n === d);
      label.classed("secondary", (n) =>
        links.some(
          ({ source, target }) =>
            (keyMap(n) === source && keyMap(d) === target) ||
            (keyMap(n) === target && keyMap(d) === source)
        )
      );
      path
        .classed(
          "primary",
          (l) => l.source === keyMap(d) || l.target === keyMap(d)
        )
        .filter(".primary")
        .raise();
      d3.selectAll(".legend g text")
        .data(color.domain())
        .classed("primary", (v) => v == valueMap(d));
    })
    .on("pointerout", () => {
      svg.classed("hover", false);
      label.classed("primary", false);
      label.classed("secondary", false);
      path.classed("primary", false).order();
      d3.select(".legend g text")
        .data(color.domain())
        .classed("primary", false);
    });

  // Add styles for the hover interaction.
  svg.append("style").text(`
    .hover text { opacity: ${fontMouseoverOpacity}; }
    .hover g.primary text { font-weight: bold; opacity: 1; }
    .hover g.primary circle { r: ${rMouseover} }
    .hover g.secondary text { opacity: 1; }
    .hover path { opacity: ${arcMouseoverOpacity}; }
    .hover path.primary { opacity: 1; }
    .hover .legend text.primary { opacity: 1; }
  `);

  // A function that updates the positions of the labels and recomputes the arcs
  // when passed a new order.
  function update(order) {
    yPosition.domain(order);

    label
      .sort((a, b) =>
        d3.ascending(y_positions.get(keyMap(a)), y_positions.get(keyMap(b)))
      )
      .transition()
      .duration(750)
      .delay((d, i) => i * 20) // Make the movement start from the top.
      .attrTween("transform", (d) => {
        const i = d3.interpolateNumber(
          y_positions.get(keyMap(d)),
          yPosition(keyMap(d))
        );
        return (t) => {
          const y = i(t);
          y_positions.set(keyMap(d), y);
          return `translate(${marginLeft},${y})`;
        };
      });

    path
      .transition()
      .duration(750 + nodes.length * 20) // Cover the maximum delay of the label transition.
      .attrTween("d", (d) => () => arc(d));
  }

  if (legend) {
    svg
      .append("g")
      .attr("transform", `translate(${width - marginRight},${marginTop})`)
      .append(() => legend);
  }

  return Object.assign(svg.node(), { update });
}

/**
 * Generate a map of different sorting options and their sorting function for a list of
 * nodes in a graph.
 * Adapted from: https://observablehq.com/@d3/arc-diagram
 * Sort options:
 * - "input": unsorted
 * - "by name": the nodes are sorted by their name
 * - "by property": the nodes are sorted by a node property
 * - "by degree": the nodes are sorted by their group
 *
 * @param {Object} - a graph object with properites `nodes` and `links`
 * @returns {Map} - a map of the node sort functions
 */
export function sortNodes(
  {
    nodes, // : [
    // { id: "A", group: 1 },
    // { id: "B", group: 2 },
    // ],
    links, // : [
    // { source: "A", target: "B" },
    // ],
  },
  { keyMap = (d) => d.id, valueMap = (d) => d.group }
) {
  const degree = d3.rollup(
    links.flatMap(({ source, target }) => [
      { node: source, count: 1 },
      { node: target, count: 1 },
    ]),
    (v) => d3.sum(v, ({ count }) => count),
    ({ node }) => node
  );
  console.debug("degree", degree);
  return new Map([
    ["by name", d3.sort(nodes.map(keyMap))],
    ["by property", d3.sort(nodes, valueMap, keyMap).map(keyMap)],
    ["input", nodes.map(keyMap)],
    [
      "by degree",
      d3
        .sort(
          nodes,
          (d) => (degree.has(keyMap(d)) ? degree.get(keyMap(d)) : 0),
          keyMap
        )
        .map(keyMap)
        .reverse(),
    ],
  ]);
}
