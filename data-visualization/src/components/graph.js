import * as d3 from "d3"
import { circleLegend } from "./legend.js"
import { cropText } from "./utilities.js"

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
 * - !`null` and `undefined` properties are NOT ignored!
 * This function is useful for creating the links of a directed property graph
 * @param {Object[]} data - input table
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
  const links = []
  // create links for each "row" and add them to an array (representing the links)
  data.forEach((row) => {
    // iterate though every property of every row
    for (const [key, value] of Object.entries(row)) {
      if (column && !column.includes(key)) {
        continue // column not whitelisted
      } else if (key == id_key || value == null || value == undefined) {
        continue
      } else if (typeof value == "string" || typeof value == "number") {
        // get rows with the same value
        const rows_to_link = data.filter(
          (d) => d[id_key] != row[id_key] && d[key] == row[key]
        )

        for (let index = 0; index < rows_to_link.length; index++) {
          const row_to_link = rows_to_link[index]
          if (
            !reflexive &&
            links.some(
              (l) => l.source == row_to_link[id_key] && l.target == row[id_key]
            )
          ) {
            continue // link already exists
          }

          links.push({
            source: row[id_key],
            target: row_to_link[id_key],
            label: key,
            value: value,
          })
        }
      } else if (value instanceof Array) {
        const rows_to_link = []
        // create link if other rows contain elements from this array
        for (let index = 0; index < value.length; index++) {
          const element = value[index]
          if (!element) {
            console.warn("No element found", index, key, value)
            continue
          }
          // get rows with intersecting elements and add them to rows_to_link
          data
            .filter((d) => d[id_key] != row[id_key] && d[key].includes(element))
            .forEach((node) => rows_to_link.push(node))
          rows_to_link.forEach((d) => {
            links.push({
              source: row[id_key],
              target: d[id_key],
              label: key,
              value: element,
            })
          })
        }
      } else {
        console.warn("Unknown property type", key, value)
      }
    }
  })

  return links
}

/**
 * Map the elements of an array of objects (a table) to a graph with the following rules:
 * - Each object (row) is treated as a node identified by an `id_key`
 * - A triple is created for every property of every row with primitive values
 * - A triple is created for every element of every Array of every row
 * - Triples contain:
 *   - a `source` property (the subject) created from the row id
 *   - a `label` property (the predicate) created from the property key
 *   - a `target` property (the object) created from the property value (or array element)
 * - A list of nodes is also created with the following properties:
 *   - an `id` property created from the property values (and Array elements) of the row
 *   - a `type` property created from the property keys of the row
 *     - note that this is not a standard RDF triple structure but is very useful for
 *       filtering and styling nodes
 * - !Duplicate rows are treated as duplicate nodes!
 * - `null` and `undefined` property values are ignored
 * This function is useful for creating the links of a directed graph
 * @param {Object[]} data - input table
 * @param {Object} options - configuration options
 * @returns {Object<Array, Array>}
 */
export function mapTableToTriples(
  data,
  {
    id_key = "id", // the key used to identify a row
    column, // columns NOT in this list are ignored. Use all columns by default
    // type_nodes = false, // create an RDF Type triple for each node
  } = {}
) {
  // create triples for each row and add them to an array (representing the graph)
  const nodes = []
  const links = []

  data.forEach((row) => {
    // create node
    nodes.push({ id: row[id_key], type: id_key })

    // iterate though every entry of each row
    for (const [key, value] of Object.entries(row)) {
      if (column && !column.includes(key)) {
        continue // column not whitelisted
      } else if (
        key == id_key ||
        value == "" ||
        value == null ||
        value == undefined
      ) {
        continue // ignore id key and null values
      } else if (typeof value == "string" || typeof value == "number") {
        // create target node if necessary
        if (!nodes.some(({ id, type }) => id == value && type == key))
          nodes.push({ id: value, type: key })

        // push value of row properties to graph
        links.push({ source: row[id_key], label: key, target: value })
      } else if (value instanceof Array) {
        for (let index = 0; index < value.length; index++) {
          const element = value[index]
          if (!element) {
            console.warn("No element found", index, key, value)
            continue
          }

          // create target node if necessary
          if (!nodes.some(({ id, type }) => id == element && type == key))
            nodes.push({ id: element, type: key })

          // push value of row Array elements to graph
          links.push({
            source: row[id_key],
            label: key,
            target: element,
          })
        }
      } else {
        console.warn("Unknown property type", key, value)
      }
    }
  })

  return { nodes: nodes, links: links }
}

