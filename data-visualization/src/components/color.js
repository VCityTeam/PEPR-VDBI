import * as d3 from 'npm:d3';
import { exclude } from './utilities.js';
import { cnu_category_map } from './cnu.js';

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
    console.warn(`empty cnu: ${cnu}`);
    return null;
  }
  if (cnu == 'Administratif') return cnu;

  // Given a string starting with a CNU number, return the number
  const cnu_number = Number(cnu.trim().substring(0, 2));
  const category = cnu_category_map
    .entries()
    .find((d) => d[1].includes(cnu_number));

  if (!category) console.warn(`could not categorize cnu: ${cnu}`);

  return category ? category[0] : null;
}

/**
* Determine the color value of a CNU string.
*
* @param {}  - 
* @returns {} 
*/
export function colorCNU(d, max) {
  const cnu_category = getCategoryFromCNU(d[0]);
  const color_value = d[1] > 1 ? d[1] : 1; // we can't input logarithmic values below 1

  const color = d3.scaleLog([1, max], [0.4, 1]);
  //   .scaleSequential()
  //   .domain([0, max])
  //   .interpolator(d3.interpolateGreys)
  //   .unknown("grey");

  // determine color range by category
  if (cnu_category == 'Lettres et sciences humaines') {
    // color.interpolator(d3.interpolateOranges);
    return d3.interpolateOranges(color(color_value));
  } else if (cnu_category == 'Sections de santé') {
    // color.interpolator(d3.interpolateGreens);
    return d3.interpolateGreens(color(color_value));
  } else if (cnu_category == 'Sciences') {
    // color.interpolator(d3.interpolateBlues);
    return d3.interpolateBlues(color(color_value));
  } else if (cnu_category == 'Droit, économie et gestion') {
    // color.interpolator(d3.interpolateReds);
    return d3.interpolateReds(color(color_value));
  } else if (cnu_category == 'Pluridisciplinaire') {
    // color.interpolator(d3.interpolatePurples);
    return d3.interpolatePurples(color(color_value));
  } else if (cnu_category == 'Administratif' || exclude(cnu_category)) {
    // use default interpolator
  } else {
    console.error(`color CNU not implemented for ${d[0]}`);
    // use default interpolator
  }

  // return color(d[1]);
  return d3.interpolateGreys(color(color_value));
}
