import * as d3 from 'npm:d3';

/**
 * Create a donut chart
 * Adapted from:
 * - https://github.com/VCityTeam/UD-Viz/blob/master/packages/widget_sparql/src/view/D3GraphCanvas.js
 * - https://d3-graph-gallery.com/graph/custom_legend.html
 *
 * @param {Array<Object>} data - input dataset, by default expects an array of key (string)
 *  and value (number) pairs. Modify keyMap and valueMap in the options if this is not the case.
 * @param {Object} options - configuration options for the chart
 * @returns {d3.node} - SVG node containing the donut chart
 */
export function circleLegend(
  data,
  {
    width,
    keyMap = (d) => d.entity,
    valueMap = (d) => d.count,
    colorMap = valueMap,
    radius = 5,
    lineSeparation = 25,
    fontSize = 14,
    fontWeight = 'normal',
    fontColor = 'black',
    strokeColor = 'black',
    strokeWidth = 0.5,
    backgroundColor = 'black',
    backgroundStroke = 'black',
    backgroundOpacity = 0,
    backgroundStrokeOpacity = 0,
    backgroundRadius = radius,
    marginTop = 5,
    marginLeft = 5,
    color = (d) =>
      d3.interpolatePlasma(
        d3
          .scaleLinear()
          .domain([
            Math.min(...data.map(valueMap)),
            Math.max(...data.map(valueMap)),
          ])(d)
      ),
    text = (d) => `${valueMap(d)}: ${keyMap(d)}`,
  } = {}
) {
  const svg = d3
    .create('svg')
    .classed('legend', true)
    .attr('height', (data.length - 1) * lineSeparation + radius * 2 + marginTop * 2)
    .attr('width', width);

  svg
    .append('rect')
    .attr('fill', backgroundColor)
    .attr('fill-opacity', backgroundOpacity)
    .attr('stroke', backgroundStroke)
    .attr('stroke-opacity', backgroundStrokeOpacity)
    .attr('height', (data.length - 1) * lineSeparation + radius * 2 + marginTop * 2)
    .attr('width', width)
    .attr('rx', backgroundRadius)
    .attr('ry', backgroundRadius);

  svg
    .append('g')
    .attr('stroke', strokeColor)
    .attr('stroke-width', strokeWidth)
    .selectAll('circle')
    .data(data)
    .join('circle')
    .attr('cx', radius + marginLeft)
    .attr('cy', (_d, i) => radius + i * lineSeparation + marginTop)
    .attr('r', radius)
    .style('fill', (d) => color(colorMap(d)));

  svg
    .append('g')
    .style('fill', fontColor)
    .style('font-size', fontSize)
    .attr('text-anchor', 'left')
    .selectAll('text')
    .data(data)
    .join('text')
    .style('font-weight', fontWeight)
    .attr('x', radius * 2 + 5 + marginLeft)
    .attr('y', (_d, i) => radius * 2 + i * lineSeparation + marginTop)
    .text(text);

  // console.debug(svg.node());
  return svg.node();
}