/**
 * @deprecated, use `mapTableToTriples()` instead
 */
export function mapProjectsToRDFGraph(projects, colorMap = {}) {
  // create triples for each project and add them to an array (representing the graph)
  const nodes = []
  const links = []

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
        nodes.push({ id: project.acronyme, color: colorMap.acronyme })
      } else if (typeof value == "string") {
        if (!nodes.find((d) => d.id == value)) {
          nodes.push({ id: value, color: colorMap[key] })
        }
        links.push({ source: project.acronyme, label: key, target: value })
      } else {
        // push value of project properties to graph
        for (let index = 0; index < value.length; index++) {
          const element = value[index]
          if (!element) {
            console.warn("No element found", index, key, value)
          }
          if (!nodes.find((d) => d.id == element)) {
            nodes.push({ id: element, color: colorMap[key] })
          }
          links.push({
            source: project.acronyme, // project id
            label: key, // property name
            target: element, // unique value
          })
        }
      }
    }
  })

  return { nodes: nodes, links: links }
}

/**
 * @class Graph
 * A d3 force graph class for storing and visualizing graph data.
 */
export class Graph {
  /**
   * @param {object} data - an object with properties `nodes` and `links`
   * @param {object[]} data.nodes - an array of node objects with properties:
   *    nodes: array<{
   *      id:    string,
   *      color: number
   *    }>,
   * @param {object[]} data.links - an array of link objects with properties:
   *    links: array<{
   *      source: string,
   *      label:  string,
   *      target: string
   *    }>
   *  }
   * @param {object} options - configuration options for the graph
   * @param {string} options.id - the id of the graph SVG element
   * @param {number} options.width - canvas width
   * @param {number} options.height - canvas height
   * @param {number[]} options.viewBox - viewBox for the SVG canvas
   * @param {number[]} options.scaleExtent - bounding box for the canvas
   * @param {array[]} options.translateExtent - bounding box for the canvas
   * @param {Function} options.keyMap - the function for identifying a node
   * @param {Function} options.relationMap - the function for identifying a link
   * @param {Function} options.valueMap - the function for categorizing a node
   * @param {Function} options.xMap - horizontal position accessor
   * @param {Function} options.yMap - vertical position accessor
   * @param {Function} options.color - color scheme
   * @param {number} options.fontSize - label font size
   * @param {number} options.r - node radius
   * @param {number} options.textLength - label cutoff length
   * @param {number} options.stroke - stroke for links
   * @param {number} options.strokeWidth - stroke width for links
   * @param {number} options.nodeStrokeOpacity - stroke opacity for nodes
   * @param {number} options.linkStrokeOpacity - stroke opacity for links
   * @param {string} options.textColor - label color
   * @param {string} options.halo - color of label halo
   * @param {number} options.haloWidth - padding around the labels
   * @param {number} options.nodeLabelOpacity - default node label opacity
   * @param {number} options.linkLabelOpacity - default link label opacity
   * @param {number} options.highlightOpacity - mouseover label opacity
   * @param {number} options.nodeLabelOffset - move node label placement
   * @param {element} options.legend - legend for the graph
   * @param {number} options.legendX - horizontal location of legend
   * @param {number} options.legendY - vertical location of legend
   **/
  constructor(
    { nodes = [], links = [] },
    {
      id = "d3_graph_" + Math.random().toString(36).substring(7),
      width = 500,
      height = 500,
      viewBox = [-width / 2, -height / 2, width, height],
      scaleExtent = [0, Infinity],
      translateExtent = [
        [-Infinity, -Infinity],
        [Infinity, Infinity],
      ],
      keyMap = (d) => d.id,
      relationMap = (d) => d.label,
      valueMap = (d) => d.type,
      xMap = (d) => d.fx,
      yMap = (d) => d.fy,
      color = d3.scaleOrdinal(d3.schemeCategory10),
      fontSize = 10,
      r = 3,
      textLength = 15,
      stroke = "black",
      strokeWidth = 0.5,
      nodeStrokeOpacity = 0.4,
      linkStrokeOpacity = 0.6,
      textColor = "black",
      halo = "GhostWhite",
      haloWidth = 0.25,
      nodeLabelOpacity = 0.2,
      linkLabelOpacity = 0.2,
      highlightOpacity = 1,
      nodeLabelOffset = 10,
      legend = circleLegend(
        [
          ...new Set(
            nodes
              .map((d) => valueMap(d))
              .filter((d) => d != null)
              .sort(d3.ascending)
          ),
        ],
        {
          keyMap: (d) => d,
          valueMap: (d) => d,
          color: color,
          lineSeparation: 20,
          text: (d) => cropText(d, 40),
          backgroundColor: "black",
          backgroundStroke: "black",
          backgroundOpacity: 0.1,
        }
      ),
      legendX = -width / 2 + 10,
      legendY = -height / 2 + 10,
    }
  ) {
    this.nodes = [...nodes]
    this.links = [...links]
    this.id = id
    this.width = width
    this.height = height
    this.viewBox = viewBox
    this.scaleExtent = scaleExtent
    this.translateExtent = translateExtent
    this.keyMap = keyMap
    this.relationMap = relationMap
    this.valueMap = valueMap
    this.xMap = xMap
    this.yMap = yMap
    this.color = color
    this.fontSize = fontSize
    this.r = r
    this.textLength = textLength
    this.stroke = stroke
    this.strokeWidth = strokeWidth
    this.nodeStrokeOpacity = nodeStrokeOpacity
    this.linkStrokeOpacity = linkStrokeOpacity
    this.textColor = textColor
    this.halo = halo
    this.haloWidth = haloWidth
    this.nodeLabelOpacity = nodeLabelOpacity
    this.linkLabelOpacity = linkLabelOpacity
    this.highlightOpacity = highlightOpacity
    this.nodeLabelOffset = nodeLabelOffset
    this.legend = legend
    this.legendX = legendX
    this.legendY = legendY

    this.svg = d3
      .create("svg")
      .attr("id", id)
      .attr("class", "d3_graph")
      .attr("viewBox", viewBox)
      .style("display", "hidden")

    // Add styles for the user interaction.
    this.svg.append("style").text(`
      .hover circle.highlight { opacity: ${highlightOpacity} }
      .hover circle { opacity: 0.1; }
      .hover line.highlight { opacity: ${highlightOpacity}; }
      .hover line { opacity: 0.1; }
      .hover text.highlight { font-weight: bold; opacity: ${highlightOpacity}; }
      .hover text.secondary { opacity: ${highlightOpacity}; }
      .hover text { opacity: 0.1; }
    `)

    this.svg
      .append("g")
      .attr("class", "links")
      .attr("stroke", stroke)
      .attr("stroke-opacity", linkStrokeOpacity)

    this.svg.append("g").attr("class", "nodes")

    this.svg
      .append("g")
      .attr("class", "link_labels")
      .style("text-anchor", "middle")
      .style("font-family", "Arial")
      .style("font-size", this.fontSize)
      .style("fill", this.textColor)
      // .style('fill', 'white')
      // .style('visibility', 'hidden')
      .style("opacity", this.linkLabelOpacity)
      .style("pointer-events", "none")

    this.svg
      .append("g")
      .attr("class", "node_labels")
      .style("text-anchor", "middle")
      .style("font-family", "Arial")
      .style("font-size", this.fontSize)
      .style("fill", this.textColor)
      .style("opacity", this.nodeLabelOpacity)
      // .style('fill', 'white')
      // .style('visibility', 'hidden')
      .style("pointer-events", "none")

    if (legend) {
      const legend_svg = this.svg
        .append("g")
        .attr("transform", `translate(${legendX},${legendY})`)
      legend_svg.append(() => legend)
    }

    this.simulation = this.createSimulation()
    Object.assign(this.svg.node(), { simulation: this.simulation })

    this.update()

    this.zoom = d3
      .zoom()
      .scaleExtent(scaleExtent)
      .translateExtent(translateExtent)
      .on("zoom", this.handleZoom(id))
    this.svg.call(this.zoom)
  }

