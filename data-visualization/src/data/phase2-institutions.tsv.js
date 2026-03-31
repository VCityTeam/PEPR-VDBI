import { DuckDBInstance } from '@duckdb/node-api'
import { tsvFormat } from 'd3-dsv'
import { queryAndFormatRE } from './utilities/siret_api.js'

const all_institutions_query = `
  select
    id,
    list_distinct(list(label)) as labels,
    count(*) as count,
  from (
    select distinct
      unnest(
        apply(
          [
            "siret-0"::VARCHAR,
            "siret-1"::VARCHAR,
            "siret-2"::VARCHAR,
            "siret-3"::VARCHAR,
            "siret-4"::VARCHAR,
            "siret-5"::VARCHAR,
            "siret-6"::VARCHAR,
            "siret-7"::VARCHAR,
            "siret-8"::VARCHAR,
            "siret-9"::VARCHAR,
            "SIRET2.0"::VARCHAR,
            "SIRET2.1"::VARCHAR,
            "SIRET2.2"::VARCHAR,
            "SIRET2.3"::VARCHAR,
            "SIRET2.4"::VARCHAR,
            "SIRET2.5"::VARCHAR,
            "SIRET2.6"::VARCHAR,
            "SIRET2.7"::VARCHAR,
            "SIRET2.8"::VARCHAR,
            "SIRET2.9"::VARCHAR,
            "SIRET2.10"::VARCHAR,
            "SIRET2.11"::VARCHAR,
            "SIRET2.12"::VARCHAR,
            "SIRET2.13"::VARCHAR,
            "SIRET2.14"::VARCHAR,
          ],
          x -> regexp_replace(x, '[\s ]', '', 'g'))
      ) as id,
      unnest(
        apply(
          [
            "institution-0"::VARCHAR,
            "institution-1"::VARCHAR,
            "institution-2"::VARCHAR,
            "institution-3"::VARCHAR,
            "institution-4"::VARCHAR,
            "institution-5"::VARCHAR,
            "institution-6"::VARCHAR,
            "institution-7"::VARCHAR,
            "institution-8"::VARCHAR,
            "institution-9"::VARCHAR,
            "Institution2.0"::VARCHAR,
            "Institution2.1"::VARCHAR,
            "Institution2.2"::VARCHAR,
            "Institution2.3"::VARCHAR,
            "Institution2.4"::VARCHAR,
            "Institution2.5"::VARCHAR,
            "Institution2.6"::VARCHAR,
            "Institution2.7"::VARCHAR,
            "Institution2.8"::VARCHAR,
            "Institution2.9"::VARCHAR,
            "Institution2.10"::VARCHAR,
            "Institution2.11"::VARCHAR,
            "Institution2.12"::VARCHAR,
            "Institution2.13"::VARCHAR,
            "Institution2.14"::VARCHAR,
          ],
          x -> trim(regexp_replace(x, '[\n\r]', ' ', 'g'))
        )
      ) as label,
    from 'src/data/private/AAP2_template_export.tsv'
  ) where id is not null and label is not null
  group by id
`

const instance = await DuckDBInstance.create()
const connection = await instance.connect()

const reader = await connection.runAndReadAll(all_institutions_query)
const rows = reader.getRowObjectsJson()

const response_cache = new Map()

for (let index = 0; index < rows.length; index++) {
  const row = rows[index]
  if (response_cache.has(row.id)) {
    rows[index] = { ...row, ...response_cache.get(row.id) }
    continue
  }
  const response = await queryAndFormatRE(row.id, 'aap2_export', false)
  if (response.siret) {
    response_cache.set(row.id, response)
  }
  rows[index] = { ...row, ...response }
}

process.stdout.write(tsvFormat(rows))

connection.closeSync()
