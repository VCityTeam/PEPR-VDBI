import { DuckDBInstance } from '@duckdb/node-api'
import { tsvFormat } from 'd3-dsv'

const query = `
select distinct
  email,
  firstname,
  upper(lastname) as lastname,
  orcid,
  idhal,
  idref,
from (
  select
    unnest(
      [
        "prenom-0"::VARCHAR,
        "prenom-1"::VARCHAR,
        "prenom-2"::VARCHAR,
        "prenom-3"::VARCHAR,
        "prenom-4"::VARCHAR,
        "prenom-5"::VARCHAR,
        "prenom-6"::VARCHAR,
        "prenom-7"::VARCHAR,
        "prenom-8"::VARCHAR,
        "prenom-9"::VARCHAR,
        "Prénom2.0"::VARCHAR,
        "Prénom2.1"::VARCHAR,
        "Prénom2.2"::VARCHAR,
        "Prénom2.3"::VARCHAR,
        "Prénom2.4"::VARCHAR,
        "Prénom2.5"::VARCHAR,
        "Prénom2.6"::VARCHAR,
        "Prénom2.7"::VARCHAR,
        "Prénom2.8"::VARCHAR,
        "Prénom2.9"::VARCHAR,
        "Prénom2.10"::VARCHAR,
        "Prénom2.11"::VARCHAR,
        "Prénom2.12"::VARCHAR,
        "Prénom2.13"::VARCHAR,
        "Prénom2.14"::VARCHAR,
      ]
    ) as firstname,
    unnest(
      [
        "nom-0"::VARCHAR,
        "nom-1"::VARCHAR,
        "nom-2"::VARCHAR,
        "nom-3"::VARCHAR,
        "nom-4"::VARCHAR,
        "nom-5"::VARCHAR,
        "nom-6"::VARCHAR,
        "nom-7"::VARCHAR,
        "nom-8"::VARCHAR,
        "nom-9"::VARCHAR,
        "Nom2.0"::VARCHAR,
        "Nom2.1"::VARCHAR,
        "Nom2.2"::VARCHAR,
        "Nom2.3"::VARCHAR,
        "Nom2.4"::VARCHAR,
        "Nom2.5"::VARCHAR,
        "Nom2.6"::VARCHAR,
        "Nom2.7"::VARCHAR,
        "Nom2.8"::VARCHAR,
        "Nom2.9"::VARCHAR,
        "Nom2.10"::VARCHAR,
        "Nom2.11"::VARCHAR,
        "Nom2.12"::VARCHAR,
        "Nom2.13"::VARCHAR,
        "Nom2.14"::VARCHAR,
      ]
    ) as lastname,
    unnest(
      apply(
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
        ],
        x -> lower(x)
      )
    ) as email,
    unnest(
      [
        "orcid-0"::VARCHAR,
        "orcid-1"::VARCHAR,
        "orcid-2"::VARCHAR,
        "orcid-3"::VARCHAR,
        "orcid-4"::VARCHAR,
        "orcid-5"::VARCHAR,
        "orcid-6"::VARCHAR,
        "orcid-7"::VARCHAR,
        "orcid-8"::VARCHAR,
        "orcid-9"::VARCHAR,
        "ORCID2.0"::VARCHAR,
        "ORCID2.1"::VARCHAR,
        "ORCID2.2"::VARCHAR,
        "ORCID2.3"::VARCHAR,
        "ORCID2.4"::VARCHAR,
        "ORCID2.5"::VARCHAR,
        "ORCID2.6"::VARCHAR,
        "ORCID2.7"::VARCHAR,
        "ORCID2.8"::VARCHAR,
        "ORCID2.9"::VARCHAR,
        "ORCID2.10"::VARCHAR,
        "ORCID2.11"::VARCHAR,
        "ORCID2.12"::VARCHAR,
        "ORCID2.13"::VARCHAR,
        "ORCID2.14"::VARCHAR,
      ]
    ) as orcid,
    unnest(
      [
        "idhal-0"::VARCHAR,
        "idhal-1"::VARCHAR,
        "idhal-2"::VARCHAR,
        "idhal-3"::VARCHAR,
        "idhal-4"::VARCHAR,
        "idhal-5"::VARCHAR,
        "idhal-6"::VARCHAR,
        "idhal-7"::VARCHAR,
        "idhal-8"::VARCHAR,
        "idhal-9"::VARCHAR,
        "idHAL2.0"::VARCHAR,
        "idHAL2.1"::VARCHAR,
        "idHAL2.2"::VARCHAR,
        "idHAL2.3"::VARCHAR,
        "idHAL2.4"::VARCHAR,
        "idHAL2.5"::VARCHAR,
        "idHAL2.6"::VARCHAR,
        "idHAL2.7"::VARCHAR,
        "idHAL2.8"::VARCHAR,
        "idHAL2.9"::VARCHAR,
        "idHAL2.10"::VARCHAR,
        "idHAL2.11"::VARCHAR,
        "idHAL2.12"::VARCHAR,
        "idHAL2.13"::VARCHAR,
        "idHAL2.14"::VARCHAR,
      ]
    ) as idhal,
    unnest(
      [
        "idref-0"::VARCHAR,
        "idref-1"::VARCHAR,
        "idref-2"::VARCHAR,
        "idref-3"::VARCHAR,
        "idref-4"::VARCHAR,
        "idref-5"::VARCHAR,
        "idref-6"::VARCHAR,
        "idref-7"::VARCHAR,
        "idref-8"::VARCHAR,
        "idref-9"::VARCHAR,
        "IdRef2.0"::VARCHAR,
        "IdRef2.1"::VARCHAR,
        "IdRef2.2"::VARCHAR,
        "IdRef2.3"::VARCHAR,
        "IdRef2.4"::VARCHAR,
        "IdRef2.5"::VARCHAR,
        "IdRef2.6"::VARCHAR,
        "IdRef2.7"::VARCHAR,
        "IdRef2.8"::VARCHAR,
        "IdRef2.9"::VARCHAR,
        "IdRef2.10"::VARCHAR,
        "IdRef2.11"::VARCHAR,
        "IdRef2.12"::VARCHAR,
        "IdRef2.13"::VARCHAR,
        "IdRef2.14"::VARCHAR,
      ]
    ) as idref,
  from 'src/data/private/AAP2_template_export.tsv'
  left join 'src/data/private/AAP2_submission_metadata.tsv'
    on AAP2_template_export.filename ^@ AAP2_submission_metadata.DOCID::VARCHAR
)
where firstname != '' and lastname != ''
group by all
order by email
`

const instance = await DuckDBInstance.create()
const connection = await instance.connect()

const reader = await connection.runAndReadAll(query)
const rows = reader.getRowObjectsJson()

process.stdout.write(tsvFormat(rows))

connection.closeSync()
