// A CLI helper script for querying the identified APIs and formatting the response.

import { tsvFormat } from 'd3-dsv'
import { queryAndFormatRE } from './siret_api.js'

const args = process.argv.slice(2)

if (args.length == 0 || args.length > 2) {
  console.error('Usage: node query_api.js <query> <source (optional)>')
  process.exit(1)
}

const query = args[0]
const source = args[1] ?? 'cli'

const response = await queryAndFormatRE(query, source, false)

process.stdout.write(tsvFormat([response]))
