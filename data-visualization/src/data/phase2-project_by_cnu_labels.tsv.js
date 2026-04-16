import { DuckDBInstance } from '@duckdb/node-api'
import { tsvFormat } from 'd3-dsv'

const query = `
select
  project_id,
  filter(cnu_labels, x -> x is not null) as cnu_labels
from (
  select
    "TITRE_COURT" as project_id,
    [
      "cnu-0"::VARCHAR,
      "cnu-1"::VARCHAR,
      "cnu-2"::VARCHAR,
      "cnu-3"::VARCHAR,
      "cnu-4"::VARCHAR,
      "cnu-5"::VARCHAR,
      "cnu-6"::VARCHAR,
      "cnu-7"::VARCHAR,
      "cnu-8"::VARCHAR,
      "cnu-9"::VARCHAR,
      "CNU2.0"::VARCHAR,
      "CNU2.1"::VARCHAR,
      "CNU2.2"::VARCHAR,
      "CNU2.3"::VARCHAR,
      "CNU2.4"::VARCHAR,
      "CNU2.5"::VARCHAR,
      "CNU2.6"::VARCHAR,
      "CNU2.7"::VARCHAR,
      "CNU2.8"::VARCHAR,
      "CNU2.9"::VARCHAR,
      "CNU2.10"::VARCHAR,
      "CNU2.11"::VARCHAR,
      "CNU2.12"::VARCHAR,
      "CNU2.13"::VARCHAR,
      "CNU2.14"::VARCHAR,
      "cnu-6-0"::VARCHAR,
      "cnu-6-1"::VARCHAR,
      "cnu-6-2"::VARCHAR,
      "cnu-6-3"::VARCHAR,
    ] as cnu_labels,
  from 'src/data/private/AAP2_submission_metadata.tsv'
  left join 'src/data/private/AAP2_template_export.tsv'
  on AAP2_template_export.filename ^@ AAP2_submission_metadata.DOCID::VARCHAR
)
`

const instance = await DuckDBInstance.create()
const connection = await instance.connect()

const reader = await connection.runAndReadAll(query)
const rows = reader.getRowObjectsJson()

// for (let index = 0; index < rows.length; index++) {
//   const row = rows[index]
//   row.cnu = toLowerPreservingAcronyms(row.cnu)
// }

process.stdout.write(tsvFormat(rows))

connection.closeSync()
