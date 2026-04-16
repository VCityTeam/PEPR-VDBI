import { DuckDBInstance } from '@duckdb/node-api'
import { tsvFormat } from 'd3-dsv'
import { toLowerPreservingAcronyms } from './utilities/data_utilities.js'

const query = `
select distinct
  project_id,
  unnest(keywords) as keyword,
from (
  select
    "TITRE_COURT" as project_id,
    list_transform(
      string_split_regex(MOTCLE, '[;,]'), x -> trim(regexp_replace(x, '[\n\r]', ' ', 'g'))
    ) || list_transform(
      string_split_regex(keywords, '[;,]'), x -> trim(regexp_replace(x, '[\n\r]', ' ', 'g'))
    )
    as keywords,
  from 'src/data/private/AAP2_submission_metadata.tsv'
  left join 'src/data/private/AAP2_template_export.tsv'
  on AAP2_template_export.filename ^@ AAP2_submission_metadata.DOCID::VARCHAR
)
`

const instance = await DuckDBInstance.create()
const connection = await instance.connect()

const reader = await connection.runAndReadAll(query)
const rows = reader.getRowObjectsJson()

for (let index = 0; index < rows.length; index++) {
  const row = rows[index]
  row.keyword = toLowerPreservingAcronyms(row.keyword)
}

process.stdout.write(tsvFormat(rows))

connection.closeSync()
