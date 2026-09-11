// import { tsvFormat } from 'd3'
import { simpleGristQuery } from './utilities/grist_api.js'

const query_1 = `
select
  id,
  NOM_COMPLET as fullname,
  EMAILS as email,
  GENRE as gender,
  MOT_CLES as keywords,
  PROJETS as projects,
  ANNEES_LANCEMENT_PROJET as aaps,
  CNUS as cnus
from Vue_Membres_Tableau
where ACTIVE`

const data = []

await simpleGristQuery(query_1, 'oUjutoUDF9xP29sxnd6SNX')
  .then((response) => {
    const result = response.records.map((record) => record.fields)
    data.push(...result)
  })
  .catch((error) => {
    console.error('Error fetching data from Grist API:', error)
  })

const query_2 = `select * from CNUs`

const cnu_data = []

await simpleGristQuery(query_2, 'oUjutoUDF9xP29sxnd6SNX')
  .then((response) => {
    const result = response.records.map((record) => record.fields)
    cnu_data.push(...result)
  })
  .catch((error) => {
    console.error('Error fetching data from Grist API:', error)
  })

for (const d of data) {
  d.cnus = d.cnus
    ? JSON.parse(d.cnus).map((cnu) => cnu_data.find((c) => c.id == cnu))
    : [null]
  d.keywords = JSON.parse(d.keywords)
  d.projects = JSON.parse(d.projects)
  d.aaps = JSON.parse(d.aaps)
  d.email = JSON.parse(d.email)
}

// process.stdout.write(tsvFormat(data))
process.stdout.write(JSON.stringify(data))
