// code modified from https://observablehq.com/framework/getting-started

async function fetchText(url) {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`fetch failed: ${response.status}`)
  return await response.text()
}

const response = await fetchText(
  "https://raw.githubusercontent.com/VCityTeam/PEPR-VDBI/refs/heads/master/data-analysis/test-data/output/js_roundtable/urbhealth_wps_en_cleaned_INTERSECTION_SUM_whaou_wps_en_cleaned_INTERSECTION_SUM_resilience_wps_en_cleaned.csv"
)

process.stdout.write(response)
