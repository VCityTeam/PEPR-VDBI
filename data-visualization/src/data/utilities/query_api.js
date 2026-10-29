// A CLI helper script for querying the identified APIs and formatting the
// response. Intended for checking by hand what an API returns for a given
// query, rather than being imported by a data loader.
//
// Usage: node src/data/utilities/query_api.js <geocoding|siret> <query>
// Writes the JSON response to stdout; exits 1 on a usage or unknown-API error.

import { queryAndFormatRE } from './siret_api.js'
import { GeocodingService } from './geocoding.js'

const args = process.argv.slice(2)

if (args.length == 0 || args.length > 2) {
  console.error('Usage: node query_api.js <api> <query>\napi: geocoding | siret\nquery: the query string to search for')
  process.exit(1)
}

const api = args[0]
const query = args[1]

if (api === 'geocoding') {
  const geocodingService = new GeocodingService()
  const results = await geocodingService.simpleSearch(query)
  process.stdout.write(JSON.stringify(results))
} else if (api === 'siret') {
  const response = await queryAndFormatRE(query, 'cli', false)
  process.stdout.write(JSON.stringify(response))
} else {
  console.error(`Unknown API: ${api}`)
  process.exit(1)
}
process.exit(0)
