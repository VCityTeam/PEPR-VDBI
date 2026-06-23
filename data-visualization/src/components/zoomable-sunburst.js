import * as d3 from 'd3';
import { cropText } from './utilities.js';

/**
 * Build an interactive zoomable sunburst chart (click an arc or the center
 * circle to zoom in/out) from a d3 hierarchy
 *
 * @param {Object} hierarchy - a d3 hierarchy root node (with `id`, `height`, `depth`, `value`, `children`)
 * @param {Object} [options]
 * @param {number} [options.width=500] - chart width (and height, as the chart is square)
 * @param {number} [options.fontSize=8] - label font size, in pixels
 * @param {string} [options.fontFamily='sans-serif'] - label font family
 * @param {Function} [options.keyMap] - accessor for a node's identifier
 * @param {Function} [options.valueMap] - accessor for a node's value
 * @param {Function} [options.labelMap] - accessor for a node's rendered label text
 * @returns {SVGElement} the rendered zoomable sunburst chart
 */
export function zoomableSunburst(
  // interface Hierarchy {
  //   id: string;
  //   height: number;
  //   depth: number;
  //   value?: number;
  //   children?: Hierarchy[];
  // }
  hierarchy = [],
  {
    width = 500,
    fontSize = 8,
    fontFamily = 'sans-serif',
    keyMap = (d) => d.id,
    valueMap = (d) => d.value,
    labelMap = (d) => cropText(`(${keyMap(d)}) ${valueMap(d)}`),
  },
) {
  // Specify the chart’s dimensions.
  const height = width
  const radius = width / 6

  // Create the color scale.
  const color = d3.scaleOrdinal(
    d3.quantize(
      d3.interpolateRainbow,
      hierarchy.children ? hierarchy.children.length + 1 : 0,
    ),
  )

  // Compute the layout.
  // const hierarchy = d3.hierarchy(data).count();
  // .sum((d) => valueMap(d))
  // .sort((a, b) => valueMap(b) - valueMap(a));
  console.debug(hierarchy)

  const root = d3.partition().size([2 * Math.PI, hierarchy.height + 1])(
    hierarchy,
  )
  root.each((d) => (d.current = d))

  // Create the arc generator.
  const arc = d3
    .arc()
    .startAngle((d) => d.x0)
    .endAngle((d) => d.x1)
    .padAngle((d) => Math.min((d.x1 - d.x0) / 2, 0.005))
    .padRadius(radius * 1.5)
    .innerRadius((d) => d.y0 * radius)
    .outerRadius((d) => Math.max(d.y0 * radius, d.y1 * radius - 1))

  // Create the SVG container.
  const svg = d3
    .create('svg')
    .attr('viewBox', [-width / 2, -height / 2, width, width])
    .style('font', '10px sans-serif')

  // Append the arcs.
  const path = svg
    .append('g')
    .selectAll('path')
    .data(root.descendants().slice(1))
    .join('path')
    .attr('fill', (d) => {
      while (d.depth > 1) d = d.parent
      return color(d.id)
    })
    .attr('fill-opacity', (d) =>
      arcVisible(d.current) ? (d.children ? 0.6 : 0.4) : 0,
    )
    .attr('pointer-events', (d) => (arcVisible(d.current) ? 'auto' : 'none'))
    .attr('d', (d) => arc(d.current))

  // Make them clickable if they have children.
  path
    .filter((d) => d.children)
    .style('cursor', 'pointer')
    .on('click', clicked)

  const format = d3.format(',d')
  path
    .append('title')
    .text(
      (d) =>
        `Path: ${d
          .ancestors()
          .map(keyMap)
          .reverse()
          .join('/')}\nCount: ${format(d.value)}`,
    )

  const label = svg
    .append('g')
    .attr('pointer-events', 'none')
    .attr('text-anchor', 'middle')
    .style('user-select', 'none')
    .style('font-family', fontFamily)
    .style('font-size', fontSize + 'px')
    .selectAll('text')
    .data(root.descendants().slice(1))
    .join('text')
    .attr('dy', '0.35em')
    .attr('fill-opacity', (d) => +labelVisible(d.current))
    .attr('transform', (d) => labelTransform(d.current))
    .text(labelMap)

  const parent = svg
    .append('circle')
    .datum(root)
    .attr('r', radius)
    .attr('fill', 'none')
    .attr('pointer-events', 'all')
    .on('click', clicked)

  /**
   * Zoom the sunburst in/out, recentering on the clicked node and
   * transitioning all arcs/labels to their new positions
   *
   * @param {PointerEvent} event - the click event (Alt-click uses a slower transition)
   * @param {Object} p - the clicked d3 partition node to zoom to
   * @returns {void}
   */
  function clicked(event, p) {
    parent.datum(p.parent || root)

    root.each(
      (d) =>
        (d.target = {
          x0:
            Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) *
            2 *
            Math.PI,
          x1:
            Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) *
            2 *
            Math.PI,
          y0: Math.max(0, d.y0 - p.depth),
          y1: Math.max(0, d.y1 - p.depth),
        }),
    )

    const t = svg.transition().duration(event.altKey ? 7500 : 750)

    // Transition the data on all arcs, even the ones that aren’t visible,
    // so that if this transition is interrupted, entering arcs will start
    // the next transition from the desired position.
    path
      .transition(t)
      .tween('data', (d) => {
        const i = d3.interpolate(d.current, d.target)
        return (t) => (d.current = i(t))
      })
      .filter(function (d) {
        return +this.getAttribute('fill-opacity') || arcVisible(d.target)
      })
      .attr('fill-opacity', (d) =>
        arcVisible(d.target) ? (d.children ? 0.6 : 0.4) : 0,
      )
      .attr('pointer-events', (d) => (arcVisible(d.target) ? 'auto' : 'none'))

      .attrTween('d', (d) => () => arc(d.current))

    label
      .filter(function (d) {
        return +this.getAttribute('fill-opacity') || labelVisible(d.target)
      })
      .transition(t)
      .attr('fill-opacity', (d) => +labelVisible(d.target))
      .attrTween('transform', (d) => () => labelTransform(d.current))
  }

  /**
   * Determine whether an arc should be visible given its current
   * radial/angular extent
   *
   * @param {Object} d - a partition node's `current`/`target` position
   * @returns {boolean} true if the arc is within the visible radius and has nonzero angular extent
   */
  function arcVisible(d) {
    return d.y1 <= 3 && d.y0 >= 1 && d.x1 > d.x0
  }

  /**
   * Determine whether a label should be visible given its current arc's
   * size (hidden for arcs too small to fit text)
   *
   * @param {Object} d - a partition node's `current`/`target` position
   * @returns {boolean} true if the corresponding arc is large enough to show a label
   */
  function labelVisible(d) {
    return d.y1 <= 3 && d.y0 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03
  }

  /**
   * Compute the SVG transform for positioning a label at the midpoint of
   * its arc
   *
   * @param {Object} d - a partition node's `current`/`target` position
   * @returns {string} an SVG `transform` attribute value
   */
  function labelTransform(d) {
    const x = (((d.x0 + d.x1) / 2) * 180) / Math.PI
    const y = ((d.y0 + d.y1) / 2) * radius
    return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`
  }

  return svg.node()
}
