import { pino } from 'pino'
import { default_log_options } from './data_utilities.js'

const logger = pino(default_log_options('siret utility'))

const defaultResponse = {
  siret: null,
  siren: null,
  nom_complet: null,
  nature_juridique: null,
  latitude: null,
  longitude: null,
  libelle_commune: null,
  commune: null,
  code_postal: null,
  region: null,
}

/**
 * Queries the API and formats the response. If the query fails or yields no results,
 * returns a default response matching the CSV header structure.
 *
 * @param {string} query - The search query to be sent.
 * @param {string} source - The source of the data.
 * @param {boolean} [useSiege=true] - Prefer siege results over matching etablissements data.
 * @returns {Promise<object[]>} A promise resolving to an object.
 */
export async function queryAndFormatRechercheEntreprises(
  query,
  source,
  useSiege = true,
) {
  const response = await queryRechercheEntreprises(query)

  const formattedResponse = {
    ...defaultResponse,
    source_label: query,
    source: source,
  }

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
  if (response?.results?.length == 0) {
    logger.warn(
      `Could not format response; N° results returned: ${response?.results?.length}; query: ${query}`,
    )
    return formattedResponse
  }

  const result = response.results[0]

  formattedResponse.siren = result.siren
  formattedResponse.nom_complet = result.nom_complet
  formattedResponse.nature_juridique = result.nature_juridique
  formattedResponse.siret = result.siege.siret
  formattedResponse.latitude = result.siege.latitude
  formattedResponse.longitude = result.siege.longitude
  formattedResponse.libelle_commune = result.siege.libelle_commune
  formattedResponse.commune = result.siege.commune
  formattedResponse.code_postal = result.siege.code_postal
  formattedResponse.region = result.siege.region

  // matching etablissements may have more accurate data otherwise keep siege data
  if (!useSiege && result.matching_etablissements?.length > 0) {
    const matchingEtablissement = result.matching_etablissements[0]

    formattedResponse.siret = matchingEtablissement.siret
    formattedResponse.latitude = matchingEtablissement.latitude
    formattedResponse.longitude = matchingEtablissement.longitude
    formattedResponse.libelle_commune = matchingEtablissement.libelle_commune
    formattedResponse.commune = matchingEtablissement.commune
    formattedResponse.code_postal = matchingEtablissement.code_postal
    formattedResponse.region = matchingEtablissement.region
  }

  return formattedResponse
}

/**
 * Send a basic query to the recherche-entreprises.api.gouv.fr Public API. Only top
 * result is returned. https://recherche-entreprises.api.gouv.fr/
 *
 * @param {string} query - The search query to be sent.
 * @param {number} [sleep=0.2] - The number of seconds to sleep before sending the request to avoid rate limiting.
 * @returns {Promise<Object|null>} A promise resolving to a dictionary (object) of the request response if successful, or null.
 */
export async function queryRechercheEntreprises(query, sleep = 0.2) {
  logger.debug(`Querying recherche-entreprises.api with query: ${query}`)

  // sleep to avoid rate limiting
  await new Promise((resolve) => setTimeout(resolve, sleep * 1000))

  try {
    const response = await fetch(
      `https://recherche-entreprises.api.gouv.fr/search?q=${encodeURIComponent(query)}&page=1&per_page=1`,
      {
        headers: {
          Accept: 'application/json',
        },
      },
    )

    if (!response.ok) {
      // Emulate response.raise_for_status()
      throw new Error(`HTTP error! status: ${response.status}, query: ${query}`)
    }

    const data = await response.json()
    logger.debug(`recherche-entreprises.api response: ${data}`)
    return data
  } catch (err) {
    if (err.message && err.message.startsWith('HTTP error')) {
      logger.error(
        `HTTP error occurred when querying recherche-entreprises.api: ${err}`,
      )
    } else {
      logger.error(
        `Other error occurred when querying recherche-entreprises.api: ${err}`,
        err.cause,
      )
    }
    return null
  }
}
