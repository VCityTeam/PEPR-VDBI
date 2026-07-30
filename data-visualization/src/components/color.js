import * as d3 from 'd3'
import { cnu_category_section_map, getGroupFromCNU } from './cnu.js'

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
      'ATECA',
      'CAPTURE',
      'CARE',
      'COOL ZINC',
      'DC RISK CITY',
      'GO PRO',
      'MRHR',
      'NESPAMEX',
      'PERENNIS',
      'PFAS-CITES',
      'RARE',
      'SITINERE',
      'TOTEM',
      'URBEXPOMIC',
    ],
    d3.schemePaired,
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

export const cnu_dark_color_map = new Map([
  ['Lettres et sciences humaines', 'green'],
  ['Sections de santé', 'violet'],
  ['Sciences', 'darkblue'],
  ['Droit, économie et gestion', 'red'],
  ['Pluridisciplinaire', 'orange'],
])

export const cnu_color_range_map = new Map([
  ['Lettres et sciences humaines', d3.interpolateViridis],
  ['Sections de santé', d3.interpolateWarm],
  ['Sciences', d3.interpolateCool],
  ['Droit, économie et gestion', d3.interpolateCividis],
  ['Pluridisciplinaire', d3.interpolateSinebow],
])

export const cnu_string_color_range_map = new Map([
  ['Lettres et sciences humaines', 'Viridis'],
  ['Sections de santé', 'Warm'],
  ['Sciences', 'Cool'],
  ['Droit, économie et gestion', 'Cividis'],
  ['Pluridisciplinaire', 'Sinebow'],
])

// /**
//  * Determine the color value of a CNU string.
//  *
//  * @param {}  -
//  * @returns {}
//  */
// export function colorCNU(d, max) {
//   const cnu_category = getGroupFromCNU(d[0])
//   // calculate color value
//   // note: we can't pass values below 1 to logarithmic scales
//   const color_value = d3.scaleLog([1, max], [0.4, 1])(d[1] > 1 ? d[1] : 1)

//   if (exclude(cnu_category) && cnu_color_range_map.has(cnu_category)) {
//     return cnu_color_range_map.get(cnu_category)(color_value)
//   } else if (!exclude(cnu_category)) {
//     console.error(`color CNU not implemented for ${d[0]}`)
//   }
//   return d3.interpolateGreys(color_value)
// }

/**
 * Return a quantized color for a CNU code based on its category's color
 * interpolator
 *
 * @param {string} cnu - CNU full name/number to color
 * @param {number} [num_colors=10] - number of quantized color steps
 *  (defaults to the number of CNU section groups)
 * @returns {string} a color value
 */
export function quantized_cnu_color(cnu, num_colors = 10) {
  const cnu_category = getGroupFromCNU(cnu)
  const cnu_category_values = cnu_category_section_map.has(cnu_category)
    ? cnu_category_section_map.get(cnu_category)
    : []

  return d3
    .scaleOrdinal(
      cnu_category_values,
      d3.quantize(
        cnu_color_range_map.has(cnu_category)
          ? cnu_color_range_map.get(cnu_category)
          : d3.interpolateGreys,
        num_colors,
      ),
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

/**
 * Return a quantized color for a CNU code based on its category's CNRS
 * color interpolator
 *
 * @param {string} cnu - CNU full name/number to color
 * @param {number} [num_colors=6] - number of quantized color steps
 *  (defaults to the number of CNRS color groups)
 * @returns {string} a color value
 */
export function quantized_cnrs_color(cnu, num_colors = 6) {
  const cnu_category = getGroupFromCNU(cnu)
  const cnu_category_values = cnu_category_section_map.get(cnu_category)

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
  ['PE - Sciences & Technologies', d3.interpolateCool],
  ['LS - Vie & Santé', d3.interpolateWarm],
  ['SH - Sciences Humaines & Sociales', d3.interpolateViridis],
])

export const erc_color_scale = d3
  .scaleOrdinal(erc_category_colors.keys(), erc_category_colors.values())
  .unknown('grey')

/**
 * Find the ERC category matching the first 2 characters of an ERC
 * discipline string
 *
 * @param {string} erc_discipline - the ERC discipline code (e.g. 'PE1')
 * @returns {string|undefined} the matching ERC category key, if found
 */
export function getCategoryFromErcDiscipline(erc_discipline) {
  if (!erc_discipline) {
    console.warn(`empty erc discipline: ${erc_discipline}`)
    return null
  }
  return erc_category_colors
    .keys()
    .find((d) => d.startsWith(erc_discipline.substring(0, 2)))
}

/**
 * Return an interpolated color for an ERC discipline using a sequential
 * scale over its category's color interpolator
 *
 * @param {string} erc_discipline - the ERC discipline code (e.g. 'PE1')
 * @returns {string} a color value
 */
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
  ['ST Sciences et Technologies', d3.interpolateCool],
  ['SHS Sciences humaines et sociales', d3.interpolateViridis],
  ['SVE Sciences du vivant et environnement', d3.interpolateWarm],
])

export const hceres_color_scale = d3
  .scaleOrdinal(hceres_category_colors.keys(), hceres_category_colors.values())
  .unknown('grey')

/**
 * Find the HCERES category matching the first 2 characters of an HCERES
 * discipline string
 *
 * @param {string} hceres_discipline - the HCERES discipline code
 * @returns {string|undefined} the matching HCERES category key, if found
 */
export function getCategoryFromHceresDiscipline(hceres_discipline) {
  if (!hceres_discipline) {
    console.warn(`empty hceres discipline: ${hceres_discipline}`)
    return null
  }
  return hceres_category_colors
    .keys()
    .find((d) => d.startsWith(hceres_discipline.substring(0, 2)))
}

/**
 * Return an ordinal-quantized color for an HCERES discipline within the
 * supplied domain, using its category's color interpolator
 *
 * @param {string} hceres_discipline - the HCERES discipline code
 * @param {Array} [domain=[1, 12]] - the ordinal domain to scale over
 * @returns {string} a color value
 */
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

/**
 * Return a quantized color interpolated between a legal-nature base color
 * and white
 *
 * @param {number} code - the legal nature code
 * @param {number[]} [domain=[0,1,2,3,4,5,6,7,8,9]] - the ordinal domain to scale over
 * @returns {Function} an ordinal d3 color scale, callable with a domain value
 */
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

// keyword colors //

/**
 * Build an ordinal color scale over a list of keywords using a sinebow
 * interpolator
 *
 * @param {string[]} keywords - the keywords to assign colors to
 * @returns {Function} an ordinal d3 color scale, callable with a keyword
 */
export const keyword_color_scale = (keywords) =>
  d3
    .scaleOrdinal(
      keywords,
      d3.quantize(d3.interpolateSinebow, keywords.length + 1),
    )
    .unknown('grey')
