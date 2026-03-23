import { mapRowToColumnKeys, rowsToObjectArray } from './data_utilities.js'

/**
 * Extract data from the partenaires sheet
 *
 * @param {Workbook} workbook - The workbook to extract
 * @returns {Object[]} A dictionary of the extracted sheet, each column header is used a key.
 *    Columns headers with identical information are grouped into the same key (e.g., "lab1" and "lab2" are grouped into "lab").
 */
export function getPartnersSheet(workbook) {
  mapRowToColumnKeys(workbook, 1)
  // return rowsToObjectArray(workbook.worksheets[1].getRows(2, 3))
  return rowsToObjectArray(workbook.worksheets[1].getRows(2, 181))
}