  /**
   * Update the graph with new nodes and links.
   */
  update() {
    this.simulation.nodes(this.nodes)
    this.simulation.force("link").links(this.links)
    this.simulation.restart()

    this.getNodes()
      .data(this.nodes)
      .join("circle")
      .attr("r", this.r)
      .attr("stroke-opacity", this.nodeStrokeOpacity)
      .attr("stroke-width", this.strokeWidth)
      .attr("stroke", this.stroke)
      .attr("fill", (d) => this.color(this.valueMap(d)))
      .on("pointerup", this.handleNodePointerup())
      .on("pointerdown", this.handleNodePointerdown())
      .on("pointerenter", this.handleNodePointerenter())
      .on("pointerout", this.handleNodePointerout())
      .style("pointer-events", "all")
      .call(this.handleDrag(this.simulation))
    this.getNodes().append("title").text(this.keyMap)

    this.getLinks()
      .data(this.links)
      .join("line")
      .style("pointer-events", "none")
      .attr("stroke-width", this.strokeWidth)

    this.getNodeLabels()
      .data(this.nodes)
      .join("text")
      .text((d) => cropText(this.keyMap(d), this.textLength))
      .attr("stroke-linejoin", "round")
      .attr("stroke-width", this.haloWidth)
      .attr("stroke", this.halo)
      .attr("paint-order", "stroke")

    this.getLinkLabels()
      .data(this.links)
      .join("text")
      .text((d) => cropText(this.relationMap(d), this.textLength))
      .attr("stroke-linejoin", "round")
      .attr("stroke-width", this.haloWidth)
      .attr("stroke", this.halo)
      .attr("paint-order", "stroke")
  }

