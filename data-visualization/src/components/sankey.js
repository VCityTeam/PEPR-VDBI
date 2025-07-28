import * as d3_sankey from 'npm:d3-sankey';
import { InternMap, scaleOrdinal, create, interpolateSpectral } from 'npm:d3';

// Code adapted from https://observablehq.com/@d3/parallel-sets

/**
 * Transform csv data to a graph interoperable with the SankeyDiagram example
 * @param {object[]} data - An observable framework CSV data object
 *   - see here for more information: https://observablehq.com/framework/lib/csv
 * @param {string[]} keys - An array of keys to use for the nodes
 * @returns {object[]} - Graph object with 'nodes' and 'links' arrays
 */
export function tableToSankeyGraph(data, keys) {
  const nodes = [];
  const nodeByKey = new InternMap([], JSON.stringify);
  const indexByKey = new InternMap([], JSON.stringify);
  const links = [];

  let index = -1;
  for (const k of keys) {
    for (const d of data) {
      const key = [k, d[k]];
      if (nodeByKey.has(key)) continue;
      const node = { name: d[k] };
      nodes.push(node);
      nodeByKey.set(key, node);
      indexByKey.set(key, ++index);
    }
  }

  for (let i = 1; i < keys.length; ++i) {
    const a = keys[i - 1];
    const b = keys[i];
    const prefix = keys.slice(0, i + 1);
    const linkByKey = new InternMap([], JSON.stringify);
    for (const d of data) {
      const names = prefix.map((k) => d[k]);
      const value = d.value || 1;
      let link = linkByKey.get(names);
      if (link) {
        link.value += value;
        continue;
      }
      link = {
        source: indexByKey.get([a, d[a]]),
        target: indexByKey.get([b, d[b]]),
        names,
        value,
      };
      links.push(link);
      linkByKey.set(names, link);
    }
  }
  return { nodes, links };
}

/**
 * Create a Sankey diagram from a graph object
 *
 * @param {Object} graph - graph object containing nodes and links
 * - should be in the format returned by tableToSankeyGraph:
 *   {
 *     nodes: [{ name: 'Node1' }, { name: 'Node2' }, ...],
 *     links: [{
 *       source: 0,
 *       target: 1,
 *       value: 10,
 *       names: ['Node1', 'Node2'] },
 *     ...]
 *   }
 * @param {Array} graph.nodes - graph object containing nodes and links
 * @param {Array} graph.links - graph object containing nodes and links
 * @param {scaleOrdinal} color - color scale for the nodes
 */
export function sankeyDiagram(
  graph,
  {
    keyMap = (d) => d.names,
    valueMap = (d) => d.names[0],
    color = scaleOrdinal(interpolateSpectral).unknown('#ccc'),
    width = 928,
    height = 720,
  } = {}
) {
  const sankey_generator = d3_sankey
    .sankey()
    .nodeSort(null)
    .linkSort(null)
    .nodeWidth(4)
    .nodePadding(20)
    .extent([
      [0, 5],
      [width, height - 5],
    ]);

  const svg = create('svg')
    .attr('viewBox', [0, 0, width, height])
    .attr('width', width)
    .attr('height', height)
    .attr('style', 'max-width: 100%; height: auto;');

  const { nodes, links } = sankey_generator({
    nodes: graph.nodes.map((d) => Object.create(d)),
    links: graph.links.map((d) => Object.create(d)),
  });

  svg
    .append('g')
    .selectAll('rect')
    .data(nodes)
    .join('rect')
    .attr('x', (d) => d.x0)
    .attr('y', (d) => d.y0)
    .attr('height', (d) => d.y1 - d.y0)
    .attr('width', (d) => d.x1 - d.x0)
    .append('title')
    .text((d) => `${d.name}\n${d.value.toLocaleString()}`);

  svg
    .append('g')
    .attr('fill', 'none')
    .selectAll('g')
    .data(links)
    .join('path')
    .attr('d', d3_sankey.sankeyLinkHorizontal())
    .attr('stroke', (d) => color(valueMap(d)))
    .attr('stroke-width', (d) => d.width)
    .style('mix-blend-mode', 'multiply')
    .append('title')
    .text((d) => `${keyMap(d).join(' → ')}\n${d.value.toLocaleString()}`);

  svg
    .append('g')
    .style('font', '10px sans-serif')
    .selectAll('text')
    .data(nodes)
    .join('text')
    .attr('x', (d) => (d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6))
    .attr('y', (d) => (d.y1 + d.y0) / 2)
    .attr('dy', '0.35em')
    .attr('text-anchor', (d) => (d.x0 < width / 2 ? 'start' : 'end'))
    .text((d) => d.name)
    .append('tspan')
    .attr('fill-opacity', 0.7)
    .text((d) => ` ${d.value.toLocaleString()}`);

  return svg.node();
}
