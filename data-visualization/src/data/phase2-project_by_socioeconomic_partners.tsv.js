import { DuckDBInstance } from '@duckdb/node-api'
import { tsvFormat } from 'd3-dsv'

export const query = `
  select distinct project_id, partner_id, prospective from (
    select
    "TITRE_COURT" as project_id,
      unnest(
        apply([
          "SIRET le cas échéant 1"::VARCHAR,
          "SIRET le cas échéant 2"::VARCHAR,
          "SIRET le cas échéant 3"::VARCHAR,
          "SIRET le cas échéant 4"::VARCHAR,
          "SIRET le cas échéant 5"::VARCHAR,
          "SIRET le cas échéant 6"::VARCHAR,
          "SIRET le cas échéant 7"::VARCHAR,
          "SIRET le cas échéant 8"::VARCHAR,
          "SIRET le cas échéant 1_2"::VARCHAR,
          "SIRET le cas échéant 2_2"::VARCHAR,
          "SIRET le cas échéant 3_2"::VARCHAR,
          "SIRET le cas échéant 4_2"::VARCHAR,
          "SIRET le cas échéant 5_2"::VARCHAR,
          "SIRET le cas échéant 6_2"::VARCHAR,
          "SIRET le cas échéant 7_2"::VARCHAR,
          "SIRET le cas échéant 8_2"::VARCHAR,
        ],
        x -> regexp_replace(x, '[\s ]', '', 'g'))
      ) as partner_id,
      unnest(
        apply([
          "Nom 1"::VARCHAR,
          "Nom 2"::VARCHAR,
          "Nom 3"::VARCHAR,
          "Nom 4"::VARCHAR,
          "Nom 5"::VARCHAR,
          "Nom 6"::VARCHAR,
          "Nom 7"::VARCHAR,
          "Nom 8"::VARCHAR,
          "Nom 1_2"::VARCHAR,
          "Nom 2_2"::VARCHAR,
          "Nom 3_2"::VARCHAR,
          "Nom 4_2"::VARCHAR,
          "Nom 5_2"::VARCHAR,
          "Nom 6_2"::VARCHAR,
          "Nom 7_2"::VARCHAR,
          "Nom 8_2"::VARCHAR,
        ],
        x -> trim(regexp_replace(x, '[\n\r]', ' ', 'g')))
      ) as label,
      unnest(
        apply([
          "Activité  secteurs dactivité 1"::VARCHAR,
          "Activité  secteurs dactivité 2"::VARCHAR,
          "Activité  secteurs dactivité 3"::VARCHAR,
          "Activité  secteurs dactivité 4"::VARCHAR,
          "Activité  secteurs dactivité 5"::VARCHAR,
          "Activité  secteurs dactivité 6"::VARCHAR,
          "Activité  secteurs dactivité 7"::VARCHAR,
          "Activité  secteurs dactivité 8"::VARCHAR,
          "Activité  secteurs dactivité 1_2"::VARCHAR,
          "Activité  secteurs dactivité 2_2"::VARCHAR,
          "Activité  secteurs dactivité 3_2"::VARCHAR,
          "Activité  secteurs dactivité 4_2"::VARCHAR,
          "Activité  secteurs dactivité 5_2"::VARCHAR,
          "Activité  secteurs dactivité 6_2"::VARCHAR,
          "Activité  secteurs dactivité 7_2"::VARCHAR,
          "Activité  secteurs dactivité 8_2"::VARCHAR,
        ],
        x -> trim(regexp_replace(x, '[\n\r]', ' ', 'g')))
      ) as activity,
      unnest(
        [
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          true,
          true,
          true,
          true,
          true,
          true,
          true,
          true,
        ]
      ) as prospective,
    from 'src/data/private/AAP2_template_export.tsv'
    left join 'src/data/private/AAP2_submission_metadata.tsv'
    on AAP2_template_export.filename ^@ AAP2_submission_metadata.DOCID::VARCHAR
  ) where partner_id is not null and label is not null
`

const instance = await DuckDBInstance.create()
const connection = await instance.connect()

const reader = await connection.runAndReadAll(query)
const rows = reader.getRowObjectsJson()

process.stdout.write(tsvFormat(rows))

connection.closeSync()
