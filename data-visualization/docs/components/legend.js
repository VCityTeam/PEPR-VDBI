import * as d3 from "npm:d3";

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
    keyMap = (d) => d.entity,
    valueMap = (d) => d.count,
    radius = 5,
    lineSeparation = 25,
    fontSize = 12,
    fontWeight = "normal",
    fontColor = "white",
    strokeColor = "white",
    strokeWidth = 0.5,
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
    .create("svg")
    .classed("legend", true)
    .attr("height", (data.length - 1) * lineSeparation + radius * 2);

  svg
    .append("g")
    .attr("stroke", strokeColor)
    .attr("stroke-width", strokeWidth)
    .selectAll("circle")
    .data(data)
    .join("circle")
    .attr("cx", radius)
    .attr("cy", (_d, i) => radius + i * lineSeparation)
    .attr("r", radius)
    .style("fill", (d) => color(valueMap(d)));

  svg
    .append("g")
    .style("fill", fontColor)
    .style("font-size", fontSize)
    .attr("text-anchor", "left")
    .selectAll("text")
    .data(data)
    .join("text")
    .style("font-weight", fontWeight)
    .attr("x", radius * 2 + 5)
    .attr("y", (_d, i) => radius * 2 + i * lineSeparation)
    .text(text);

  console.debug(svg.node());
  return svg.node();
}
