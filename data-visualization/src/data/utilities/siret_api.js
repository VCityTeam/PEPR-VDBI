import { pino } from 'pino'
import { default_log_options, handleFetchJson } from './data_utilities.js'

const logger = pino(default_log_options('siret api utility'))

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
 * returns a default response matching the CSV header structure. Only top
 * result is returned. https://recherche-entreprises.api.gouv.fr/
 *
 * @param {string} query - The search query to be sent.
 * @param {string} source - The source of the data.
 * @param {boolean} [useSiege=true] - Prefer siege results over matching etablissements data.
 * @returns {Promise<object[]>} A promise resolving to an object.
 */
export async function queryAndFormatRE(query, source, useSiege = true) {
  const response = await handleFetchJson(
    `https://recherche-entreprises.api.gouv.fr/search` +
      `?q=${encodeURIComponent(query)}&page=1&per_page=1`,
    0.5,
    logger,
  )

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

// TODO: implement singleton pattern to avoid async rate limiting

// export class X {
//   private static instance: X | null = null;

//   public static getInstance() {
//     if (X.instance === null) {
//       X.instance = new X();
//     }

//     return X.instance;
//   }
// }
