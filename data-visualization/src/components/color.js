import * as d3 from 'd3'
import { exclude } from './utilities.js'
import { cnu_category_map } from './cnu.js'

// PEPR VDBI colors //
// - #3557a2
// - #ff722c
export const vdbi_color_scheme = {
  blue: '#3558A2',
  orange: '#FF732C',
}

export const vdbi_color_scale_diverging = d3
  .scaleDiverging()
  .range([vdbi_color_scheme.blue, 'white', vdbi_color_scheme.orange])
  .unknown('grey')

export const vdbi_orange_analogic_color_scheme = [
  // "#ffe6bf",
  // "#ffd9bf",
  // "#ffcc80",
  // "#ffb380",
  '#ff9900',
  '#ff6600',
  '#b36b00',
  '#b34700',
]

export const vdbi_blue_analogic_color_scheme = [
  // "#bfe2ff",
  // "#c9c8ff",
  // "#9390ff",
  '#80c6ff',
  '#0064b5',
  '#00467f',
  // "#1b17b0",
  '#13107b',
]

export const vdbi_analogic_color_scale = d3
  .scaleQuantize()
  .range(
    d3
      .zip(vdbi_orange_analogic_color_scheme, vdbi_blue_analogic_color_scheme)
      .flat(),
  )
  .unknown('grey')

export const vdbi_orange_analogic_color_scale = d3
  .scaleQuantize()
  .range(vdbi_orange_analogic_color_scheme)
  .unknown('grey')

export const vdbi_blue_analogic_color_scale = d3
  .scaleQuantize()
  .range(vdbi_blue_analogic_color_scheme)
  .unknown('grey')

export const project_color_scale = d3
  .scaleOrdinal(
    [
      'INTEGREEN',
      'NEO',
      'RESILIENCE',
      'TRACES',
      'URBHEALTH',
      'VF++',
      'VILLEGARDEN',
      'WHAOU',
    ],
    d3.schemeCategory10.slice(0, 8),
  )
  .unknown('grey')

// CNU Colors //

export const cnu_color_map = new Map([
  ['Lettres et sciences humaines', 'lightgreen'],
  ['Sections de santé', 'violet'],
  ['Sciences', 'lightblue'],
  ['Droit, économie et gestion', 'pink'],
  ['Pluridisciplinaire', 'yellow'],
])

export const cnu_color_range_map = new Map([
  ['Lettres et sciences humaines', d3.interpolateGreens],
  ['Sections de santé', d3.interpolatePurples],
  ['Sciences', d3.interpolateBlues],
  ['Droit, économie et gestion', d3.interpolateReds],
  ['Pluridisciplinaire', d3.interpolateRgbBasis(['white', 'yellow', 'brown'])],
])

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
  if (cnu == 'Administratif') return cnu

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

  if (exclude(cnu_category) && cnu_color_range_map.has(cnu_category)) {
    return cnu_color_range_map.get(cnu_category)(color_value)
  } else if (!exclude(cnu_category)) {
    console.error(`color CNU not implemented for ${d[0]}`)
  }
  return d3.interpolateGreys(color_value)
}

export function quantized_cnu_color(cnu, num_colors = 6) {
  const cnu_category = getCategoryFromCNU(cnu)
  const cnu_category_values = cnu_category_map.get(cnu_category)

  return d3
    .scaleOrdinal(
      cnu_category_values,
      d3.quantize(
        cnu_color_range_map.get(cnu_category),
        num_colors,
        // Math.round(cnu_category_values.length * 3),
      ),
      // .slice(Math.round(cnu_category_values.length / 2)),
    )
    .unknown('grey')(Number(cnu.substring(0, 2)))
}

// CNU-CNRS section Colors //

export const cnrs_color_map = new Map([
  ['Lettres et sciences humaines', 'lightgreen'],
  ['Sections de santé', 'violet'],
  ['Sciences', 'lightblue'],
  ['Droit, économie et gestion', 'lightgreen'],
  ['Pluridisciplinaire', 'lightgreen'],
])

