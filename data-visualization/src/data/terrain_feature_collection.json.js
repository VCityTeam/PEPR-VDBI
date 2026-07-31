import { loadEnvFile } from 'node:process'
import { simpleGristQuery } from './utilities/grist_api.js'

const query = `
select
  Lieux.id as id,
  OSM_ID,
  OSM_TYPE,
  ECHELLE,
  GEOMETRY,
  json_array(
    json_object(
      'id', Terrains.PROJET,
      'label', gristHelper_Display
    )
  ) as projects 
from Lieux
join Terrains
  on Lieux.id = Terrains.TERRAIN
where ECHELLE != 'pays'
group by
  Lieux.id,
  OSM_ID,
  OSM_TYPE,
 ECHELLE,
 GEOMETRY
`

simpleGristQuery(query, 'oUjutoUDF9xP29sxnd6SNX')
  .then((response) => {
    const features = response.records.map((record) => ({
      type: 'Feature',
      properties: {
        id: record.fields.id,
        osm_id: record.fields.OSM_ID,
        osm_type: record.fields.OSM_TYPE,
        scale: record.fields.ECHELLE,
        projects: JSON.parse(record.fields.projects),
      },
      geometry: JSON.parse(record.fields.GEOMETRY),
    }))

    const feature_collection = {
      type: 'FeatureCollection',
      features: features,
    }

    process.stdout.write(JSON.stringify(feature_collection))
  })
  .catch((error) => {
    console.error('Error fetching data from Grist API:', error)
  })
