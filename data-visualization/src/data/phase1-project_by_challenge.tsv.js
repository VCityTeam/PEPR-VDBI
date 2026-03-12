import ExcelJS from 'exceljs'
import { tsvFormat } from 'd3-dsv'
import {
  getGeneralSheet,
  resolveGeneralEntities,
} from './utilities/phase1-workbook.js'
import { challenge_label_id_map } from './utilities/240108-proposals-keywords.js'
import {
  mapRowToColumnKeys,
  rowsToObjectArray,
} from './utilities/data_utilities.js'

// extract and format primary challenges

const workbook_1 = new ExcelJS.Workbook()
await workbook_1.xlsx.readFile(
  'src/data/private/251127 VDBI Base Connaissance vdef jyt.xlsx',
)

const data_1 = resolveGeneralEntities(getGeneralSheet(workbook_1)).map(
  ({ acronyme, challenge }) => ({ acronyme, challenge, primary: true }),
)

// extract and format secondary challenges

const workbook_2 = new ExcelJS.Workbook()
await workbook_2.xlsx.readFile(
  'src/data/private/240108_consortium, contenus des propositions CNRS-SHS_GGE_JYT_ANRT.xlsx',
)

mapRowToColumnKeys(workbook_2, 1)
const data_2 = rowsToObjectArray(
  workbook_2.worksheets[1].getRows(2, 77),
).flatMap((d) => [
  {
    acronyme: d.Acronyme,
    challenge: challenge_label_id_map.get(d['autre défi 1']),
    primary: false,
  },
  {
    acronyme: d.Acronyme,
    challenge: challenge_label_id_map.get(d['autre défi 2']),
    primary: false,
  },
  {
    acronyme: d.Acronyme,
    challenge: challenge_label_id_map.get(d['autre défi 3']),
    primary: false,
  },
  {
    acronyme: d.Acronyme,
    challenge: challenge_label_id_map.get(d['autre défi 4']),
    primary: false,
  },
  {
    acronyme: d.Acronyme,
    challenge: challenge_label_id_map.get(d['autre défi 5']),
    primary: false,
  },
  {
    acronyme: d.Acronyme,
    challenge: challenge_label_id_map.get(d['autre défi 6']),
    primary: false,
  },
])

// join and print

const formatted_data = data_1.concat(data_2).filter((d) => !!d.challenge)

process.stdout.write(tsvFormat(formatted_data))