export const cnrs_color_range_map = new Map([
  ['Lettres et sciences humaines', d3.interpolateViridis],
  ['Sections de santé', d3.interpolateWarm],
  ['Sciences', d3.interpolateCool],
  ['Droit, économie et gestion', d3.interpolateViridis],
  ['Pluridisciplinaire', d3.interpolateViridis],
])

export function quantized_cnrs_color(cnu, num_colors = 6) {
  const cnu_category = getCategoryFromCNU(cnu)
  const cnu_category_values = cnu_category_map.get(cnu_category)

  return d3
    .scaleOrdinal(
      cnu_category_values,
      d3.quantize(cnrs_color_range_map.get(cnu_category), num_colors),
    )
    .unknown('grey')(Number(cnu.substring(0, 2)))
}

// ERC Colors //

export const erc_category_colors = new Map([
  ['PE - Sciences & Technologies', d3.schemeCategory10[0]],
  ['LS - Vie & Santé', d3.schemeCategory10[4]],
  ['SH - Sciences Humaines & Sociales', d3.schemeCategory10[2]],
])

export const erc_color_range_map = new Map([
  ['PE - Sciences & Technologies', d3.interpolateGreens],
  ['LS - Vie & Santé', d3.interpolatePurples],
  ['SH - Sciences Humaines & Sociales', d3.interpolateBlues],
])

export const erc_color_scale = d3
  .scaleOrdinal(erc_category_colors.keys(), erc_category_colors.values())
  .unknown('grey')

export function getCategoryFromErcDiscipline(erc_discipline) {
  if (!erc_discipline) {
    console.warn(`empty erc discipline: ${erc_discipline}`)
    return null
  }
  return erc_category_colors
    .keys()
    .find((d) => d.startsWith(erc_discipline.substring(0, 2)))
}

export function interpolated_erc_color(erc_discipline) {
  const erc_category = getCategoryFromErcDiscipline(erc_discipline)
  const color_scale = d3
    .scaleSequential([1, 12], erc_color_range_map.get(erc_category))
    .unknown('grey')
  return color_scale(Number(erc_discipline.substring(2, 4)))
}

// HCERES Colors //

export const hceres_category_colors = new Map([
  ['ST Sciences et Technologies', d3.schemeCategory10[0]],
  ['SHS Sciences humaines et sociales', d3.schemeCategory10[2]],
  ['SVE Sciences du vivant et environnement', d3.schemeCategory10[4]],
])

export const hceres_color_range_map = new Map([
  ['ST Sciences et Technologies', d3.interpolateGreens],
  ['SHS Sciences humaines et sociales', d3.interpolateBlues],
  ['SVE Sciences du vivant et environnement', d3.interpolatePurples],
])

export const hceres_color_scale = d3
  .scaleOrdinal(hceres_category_colors.keys(), hceres_category_colors.values())
  .unknown('grey')

export function getCategoryFromHceresDiscipline(hceres_discipline) {
  if (!hceres_discipline) {
    console.warn(`empty hceres discipline: ${hceres_discipline}`)
    return null
  }
  return hceres_category_colors
    .keys()
    .find((d) => d.startsWith(hceres_discipline.substring(0, 2)))
}

export function interpolated_hceres_color(hceres_discipline, domain = [1, 12]) {
  const hceres_category = getCategoryFromHceresDiscipline(hceres_discipline)
  const color_scale = d3
    .scaleOrdinal(
      domain,
      d3.quantize(
        hceres_color_range_map.get(hceres_category),
        domain.length + 1,
      ),
    )
    .unknown('grey')
  return color_scale(hceres_discipline)
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
  .unknown('grey')

export const interpolated_legal_nature_color = (
  code,
  domain = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
) =>
  d3
    .scaleOrdinal(
      domain,
      d3.quantize(
        d3.interpolateRgb(legal_nature_colors(code), 'white'),
        domain.length + 1,
      ),
    )
    .unknown('grey')
