import * as d3 from 'd3'
import { circleLegend } from './legend.js'
import { createTooltip, cropText } from './utilities.js'

/**
 * Core donut/pie chart renderer: draws colored arcs with hover tooltips.
 * Adapted from:
 * - https://observablehq.com/@d3/donut-chart/2
 * - https://observablehq.com/@mast4461/d3-donut-chart-labels
 *
 * Use `DonutChartWithLegend` for a chart with a section color legend (the
 * previous default behavior of `donutChart()`), or `DonutChartWithLabels`
 * for a chart with section labels connected to their slice by a leader line
 * (https://d3-graph-gallery.com/graph/donut_label.html). Subclass this class
 * directly for a bare donut chart, or to compose your own extension by
 * overriding `renderExtensions()`.
 */
export class DonutChart {
  /**
   * @param {Object[]} data - input dataset, by default expects an array of key (string)
   *  and value (number) pairs. Modify keyMap and valueMap in the options if this is not the case.
   * @param {object} options - configuration options for the chart
   * @param {number} options.width - width of the chart
   * @param {number} options.height - height of the chart
   * @param {number} options.legendWidth - horizontal space reserved to the side of the donut (for a legend, or extra breathing room)
   * @param {number|function} options.innerRadiusRatio - ratio (or per-datum function) of the radius to the inner radius
   * @param {number|function} options.outerRadiusRatio - ratio (or per-datum function) of the radius to the outer radius
   * @param {function} options.keyMap - accessor function to map the data to the key
   * @param {function} options.valueMap - accessor function to map the data to the value
   * @param {function} options.colorMap - accessor function to map the data to the color
   * @param {function} options.sort - comparator used by d3.pie to order slices
   * @param {function} options.color - ordinal color scale mapping colorMap(d) to a color
   * @param {number} options.fontSize - font size of the labels
   * @param {string} options.fontFamily - font family of the labels
   * @param {string} options.sliceStrokeColor - color of the slice stroke shown on hover
   * @param {number} options.labelCuttoff - minimum arc angle (radians) below which a slice is considered "minor"
   */
  constructor(
    data,
    {
      width = 600,
      legendWidth = width * 0.4,
      height = width - legendWidth,
      innerRadiusRatio = 0.5,
      outerRadiusRatio = 0.9,
      keyMap = (d) => d.entity,
      valueMap = (d) => d.count,
      colorMap = keyMap,
      sort = (a, b) => valueMap(b) - valueMap(a),
      fontSize = 16,
      fontFamily = 'sans-serif',
      sliceStrokeColor = 'black',
      labelCuttoff = 0.25,
      color = d3
        .scaleOrdinal(d3.schemeObservable10)
        .domain(new Set(data.map(keyMap)))
        .unknown('grey'),
    } = {},
  ) {
    this.data = data
    this.width = width
    this.legendWidth = legendWidth
    this.height = height
    this.innerRadiusRatio = innerRadiusRatio
    this.outerRadiusRatio = outerRadiusRatio
    this.keyMap = keyMap
    this.valueMap = valueMap
    this.colorMap = colorMap
    this.sort = sort
    this.fontSize = fontSize
    this.fontFamily = fontFamily
    this.sliceStrokeColor = sliceStrokeColor
    this.labelCuttoff = labelCuttoff
    this.color = color

    this.radius = Math.min(width - legendWidth, height) / 2

    this.arc = d3
      .arc()
      .innerRadius(
        typeof innerRadiusRatio === 'function'
          ? innerRadiusRatio
          : this.radius * innerRadiusRatio,
      )
      .outerRadius(
        typeof outerRadiusRatio === 'function'
          ? outerRadiusRatio
          : this.radius * outerRadiusRatio,
      )

    this.pie = d3.pie().padAngle(1 / this.radius).value(valueMap).sort(sort)
    this.pieData = this.pie(data)
    this.cuttoffData = this.pieData
      .filter((d) => !this.isMajorArc(d))
      .map((d) => d.data)
  }

