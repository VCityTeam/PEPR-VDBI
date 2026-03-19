import { DuckDBInstance } from '@duckdb/node-api'
import { tsvFormat } from 'd3-dsv'

const cnu_query = `
with project_cnus as (
  select
    "Titre court" as acronyme,
    filter(
      flatten(
        [
          string_split_regex("cnu-0"::VARCHAR, '[^\\d*]'),
          string_split_regex("cnu-1"::VARCHAR, '[^\\d*]'),
          string_split_regex("cnu-2"::VARCHAR, '[^\\d*]'),
          string_split_regex("cnu-3"::VARCHAR, '[^\\d*]'),
          string_split_regex("cnu-4"::VARCHAR, '[^\\d*]'),
          string_split_regex("cnu-5"::VARCHAR, '[^\\d*]'),
          string_split_regex("cnu-6"::VARCHAR, '[^\\d*]'),
          string_split_regex("cnu-7"::VARCHAR, '[^\\d*]'),
          string_split_regex("cnu-8"::VARCHAR, '[^\\d*]'),
          string_split_regex("cnu-9"::VARCHAR, '[^\\d*]'),
          string_split_regex("CNU2.0"::VARCHAR, '[^\\d*]'),
          string_split_regex("CNU2.1"::VARCHAR, '[^\\d*]'),
          string_split_regex("CNU2.2"::VARCHAR, '[^\\d*]'),
          string_split_regex("CNU2.3"::VARCHAR, '[^\\d*]'),
          string_split_regex("CNU2.4"::VARCHAR, '[^\\d*]'),
          string_split_regex("CNU2.5"::VARCHAR, '[^\\d*]'),
          string_split_regex("CNU2.6"::VARCHAR, '[^\\d*]'),
          string_split_regex("CNU2.7"::VARCHAR, '[^\\d*]'),
          string_split_regex("CNU2.8"::VARCHAR, '[^\\d*]'),
          string_split_regex("CNU2.9"::VARCHAR, '[^\\d*]'),
          string_split_regex("CNU2.10"::VARCHAR, '[^\\d*]'),
          string_split_regex("CNU2.11"::VARCHAR, '[^\\d*]'),
          string_split_regex("CNU2.12"::VARCHAR, '[^\\d*]'),
          string_split_regex("CNU2.13"::VARCHAR, '[^\\d*]'),
          string_split_regex("CNU2.14"::VARCHAR, '[^\\d*]'),
          string_split_regex("cnu-6-0"::VARCHAR, '[^\\d*]'),
          string_split_regex("cnu-6-1"::VARCHAR, '[^\\d*]'),
          string_split_regex("cnu-6-2"::VARCHAR, '[^\\d*]'),
          string_split_regex("cnu-6-3"::VARCHAR, '[^\\d*]'),
        ]
      ),
      x -> x is not null and if(x = '', false, x::INT1 > 0)
    ) as cnus,
  from 'src/data/private/AAP2_submission_metadata.tsv'
  left join 'src/data/private/AAP2_template_export.tsv'
  on AAP2_template_export.filename ^@ AAP2_submission_metadata.DOCID::VARCHAR
)

select
  acronyme,
  unnest(apply(cnus, x -> if(x::INT1 < 10, '0' || x::INT1, x)))::VARCHAR as cnu,
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
