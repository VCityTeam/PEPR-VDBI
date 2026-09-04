import { handleFetchJson } from './data_utilities.js'

export class GeocodingService {
  /**
   * Instantiates a Nominatim geocoding service.
   * Adapted from https://www.npmjs.com/package/@ud-viz/widget_geocoding
   * Uses https://www.openstreetmap.org/ by default
   *
   * @param {object} [configGeocoding] Geocoding config.
   * @param {string} [configGeocoding.url] Base URL of the geocoding API endpoint
   *   that requests are sent to (e.g. a Nominatim `/search` endpoint).
   * @param {number|string} [configGeocoding.requestTimeIntervalMs] Minimum
   *   delay, in milliseconds, to wait between two requests. While a request is
   *   "cooling down", the service's request methods throw instead of calling
   *   the API. Pass `0` or `''` (falsy) to disable throttling entirely.
   * @param {object} [configGeocoding.result] Describes how to read a single
   *   result out of the API's JSON response.
   * @param {string} [configGeocoding.result.format] Expected response format
   *   (informational only; the service always parses the response as JSON).
   * @param {string} [configGeocoding.result.basePath] Dot-separated path, resolved
   *   via {@link getAttributeByPath}, to the array of results within the parsed
   *   response body. Leave empty (`''`) when the response body itself is that array.
   * @param {string} [configGeocoding.result.lon] Dot-separated path to a result's
   *   longitude field, resolved via {@link getAttributeByPath} on each result object.
   * @param {string} [configGeocoding.result.lat] Dot-separated path to a result's
   *   latitude field, resolved via {@link getAttributeByPath} on each result object.
   * @param {object} [configGeocoding.parameters] Map describing the query string
   *   parameters to append to the request URL. Each key is a parameter name; each
   *   value is an object with:
   *   - `fill: 'query'` — the parameter is filled with the URL-encoded search
   *     string passed to `getCoordinates`/`simpleSearch`/`getOsmCode`.
   *   - `fill: 'value'` — the parameter is filled with the literal `value` field.
   *   - `fill: 'extent'` — the parameter is filled from `format`, a template
   *     string containing the placeholders `SOUTH`, `WEST`, `NORTH`, `EAST`,
   *     which are replaced with the matching bounds from `extent`.
   * @param {object} [configGeocoding.extent] Bounding box used to fill
   *   `fill: 'extent'` parameters (e.g. to restrict results to a region).
   * @param {string} [configGeocoding.extent.name] CRS identifier the bounds are
   *   expressed in (e.g. `'EPSG:3946'`); informational, not used in requests.
   * @param {number} [configGeocoding.extent.west] Western bound, in the CRS
   *   given by `extent.name`.
   * @param {number} [configGeocoding.extent.east] Eastern bound, in the CRS
   *   given by `extent.name`.
   * @param {number} [configGeocoding.extent.south] Southern bound, in the CRS
   *   given by `extent.name`.
   * @param {number} [configGeocoding.extent.north] Northern bound, in the CRS
   *   given by `extent.name`.
   */
  constructor({
    url = 'https://nominatim.openstreetmap.org/',
    requestTimeIntervalMs = 3000,
    defaultParameters = {
      limit: 1,
    },
  } = {}) {
    this.geocodingUrl = url
    this.requestTimeIntervalMs = requestTimeIntervalMs
    this.canDoRequest = true
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
  async simpleSearch(
    searchString,
    parameters = {
      format: 'jsonv2',
    },
  ) {
    if (!!this.requestTimeIntervalMs && !this.canDoRequest) {
      await new Promise((resolve) =>
        setTimeout(resolve, this.requestTimeIntervalMs),
      )
    }

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

    if (this.requestTimeIntervalMs) {
      this.canDoRequest = false
      setTimeout(() => {
        this.canDoRequest = true
      }, Number(this.requestTimeIntervalMs))
    }

    return response
  }

  /**
   * Retrieve the feature properties based on an OSM object ID.
   *
   * @param {string} osmType The type of the OSM object (e.g. 'R' for relation).
   * @param {string} osmId The ID of the OSM object.
   * @param {object} parameters Additional parameters to pass to the API.
   * @returns {Promise<Array<object>>} The raw array of matching result objects
   *   found at `result.basePath` in the parsed response.
   * @throws {string} `'Cannot perform a request for now.'` if called again before
   *   `requestTimeIntervalMs` has elapsed since the previous request, or
   *   `'No result found'` if the API returned zero results.
   */
  async detailedSearch(
    osmType,
    osmId,
    parameters = {
      format: 'json',
    },
  ) {
    if (!!this.requestTimeIntervalMs && !this.canDoRequest) {
      throw 'Cannot perform a request for now.'
    }

    // search parameters
    const searchParameters = new URLSearchParams({
      ...this.defaultParameters,
      ...parameters,
      osmtype: osmType,
      osmid: osmId,
    })

    // Build the URL according to parameter description (in config file)
    let url = `${this.geocodingUrl}details?${searchParameters}`

    // Make the request
    const response = await handleFetchJson(url, this.requestTimeIntervalMs, {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:153.0) Gecko/20100101 Firefox/153.0',
    })

    if (this.requestTimeIntervalMs) {
      this.canDoRequest = false
      setTimeout(() => {
        this.canDoRequest = true
      }, Number(this.requestTimeIntervalMs))
    }

    return response
  }
}