  // Getters for the graph elements //

  /**
   * Get the SVG element of the graph
   * @returns {d3.node} the SVG node of the graph
   */
  getCanvas() {
    return this.svg.node()
  }

  /**
   * Get the SVG node group of the graph
   * @returns {d3.selection} the node group
   */
  getNodeGroup() {
    return this.svg.selectAll(`#${this.id} g.nodes`)
  }

  /**
   * Get the SVG link group of the graph
   * @returns {d3.selection} the link group
   */
  getLinkGroup() {
    return this.svg.selectAll(`#${this.id} g.links`)
  }

  /**
   * Get the SVG node label group of the graph
   * @returns {d3.selection} the node label group
   */
  getNodeLabelGroup() {
    return this.svg.selectAll(`#${this.id} g.node_labels`)
  }

  /**
   * Get the SVG link label group of the graph
   * @returns {d3.selection} the link label group
   */
  getLinkLabelGroup() {
    return this.svg.selectAll(`#${this.id} g.link_labels`)
  }

  /**
   * Get the SVG nodes of the graph
   * @returns {d3.selection} the SVG nodes
   */
  getNodes() {
    return this.getNodeGroup().selectAll("circle")
  }

  /**
   * Get the SVG link group of the graph
   * @returns {d3.selection} the SVG links
   */
  getLinks() {
    return this.getLinkGroup().selectAll("line")
  }

