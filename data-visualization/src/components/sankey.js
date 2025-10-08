import * as d3_sankey from 'd3-sankey';
import { InternMap, scaleOrdinal, create, interpolateSpectral } from 'd3';
import { cropText } from './utilities.js';

// Code adapted from https://observablehq.com/@d3/parallel-sets

/**
 * Transform csv data to a graph interoperable with the SankeyDiagram example
 * @param {object[]} data - a tablular dataset. Each object is a row with key-value pairs
 * @param {string[]} keys - An array of keys to use for the nodes
 * @returns {object[]} - Graph object with 'nodes' and 'links' arrays:
 *   {
 *     nodes: [{ name: 'Node1' }, { name: 'Node2' }, ...],
 *     links: [{
 *       source: 0,
 *       target: 1,
 *       value: 10,
 *       names: ['Node1', 'Node2'] },
 *     ...]
 *   }
 */
export function parallelSetToGraph(data, keys) {
  const nodes = []
  const nodeByKey = new InternMap([], JSON.stringify)
  const indexByKey = new InternMap([], JSON.stringify)
  const links = []

  let index = -1
  for (const k of keys) {
    for (const d of data) {
      const key = [k, d[k]]
      if (nodeByKey.has(key)) continue
      const node = { id: d[k] }
      nodes.push(node)
      nodeByKey.set(key, node)
      indexByKey.set(key, ++index)
    }
  }

  for (let i = 1; i < keys.length; ++i) {
    const a = keys[i - 1]
    const b = keys[i]
    const prefix = keys.slice(0, i + 1)
    const linkByKey = new InternMap([], JSON.stringify)
    for (const d of data) {
      const path = prefix.map((k) => d[k])
      const value = d.value || 1
      let link = linkByKey.get(path)
      if (link) {
        link.value += value
        continue
      }
      link = {
        source: indexByKey.get([a, d[a]]),
        target: indexByKey.get([b, d[b]]),
        path,
        value,
      }
      links.push(link)
      linkByKey.set(path, link)
    }
  }
  return { nodes, links }
}

/**
 * Create a Sankey diagram from a graph object
 *
 * @param {Object} graph - a graph object containing nodes and links
 * @param {Object[]} graph.nodes
 * @param {Object[]} graph.nodes[].name - node label
 * @param {Object[]} graph.links
 * @param {Object[]} graph.links[].source
 * @param {Object[]} graph.links[].target
 * @param {Object[]} graph.links[].value - link value, used to determine width link width
 * @param {Object[]} graph.links[].names - array of node names corresponding to the link path
 * @param {Number} width - width of the SVG element
 * @param {Number} height - height of the SVG element
 * @param {Function} idMap - function to map a node to its label
 * @param {Function} pathMap - function to map a link to its path
 * @param {Function} text - function to map a node to its label
 * @param {scaleOrdinal|Function} nodeFill - color scale for nodes
 * @param {scaleOrdinal|Function} linkStroke - color scale for links
 */
export function sankeyDiagram(
  graph,
  {
    idMap = (d) => d.id,
    pathMap = (d) => d.path,
    width = 928,
    height = 720,
    nodeFill = "black",
    linkStroke = (d) =>
      scaleOrdinal(interpolateSpectral).unknown("#ccc")(pathMap(d)[0]),
    font_size = 12,
    text = (d) => cropText(idMap(d), 85),
    node_sort = null,
    link_sort = null,
  } = {}
) {
  const sankeyGenerator = d3_sankey
    .sankey()
    .nodeSort(node_sort)
    .linkSort(link_sort)
    .nodeWidth(4)
    .nodePadding(20)
    // .nodeAlign(d3_sankey.sankeyCenter)
    .extent([
      [0, 5],
      [width, height - 5],
    ])

  const svg = create("svg")
    .attr("viewBox", [0, 0, width, height])
    .attr("width", width)
    .attr("height", height)
    .attr("style", "max-width: 100%; height: auto;")

  const { nodes, links } = sankeyGenerator({
    nodes: graph.nodes.map((d) => Object.create(d)),
    links: graph.links.map((d) => Object.create(d)),
  })

  console.debug("Sankey nodes:", nodes)
  console.debug("Sankey links:", links)

  svg
    .append("g")
    .selectAll("rect")
    .data(nodes)
    .join("rect")
    .attr("x", (d) => d.x0)
    .attr("y", (d) => d.y0)
    .attr("height", (d) => d.y1 - d.y0)
    .attr("width", (d) => d.x1 - d.x0)
    .attr("fill", nodeFill)
    .append("title")
    .text((d) => `${idMap(d)}\n${d.value.toLocaleString()}`)

  svg
    .append("g")
    .attr("fill", "none")
    .selectAll("g")
    .data(links)
    .join("path")
    .attr("d", d3_sankey.sankeyLinkHorizontal())
    .attr("stroke", linkStroke)
    .attr("stroke-width", (d) => d.width)
    .style("mix-blend-mode", "multiply")
    .append("title")
    .text((d) => `${pathMap(d).join(" → ")}\n${d.value.toLocaleString()}`)

  svg
    .append("g")
    .style("font", "10px sans-serif")
    .selectAll("text")
    .data(nodes)
    .join("text")
    .attr("x", (d) => (d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6))
    .attr("y", (d) => (d.y1 + d.y0) / 2)
    .attr("dy", "0.35em")
    .attr("font-size", font_size)
    .attr("text-anchor", (d) => (d.x0 < width / 2 ? "start" : "end"))
    .text(text)
    .append("tspan")
    .attr("fill-opacity", 0.7)
    .text((d) => ` ${d.value.toLocaleString()}`)

  return svg.node()
}
