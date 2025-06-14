import * as d3 from 'npm:d3';
import { circleLegend } from './legend.js';
import { createTooltip, cropText } from './utilities.js';

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
    width = 600,
    height = Math.min(width, 500),
    innerRadiusRatio = 0.4,
    outerRadiusRatio = 1,
    legendLeftMargin = 80,
    // minorArcLabelRadiusRatio = 0.1, // the ratio of the radius to place the minor arc label outside of the arc
    keyMap = (d) => d.entity,
    valueMap = (d) => d.count,
    colorMap = valueMap,
    // sort = (a, b) => d3.descending(a.count, b.count),
    fontSize = 16,
    fontFamily = 'sans-serif',
    sliceStrokeColor = "black",
    // strokeWidth = 1,
    // strokeOpacity = 0.5,
    fill = 'white',
    fillOpacity = 1,
    majorLabelText = (d) => cropText(keyMap(d.data), 30),
    minorLabelText = (d) =>
      `${((valueMap(d.data) / d3.sum(data.map(valueMap))) * 100).toFixed(1)}%`,
    // minorLabelText = (d) => d.value.toLocaleString("en-US"),
    majorLabelBackgroundX = (d) => `-${majorLabelText(d).length * 0.3}em`,
    majorLabelBackgroundY = '-1.7em',
    majorLabelBackgroundWidth = (d) => `${majorLabelText(d).length * 0.6}em`,
    majorLabelBackgroundHeight = '1.6em',
    minorLabelBackgroundX = (d) => `-${minorLabelText(d).length * 0.35}em`,
    minorLabelBackgroundY = '-0.1em',
    minorLabelBackgroundWidth = (d) => `${minorLabelText(d).length * 0.7}em`,
    minorLabelBackgroundHeight = '1.2em',
    labelCuttoff = 0.25, // minimum arc angle for displaying label on arc
    color = (d) =>
      d3.interpolatePlasma(
        d3
          .scaleLinear()
          .domain([
            Math.min(...data.map(valueMap)),
            Math.max(...data.map(valueMap)),
          ])(d)
      ),
    legend = circleLegend(data, {
      keyMap: keyMap,
      valueMap: valueMap,
      colorMap: colorMap,
      color: color,
      radius: 6,
      fontSize: 16,
      lineSeparation: 25,
      // text: (d) => cropText(keyMap(d), 30),
    }),
  } = {}
) {
  const radius = Math.min(width, height) / 2;
  const arc = d3
    .arc()
    .innerRadius(radius * innerRadiusRatio)
    .outerRadius(radius * outerRadiusRatio);

  // const minorLabelArc = d3
  //   .arc()
  //   .innerRadius(radius * outerRadiusRatio)
  //   .outerRadius(radius + (radius * minorArcLabelRadiusRatio));

  // const midAngle = (d) => d.startAngle + (d.endAngle - d.startAngle) / 2;

  /**
   * @param {object} d - a datum produced by the d3.pie() to be sent to a d3 arc generator
   * @returns {boolean}
   */
  const isMajorArc = (d) => d.endAngle - d.startAngle > labelCuttoff;

  const pie = d3
    .pie()
    .padAngle(1 / radius)
    .value(valueMap);
  const pieData = pie(data);
  // console.debug(pieData);

  const cuttoffData = pieData.filter((d) => !isMajorArc(d)).map((d) => d.data);

  const svg = d3
    .create('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', [
      -width / 2 - legendLeftMargin,
      -height / 2,
      width,
      height,
    ])
    .attr('style', 'max-width: 100%; height: auto;');

  const tooltip = createTooltip();
  // console.debug(tooltip);

  // const labelText = (d) => `${keyMap(d.data)}: ${d.value.toLocaleString()}`;

  svg
    .append('g')
    .selectAll()
    .data(pieData)
    .join('path')
    .attr('fill', (d) => color(colorMap(d.data)))
    .attr('d', arc)
    .on('mouseover', (_e, d) => {
      // add legend tooltip if arc is too small for a label and highlight arc
      if (!isMajorArc(d)) {
        const legend = circleLegend(cuttoffData, {
          keyMap: keyMap,
          valueMap: valueMap,
          colorMap: colorMap,
          color: color,
          lineSeparation: 25,
          // if the key in the legend is the same as the mouseovered arc, bold the text
          fontWeight: (d2) =>
            keyMap(d2) == keyMap(d.data) ? 'bold' : 'normal',
        });
        tooltip.appendChild(legend);
      } else {
        tooltip.textContent = `${d.value.toLocaleString()}: ${keyMap(d.data)}`;
      }
      d3.select('body').append(() => tooltip);
      // highlight the arc
      d3.select(_e.target)
        .attr('stroke', sliceStrokeColor)
        // .attr('stroke-opacity', 0.8)
        .attr('stroke-width', 1);
    })
    .on('mousemove', (event) =>
      d3
        .select('.tooltip')
        .style('top', event.pageY - 10 + 'px')
        .style('left', event.pageX + 15 + 'px')
    )
    .on('mouseout', (event) => {
      // console.debug("mouseout");
      tooltip.textContent = '';
      tooltip.parentNode.removeChild(tooltip);
      d3.select(event.target).attr('stroke-width', 0);
    });

  // TODO: add configuration options for label background placement and sizing

  // add major label background
  svg
    .append('g')
    .attr('fill', 'black')
    .attr('fill-opacity', 0.5)
    .selectAll()
    .data(pieData)
    .join('rect')
    .attr('transform', (d) => `translate(${arc.centroid(d)})`)
    .call((rect) =>
      rect
        .filter((d) => isMajorArc(d))
        .attr('x', majorLabelBackgroundX)
        .attr('y', majorLabelBackgroundY)
        .attr('width', majorLabelBackgroundWidth)
        .attr('height', majorLabelBackgroundHeight)
        .attr('rx', '0.5em')
        .attr('ry', '0.5em')
    );

  // add minor label background
  svg
    .append('g')
    .attr('fill', 'black')
    .attr('fill-opacity', 0.5)
    .selectAll()
    .data(pieData)
    .join('rect')
    .attr('transform', (d) => `translate(${arc.centroid(d)})`)
    .call((rect) =>
      rect
        .filter((d) => isMajorArc(d))
        .attr('x', minorLabelBackgroundX)
        .attr('y', minorLabelBackgroundY)
        .attr('width', minorLabelBackgroundWidth)
        .attr('height', minorLabelBackgroundHeight)
    );

  svg
    .append('g')
    .attr('font-family', fontFamily)
    .attr('font-size', fontSize)
    .attr('text-anchor', 'middle')
    // .attr("stroke", strokeColor)
    // .attr("stroke-width", strokeWidth)
    // .attr("stroke-opacity", strokeOpacity)
    .attr('fill', fill)
    .attr('fill-opacity', fillOpacity)
    .selectAll()
    .data(pieData)
    .join('text')
    .attr('transform', (d) => `translate(${arc.centroid(d)})`)
    // add major label for major arcs
    .call((text) =>
      text
        .filter((d) => isMajorArc(d))
        .append('tspan')
        .attr('y', '-0.4em')
        .attr('font-weight', 'bold')
        .text(majorLabelText)
    )
    // add minor label for major arcs
    .call((text) =>
      text
        .filter((d) => isMajorArc(d))
        .append('tspan')
        .attr('x', 0)
        .attr('y', (d) => (isMajorArc(d) ? '0.7em' : '0em'))
        .attr('fill-opacity', 0.7)
        .attr('stroke-width', 0)
        .text(minorLabelText)
    );
  // add label for minor arcs
  // .call((text) =>
  //   text
  //     .filter((d) => !isMajorArc(d))
  //     .attr("x", 0)
  //     .attr("y", (d) => (isMajorArc(d) ? "0.7em" : "0em"))
  //     .attr("fill-opacity", 0.7)
  //     .attr("text-anchor", (d))
  //     .attr("stroke-width", 0)
  //     .attr("transform", (d) => {
  //       const c = minorLabelArc.centroid(d);
  //       console.debug(d.data, c);
  //       return `translate(${c})`;
  //     })
  //     .text(`hi`)
  //     // .text(`${minorLabelText}: ${majorLabelText}`)
  // );

  // Create legend
  if (legend) {
    svg
      .append('g')
      .attr(
        'transform',
        `translate(${-width / 2 - legendLeftMargin + 10},${-height / 2 + 10})`
      )
      .append(() => legend);
  }

  return svg.node();
}

export const pieChartUserGuideTip = `<p>Hover over a slice to see the count and entity name.</p>`;
