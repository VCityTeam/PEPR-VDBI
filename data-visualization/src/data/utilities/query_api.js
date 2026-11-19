// A CLI helper script for querying the identified APIs and formatting the
// response. Intended for checking by hand what an API returns for a given
// query, rather than being imported by a data loader.
//
// Usage: node src/data/utilities/query_api.js <geocoding|siret> <query>
// Writes the JSON response to stdout; exits 1 on a usage or unknown-API error.

import { queryAndFormatRE } from './siret_api.js'
import { GeocodingService } from './geocoding.js'
import { csvFormat, tsvFormat } from 'd3-dsv'

const args = process.argv.slice(2)

if (args.length == 0 || args.length > 3) {
  console.error(`Usage: node query_api.js <api> <query> <format>
    api: geocoding | siret
    query: the query string to search for
    format: (optional) the format of the response; 'csv', 'tsv' or 'json' (default: json)`)
  process.exit(1)
}

const api = args[0]
const query = args[1]
const format = args[2] || 'json'
let response = undefined

if (api === 'geocoding') {
  const geocodingService = new GeocodingService()
  response = await geocodingService.simpleSearch(query)
} else if (api === 'siret') {
  response = await queryAndFormatRE(query, 'cli', false)
} else {
  console.error(`Unknown API: ${api}`)
  process.exit(1)
}

if (format === 'tsv') {
  process.stdout.write(tsvFormat([response]))
} else if (format === 'csv') {
  process.stdout.write(csvFormat([response]))
} else if (format === 'json') {
  process.stdout.write(JSON.stringify(response))
}

process.exit(0)
