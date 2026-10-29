import {
  default_log_options,
  handleFetchJson,
} from './data_utilities.js'
import { pino } from 'pino'
import { loadEnvFile } from 'node:process'

const logger = pino(default_log_options('grist api utility'))

/**
 * Run a read-only SQL query against a Grist document through its REST API.
 * The bearer token is read from `GRIST_TOKEN` in `src/data/.env`, loaded on
 * every call.
 *
 * @param {string} query - The SQL query to run, URL-encoded internally.
 * @param {string} doc_id - The Grist document ID to query.
 * @returns {Promise<object|null>} A promise resolving to the API's
 *  `{records: [{id, fields}, ...]}` response body, or null if the request
 *  failed (errors are logged by `handleFetchJson`, not thrown).
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
