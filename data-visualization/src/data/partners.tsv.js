import { tsvFormat } from 'd3'
import { simpleGristQuery } from './utilities/grist_api.js'

const query = `
select
  id,
  if(sigle is null or sigle = '', libelle, concat(libelle, ' (', sigle, ')')) as label,
  code_postal as postal_code,
  'LABORATOIRE' as type
from Laboratoires
union
select
  id,
  nom_complet as label,
  code_postal as postal_code,
  'INSTITUTION' as type
from Institutions
union
select
  id,
  nom_complet as label,
  code_postal as postal_code,
  'SOCIOECONOMIQUE' as type
from Partenaires_socioeconomiques
`

simpleGristQuery(query, 'oUjutoUDF9xP29sxnd6SNX')
  .then((response) => {
    const result = response.records.map((record) => record.fields)
    process.stdout.write(tsvFormat(result))
  })
  .catch((error) => {
    console.error('Error fetching data from Grist API:', error)
  })