  /**
   * @param {object} d - a datum produced by d3.pie() to be sent to a d3 arc generator
   * @returns {boolean} whether the arc is wide enough to carry its own label
   */
  isMajorArc(d) {
    return d.endAngle - d.startAngle > this.labelCuttoff
  }

  /**
   * The outer radius in effect for a given pie datum, resolving the
   * function-or-ratio form of `outerRadiusRatio`.
   *
   * @param {object} d - a datum produced by d3.pie()
   * @returns {number}
   */
  outerRadiusFor(d) {
    return typeof this.outerRadiusRatio === 'function'
      ? this.outerRadiusRatio(d)
      : this.radius * this.outerRadiusRatio
  }

  /**
   * @returns {d3.Selection} a blank SVG root sized/viewboxed for this chart
   */
  createSvg() {
    return d3
      .create('svg')
      .classed('donut-chart', true)
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('viewBox', [-this.width / 2, -this.height / 2, this.width, this.height])
      .attr('style', 'max-width: 100%; height: auto;')
  }

  /**
   * Draws the colored arcs and wires up hover tooltips (a value/key tooltip
   * for major slices, a color-legend tooltip listing all minor slices when
   * hovering any one of them).
   *
   * @param {d3.Selection} svg
   */
  renderArcs(svg) {
    const tooltip = createTooltip()

    svg
      .append('g')
      .selectAll()
      .data(this.pieData)
      .join('path')
      .attr('fill', (d) => this.color(this.colorMap(d.data)))
      .attr('d', this.arc)
      .on('mouseover', (_e, d) => {
        // add legend tooltip if arc is too small for a label and highlight arc
        if (!this.isMajorArc(d)) {
          const legend = circleLegend(this.cuttoffData, {
            keyMap: this.keyMap,
            valueMap: this.valueMap,
            colorMap: this.colorMap,
            color: this.color,
            lineSeparation: 25,
            // if the key in the legend is the same as the mouseovered arc, bold the text
            fontWeight: (d2) =>
              this.keyMap(d2) == this.keyMap(d.data) ? 'bold' : 'normal',
          })
          tooltip.appendChild(legend)
        } else {
          tooltip.textContent = `${d.value.toLocaleString()}: ${this.keyMap(d.data)}`
        }
        d3.select('body').append(() => tooltip)
        // highlight the arc
        d3.select(_e.target).attr('stroke', this.sliceStrokeColor).attr('stroke-width', 1)
      })
      .on('mousemove', (event) =>
        d3
          .select('.tooltip')
          .style('top', event.pageY - 10 + 'px')
          .style('left', event.pageX + 15 + 'px'),
      )
      .on('mouseout', (event) => {
        tooltip.textContent = ''
        tooltip.parentNode.removeChild(tooltip)
        d3.select(event.target).attr('stroke-width', 0)
      })
  }

  /**
   * Hook for subclasses to draw additional chart elements (a legend, labels,
   * etc.) after the arcs have been rendered. No-op in the base class.
   *
   * @param {d3.Selection} svg
   */
  renderExtensions() {
    // no-op, overridden by extensions
  }

  /**
   * @returns {SVGElement} the rendered donut chart
   */
  render() {
    const svg = this.createSvg()
    this.renderArcs(svg)
    this.renderExtensions(svg)
    return svg.node()
  }
}

/**
 * Donut chart with a section color legend, drawn to the left of the donut
 * (the legend previously built into `donutChart()`).
 */
export class DonutChartWithLegend extends DonutChart {
  /**
   * @param {Object[]} data
   * @param {object} options - all `DonutChart` options, plus:
   * @param {number} options.legendTextLength - length of the legend text
   * @param {function} options.legendText - function to map the data to the legend text
   * @param {number} options.legendFontSize - font size of the legend text
   * @param {number} options.legendLineSeparation - separation between legend lines
   */
  constructor(
    data,
    {
      legendTextLength = 30,
      legendText,
      legendFontSize = 16,
      legendLineSeparation = 25,
      ...options
    } = {},
  ) {
    super(data, options)
    const total = d3.sum(data.map(this.valueMap))
    this.legendTextLength = legendTextLength
    this.legendText =
      legendText ??
      ((d) =>
        `${this.valueMap(d) / total < 0.1 ? ' ' : ''}${(
          (this.valueMap(d) / total) *
          100
        ).toFixed(1)}% ${cropText(this.keyMap(d), this.legendTextLength)}`)
    this.legendFontSize = legendFontSize
    this.legendLineSeparation = legendLineSeparation
  }