  /**
   * Get the SVG node label group of the graph
   * @returns {d3.selection} the SVG node labels
   */
  getNodeLabels() {
    return this.getNodeLabelGroup().selectAll("text")
  }

  /**
   * Get the SVG link label group of the graph
   * @returns {d3.selection} the SVG link labels
   */
  getLinkLabels() {
    return this.getLinkLabelGroup().selectAll("text")
  }

  /**
   * Start a force simulation from graph data
   *
   * @returns {d3.forceSimulation} a D3 force simulation object
   */
  createSimulation() {
    return (
      d3
        .forceSimulation(this.nodes)
        // .alphaDecay('0.03')
        .force("link", d3.forceLink(this.links).id(this.keyMap))
        .force("charge", d3.forceManyBody())
        .force("collide", d3.forceCollide().radius(this.r).iterations(3))
        .force("x", d3.forceX())
        .force("y", d3.forceY())
        .force("fx", this.xMap)
        .force("fy", this.yMap)
        .on("tick", this.handleTick())
    )
  }

  /**
   * Create a drag effect for graph nodes within the context of a force simulation
   * @returns {d3.drag} a D3 drag function to enable dragging nodes within the graph
   */
  handleDrag(simulation) {
    /**
     *
     * @param {d3.D3DragEvent} event the drag event containing information on which node is being clicked and dragged
     */
    function dragstarted(event) {
      if (!event.active) simulation.alphaTarget(0.3).restart()
      event.subject.fx = event.subject.x
      event.subject.fy = event.subject.y
    }

    /**
     *
     * @param {d3.D3DragEvent} event the drag event containing information on which node is being clicked and dragged
     */
    function dragged(event) {
      event.subject.fx = event.x
      event.subject.fy = event.y
    }

    /**
     *
     * @param {d3.D3DragEvent} event the drag event containing information on which node is being clicked and dragged
     */
    function dragended(event) {
      if (!event.active) simulation.alphaTarget(0)
      event.subject.fx = null
      event.subject.fy = null
    }

    return d3
      .drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended)
  }

  /**
   * A handler function for selecting elements to transform during a zoom event
   *
   */
  handleZoom() {
    return (event) => {
      this.getNodeGroup()
        .attr("height", "100%")
        .attr("width", "100%")
        .attr("transform", event.transform)

      this.getLinkGroup()
        .attr("height", "100%")
        .attr("width", "100%")
        .attr("transform", event.transform)

      this.getNodeLabelGroup()
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
        )

      this.getLinkLabelGroup()
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
        )
    }
  }

  /**
   * A handler function for updating elements to every simulation tick
   */
  handleTick() {
    return () => {
      this.getNodes()
        .attr("cx", (d) => d.x)
        .attr("cy", (d) => d.y)
      this.getNodeLabels()
        .attr("x", (d) => d.x)
        .attr("y", (d) => d.y - this.nodeLabelOffset)
      this.getLinks()
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y)
      this.getLinkLabels()
        .attr("x", (d) => (d.source.x + d.target.x) / 2)
        .attr("y", (d) => (d.source.y + d.target.y) / 2)
    }
  }

  // Event handlers for node interactions //

  /**
   * function to handle mouseout events on nodes: highlight the hovered node and connected links
   */
  handleNodePointerenter() {
    return (_event, datum) => {
      this.svg.classed("hover", true)
      this.getNodes().classed("highlight", (d) => d === datum)
      this.getNodeLabels().classed("highlight", (d) => d === datum)
      this.getLinks().classed(
        "highlight",
        ({ source, target }) => datum === target || datum === source
      )
      this.getLinkLabels().classed(
        "highlight",
        ({ source, target }) => datum === target || datum === source
      )

      d3.selectAll(".legend g text")
        .data(this.color.domain())
        .classed("highlight", (v) => v == this.valueMap(datum))
    }
  }

  /**
   * function to handle pointerout events on nodes
   */
  handleNodePointerout() {
    return () => {
      this.svg.classed("hover", false)
      this.getNodes().classed("highlight", false)
      this.getNodeLabels().classed("highlight", false)
      this.getLinks().classed("highlight", false)
      this.getLinkLabels().classed("highlight", false)
    }
  }

  /**
   * function to handle pointerdown events on nodes
   */
  handleNodePointerdown() {
    // return (event, datum) => {
    //   console.debug('event', event);
    //   console.debug('datum', datum);
    // };
  }

  /**
   * function to handle pointerup events on nodes
   */
  handleNodePointerup() {
    // return (event, datum) => {
    //   console.debug('event', event);
    //   console.debug('datum', datum);
    // };
  }
}

