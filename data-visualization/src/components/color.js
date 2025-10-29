import * as d3 from "d3"
import { exclude } from "./utilities.js"
import { cnu_category_map } from "./cnu.js"

// PEPR VDBI colors //
// - #3557a2
// - #ff722c
export const vdbi_color_scheme = {
  blue: "#3558A2",
  orange: "#FF732C",
}

export const vdbi_color_scale_diverging = d3
  .scaleDiverging()
  .range([vdbi_color_scheme.blue, "white", vdbi_color_scheme.orange])
  .unknown("#ccc")

export const vdbi_orange_analogic_color_scheme = [
  // "#ffe6bf",
  // "#ffd9bf",
  // "#ffcc80",
  // "#ffb380",
  "#ff9900",
  "#ff6600",
  "#b36b00",
  "#b34700",
]

export const vdbi_blue_analogic_color_scheme = [
  // "#bfe2ff",
  // "#c9c8ff",
  // "#9390ff",
  "#80c6ff",
  "#0064b5",
  "#00467f",
  // "#1b17b0",
  "#13107b",
]

export const vdbi_analogic_color_scale = d3
  .scaleQuantize()
  .range(
    d3
      .zip(vdbi_orange_analogic_color_scheme, vdbi_blue_analogic_color_scheme)
      .flat()
  )
  .unknown("#ccc")

export const vdbi_orange_analogic_color_scale = d3
  .scaleQuantize()
  .range(vdbi_orange_analogic_color_scheme)
  .unknown("#ccc")

export const vdbi_blue_analogic_color_scale = d3
  .scaleQuantize()
  .range(vdbi_blue_analogic_color_scheme)
  .unknown("#ccc")

export const project_color_scale = d3
  .scaleOrdinal(
    [
      "INTEGREEN",
      "NEO",
      "RESILIENCE",
      "TRACES",
      "URBHEALTH",
      "VF++",
      "VILLEGARDEN",
      "WHAOU",
    ],
    d3.schemeCategory10.slice(0, 8)
  )
  .unknown("#ccc")

// CNU Colors //

/**
 * Determine the category of a CNU number.
 * Based on https://conseil-national-des-universites.fr/
 *
 * @param {String} cnu - CNU full name to categorize
 * @returns {Number} The CNU category number
 */
export function getCategoryFromCNU(cnu) {
  if (!cnu) {
    console.warn(`empty cnu: ${cnu}`)
    return null
  }
  if (cnu == "Administratif") return cnu

  // Given a string starting with a CNU number, return the number
  const cnu_number = Number(cnu.trim().substring(0, 2))
  const category = cnu_category_map
    .entries()
    .find((d) => d[1].includes(cnu_number))

  if (!category) console.warn(`could not categorize cnu: ${cnu}`)

  return category ? category[0] : null
}

/**
 * Determine the color value of a CNU string.
 *
 * @param {}  -
 * @returns {}
 */
export function colorCNU(d, max) {
  const cnu_category = getCategoryFromCNU(d[0])
  // calculate color value
  // note: we can't pass values below 1 to logarithmic scales
  const color_value = d3.scaleLog([1, max], [0.4, 1])(d[1] > 1 ? d[1] : 1)

  // determine color range by category
  if (cnu_category == "Lettres et sciences humaines") {
    return d3.interpolateGreens(color_value)
  } else if (cnu_category == "Sections de santé") {
    return d3.interpolatePurples(color_value)
  } else if (cnu_category == "Sciences") {
    return d3.interpolateBlues(color_value)
  } else if (cnu_category == "Droit, économie et gestion") {
    return d3.interpolateOranges(color_value)
  } else if (cnu_category == "Pluridisciplinaire") {
    return d3.interpolateReds(color_value)
  } else if (cnu_category == "Administratif" || exclude(cnu_category)) {
    // use default interpolator
  } else {
    console.error(`color CNU not implemented for ${d[0]}`)
    // use default interpolator
  }
  return d3.interpolateGreys(color_value)
}

// Legal nature colors //
// (Code 0) Organisme de placement collectif en valeurs mobilières sans personnalité morale
// (Code 1) Entrepreneur individuel
// (Code 2) Groupement de droit privé non doté de la personnalité morale
// (Code 3) Personne morale de droit étranger
// (Code 4) Personne morale de droit public soumise au droit commercial
// (Code 5) Société commerciale
// (Code 6) Autre personne morale immatriculée au RCS
// (Code 7) Personne morale et organisme soumis au droit administratif
// (Code 8) Organisme privé spécialisé
// (Code 9) Groupement de droit privé
export const legal_nature_colors = d3
  .scaleOrdinal([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], d3.schemeSet3)
  .unknown("#ccc")

export const interpolated_legal_nature_color = (
  code,
  domain = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
) =>
  d3
    .scaleOrdinal(
      domain,
      d3.quantize(
        d3.interpolateRgb(legal_nature_colors(code), "white"),
        domain.length + 1
      )
    )
    .unknown("#ccc")
