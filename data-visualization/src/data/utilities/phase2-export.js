export const projects_query = (path_to_data) => `
  select
    '${path_to_data}private/AAP2_submission_metadata.csv.DOCID' as DOCID,
    STATUT,
    TYPDOC,
    type_projet,
    '' as SHORT_TITLE,
    TITLE,
    list_contains(
      split(TOPIC, ','),
      'Changement climatique et préservation de la biodiversité'
    ) as defi_1_1,
    list_contains(
      split(TOPIC, ','),
      'Vers des villes et/ou des bâtiments résilient(e)s'
    ) as defi_2_1,
    list_contains(
      split(TOPIC, ','),
      'Villes et/ou bâtiments sobres et frugaux'
    ) as defi_3_1,
    list_contains(
      split(TOPIC, ','),
      'Vers des villes et/ou bâtiments inclusifs et équitables'
    ) as defi_4_1,
    list_contains(
      split(TOPIC, ','),
      'Villes et/ou bâtiments durable, santé et bien-être'
    ) as defi_5_1,
    list_contains(
      split(TOPIC, ','),
      'Défis émergents'
    ) as defi_6_1,
    "defi-1" = 'On' as defi_1_2,
    "defi-2" = 'On' as defi_2_2,
    "defi-3" = 'On' as defi_3_2,
    "defi-4" = 'On' as defi_4_2,
    "defi-5" = 'On' as defi_5_2,
    "defi-6" = 'On' as defi_6_2,
    list_transform(split(MOTCLE, ';'), x -> trim(x)) as MOTCLE,
    list_transform(split(keywords, ';'), x -> trim(x)) as keywords,
    list_transform(split(disciplines, ';'), x -> trim(x)) as disciplines,
    filter(
      list_distinct([
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
      ]),
      x -> x is not null
    ) as cnus,
    -- "cnu-6-0" as cnu_thesis_1,
    "no ecole-0" as ed_thesis_1,
    -- "cnu-6-1" as cnu_thesis_2,
    "no ecole-1" as ed_thesis_2,
    -- "cnu-6-2" as cnu_thesis_3,
    "no ecole-2" as ed_thesis_3,
    "budget-0" as budget,
    "budget-1" as supplementary_budget,
    NOTE,
    -- TYPE,
    -- DATE,
    -- ABSTRACT,
    -- SPEAKERS,
    -- CORRESPONDING,
    -- AUTHORS,
    -- LABOS,
    -- FILE,
    -- FILE_SRC,
    -- DATEPRODUCT,
    -- COMMENTAIRE,
    -- LANGUE,
    -- CREATEUSERID,
    -- MAIL,
    -- titre,
  from read_csv('${path_to_data}private/AAP2_submission_metadata.csv',
    ignore_errors=true
  )
  left join '${path_to_data}private/AAP2_template_export.tsv'
  on '${path_to_data}private/AAP2_submission_metadata.csv.DOCID' =
    '${path_to_data}private/AAP2_template_export.tsv.DOCID'
`

export const total_project_count_query = (path_to_data) => `
  select count(*) as c
  from '${path_to_data}private/AAP2_submission_metadata.csv'
`

export const all_institutions_query = (path_to_data) => `
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
          x -> replace(x, ' ', ''))
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
          x -> trim(x)
        )
      ) as label,
    from '${path_to_data}private/AAP2_template_export.tsv'
  ) where id is not null and label is not null
  group by id
`

export const all_unites_query = (path_to_data) => `
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
    from '${path_to_data}private/AAP2_template_export.tsv'
  ) where id is not null and label is not null
  group by id
`

export const all_partners_query = (path_to_data) => `
  select
    id,
    list_distinct(list(label)) as labels,
    list_distinct(list(activity)) as activities,
    count(*) as count,
  from (
    select distinct
      unnest(
        apply([
          "SIRET le cas échéant 1"::VARCHAR,
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
        x -> replace(x, ' ', ''))
      ) as id,
      unnest(
        apply(
          [
            "Nom 1"::VARCHAR,
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
          x -> trim(x))
      ) as label,
      unnest(
        apply(
          [
            "Activité  secteurs dactivité 1"::VARCHAR,
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
          x -> trim(x))
      ) as activity,
    from '${path_to_data}private/AAP2_template_export.tsv'
  ) where id is not null and label is not null
  group by id
`

export const all_institutions_by_project_query = (path_to_data) => `
  select distinct DOCID, institution_id from (
    select
      DOCID,
      unnest(
        apply([
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
        x -> replace(x, ' ', ''))
      ) as institution_id,
      unnest(
        apply([
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
        x -> trim(x))
      ) as label,
    from '${path_to_data}private/AAP2_template_export.tsv'
  ) where institution_id is not null and label is not null
`

export const all_unites_by_project_query = (path_to_data) => `
  select distinct DOCID, unite_id from (
    select
      DOCID,
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
      ) as unite_id,
      unnest(
        apply([
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
    from '${path_to_data}private/AAP2_template_export.tsv'
  ) where unite_id is not null and label is not null
`

export const all_partners_by_project_query = (path_to_data) => `
  select distinct DOCID, partner_id from (
    select
      DOCID,
      unnest(
        apply([
          "SIRET le cas échéant 1"::VARCHAR,
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
        x -> replace(x, ' ', ''))
      ) as partner_id,
      unnest(
        apply([
          "Nom 1"::VARCHAR,
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
        x -> trim(x))
      ) as label,
      unnest(
        apply([
          "Activité  secteurs dactivité 1"::VARCHAR,
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
        x -> trim(x))
      ) as activity,
    from '${path_to_data}private/AAP2_template_export.tsv'
  ) where partner_id is not null and label is not null
`

export const researchers_query = (path_to_data) => ``

export const researcher_by_keywords_query = (path_to_data) => ``
