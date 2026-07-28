import { tsvFormat } from 'd3'
import { loadEnvFile } from 'node:process'
import { handleFetchJson } from './utilities/data_utilities.js'

loadEnvFile()

// const query = `select
//   ID_PARTENAIRE as id,
//   nom_complet as label,
//   code_postal as postal_code,
//   'Socio-économique' as type
// from Partenaires_socioeconomiques`

const query = `select
  ID_PARTENAIRE as id,
  nom_complet as label,
  code_postal as postal_code,
  'Socio-économique' as type
from Partenaires_socioeconomiques
union
select
  ID_UNITE as id,
  if(sigle is null or sigle = '', libelle, concat(libelle, ' (', sigle, ')')) as label,
  code_postal as postal_code,
  'Laboratoire' as type
from Laboratoires
union
select
  ID_INSTITUTION as id,
  nom_complet as label,
  code_postal as postal_code,
  'Institution' as type
from Institutions
`

const doc_id = 'oUjutoUDF9xP29sxnd6SNX'

const token = process.env.GRIST_TOKEN

const url = `https://grist.numerique.gouv.fr/api/docs/${doc_id}/sql?q=${encodeURIComponent(query)}`

const response = await handleFetchJson(url, 3000, {
  accept: 'application/json',
  Authorization: `Bearer ${token}`,
})

const result = response.records.map((record) => record.fields)

// process.stdout.write(JSON.stringify(response, null, 2))
process.stdout.write(tsvFormat(result))
