// code modified from https://observablehq.com/framework/getting-started

/**
 * Fetch a URL and return its parsed JSON response
 *
 * @param {string} url - the URL to fetch
 * @returns {Promise<Object>} a promise resolving to the parsed JSON response
 */
async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`fetch failed: ${response.status}`);
  return await response.json();
}

const response = await fetchJson("https://france-geojson.gregoiredavid.fr/repo/departements.geojson");

process.stdout.write(JSON.stringify(response));
