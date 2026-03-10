import { DuckDBInstance } from '@duckdb/node-api'
import { tsvFormat } from 'd3-dsv'

const all_unites_query = `
  select
    id,
    list_distinct(list(label)) as labels,
    count(*) as count,
  from (
    select distinct
      unnest(
        apply([
          "rnsr-0"::VARCHAR,
          "rnsr-1"::VARCHAR,
          "rnsr-2"::VARCHAR,
          "rnsr-3"::VARCHAR,
          "rnsr-4"::VARCHAR,
          "rnsr-5"::VARCHAR,
          "rnsr-6"::VARCHAR,
          "rnsr-7"::VARCHAR,
          "rnsr-8"::VARCHAR,
          "rnsr-9"::VARCHAR,
          "RNSR2.0"::VARCHAR,
          "RNSR2.1"::VARCHAR,
          "RNSR2.2"::VARCHAR,
          "RNSR2.3"::VARCHAR,
          "RNSR2.4"::VARCHAR,
          "RNSR2.5"::VARCHAR,
          "RNSR2.6"::VARCHAR,
          "RNSR2.7"::VARCHAR,
          "RNSR2.8"::VARCHAR,
          "RNSR2.9"::VARCHAR,
          "RNSR2.10"::VARCHAR,
          "RNSR2.11"::VARCHAR,
          "RNSR2.12"::VARCHAR,
          "RNSR2.13"::VARCHAR,
          "RNSR2.14"::VARCHAR,
        ],
        x -> regexp_replace(x, '\\W', ''))
      ) as id,
      unnest(
        apply(
          [
            "unite-0"::VARCHAR,
            "unite-1"::VARCHAR,
            "unite-2"::VARCHAR,
            "unite-3"::VARCHAR,
            "unite-4"::VARCHAR,
            "unite-5"::VARCHAR,
            "unite-6"::VARCHAR,
            "unite-7"::VARCHAR,
            "unite-8"::VARCHAR,
            "unite-9"::VARCHAR,
            "Unité2.0"::VARCHAR,
            "Unité2.1"::VARCHAR,
            "Unité2.2"::VARCHAR,
            "Unité2.3"::VARCHAR,
            "Unité2.4"::VARCHAR,
            "Unité2.5"::VARCHAR,
            "Unité2.6"::VARCHAR,
            "Unité2.7"::VARCHAR,
            "Unité2.8"::VARCHAR,
            "Unité2.9"::VARCHAR,
            "Unité2.10"::VARCHAR,
            "Unité2.11"::VARCHAR,
            "Unité2.12"::VARCHAR,
            "Unité2.13"::VARCHAR,
            "Unité2.14"::VARCHAR,
          ],
          x -> trim(x))
      ) as label,
    from 'src/data/private/AAP2_template_export.tsv'
  ) where id is not null and label is not null
  group by id
`

const instance = await DuckDBInstance.create()
const connection = await instance.connect()

const reader = await connection.runAndReadAll(all_unites_query)
const rows = reader.getRowObjectsJson()

process.stdout.write(tsvFormat(rows))

connection.closeSync()
