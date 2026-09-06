import { handleFetchJson } from './data_utilities.js'

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
   *   URL-encoded internally before being sent as the `query`-filled request
   *   parameter.
   * @returns {Promise<Array<object>>} The raw array of matching result objects
   *   found at `result.basePath` in the parsed response.
   * @throws {string} `'Cannot perform a request for now.'` if called again before
   *   `requestTimeIntervalMs` has elapsed since the previous request, or
   *   `'No result found'` if the API returned zero results.
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
   * @param {string} osmIds The IDs of the OSM objects.
   * @param {object} parameters Additional parameters to pass to the API.
   * @returns {Promise<Array<object>>} The raw array of matching result objects
   *   found at `result.basePath` in the parsed response.
   * @throws {string} `'Cannot perform a request for now.'` if called again before
   *   `requestTimeIntervalMs` has elapsed since the previous request, or
   *   `'No result found'` if the API returned zero results.
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

export function getOsmId(d) {
  return `${d.osm_type[0].toUpperCase()}${d.osm_id}`
}