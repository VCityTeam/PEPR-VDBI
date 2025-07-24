// code modified from https://observablehq.com/framework/getting-started

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`fetch failed: ${response.status}`);
  return await response.json();
}

const response = await fetchJson("https://france-geojson.gregoiredavid.fr/repo/departements.geojson");

process.stdout.write(JSON.stringify(response));