/**
 * @deprecated
 */
export function forceGraph(data, options = {}) {
  const graph = new Graph(data, options)
  return graph.getCanvas()
}

export class StaticGraph extends Graph {
  /**
   * Create an initially static graph with a stopped simulation and fixed nodes.
   *
   * @param {object} data - Same as `Graph`, with properties `nodes` and `links`.
   * @param {object} options - Same as super constructor with the addition of several properties.
   */
  constructor(
    data,
    {
      margin = 250, // margin for zoom and pan extents
      xMap = (d) => d.fx, // horizontal position accessor
      yMap = (d) => d.fy, // vertical position accessor
      translateExtent = [
        [d3.min(data.nodes, xMap) - margin, d3.min(data.nodes, yMap) - margin],
        [d3.max(data.nodes, xMap) + margin, d3.max(data.nodes, yMap) + margin],
      ], // zoom and pan extents
      viewBox = [
        translateExtent[0][0],
        translateExtent[0][1],
        translateExtent[1][0] - translateExtent[0][0],
        translateExtent[1][1] - translateExtent[0][1],
      ],
      legendX = translateExtent[0][0] + 10,
      legendY = translateExtent[0][1] + 10,
    }
  ) {
    super(
      data,
      Object.assign(
        {
          xMap: xMap,
          yMap: yMap,
          translateExtent: translateExtent,
          viewBox: viewBox,
          legendX: legendX,
          legendY: legendY,
        },
        arguments[1]
      )
    )
  }

  /**
   * An empty drag function for static graphs.
   *
   */
  handleDrag() {
    return d3.drag().on("start", null).on("drag", null).on("end", null)
  }
}

export class MuralGraph extends StaticGraph {
  /**
   * Create an initially static graph. Add links through mouse clicks
   *
   * @param {object} data - Same as super constructor, with properties `nodes` and `links`.
   * @param {object} options - Same as super constructor with the addition of several properties.
   */
  constructor(data, options) {
    super(data, options)
    this.selectedNode = null // the currently selected node's datum
    this.svg.append("style").text(`
      circle.selected { opacity: 1; stroke-width: ${this.nodeStroke * 1.5}; }
      text.selected { font-weight: bold; opacity: 1; }
    `)
  }

  /**
   * Click handler for nodes to select or link them
   */
  handleNodePointerdown() {
    return (_event, datum) => {
      if (!this.selectedNode) {
        // select the clicked node
        this.selectedNode = datum
        this.getNodes().classed("selected", (d) => d === datum)
        this.getNodeLabels().classed("selected", (d) => d === datum)
      } else if (this.selectedNode !== datum) {
        // if a different node is already selected, create a link to the clicked node
        this.links.push({
          source: this.selectedNode,
          target: datum,
          label: prompt("new link label:") || "",
        })
        this.update()
        // this.simulation.nodes(this.nodes).force('link').links(this.links);
        // this.simulation.tick();
        this.selectedNode = null // reset selected node
        this.getNodes().classed("selected", false)
        this.getNodeLabels().classed("selected", false)
      } else {
        // if the clicked node is already selected, deselect it
        this.selectedNode = null
        this.getNodes().classed("selected", false)
        this.getNodeLabels().classed("selected", false)
      }
    }
  }
}

