import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { tsvFormat } from 'd3-dsv'

const data = await readFile(
  fileURLToPath(import.meta.resolve('./private/phase1-workbook.json')),
  'utf-8',
)

process.stdout.write(tsvFormat(JSON.parse(data).project_by_researchers))
