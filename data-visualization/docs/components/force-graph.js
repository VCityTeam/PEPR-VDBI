import * as d3 from "npm:d3";

export function mapEntitiesToGraph(projects) {
  // create triples for each project and add them to an array (representing the graph)
  const nodes = [];
  const links = [];

  // nodes.push({ id: "PEPR VDBI", color: 0 });

  projects.forEach((project) => {
    nodes.push({ id: project.acronyme[0], color: 0 });
    // link to root node
    // links.push({
    //   source: "PEPR VDBI",
    //   label: "hasProjet",
    //   target: project.acronyme[0],
    // });
    // iterate though every entry of each project
    for (const [key, value] of Object.entries(project)) { // TODO: minor optimization, use a while loop+stack to get nodes+links from values 
      // skip id cells
      if (key != "acronyme") {
        // push value of project properties to graph
        for (let index = 0; index < value.length; index++) {
          const element = value[index];
          if (!nodes.find((d) => d.id == element)) {
            nodes.push({ id: element, color: index });
          }
          links.push({
            source: project.acronyme[0], // project id
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
  data = {}, // { nodes: array<{ id: string, color: number }>, links: array<{ source: string, label: string, target: string }> }
  {
    typeList = [], // list of color lables for legend
    width = 500, // canvas width
    height = 500, // canvas height
    fontSize = 12, // label font size
    r = 3, // node radius
    textLength = 15, // label cutoff length
    stroke = "#111", // stroke for links
    strokeWidth = 1.5, // stroke width for links
    strokeOpacity = 0.4, // stroke opacity for links
    textColor = "black", // label color
    halo = "#fff", // color of label halo
    haloWidth = 1, // padding around the labels
    labelOpacity = 0.2, // default label opacity
    highlightOpacity = 0.9, // mouseover label opacity
  }
) {
  const svg = d3
    .create("svg")
    .attr("class", "d3_graph")
    .attr("viewBox", [0, 0, width, height])
    .style("display", "hidden");

  const links = data.links.map((d) => Object.create(d));
  const nodes = data.nodes.map((d) => Object.create(d));
  const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

  const simulation = d3
    .forceSimulation(nodes)
    .force(
      "link",
      d3.forceLink(links).id((d) => d.id)
    )
    .force("charge", d3.forceManyBody().strength(-60))
    .force("center", d3.forceCenter(width / 2, height / 2));

  const zoom = d3.zoom().on("zoom", handleZoom);

  svg.call(zoom);

  const link = svg
    .append("g")
    .attr("stroke", stroke)
    .attr("stroke-opacity", strokeOpacity)
    .selectAll("line")
    .data(links)
    .join("line")
    .attr("stroke-width", strokeWidth);

  const node = svg
    .append("g")
    .selectAll("circle")
    .data(nodes)
    .join("circle")
    .attr("r", r)
    .attr("stroke-opacity", strokeOpacity)
    .attr("stroke-width", strokeWidth)
    .attr("stroke", stroke)
    .attr("fill", (d) => colorScale(d.color))
    .on("click", (event, datum) => {
      // console.debug("event", event);
      // console.debug("datum", datum);
    })
    .on("mouseover", (event, datum) => {
      event.target.style["strokeOpacity"] = highlightOpacity;
      // event.target.style["stroke"] = "white";
      // event.target.style["fill"] = colorScale(nodes[datum.index].color);
      node_label
        .filter((_e, j) => {
          return datum.index == j;
        })
        // .style("fill", "white")
        .style("opacity", highlightOpacity);
      link_label
        .filter((e) => {
          return datum.index == e.source.index || datum.index == e.target.index;
        })
        // .style("fill", "white")
        .style("opacity", highlightOpacity);
      // console.debug("event", event);
      // console.debug("datum", datum);
    })
    .on("mouseout", (event, datum) => {
      event.target.style["strokeOpacity"] = strokeOpacity;
      // event.target.style["stroke"] = stroke;
      // event.target.style["fill"] = colorScale(nodes[datum.index].color);
      node_label
        .filter((_e, j) => {
          return datum.index == j;
        })
        // .style("fill", "grey")
        .style("opacity", labelOpacity);
      link_label
        .filter((e) => {
          return datum.index == e.source.index || datum.index == e.target.index;
        })
        // .style("fill", "grey")
        .style("opacity", labelOpacity);
      // console.debug("event", event);
      // console.debug("datum", datum);
    })
    .call(drag(simulation));

  node.append("title").text((d) => d.id);

  const node_label = svg
    .selectAll(".node_label")
    .data(nodes)
    .enter()
    .append("text")
    .text((d) => {
      return d.id.length > textLength
        ? d.id.slice(0, textLength).concat("...")
        : d.id;
    })
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
    .text((d) => {
      return d.label.length > textLength
        ? d.label.slice(0, textLength).concat("...")
        : d.label;
    })
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
    node_label
      .attr("x", function (d) {
        return d.x;
      })
      .attr("y", function (d) {
        return d.y - 10;
      });
    link
      .attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y);
    link_label
      .attr("x", function (d) {
        return (d.source.x + d.target.x) / 2;
      })
      .attr("y", function (d) {
        return (d.source.y + d.target.y) / 2;
      });
    node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
  });

  // Create legend
  svg
    .append("text")
    .attr("x", 12)
    .attr("y", 24)
    .style("font-size", "18px")
    .style("text-decoration", "underline")
    .text("Legend")
    .style("fill", "FloralWhite");

  // legend colors
  svg
    .append("g")
    .attr("stroke", "#111")
    .attr("stroke-width", 1)
    .selectAll("rect")
    .data(typeList)
    .join("rect")
    .attr("x", 12)
    .attr("y", (_d, i) => 32 + i * 16)
    .attr("width", 10)
    .attr("height", 10)
    .style("fill", (d, i) => {
      return setColor(i, "#000");
    })
    .append("title")
    .text((d) => d);

  // legend text
  svg
    .append("g")
    .selectAll("text")
    .data(typeList)
    .join("text")
    .attr("x", 26)
    .attr("y", (_d, i) => 41 + i * 16)
    .text((d) => d)
    .style("fill", "FloralWhite")
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
    d3.selectAll("svg g")
      .filter((_d, i) => i < 2)
      .attr("height", "100%")
      .attr("width", "100%")
      // .attr('transform', event.transform)
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
    d3.selectAll("text.node_label")
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
    d3.selectAll("text.link_label")
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
