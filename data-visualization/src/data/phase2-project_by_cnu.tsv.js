import { DuckDBInstance } from '@duckdb/node-api'
import { tsvFormat } from 'd3-dsv'
import { toLowerPreservingAcronyms } from './utilities/data_utilities.js'

const cnu_query = `
with project_cnus as (
  select
    "Titre court" as acronyme,
    filter(
      [
        trim("cnu-0"::VARCHAR),
        trim("cnu-1"::VARCHAR),
        trim("cnu-2"::VARCHAR),
        trim("cnu-3"::VARCHAR),
        trim("cnu-4"::VARCHAR),
        trim("cnu-5"::VARCHAR),
        trim("cnu-6"::VARCHAR),
        trim("cnu-7"::VARCHAR),
        trim("cnu-8"::VARCHAR),
        trim("cnu-9"::VARCHAR),
        trim("CNU2.0"::VARCHAR),
        trim("CNU2.1"::VARCHAR),
        trim("CNU2.2"::VARCHAR),
        trim("CNU2.3"::VARCHAR),
        trim("CNU2.4"::VARCHAR),
        trim("CNU2.5"::VARCHAR),
        trim("CNU2.6"::VARCHAR),
        trim("CNU2.7"::VARCHAR),
        trim("CNU2.8"::VARCHAR),
        trim("CNU2.9"::VARCHAR),
        trim("CNU2.10"::VARCHAR),
        trim("CNU2.11"::VARCHAR),
        trim("CNU2.12"::VARCHAR),
        trim("CNU2.13"::VARCHAR),
        trim("CNU2.14"::VARCHAR),
        trim("cnu-6-0"::VARCHAR),
        trim("cnu-6-1"::VARCHAR),
        trim("cnu-6-2"::VARCHAR),
        trim("cnu-6-3"::VARCHAR),
      ],
      x -> x is not null
    ) as cnus,
  from 'src/data/private/AAP2_submission_metadata.tsv'
  left join 'src/data/private/AAP2_template_export.tsv'
  on AAP2_submission_metadata.DOCID =
    AAP2_template_export.DOCID
)

select
  acronyme,
  unnest(cnus) as cnu,
from project_cnus
`

const instance = await DuckDBInstance.create()
const connection = await instance.connect()

const reader = await connection.runAndReadAll(cnu_query)
const rows = reader.getRowObjectsJson()

// for (let index = 0; index < rows.length; index++) {
//   const row = rows[index]
//   row.cnu = toLowerPreservingAcronyms(row.cnu)
// }

process.stdout.write(tsvFormat(rows))

connection.closeSync()
