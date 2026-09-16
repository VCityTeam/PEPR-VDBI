import { simpleGristQuery } from './utilities/grist_api.js'

const project_data = []

const query_1 = `
select
  id,
  ID_PROJET,
  TYPE,
  NOM_FR,
  NOM_EN,
  FINANCE,
  NOTE,
  cast(DEFI_PRINCIPALE as text) as DEFI_PRINCIPALE,
  -- DEFI_PRINCIPALE,
  DEFI_1,
  DEFI_2,
  DEFI_3,
  DEFI_4,
  DEFI_5,
  DEFI_6,
  BUDGET,
  COMMENTAIRE,
  TITRE_COURT,
  CODE_ANR,
  ANNEE_LANCEMENT
from Projets
order by manualSort
`

await simpleGristQuery(query_1, 'oUjutoUDF9xP29sxnd6SNX')
  .then((response) => {
    const result = response.records.map((record) => record.fields)
    project_data.push(...result)
  })
  .catch((error) => {
    console.error('Error fetching data from Grist API:', error)
  })

const keyword_data = []

const query_2 = `
select
  id,
  MOT as keyword,
  PROJET as project_id,
  gristHelper_Display2 as project
  -- TYPE,
  -- COMMENTAIRE
from Mot_cles_par_projet`

await simpleGristQuery(query_2, 'oUjutoUDF9xP29sxnd6SNX')
  .then((response) => {
    const result = response.records.map((record) => record.fields)
    keyword_data.push(...result)
  })
  .catch((error) => {
    console.error('Error fetching data from Grist API:', error)
  })

// for some reason grist choice types are returned as text buffers
// casting to a string returns the desired value prefixed by this:
const magic_prefix = 'u\u0001\u0000\u0000\u0000'

// reparse aggregated lists to JSON
for (const d of project_data) {
  d.keywords = keyword_data
    .filter((kw) => kw.project_id == d.id)
    .map((d) => d.keyword)

  d.DEFI_PRINCIPALE = d.DEFI_PRINCIPALE.replace(magic_prefix, '')

  delete d.manualSort
}

process.stdout.write(JSON.stringify(project_data))
