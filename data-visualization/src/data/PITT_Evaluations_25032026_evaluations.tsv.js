import { tsvFormat } from 'd3-dsv'
import ExcelJS from 'exceljs'
import {
  mapRowToColumnKeys,
  rowsToObjectArray,
} from './utilities/data_utilities.js'
const workbook = new ExcelJS.Workbook()
await workbook.xlsx.readFile('src/data/private/PITT_Evaluations_25032026.xlsx')

mapRowToColumnKeys(workbook, 0)

const data = rowsToObjectArray(workbook.worksheets[0].getRows(2, 42))

process.stdout.write(tsvFormat(data))
