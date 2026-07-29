import { tsvFormat } from 'd3'
import { loadEnvFile } from 'node:process'
import { simpleGristQuery } from './utilities/grist_api.js'

const query = `
select
  gristHelper_Display as partner,
  gristHelper_Display2 as project,
  PARTENAIRE as partner_id,
  PROJET as project_id,
  'SOCIOECONOMIQUE' as type
from Partenaire_socioeco_par_projet
union
select
  gristHelper_Display as partner,
  gristHelper_Display2 as project,
  UNITE as partner_id,
  PROJET as project_id,
  'LABORATOIRE' as type
from Laboratoire_par_projet
union
select
  gristHelper_Display as partner,
  gristHelper_Display2 as project,
  INSTITUTION as partner_id,
  PROJET as project_id,
  'INSTITUTION' as type
from Institution_par_projet
`

simpleGristQuery(query, 'oUjutoUDF9xP29sxnd6SNX')
  .then((response) => {
    const result = response.records.map((record) => record.fields)
    process.stdout.write(tsvFormat(result))
  })
  .catch((error) => {
    console.error('Error fetching data from Grist API:', error)
  })