  renderExtensions(svg) {
    super.renderExtensions(svg)

    const legend = circleLegend(this.data, {
      width: this.legendWidth,
      keyMap: this.keyMap,
      valueMap: this.valueMap,
      colorMap: this.colorMap,
      color: this.color,
      radius: 6,
      fontSize: this.legendFontSize,
      lineSeparation: this.legendLineSeparation,
      text: this.legendText,
    })

    svg.selectAll('g').attr('transform', `translate(${-this.radius / 2} 0)`)
    svg
      .append('g')
      .attr('transform', `translate(${this.radius / 2} ${-this.radius * 0.9})`)
      .append(() => legend)
  }
}

/**
 * Donut chart with section labels connected to their slice by a leader line,
 * as in https://d3-graph-gallery.com/graph/donut_label.html
 */
export class DonutChartWithLabels extends DonutChart {
  /**
   * @param {Object[]} data
   * @param {object} options - all `DonutChart` options, plus:
   * @param {function} options.labelText - accessor for the label text of a pie datum (defaults to the key)
   * @param {number} options.labelRadiusRatio - ratio (relative to the slice's outer radius) at which the leader line breaks and the label is anchored
   * @param {string} options.labelStrokeColor - color of the leader line
   */
  constructor(
    data,
    { labelText, labelRadiusRatio = 1.4, labelStrokeColor = 'black', ...options } = {},
  ) {
    super(data, options)
    this.labelText = labelText ?? ((d) => cropText(this.keyMap(d.data), 30))
    this.labelRadiusRatio = labelRadiusRatio
    this.labelStrokeColor = labelStrokeColor
  }

  /**
   * @param {object} d - a datum produced by d3.pie()
   * @returns {number} the mid-angle (radians) of the slice
   */
  midAngle(d) {
    return d.startAngle + (d.endAngle - d.startAngle) / 2
  }

  /**
   * The point at which a slice's leader line breaks toward its label,
   * pushed left/right depending on which half of the donut the slice falls in.
   *
   * @param {object} d - a datum produced by d3.pie()
   * @returns {[number, number]}
   */
  labelAnchor(d) {
    const labelRadius = this.outerRadiusFor(d) * this.labelRadiusRatio
    const pos = d3
      .arc()
      .innerRadius(labelRadius)
      .outerRadius(labelRadius)
      .centroid(d)
    pos[0] = labelRadius * (this.midAngle(d) < Math.PI ? 1 : -1)
    return pos
  }

  renderExtensions(svg) {
    super.renderExtensions(svg)

    svg
      .append('g')
      .attr('fill', 'none')
      .attr('stroke', this.labelStrokeColor)
      .attr('stroke-width', 1)
      .selectAll('polyline')
      .data(this.pieData)
      .join('polyline')
      .attr('points', (d) => [
        this.arc.centroid(d),
        d3
          .arc()
          .innerRadius(this.outerRadiusFor(d))
          .outerRadius(this.outerRadiusFor(d))
          .centroid(d),
        this.labelAnchor(d),
      ])

    svg
      .append('g')
      .attr('font-family', this.fontFamily)
      .attr('font-size', this.fontSize)
      .selectAll('text')
      .data(this.pieData)
      .join('text')
      .attr('transform', (d) => `translate(${this.labelAnchor(d)})`)
      .attr('text-anchor', (d) => (this.midAngle(d) < Math.PI ? 'start' : 'end'))
      .attr('dy', '0.35em')
      .text(this.labelText)
  }
}

export const pieChartUserGuideTip = `<p>Hover over a slice to see the count and entity name.</p>`
