import { pino } from 'pino'
import { default_log_options, handleFetchJson } from './data_utilities.js'

const logger = pino(default_log_options('rnsr api utility'))

/**
 * Queries the API and formats the response. If the query fails or yields no results,
 * returns a default response matching the CSV header structure.
 *
 * @param {string} query - The search query to be sent.
 * @param {string} source - The source of the data.
 * @param {boolean} [useSiege=true] - Prefer siege results over matching etablissements data.
 * @returns {Promise<object[]|null>} A promise resolving to an object.
 */
export async function queryAndFormatESR(query, source) {
  const formattedResponse = {
    source_label: query,
    source: source,
  }

  if (!query) {
    logger.error(
      `Error formatting response: No query received; query: ${query}`,
    )
    return formattedResponse
  }

  const response = await handleFetchJson(
    'https://data.enseignementsup-recherche.gouv.fr' +
      '/api/explore/v2.1/catalog/datasets' +
      '/fr-esr-structures-recherche-publiques-actives/records' +
      `?where=numero_national_de_structure="${encodeURIComponent(query)}"`,
    0.5,
    null,
    logger,
  )

  if (!response) {
    logger.error(
      `Error formatting response: No response received; query: ${query}`,
    )
    return formattedResponse
  }

  if (!response?.results) {
    logger.error(
      `Error formatting response; Result format type mismatch: ${typeof response.results}; query: ${query}`,
    )
    return formattedResponse
  }
  if (response?.total_count == 0) {
    logger.warn(
      `Could not format response; N° results returned: ${response?.total_count}; query: ${query}`,
    )
    return formattedResponse
  }

  return {
    ...formattedResponse,
    ...response.results[0],
  }
}
