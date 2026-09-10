import { tsvFormat } from 'd3'
import { simpleGristQuery } from './utilities/grist_api.js'

const query = `
select
  id,
  NOM_COMPLET as fullname,
  EMAILS as email,
  GENRE as gender,
  MOT_CLES as keywords,
  PROJETS as projects,
  ANNEES_LANCEMENT_PROJET as aaps,
  CATEGORIE_CNU as cnu_type,
  CNUS as cnus
from Vue_Membres_Tableau
where ACTIVE`

const data = []

await simpleGristQuery(query, 'oUjutoUDF9xP29sxnd6SNX')
  .then((response) => {
    const result = response.records.map((record) => record.fields)
    data.push(...result)
  })
  .catch((error) => {
    console.error('Error fetching data from Grist API:', error)
  })

process.stdout.write(tsvFormat(data))
