// Export the AAP2 submission metadata as a TSV file with a UTF-8 encoding //

import ExcelJS from 'exceljs'
import { tsvFormat } from 'd3-dsv'
import {
  // anonymizeEntry,
  // pseudoanonymizeEntry,
  // filterEmptyArray,
  // toLowerPreservingAcronyms,
  mapRowToColumnKeys,
  rowsToObjectArray,
} from './data_utilities.js'

const workbook = new ExcelJS.Workbook()
await workbook.xlsx.readFile(
  'src/data/private/PITT attribution evaluateurs_ARU_GGE.xlsx',
)

mapRowToColumnKeys(workbook, 0)
const data = rowsToObjectArray(workbook.worksheets[0].getRows(2, 42))

process.stdout.write(tsvFormat(data))
