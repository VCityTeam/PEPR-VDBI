import * as d3 from "npm:d3";
import { circleLegend } from "./legend.js";

/**
 * Create a donut chart
 * Adapted from:
 * - https://observablehq.com/@d3/donut-chart/2
 * - https://observablehq.com/@mast4461/d3-donut-chart-labels
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
    outerRadiusRatio = 1,
    innerRadiusRatio = 0.4,
    keyMap = (d) => d.entity,
    valueMap = (d) => d.count,
    sort = (a, b) => d3.descending(a.count, b.count),
    fontSize = 12,
    fontFamily = "sans-serif",
    strokeColor = "white",
    strokeWidth = 0.5,
    strokeOpacity = 0.5,
    fill = "black",
    fillOpacity = 1,
    majorLabelText = (d) => keyMap(d.data),
    majorLabelCuttoff = 0.25, // minimum angle for displaying major label
    minorLabelCuttoff = 0.15, // minimum angle for displaying minor label
    color = d3
      .scaleLinear()
      .domain([
        Math.min(...data.map(valueMap)),
        Math.max(...data.map(valueMap)),
      ])
      .interpolate(d3.interpolatePlasma),
  } = {}
) {
  const height = Math.min(width, 500);
  const radius = Math.min(width, height) / 2;

  const arc = d3
    .arc()
    .innerRadius(radius * innerRadiusRatio)
    .outerRadius(radius - outerRadiusRatio);

  const midAngle = (d) => d.startAngle + (d.endAngle - d.startAngle) / 2;

  const cuttoff = (d, cuttoffValue) => d.endAngle - d.startAngle > cuttoffValue;

  const pie = d3
    .pie()
    .padAngle(1 / radius)
    .sort(sort)
    .value(valueMap);
  console.debug(pie(data));

  const cuttoffData = pie(data)
    .filter((d) => !cuttoff(d, minorLabelCuttoff))
    .map((d) => d.data)
    .sort(sort);

  const svg = d3
    .create("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [-width / 2, -height / 2, width, height])
    .attr("style", "max-width: 100%; height: auto;");

  // const color = d3
  //   .scaleOrdinal()
  //   .domain(data.sort(sort).map(valueMap)) // possibly more optimal to presort the data?
  //   .range(d3.quantize(colorInterpolation, data.length).reverse());
  debugger;
  const tooltip = document.createElement("div");
  tooltip.classList.add("tooltip");
  tooltip.classList.add("card");
  tooltip.style.position = "absolute";
  // console.debug(tooltip);

  // const labelText = (d) => `${keyMap(d.data)}: ${d.value.toLocaleString()}`;

  svg
    .append("g")
    .selectAll()
    .data(pie(data))
    .join("path")
    .attr("fill", (d) => color(valueMap(d.data)))
    .attr("d", arc)
    .on("mouseover", (_e, d) => {
      // add legend tooltip if arc is too small
      if (!cuttoff(d, minorLabelCuttoff)) {
        const legend = circleLegend(cuttoffData, {
          color: color,
          keyMap: keyMap,
          valueMap: valueMap,
          lineSeparation: 25,
        });
        tooltip.appendChild(legend);
      } else {
        tooltip.textContent = `${d.value.toLocaleString()}: ${keyMap(d.data)}`;
      }
      d3.select("body").append(() => tooltip);
    })
    .on("mousemove", (event) =>
      d3
        .select(".tooltip")
        .style("top", event.pageY - 10 + "px")
        .style("left", event.pageX + 15 + "px")
    )
    .on("mouseout", () => {
      console.debug("mouseout");
      tooltip.textContent = "";
      tooltip.parentNode.removeChild(tooltip);
    });

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
        .filter((d) => cuttoff(d, majorLabelCuttoff))
        .append("tspan")
        .attr("y", "-0.4em")
        .attr("font-weight", "bold")
        .text(majorLabelText)
    )
    .call((text) =>
      text
        .filter((d) => cuttoff(d, minorLabelCuttoff))
        .append("tspan")
        .attr("x", 0)
        .attr("y", (d) => (cuttoff(d, minorLabelCuttoff) ? "0.7em" : "0em"))
        .attr("fill-opacity", 0.7)
        .attr("stroke-width", 0)
        .text((d) => d.value.toLocaleString("en-US"))
    );

  return svg.node();
}
