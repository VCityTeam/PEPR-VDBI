import ExcelJS from 'exceljs'
import { extractPhase1Workbook } from './utilities/phase1-workbook.js'
import { tsvFormat } from 'd3-dsv'

const workbook = new ExcelJS.Workbook()
await workbook.xlsx.readFile(
  'src/data/private/251127 VDBI Base Connaissance vdef jyt.xlsx',
)

const data = extractPhase1Workbook(workbook)

process.stdout.write(tsvFormat(data.researcher_by_keywords))
