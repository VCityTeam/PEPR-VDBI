import { getAttributeByPath, request } from './utilities.js';

export class GeocodingService {
  /**
   * Instantiates the geocoding service.
   * Adapted from https://www.npmjs.com/package/@ud-viz/widget_geocoding
   * Uses https://www.openstreetmap.org/ by default
   *
   * @param {object} configGeocoding Geocoding config
   */
  constructor({
    url = 'https://nominatim.openstreetmap.org/search',
    requestTimeIntervalMs = '3000',
    result = {
      format: 'json',
      basePath: '',
      lng: 'lon',
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
    this.extent = extent;
    this.geocodingUrl = url;
    this.parameters = parameters;
    this.basePath = result.basePath;
    this.latPath = result.lat;
    this.lngPath = result.lng;
    this.requestTimeIntervalMs = requestTimeIntervalMs;
    this.canDoRequest = true;
  }

  /**
   * Retrieves the coordinates based on the search string parameter.
   *
   * @param {string} searchString Either an address or the name of a place.
   */
  async getCoordinates(searchString) {
    if (!!this.requestTimeIntervalMs && !this.canDoRequest) {
      throw 'Cannot perform a request for now.';
    }

    // URL parameters
    const queryString = encodeURIComponent(searchString);

    // Build the URL according to parameter description (in config file)
    let url = this.geocodingUrl + '?';
    for (const [paramName, param] of Object.entries(this.parameters)) {
      if (param.fill === 'value') {
        url += `${paramName}=${param.value}`;
      } else if (param.fill === 'query') {
        url += `${paramName}=${queryString}`;
      } else if (param.fill === 'extent') {
        url +=
          paramName +
          '=' +
          param.format
            .replace('SOUTH', this.extent.south)
            .replace('WEST', this.extent.west)
            .replace('NORTH', this.extent.north)
            .replace('EAST', this.extent.east);
      }
      url += '&';
    }

    // Make the request
    const req = await request('GET', url);
    const response = JSON.parse(req.response);
    const results = (this.basePath ? response[this.basePath] : response).map(
      (res) => {
        return {
          lat: Number(getAttributeByPath(res, this.latPath)),
          lng: Number(getAttributeByPath(res, this.lngPath)),
        };
      }
    );

    if (this.requestTimeIntervalMs) {
      this.canDoRequest = false;
      setTimeout(() => {
        this.canDoRequest = true;
      }, Number(this.requestTimeIntervalMs));
    }

    if (results.length > 0) {
      return results;
    }
    throw 'No result found';
  }
}
