import { DuckDBInstance } from '@duckdb/node-api'
import { tsvFormat } from 'd3-dsv'

const cnu_query = `
with researchers as (
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
    [
      'porteur de projet',
      'directeur/directrice',
      case
        when 'role-2' = 'Choice3'
        then 'codirecteur/codirectrice'
        when 'role-2' = 'Choice4'
        then 'coencadrant/coencadrante'
        else null
      end,
      case
        when 'role-3' = 'Choice3'
        then 'codirecteur/codirectrice'
        when 'role-3' = 'Choice4'
        then 'coencadrant/coencadrante'
        else null
      end,
      case
        when 'role-4' = 'Choice3'
        then 'codirecteur/codirectrice'
        when 'role-4' = 'Choice4'
        then 'coencadrant/coencadrante'
        else null
      end,
      case
        when 'role-5' = 'Choice3'
        then 'codirecteur/codirectrice'
        when 'role-5' = 'Choice4'
        then 'coencadrant/coencadrante'
        else null
      end,
      case
        when 'role-6' = 'Choice3'
        then 'codirecteur/codirectrice'
        when 'role-6' = 'Choice4'
        then 'coencadrant/coencadrante'
        else null
      end,
      case
        when 'role-7' = 'Choice3'
        then 'codirecteur/codirectrice'
        when 'role-7' = 'Choice4'
        then 'coencadrant/coencadrante'
        else null
      end,
      case
        when 'role-8' = 'Choice3'
        then 'codirecteur/codirectrice'
        when 'role-8' = 'Choice4'
        then 'coencadrant/coencadrante'
        else null
      end,
      case
        when 'role-9' = 'Choice3'
        then 'codirecteur/codirectrice'
        when 'role-9' = 'Choice4'
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
    ]
  ) as HDR,
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
    ]
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
  unnest(
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
    ]
  ) as institution,
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
    ]
  ) as institution_id,
  unnest(
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
    ]
  ) as unite,
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
    ]
  ) as site,
  from 'src/data/private/AAP2_template_export.tsv'
)

select *
from researchers
where firstname != '' and lastname != ''
`

const instance = await DuckDBInstance.create()
const connection = await instance.connect()

const reader = await connection.runAndReadAll(cnu_query)
const rows = reader.getRowObjectsJson()

process.stdout.write(tsvFormat(rows))

connection.closeSync()
