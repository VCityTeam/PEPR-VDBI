import ExcelJS from 'exceljs'
import { extractPhase1Workbook } from './utilities/phase1-workbook.js'

const workbook = new ExcelJS.Workbook()
await workbook.xlsx.readFile(
  'src/data/private/251127 VDBI Base Connaissance vdef jyt.xlsx',
)

const data = await extractPhase1Workbook(workbook, { onlyFinanced: true })

process.stdout.write(JSON.stringify(data))
