import { DuckDBInstance } from '@duckdb/node-api'
import { tsvFormat } from 'd3-dsv'

const cnu_query = `
with researcher_cnus as (
  select
    unnest(
      [
        "email-0"::VARCHAR,
        "email-1"::VARCHAR,
        "email-2"::VARCHAR,
        "email-3"::VARCHAR,
        "email-4"::VARCHAR,
        "email-5"::VARCHAR,
        "email-6"::VARCHAR,
        "email-7"::VARCHAR,
        "email-8"::VARCHAR,
        "email-9"::VARCHAR,
        "Email2.0"::VARCHAR,
        "Email2.1"::VARCHAR,
        "Email2.2"::VARCHAR,
        "Email2.3"::VARCHAR,
        "Email2.4"::VARCHAR,
        "Email2.5"::VARCHAR,
        "Email2.6"::VARCHAR,
        "Email2.7"::VARCHAR,
        "Email2.8"::VARCHAR,
        "Email2.9"::VARCHAR,
        "Email2.10"::VARCHAR,
        "Email2.11"::VARCHAR,
        "Email2.12"::VARCHAR,
        "Email2.13"::VARCHAR,
        "Email2.14"::VARCHAR,
        uuid()::VARCHAR,
        uuid()::VARCHAR,
        uuid()::VARCHAR,
        uuid()::VARCHAR,
      ]
    ) as id,
    unnest(
      apply(
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
        ],
        x -> filter(x, y -> y::VARCHAR != '')
      )
    ) as cnus,
  from 'src/data/private/AAP2_template_export.tsv'
)

select
  id,
  unnest(apply(cnus, x -> if(x::INT1 < 10, '0' || x::INT1, x)))::VARCHAR as cnu,
from researcher_cnus
`

const instance = await DuckDBInstance.create()
const connection = await instance.connect()

const reader = await connection.runAndReadAll(cnu_query)
const rows = reader.getRowObjectsJson()

process.stdout.write(tsvFormat(rows))

connection.closeSync()
