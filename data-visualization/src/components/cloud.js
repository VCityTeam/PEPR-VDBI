import * as d3 from "d3"
import d3_cloud from "d3-cloud"
import { vdbi_orange_analogic_color_scale } from "./color.js"

/**
 * Create a word cloud using d3-cloud.
 *
 * @param {object[]} data - a list of objects with `text` and `value` properties
 * @param {object} options - configuration options for the word cloud
 * @param {number} options.width - width of the word cloud
 * @param {number} options.height - height of the word cloud
 * @param {function|number} options.valueMap - a function to access the word count of each word
 * @param {number[]} options.domain - the domain of the values for the words
 * @param {function|string} options.font - font family for the words
 * @param {function|string} options.font_style - the default font style for the words
 * @param {function|string} options.font_weight - the default font weight for the words
 * @param {number[]} options.font_size_range - the range `[min, max]` of font sizes for the words
 * @param {function|number} options.font_size - the size of each word, uses `font_size_range` by default
 * @param {number} options.angle_number - the number of angles used to rotate each word
 * @param {number} options.angle_width - the distance between each angle
 * @param {number} options.angle_offset - the offset applied to every angle
 * @param {function} options.rotate - function to determine the rotation of each word
 * @param {function|string} options.color - a color string or function to determine the color of each word
 * @returns {Element} - an SVG element containing the word cloud
 */
export function wordCloud(
  data,
  {
    width = 500,
    height = 500,
    valueMap = (d) => d.value,
    domain = [d3.min(data.map(valueMap)), d3.max(data.map(valueMap))],
    font = () =>
      d3.scaleQuantize().range([
        // "Verdana, sans-serif",
        "Trebuchet MS, sans-serif",
        "Impact, sans-serif",
        "Georgia, serif",
        // "Garamond, serif",
      ])(Math.random()),
    font_style = "normal",
    font_weight = "normal",
    // font_weight = (d) =>
    //   d3.scaleQuantize(domain, ["lighter", "lighter", "normal", "bold"])(
    //     valueMap(d)
    //   ),
    font_size_range = [10, 100],
    font_size = (d) => d3.scaleLinear(domain, font_size_range)(valueMap(d)),
    // d3.scaleLog(domain, [font_size_min, font_size_max])(valueMap(d)),
    angle_number = 3,
    angle_width = 90,
    angle_offset = 45,
    rotate = () =>
      (~~(Math.random() * angle_number) - angle_number / 2) * angle_width +
      angle_offset,
    color = () => vdbi_orange_analogic_color_scale(Math.random()),
  } = {}
) {
  const cloud = d3_cloud()
    .size([width, height])
    .words(data)
    .rotate(rotate)
    .font(font)
    .fontStyle(font_style)
    .fontWeight(font_weight)
    .fontSize(font_size)
    .on("end", draw)

  const svg = d3
    .create("svg")
    .attr("width", cloud.size()[0])
    .attr("height", cloud.size()[1])

  const words = svg
    .append("g")
    .attr(
      "transform",
      `translate(${cloud.size()[0] / 2},${cloud.size()[1] / 2})`
    )

  function draw(data) {
    console.debug("wordcloud data", data)
    words
      .selectAll("text")
      .data(data)
      .join("text")
      .style("font-size", (d) => d.size + "px")
      .style("font-family", (d) => d.font)
      .style("font-style", (d) => d.style)
      .style("font-weight", (d) => d.weight)
      .style("fill", color)
      .attr("text-anchor", "middle")
      .attr("transform", (d) => `translate(${[d.x, d.y]})rotate(${d.rotate})`)
      .text((d) => d.text)
  }

  cloud.start()

  return svg.node()
}
