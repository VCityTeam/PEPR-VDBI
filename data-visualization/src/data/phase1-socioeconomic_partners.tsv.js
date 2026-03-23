// import { readFile } from 'node:fs/promises'
// import { fileURLToPath } from 'node:url'
import { tsvFormat } from 'd3-dsv'
import {
  resolveGeneralEntities,
  getGeneralSheet,
  enrichSocioeconomicPartnersEntities,
} from './utilities/phase1-workbook.js'
import ExcelJS from 'exceljs'

// const data = await readFile(
//   fileURLToPath(import.meta.resolve('./private/phase1-workbook.json')),
//   'utf-8',
// )

const workbook = new ExcelJS.Workbook()
await workbook.xlsx.readFile(
  'src/data/private/251127 VDBI Base Connaissance vdef jyt.xlsx',
)

const projects = resolveGeneralEntities(getGeneralSheet(workbook))

const partners = [...new Set(projects.flatMap(({ partners }) => partners))]

const socioeconomic_partners =
  await enrichSocioeconomicPartnersEntities(partners)

// console.log(socioeconomic_partners)
// console.log(JSON.parse(data).socioeconomic_partners)

process.stdout.write(tsvFormat(socioeconomic_partners))
