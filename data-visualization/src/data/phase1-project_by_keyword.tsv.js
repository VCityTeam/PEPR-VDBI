import ExcelJS from 'exceljs'
import { tsvFormat } from 'd3-dsv'
import {
  // anonymizeEntry,
  // pseudoanonymizeEntry,
  // filterEmptyArray,
  toLowerPreservingAcronyms,
  mapRowToColumnKeys,
  rowsToObjectArray,
} from './utilities/data_utilities.js'

const workbook = new ExcelJS.Workbook()
await workbook.xlsx.readFile(
  'src/data/private/240108_consortium, contenus des propositions CNRS-SHS_GGE_JYT_ANRT.xlsx',
)

mapRowToColumnKeys(workbook, 1)
const data = rowsToObjectArray(workbook.worksheets[1].getRows(2, 77))

const formatted_data = data
  .flatMap((d) => [
    {
      acronyme: d.Acronyme,
      keyword: toLowerPreservingAcronyms(d['Mot clef 1']),
    },
    {
      acronyme: d.Acronyme,
      keyword: toLowerPreservingAcronyms(d['Mot clef 2']),
    },
    {
      acronyme: d.Acronyme,
      keyword: toLowerPreservingAcronyms(d['Mot clef 3']),
    },
    {
      acronyme: d.Acronyme,
      keyword: toLowerPreservingAcronyms(d['Mot clef 4']),
    },
    {
      acronyme: d.Acronyme,
      keyword: toLowerPreservingAcronyms(d['Mot clef 5']),
    },
    {
      acronyme: d.Acronyme,
      keyword: toLowerPreservingAcronyms(d['Mot clef 6']),
    },
    {
      acronyme: d.Acronyme,
      keyword: toLowerPreservingAcronyms(d['Mot clef 7']),
    },
    {
      acronyme: d.Acronyme,
      keyword: toLowerPreservingAcronyms(d['Mot clef 8']),
    },
    {
      acronyme: d.Acronyme,
      keyword: toLowerPreservingAcronyms(d['Mot clef 9']),
    },
    {
      acronyme: d.Acronyme,
      keyword: toLowerPreservingAcronyms(d['Mot clef 10']),
    },
    {
      acronyme: d.Acronyme,
      keyword: toLowerPreservingAcronyms(d['Mot clef 11']),
    },
    {
      acronyme: d.Acronyme,
      keyword: toLowerPreservingAcronyms(d['Mot clef 12']),
    },
    {
      acronyme: d.Acronyme,
      keyword: toLowerPreservingAcronyms(d['Mot clef 13']),
    },
  ])
  .filter((d) => !!d.keyword)

process.stdout.write(tsvFormat(formatted_data))