export function filterLinks(graph, filterFunction, keyMap = (d) => d.id) {
  const filteredGraph = {
    links: d3.filter(graph.links, filterFunction),
  }
  // because force simulations may edit link source and target properties to point to
  // the actual node objects instead of just string identifiers, we check if this is
  // the case using the first link
  if (
    filteredGraph.links.length > 0 &&
    typeof filteredGraph.links[0].source == "string"
  ) {
    filteredGraph.nodes = d3.filter(graph.nodes, (node) =>
      filteredGraph.links.find(
        (link) => link.source == keyMap(node) || link.target == keyMap(node)
      )
    )
  } else {
    filteredGraph.nodes = d3.filter(graph.nodes, (node) =>
      filteredGraph.links.find(
        (link) =>
          keyMap(link.source) == keyMap(node) ||
          keyMap(link.target) == keyMap(node)
      )
    )
  }

  return filteredGraph
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
    // order = sortNodes({ nodes, links }, { keyMap, valueMap }).get("by degree"),
    // order = sortNodes({ nodes, links }, { keyMap, valueMap }).get("input"),
    order = sortNodes({ nodes, links }, { keyMap, valueMap }).get("by name"),
    // order = sortNodes({ nodes, links }, { keyMap, valueMap }).get("by property"),
    yDistribution = d3.scalePoint(order, [marginTop, height - marginBottom]),
    fontSize = 12,
    fontFill = "black",
    fontMouseoverOpacity = 0.3,
    arcMouseoverOpacity = 0.1,
    labelRotate = 0,
    // A color scale for links.
    color = d3
      .scaleOrdinal()
      .domain(
        nodes
          .map((d) => valueMap(d))
          .filter((d) => d != null)
          .sort(d3.ascending)
      )
      .range(
        d3
          .quantize(
            d3.interpolatePlasma,
            new Set(nodes.map((d) => valueMap(d))).size
          )
          .reverse()
      )
      .unknown("#aaa"),
    nodeFill = "GhostWhite",
    nodeStroke = "grey",
    // create a circle legend from possible arc values
    legend = circleLegend(
      [
        ...new Set(
          nodes
            .map((d) => valueMap(d))
            .filter((d) => d != null)
            .sort(d3.ascending)
        ),
      ],
      {
        keyMap: (d) => d,
        valueMap: (d) => d,
        color: color,
        text: (d) => cropText(d, 40),
      }
    ),
  } = {}
) {
  // A function of a link, that checks that source and target have the same group and returns
  // the group; otherwise null. Used to color the links.
  const groups = new Map(nodes.map((d) => [keyMap(d), valueMap(d)]))

  function sameGroup({ source, target }) {
    return groups.get(source) === groups.get(target) ? groups.get(source) : null
  }

  // Create the SVG container.
  const svg = d3
    .create("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .attr("style", "max-width: 100%; height: auto;")

  // The current position, indexed by id. Will be interpolated.
  const y_positions = new Map(
    nodes.map((d) => [keyMap(d), yDistribution(keyMap(d))])
  )

  // Add an arc for each link.
  // can this be done more simply with d3.arc ?
  function arc(d) {
    const y1 = y_positions.get(d.source)
    const y2 = y_positions.get(d.target)
    const r = Math.abs(y2 - y1) / 2
    return `M${marginLeft},${y1}A${r},${r} 0,0,${
      y1 < y2 ? 1 : 0
    } ${marginLeft},${y2}`
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
    .attr("d", arc)
  // .join(
  //   (enter) => {
  //     console.debug("enter", enter);
  //     return enter
  //       .append("path")
  //       .attr("stroke", (d) => color(sameGroup(d)))
  //       .attr("d", arc);
  //   },
  //   (update) => {
  //     console.debug("update", update);
  //     return update;
  //   }
  // );

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
      (d) =>
        `translate(${marginLeft},${y_positions.get(
          keyMap(d)
        )}), rotate(${labelRotate})`
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
        .attr("fill", nodeFill)
        .attr("stroke", nodeStroke)
    )
  // .join(
  //   (enter) => {
  //     console.debug("enter", enter);
  //     return enter
  //       .append("g")
  //       .attr(
  //         "transform",
  //         (d) => `translate(${marginLeft},${y_positions.get(keyMap(d))})`
  //       )
  //       .call((g) =>
  //         g
  //           .append("text")
  //           .attr("x", -6)
  //           .attr("dy", "0.35em")
  //           // .attr("fill", (d) => color(valueMap(d)))
  //           .text((d) => keyMap(d))
  //       )
  //       .call((g) =>
  //         g
  //           .append("circle")
  //           .attr("r", r)
  //           .attr("fill", (d) => color(valueMap(d)))
  //       );
  //   },
  //   (update) => {
  //     console.debug("update", update);
  //     return update;
  //   }
  // );

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
      svg.classed("hover", true)
      label.classed("primary", (n) => n === d)
      label.classed("secondary", (n) =>
        links.some(
          ({ source, target }) =>
            (keyMap(n) === source && keyMap(d) === target) ||
            (keyMap(n) === target && keyMap(d) === source)
        )
      )
      path
        .classed(
          "primary",
          (l) => l.source === keyMap(d) || l.target === keyMap(d)
        )
        .filter(".primary")
        .raise()
      d3.selectAll(".legend g text")
        .data(color.domain())
        .classed("primary", (v) => v == valueMap(d))
    })
    .on("pointerout", () => {
      svg.classed("hover", false)
      label.classed("primary", false)
      label.classed("secondary", false)
      path.classed("primary", false).order()
      d3.select(".legend g text").data(color.domain()).classed("primary", false)
    })

  // Add styles for the hover interaction.
  svg.append("style").text(`
    .hover text { opacity: ${fontMouseoverOpacity}; }
    .hover g.primary text { font-weight: bold; opacity: 1; }
    .hover g.primary circle { r: ${rMouseover} }
    .hover g.secondary text { opacity: 1; }
    .hover path { opacity: ${arcMouseoverOpacity}; }
    .hover path.primary { opacity: 1; }
    .hover .legend text.primary { opacity: 1; }
  `)

  // A function that updates the positions of the labels and recomputes the arcs
  // when passed a new order.
  function update(order) {
    yDistribution.domain(order)

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
          yDistribution(keyMap(d))
        )
        return (t) => {
          const y = i(t)
          y_positions.set(keyMap(d), y)
          return `translate(${marginLeft},${y}), rotate(${labelRotate})`
        }
      })

    path
      .transition()
      .duration(750 + nodes.length * 20) // Cover the maximum delay of the label transition.
      .attrTween("d", (d) => () => arc(d))
  }

  if (legend) {
    svg
      .append("g")
      .attr("transform", `translate(${width - marginRight},${marginTop})`)
      .append(() => legend)
  }

  // return svg.node();
  return Object.assign(svg.node(), { update })
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
  )
  // console.debug("degree", degree);
  return new Map([
    ["by name", d3.sort(nodes.map(keyMap))],
    ["by property", d3.sort(nodes, valueMap, keyMap).map(keyMap)],
    //    ["input", nodes.map(keyMap)],
    [
      "by degree",
      d3
        .sort(
          nodes,
          // sort first by degree descending then key ascending
          (a, b) =>
            d3.descending(
              degree.has(keyMap(a)) ? degree.get(keyMap(a)) : 0,
              degree.has(keyMap(b)) ? degree.get(keyMap(b)) : 0
            ) || d3.ascending(keyMap(a), keyMap(b))
        )
        .map(keyMap),
    ],
  ])
}
