/**
 * Return the default table header for a formatted SIRET API response.
 *
 * @returns {string[]} An array of strings representing the header.
 */
export function initSiretTable() {
  return [
    'siret',
    'siren',
    'nom_complet',
    'source_label',
    'nature_juridique',
    'latitude',
    'longitude',
    'libelle_commune',
    'commune',
    'code_postal',
    'region',
    'project_name',
    'project_coordinator',
    'source',
  ]
}

/**
 * Queries the API and formats the response. If the query fails or yields no results,
 * returns a default response matching the CSV header structure.
 *
 * @param {string} query - The search query to be sent.
 * @param {string} projectName - The name of the project.
 * @param {string} source - The source of the data.
 * @param {boolean|null} [projectCoordinator=null] - Whether the partner is the project coordinator or not.
 * @param {boolean} [useSiege=true] - Prefer siege results over matching etablissements data.
 * @returns {Promise<string[]>} A promise resolving to an array of formatted string values.
 */
export async function queryAndFormatRechercheEntreprises(
  query,
  projectName,
  source,
  projectCoordinator = null,
  useSiege = true,
) {
  const response = await queryRechercheEntreprises(query)

  const defaultResponse = [
    '', // siret
    '', // siren
    '', // nom_complet
    query, // source_label
    '', // nature_juridique
    '', // latitude
    '', // longitude
    '', // libelle_commune
    '', // commune
    '', // code_postal
    '', // region
    projectName,
    projectCoordinator !== null ? String(projectCoordinator) : '',
    source, // source
  ]

  if (response === null) {
    return defaultResponse
  }

  const formattedResponse = formatRechercheEntreprisesResponse(
    response,
    query,
    projectName,
    source,
    projectCoordinator,
    useSiege,
  )

  if (formattedResponse === null) {
    return defaultResponse
  } else {
    return formattedResponse
  }
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
  console.debug(`Querying recherche-entreprises.api with query: ${query}`)

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
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.debug(`recherche-entreprises.api response:`, data)
    return data
  } catch (err) {
    if (err.message && err.message.startsWith('HTTP error')) {
      console.error(
        `HTTP error occurred when querying recherche-entreprises.api: ${err}`,
      )
    } else {
      console.error(
        `Other error occurred when querying recherche-entreprises.api: ${err}`,
      )
    }
    return null
  }
}

/**
 * Format the response from the recherche-entreprises.api.gouv.fr Public API.
 *
 * @param {Object} response - The response from the API.
 * @param {string} label - The label from the source dataset used to identify the partner.
 * @param {string} projectName - The name of the project to be used in the response.
 * @param {string} source - The source of the data.
 * @param {boolean|null} [projectCoordinator=null] - Whether the partner is the project coordinator or not.
 * @param {boolean} [useSiege=true] - Prefer siege results over matching etablissements data. Recommend setting to true unless query is a precise identifier like a siret.
 * @returns {string[]|null} The response formatted according to initSiretTable() or null.
 */
export function formatRechercheEntreprisesResponse(
  response,
  label,
  projectName,
  source,
  projectCoordinator = null,
  useSiege = true,
) {
  if (response !== null && response.results && response.results.length > 0) {
    const result = response.results[0]

    // matching etablissements may have more accurate data otherwise use siege
    const matchingEtablissement =
      !result.matching_etablissements ||
      result.matching_etablissements.length === 0
        ? null
        : result.matching_etablissements[0]

    if (!useSiege && matchingEtablissement !== null) {
      return [
        matchingEtablissement.siret,
        result.siren,
        result.nom_complet,
        label,
        result.nature_juridique,
        matchingEtablissement.latitude,
        matchingEtablissement.longitude,
        matchingEtablissement.libelle_commune,
        matchingEtablissement.commune,
        matchingEtablissement.code_postal,
        matchingEtablissement.region,
        projectName,
        projectCoordinator !== null ? String(projectCoordinator) : '',
        source,
      ]
    } else {
      return [
        result.siege.siret,
        result.siren,
        result.nom_complet,
        label,
        result.nature_juridique,
        result.siege.latitude,
        result.siege.longitude,
        result.siege.libelle_commune,
        result.siege.commune,
        result.siege.code_postal,
        result.siege.region,
        projectName,
        projectCoordinator !== null ? String(projectCoordinator) : '',
        source,
      ]
    }
  } else {
    console.warn('No results found for query')
    return null
  }
}
