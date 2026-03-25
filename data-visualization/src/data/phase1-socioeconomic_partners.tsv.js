import { group } from 'd3'
import { tsvFormat } from 'd3-dsv'
import { getPartnersSheet } from './utilities/partenaires_aap2023.js'
import { queryAndFormatRE } from './utilities/siret_api.js'
import { extractPhase1Workbook } from './utilities/phase1-workbook.js'
import ExcelJS from 'exceljs'

const workbook = new ExcelJS.Workbook()
await workbook.xlsx.readFile('src/data/private/partenaires_aap2023.xlsx')

const partners = group(getPartnersSheet(workbook), (d) => d.type).get(
  'SOCIOECONOMIQUE',
)

const workbook_2 = new ExcelJS.Workbook()
await workbook_2.xlsx.readFile(
  'src/data/private/251127 VDBI Base Connaissance vdef jyt.xlsx',
)

const partner_labels = new Set(partners.map((d) => d.label))

const partners_2 = extractPhase1Workbook(
  workbook_2,
).socioeconomic_partners.filter((d) => !partner_labels.has(d.partner))

partners_2.forEach((d) => partners.push({ label: d.partner }))

Promise.allSettled(
  partners.map(async (d) => {
    const label = d.label
    const response = await queryAndFormatRE(d['ID primaire'], 'aap1_export')
    return { label, ...response }
  }),
).then((results) => {
  process.stdout.write(tsvFormat(results.map((r) => r.value)))
})
