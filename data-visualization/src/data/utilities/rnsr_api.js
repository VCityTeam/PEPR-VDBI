import { pino } from 'pino'
import { default_log_options, handleFetchJson } from './data_utilities.js'

const logger = pino(default_log_options('rnsr api utility'))

/**
 * Look up a research structure by its RNSR number in the French higher
 * education and research open data catalogue, and merge the top result into a
 * record tagged with the query and its source. If the query is empty, the
 * request fails, or no structure matches, only the `{source_label, source}`
 * tag is returned so that every row keeps the same CSV header structure.
 *
 * @param {string} query - The RNSR (numero_national_de_structure) to look up.
 * @param {string} source - Label identifying where the query came from, copied
 *   onto the result for traceability.
 * @returns {Promise<object>} A promise resolving to the tagged result record.
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
