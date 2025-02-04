// code modified from https://observablehq.com/framework/getting-started

const order_by = 'numero_national_de_structure';
const use_labels = true;
const format = 'json';

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`fetch failed: ${response.status}`);
  return await response.json();
}

const esr_response = await fetchJson(`https://data.enseignementsup-recherche.gouv.fr/api/explore/v2.1/catalog/datasets/fr-esr-structures-recherche-publiques-actives/exports/${format}?order_by=${order_by}&use_labels=${use_labels}`);

process.stdout.write(JSON.stringify(esr_response));