import { tsvFormat } from 'd3'
import { simpleGristQuery } from './utilities/grist_api.js'
import { GeocodingService, getOsmId } from './utilities/geocoding.js'

const query = `
select
  Terrains.PROJET as project_id,
  Projets.TYPE as project_type,
  Terrains.TERRAIN as terrain_id,
  Terrains.gristHelper_Display as project,
  Terrains.gristHelper_Display3 as terrain,
  Terrains.ECHELLE as scale,
  Lieux.OSM_ID as osm_id,
  Lieux.OSM_TYPE as osm_type,
  Lieux.LATITUDE as latitude,
  Lieux.LONGITUDE as longitude,
  Lieux.NIVEAU_ADMIN as admin_level,
  Lieux.RANG_ADDRESS as address_rank,
  Terrains.COMMENTAIRE as comment
from Terrains
join Lieux on Terrains.TERRAIN = Lieux.id
join Projets on Terrains.PROJET = Projets.id
`

const data = []

await simpleGristQuery(query, 'oUjutoUDF9xP29sxnd6SNX')
  .then((response) => {
    const result = response.records.map((record) => record.fields)
    data.push(...result)
  })
  .catch((error) => {
    console.error('Error fetching data from Grist API:', error)
  })

// also add country names to data
const geocodingService = new GeocodingService()
// since our requests are throttled, use a cache to avoid unecessary queries
const country_cache = new Map()

const osm_ids = [
  ...new Set(
    data
      .filter((d) => d.admin_level > 2 || d.address_rank > 5)
      .map((d) => getOsmId(d)),
  ),
]

// Nominatim API allows up to 50 osm_ids per request, so batch them
for (let i = 0; i < osm_ids.length; i += 50) {
  const batch = osm_ids.slice(i, i + 50)

  await geocodingService
    .detailedSearch(batch.join(','))
    .then((response) => {
      response.forEach((d) => {
        const code = d.address.country_code
        if (!country_cache.has(getOsmId(d))) {
          country_cache.set(getOsmId(d), code)
        }
      })
    })
    .catch((error) => {
      console.error('Error fetching data from Nominatim API:', error)
    })
}

for (const d of data) {
  const osm_id = getOsmId(d)
  d.country_code = country_cache.get(osm_id)
}

process.stdout.write(tsvFormat(data))
