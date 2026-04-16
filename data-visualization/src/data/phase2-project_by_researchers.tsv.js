import { DuckDBInstance } from '@duckdb/node-api'
import { tsvFormat } from 'd3-dsv'

const query = `
select distinct
  project_id,
  lower(email) as researcher_id,
  position,
  HDR,
  institution_id,
  unite_id,
  site,
from (
  select
    "TITRE_COURT" as project_id,
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
        if("cnu-6-0" is not null, "TITRE_COURT" || '_' || 'phd_0'::VARCHAR, null),
        if("cnu-6-1" is not null, "TITRE_COURT" || '_' || 'phd_1'::VARCHAR, null),
        if("cnu-6-2" is not null, "TITRE_COURT" || '_' || 'phd_2'::VARCHAR, null),
        if("cnu-6-3" is not null, "TITRE_COURT" || '_' || 'phd_3'::VARCHAR, null),
      ]
    ) as email,
    unnest(
      [
        'porteur de projet',
        'directeur/directrice',
        case
          when "role-2" = 'Choice3'
          then 'codirecteur/codirectrice'
          when "role-2" = 'Choice4'
          then 'coencadrant/coencadrante'
          else null
        end,
        case
          when "role-3" = 'Choice3'
          then 'codirecteur/codirectrice'
          when "role-3" = 'Choice4'
          then 'coencadrant/coencadrante'
          else null
        end,
        null,
        case
          when "role-5" = 'Choice3'
          then 'codirecteur/codirectrice'
          when "role-5" = 'Choice4'
          then 'coencadrant/coencadrante'
          else null
        end,
        case
          when "role-6" = 'Choice3'
          then 'codirecteur/codirectrice'
          when "role-6" = 'Choice4'
          then 'coencadrant/coencadrante'
          else null
        end,
        null,
        case
          when "role-8" = 'Choice3'
          then 'codirecteur/codirectrice'
          when "role-8" = 'Choice4'
          then 'coencadrant/coencadrante'
          else null
        end,
        case
          when "role-9" = 'Choice3'
          then 'codirecteur/codirectrice'
          when "role-9" = 'Choice4'
          then 'coencadrant/coencadrante'
          else null
        end,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        'thésard',
        'thésard',
        'thésard',
        'thésard',
      ]
    ) as position,
    unnest(
      [
        null,
        null,
        if("HDR-2" is null, null, "HDR-2" = 'On'),
        if("HDR-3" is null, null, "HDR-3" = 'On'),
        null,
        if("HDR-5" is null, null, "HDR-5" = 'On'),
        if("HDR-6" is null, null, "HDR-6" = 'On'),
        null,
        if("HDR-8" is null, null, "HDR-8" = 'On'),
        if("HDR-9" is null, null, "HDR-9" = 'On'),
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      ]
    ) as HDR,
    unnest(
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
        null,
        null,
        null,
        null,
      ]
    ) as institution_id,
    unnest(
      [
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
        null,
        null,
        null,
        null,
      ]
    ) as unite_id,
    unnest(
      [
        "adresse-0"::VARCHAR,
        "adresse-1"::VARCHAR,
        "adresse-2"::VARCHAR,
        "adresse-3"::VARCHAR,
        "adresse-4"::VARCHAR,
        "adresse-5"::VARCHAR,
        "adresse-6"::VARCHAR,
        "adresse-7"::VARCHAR,
        "adresse-8"::VARCHAR,
        "adresse-9"::VARCHAR,
        "Adresse2.0"::VARCHAR,
        "Adresse2.1"::VARCHAR,
        "Adresse2.2"::VARCHAR,
        "Adresse2.3"::VARCHAR,
        "Adresse2.4"::VARCHAR,
        "Adresse2.5"::VARCHAR,
        "Adresse2.6"::VARCHAR,
        "Adresse2.7"::VARCHAR,
        "Adresse2.8"::VARCHAR,
        "Adresse2.9"::VARCHAR,
        "Adresse2.10"::VARCHAR,
        "Adresse2.11"::VARCHAR,
        "Adresse2.12"::VARCHAR,
        "Adresse2.13"::VARCHAR,
        "Adresse2.14"::VARCHAR,
        null,
        null,
        null,
        null,
      ]
    ) as site,
  from 'src/data/private/AAP2_template_export.tsv'
  left join 'src/data/private/AAP2_submission_metadata.tsv'
    on AAP2_template_export.filename ^@ AAP2_submission_metadata.DOCID::VARCHAR
)
where email != ''
order by researcher_id
`

const instance = await DuckDBInstance.create()
const connection = await instance.connect()

const reader = await connection.runAndReadAll(query)
const rows = reader.getRowObjectsJson()

process.stdout.write(tsvFormat(rows))

connection.closeSync()
