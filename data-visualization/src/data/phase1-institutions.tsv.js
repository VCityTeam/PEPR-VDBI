import { group } from 'd3'
import { tsvFormat } from 'd3-dsv'
import { getPartnersSheet } from './utilities/partenaires_aap2023.js'
import { queryAndFormatRE } from './utilities/siret_api.js'
import ExcelJS from 'exceljs'

const workbook = new ExcelJS.Workbook()
await workbook.xlsx.readFile('src/data/private/partenaires_aap2023.xlsx')

const partners = group(getPartnersSheet(workbook), (d) => d.type)

Promise.allSettled(
  // partners.get('LABORATOIRE').map(async (d) => {
  partners.get('ETABLISSEMENT').map(async (d) => {
    //   partners.get('SOCIOECONOMIQUE').map(async (d) => {
    const label = d.label
    const response = await queryAndFormatRE(d['ID primaire'], 'aap1_export')
    return { label, ...response }
  }),
).then((results) => {
  process.stdout.write(tsvFormat(results.map((r) => r.value)))
})
