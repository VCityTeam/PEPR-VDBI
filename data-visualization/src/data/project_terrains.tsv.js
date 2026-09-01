import { tsvFormat } from 'd3'
import { loadEnvFile } from 'node:process'
import { simpleGristQuery } from './utilities/grist_api.js'

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

simpleGristQuery(query, 'oUjutoUDF9xP29sxnd6SNX')
  .then((response) => {
    const result = response.records.map((record) => record.fields)
    process.stdout.write(tsvFormat(result))
  })
  .catch((error) => {
    console.error('Error fetching data from Grist API:', error)
  })
