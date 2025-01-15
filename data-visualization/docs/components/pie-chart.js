import * as d3 from "npm:d3";

/**
 * Create a donut chart
 * Source: https://observablehq.com/@d3/donut-chart/2
 *
 * @param {Array<Object>} data - input dataset, by default expects an array of key (string)
 *  and value (number) pairs. Modify keyMap and valueMap in the options if this is not the case.
 * @param {Object} options - configuration options for the chart
 * @returns {d3.node} - SVG node containing the donut chart
 */
export function donutChart(
  data,
  {
    width = 500,
    innerRadiusRatio = 0.5,
    keyMap = (d) => d.entity,
    valueMap = (d) => d.count,
    sort = (a, b) => d3.descending(a.count, b.count),
    fontSize = 12,
    strokeColor = "white",
    fontFamily = "sans-serif",
    strokeWidth = 0.5,
    strokeOpacity = 0.5,
    fill = "black",
    fillOpacity = 1,
    majorLabelText = (d) => keyMap(d.data),
    majorLabelCuttoff = 0.25, // minimum angle for displaying major label
    minorLabelCuttoff = 0.2, // minimum angle for displaying minor label
  } = {}
) {
  const height = Math.min(width, 500);
  const radius = Math.min(width, height) / 2;

  const arc = d3
    .arc()
    .innerRadius(radius * innerRadiusRatio)
    .outerRadius(radius - 1);

  const pie = d3
    .pie()
    .padAngle(1 / radius)
    .sort(sort)
    .value(valueMap);
  console.debug(pie(data));

  const color = d3
    .scaleOrdinal()
    .domain(data.map(keyMap))
    .range(
      d3
        .quantize((t) => d3.interpolatePlasma(t * 0.8 + 0.1), data.length)
        .reverse()
    );

  const svg = d3
    .create("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [-width / 2, -height / 2, width, height])
    .attr("style", "max-width: 100%; height: auto;");

  svg
    .append("g")
    .selectAll()
    .data(pie(data))
    .join("path")
    .attr("fill", (d) => color(keyMap(d.data)))
    .attr("d", arc)
    .append("title")
    .text((d) => `${keyMap(d.data)}: ${d.value.toLocaleString()}`);

  svg
    .append("g")
    .attr("font-family", fontFamily)
    .attr("font-size", fontSize)
    .attr("text-anchor", "middle")
    .attr("stroke", strokeColor)
    .attr("stroke-width", strokeWidth)
    .attr("stroke-opacity", strokeOpacity)
    .attr("fill", fill)
    .attr("fill-opacity", fillOpacity)
    .selectAll()
    .data(pie(data))
    .join("text")
    .attr("transform", (d) => `translate(${arc.centroid(d)})`)
    .call((text) =>
      text
        .filter((d) => d.endAngle - d.startAngle > majorLabelCuttoff)
        .append("tspan")
        .attr("y", "-0.4em")
        .attr("font-weight", "bold")
        .text(majorLabelText)
    )
    .call((text) =>
      text
        .filter((d) => d.endAngle - d.startAngle > minorLabelCuttoff)
        .append("tspan")
        .attr("x", 0)
        .attr("y", "0.7em")
        .attr("fill-opacity", 0.7)
        .attr("stroke-width", 0)
        .text((d) => d.value.toLocaleString("en-US"))
    );

  return svg.node();
}
