import { handleFetchJson } from './data_utilities.js'

/**
 * Thin client for a Nominatim-style geocoding API, used by data loaders to
 * resolve place names and OSM ids to coordinates. Requests go through
 * `handleFetchJson`, which serializes them and spaces them out by
 * `requestTimeIntervalMs` to stay within the API's rate limit.
 */
export class GeocodingService {
  /**
   * Instantiates a Nominatim geocoding service.
   * Adapted from https://www.npmjs.com/package/@ud-viz/widget_geocoding
   * Uses https://www.openstreetmap.org/ by default
   *
   * @param {string} [url] Base URL of the geocoding API endpoint
   *   that requests are sent to (e.g. a Nominatim `/search` endpoint).
   * @param {number} [requestTimeIntervalMs] Minimum time interval (in milliseconds) between requests to the geocoding API.
   *   This is used to avoid rate limiting by the API. Default is 1000 ms (1 second).
   * @param {object} [defaultParameters] Default parameters to include in every request to the geocoding API.
   *   These can be overridden by passing in `parameters` to the `simpleSearch` or `detailedSearch` methods.
   */
  constructor({
    url = 'https://nominatim.openstreetmap.org/',
    requestTimeIntervalMs = 1000,
    defaultParameters = {
      format: 'jsonv2',
      limit: 1,
    },
  } = {}) {
    this.geocodingUrl = url
    this.requestTimeIntervalMs = requestTimeIntervalMs
    this.defaultParameters = defaultParameters
  }

  /**
   * Retrieve the feature properties based on a simple search string.
   *
   * @param {string} searchString Either an address or the name of a place.
   *   URL-encoded internally and sent as the `q` request parameter.
   * @param {object} [parameters] Additional request parameters, merged over
   *   `defaultParameters` (e.g. `{limit: 5}` to widen the result set).
   * @returns {Promise<Array<object>|null>} The parsed response body — an array of
   *   matching results, empty when nothing matched — or null if the request
   *   failed (errors are logged by `handleFetchJson`, not thrown).
   */
  async simpleSearch(searchString, parameters) {
    // URL parameters
    const queryString = encodeURIComponent(searchString)

    // search parameters
    const searchParameters = new URLSearchParams({
      ...this.defaultParameters,
      ...parameters,
    })
    searchParameters.set('q', queryString)

    // Build the URL according to parameter description (in config file)
    let url = `${this.geocodingUrl}search/?${searchParameters}`

    // Make the request
    const response = await handleFetchJson(url, this.requestTimeIntervalMs, {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:153.0) Gecko/20100101 Firefox/153.0',
    })

    return response
  }

  /**
   * Retrieve the feature properties based on OSM object IDs.
   *
   * @param {string} osmIds A comma-separated list of prefixed OSM object ids
   *   (e.g. `'R71525,N240109189'`); see `getOsmId`.
   * @param {object} [parameters] Additional request parameters, merged over
   *   `defaultParameters`.
   * @returns {Promise<Array<object>|null>} The parsed response body — an array of
   *   matching results, empty when nothing matched — or null if the request
   *   failed (errors are logged by `handleFetchJson`, not thrown).
   */
  async detailedSearch(osmIds, parameters) {
    // search parameters
    const searchParameters = new URLSearchParams({
      ...this.defaultParameters,
      ...parameters,
      osm_ids: osmIds,
    })

    // Build the URL according to parameter description (in config file)
    let url = `${this.geocodingUrl}lookup?${searchParameters}`

    // Make the request
    const response = await handleFetchJson(url, this.requestTimeIntervalMs, {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:153.0) Gecko/20100101 Firefox/153.0',
    })

    return response
  }
}

/**
 * Build the prefixed OSM object id that Nominatim's `lookup` endpoint expects,
 * by prepending the uppercased first letter of the object type to its id
 * (e.g. `{osm_type: 'relation', osm_id: 71525}` becomes `'R71525'`).
 *
 * @param {object} d - a Nominatim result with `osm_type` and `osm_id` properties
 * @returns {string} the prefixed OSM id
 */
export function getOsmId(d) {
  return `${d.osm_type[0].toUpperCase()}${d.osm_id}`
}