import { loadEnvFile } from 'node:process'
import { simpleGristQuery } from './utilities/grist_api.js'

const query = `select id, OSM_ID, OSM_TYPE, GEOMETRY from Lieux`

simpleGristQuery(query, 'oUjutoUDF9xP29sxnd6SNX')
  .then((response) => {
    const features = response.records.map((record) => ({
      type: 'Feature',
      properties: {
        id: record.fields.id,
        osm_id: record.fields.OSM_ID,
        osm_type: record.fields.OSM_TYPE,
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
