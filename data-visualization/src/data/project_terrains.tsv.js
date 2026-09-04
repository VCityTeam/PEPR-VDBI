import { tsvFormat } from 'd3'
import { simpleGristQuery } from './utilities/grist_api.js'
import { GeocodingService } from './utilities/geocoding.js'

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

for (let i = 0; i < data.length; i++) {
  const d = data[i]
  if (d.admin_level > 3 || d.address_rank > 6) {
    await geocodingService
      .detailedSearch(d.osm_type[0].toUpperCase(), d.osm_id)
      .then((response) => {
        const code = response.country_code
        if (country_cache.has(code)) {
          d.country_code = country_cache.get(code)
        } else {
          d.country_code = code
          country_cache.set(code, code)
        }
      })
      .catch((error) => {
        console.error('Error fetching data from Nominatim API:', error)
      })
  }
}

process.stdout.write(tsvFormat(data))
