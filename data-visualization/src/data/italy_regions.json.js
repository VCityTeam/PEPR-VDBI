// code modified from https://observablehq.com/framework/getting-started

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`fetch failed: ${response.status}`);
  return await response.json();
}

const response = await fetchJson("https://simplemaps.com/static/svg/country/it/admin1/it.json");

process.stdout.write(JSON.stringify(response));
