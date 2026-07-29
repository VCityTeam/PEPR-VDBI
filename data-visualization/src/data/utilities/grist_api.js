import {
  default_log_options,
  handleFetchJson,
} from './data_utilities.js'
import { pino } from 'pino'
import { loadEnvFile } from 'node:process'

const logger = pino(default_log_options('grist api utility'))

/**
 * Queries the Grist API and formats the response. If the query fails or yields no results,
 * returns a default response matching the CSV header structure.
 *
 * @param {string} query - The search query to be sent.
 * @param {string} doc_id - The Grist document ID.
 * @returns {Promise<object[]|null>} A promise resolving to an object.
 */
export async function simpleGristQuery(query, doc_id) {
  loadEnvFile()

  const url = `https://grist.numerique.gouv.fr/api/docs/${doc_id}/sql?q=${encodeURIComponent(query)}`

  return await handleFetchJson(
    url,
    3000,
    {
      accept: 'application/json',
      Authorization: `Bearer ${process.env.GRIST_TOKEN}`,
    },
    logger,
  )
}
