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
    url = 'https://nominatim.openstreetmap.org/search',
    requestTimeIntervalMs = '3000',
    result = {
      format: 'json',
      basePath: '',
      lon: 'lon',
      lat: 'lat',
    },
    parameters = {
      q: {
        fill: 'query',
      },
      format: {
        fill: 'value',
        value: 'json',
      },
    },
    extent = {
      name: 'EPSG:3946',
      west: 1837860,
      east: 1851647,
      south: 5169347,
      north: 5180575,
    },
  } = {}) {
    this.extent = extent
    this.geocodingUrl = url
    this.parameters = parameters
    this.basePath = result.basePath
    this.latPath = result.lat
    this.lonPath = result.lon
    this.requestTimeIntervalMs = requestTimeIntervalMs
    this.canDoRequest = true
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
  async simpleSearch(searchString) {
    if (!!this.requestTimeIntervalMs && !this.canDoRequest) {
      throw 'Cannot perform a request for now.'
    }

    // URL parameters
    const queryString = encodeURIComponent(searchString)

    // Build the URL according to parameter description (in config file)
    let url = this.geocodingUrl + `?q=${queryString}&format=jsonv2`
    // for (const [paramName, param] of Object.entries(this.parameters)) {
    //   if (param.fill === 'value') {
    //     url += `${paramName}=${param.value}`
    //   } else if (param.fill === 'query') {
    //     url += `${paramName}=${queryString}`
    //   } else if (param.fill === 'extent') {
    //     url +=
    //       paramName +
    //       '=' +
    //       param.format
    //         .replace('SOUTH', this.extent.south)
    //         .replace('WEST', this.extent.west)
    //         .replace('NORTH', this.extent.north)
    //         .replace('EAST', this.extent.east)
    //   }
    //   url += '&'
    // }

    // Make the request
    const response = await handleFetchJson(url, 0, {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:153.0) Gecko/20100101 Firefox/153.0',
    })
    const results = this.basePath ? response[this.basePath] : response

    if (this.requestTimeIntervalMs) {
      this.canDoRequest = false
      setTimeout(() => {
        this.canDoRequest = true
      }, Number(this.requestTimeIntervalMs))
    }

    if (results.length > 0) {
      return results
    }
    throw 'No result found'
  }

  /**
   * Retrieves the coordinates based on the search string parameter.
   *
   * @param {string} searchString Either an address or the name of a place.
   *   URL-encoded internally before being sent as the `query`-filled request
   *   parameter.
   * @returns {Promise<Array<{lat: number, lon: number}>>} All matching results,
   *   as `{lat, lon}` pairs extracted per the `result.lat`/`result.lon` paths.
   * @throws {string} `'Cannot perform a request for now.'` if called again before
   *   `requestTimeIntervalMs` has elapsed since the previous request, or
   *   `'No result found'` if the API returned zero results.
   */
  async getCoordinates(searchString) {
    const results = await this.simpleSearch(searchString).map((res) => {
      return {
        lat: Number(res[this.latPath]),
        lon: Number(res[this.lonPath]),
      }
    })
  }

  /**
   * Retrieves the OSM code based on the search string parameter.
   *
   * @param {string} searchString Either an address or the name of a place.
   *   URL-encoded internally before being sent as the `query`-filled request
   *   parameter.
   * @returns {Promise<Array<{lat: number, lon: number}>>} All matching results,
   *   as `{lat, lon}` pairs extracted per the `result.lat`/`result.lon` paths.
   * @throws {string} `'Cannot perform a request for now.'` if called again before
   *   `requestTimeIntervalMs` has elapsed since the previous request, or
   *   `'No result found'` if the API returned zero results.
   */
  async getOsmCode(searchString) {
    const results = await this.simpleSearch(searchString).map((res) => {
      return {
        lat: Number(res[this.latPath]),
        lon: Number(res[this.lonPath]),
      }
    })
  }
}
