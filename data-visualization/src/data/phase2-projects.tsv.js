import { DuckDBInstance } from '@duckdb/node-api'
import { tsvFormat } from 'd3-dsv'

const projects_query = `
  select
    AAP2_submission_metadata.DOCID as DOCID,
    STATUT,
    TYPDOC,
    type_projet,
    "Titre court" as acronyme,
    TITLE as name_fr,
    case
      when length(split(TOPIC, ',')) = 1
      then
        if(
          contains(
            TOPIC,
            'Changement climatique et préservation de la biodiversité'
          ),
          '1',
          ''
        ) ||
        if(
          contains(
            TOPIC,
            'Vers des villes et/ou des bâtiments résilient(e)s'
          ),
          '2',
          ''
        ) ||
        if(
          contains(
            TOPIC,
            'Villes et/ou bâtiments sobres et frugaux'
          ),
          '3',
          ''
        ) ||
        if(
          contains(
            TOPIC,
            'Vers des villes et/ou bâtiments inclusifs et équitables'
          ),
          '4',
          ''
        ) ||
        if(
          contains(
            TOPIC,
            'Villes et/ou bâtiments durable, santé et bien-être'
          ),
          '5',
          ''
        ) ||
        if(
          contains(
            TOPIC,
            'Défis émergents'
          ),
          '6',
          ''
        )
      when
        length(
          filter(
            ["defi-1","defi-2","defi-3","defi-4","defi-5","defi-6"],
            lambda x: x = 'On'
          )
        ) = 1
      then
        if("defi-1" = 'On', '1', '') ||
        if("defi-2" = 'On', '2', '') ||
        if("defi-3" = 'On', '3', '') ||
        if("defi-4" = 'On', '4', '') ||
        if("defi-5" = 'On', '5', '') ||
        if("defi-6" = 'On', '6', '')
      else null
    end as challenge,
    contains(
      TOPIC,
      'Changement climatique et préservation de la biodiversité'
    ) as defi_1_1,
    contains(
      TOPIC,
      'Vers des villes et/ou des bâtiments résilient(e)s'
    ) as defi_2_1,
    contains(
      TOPIC,
      'Villes et/ou bâtiments sobres et frugaux'
    ) as defi_3_1,
    contains(
      TOPIC,
      'Vers des villes et/ou bâtiments inclusifs et équitables'
    ) as defi_4_1,
    contains(
      TOPIC,
      'Villes et/ou bâtiments durable, santé et bien-être'
    ) as defi_5_1,
    contains(
      TOPIC,
      'Défis émergents'
    ) as defi_6_1,
    "defi-1" = 'On' as defi_1_2,
    "defi-2" = 'On' as defi_2_2,
    "defi-3" = 'On' as defi_3_2,
    "defi-4" = 'On' as defi_4_2,
    "defi-5" = 'On' as defi_5_2,
    "defi-6" = 'On' as defi_6_2,
    list_transform(split(MOTCLE, ';'), x -> trim(regexp_replace(x, '[\n\r]', ' ', 'g'))) as MOTCLE,
    list_transform(split(keywords, ';'), x -> trim(regexp_replace(x, '[\n\r]', ' ', 'g'))) as keywords,
    list_transform(split(disciplines, ';'), x -> trim(regexp_replace(x, '[\n\r]', ' ', 'g'))) as disciplines,
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
  from 'src/data/private/AAP2_submission_metadata.tsv'
  left join 'src/data/private/AAP2_template_export.tsv'
  on AAP2_submission_metadata.DOCID =
    AAP2_template_export.DOCID
`

const instance = await DuckDBInstance.create()
const connection = await instance.connect()

const reader = await connection.runAndReadAll(projects_query)
const rows = reader.getRowObjectsJson()

process.stdout.write(tsvFormat(rows))

connection.closeSync()
