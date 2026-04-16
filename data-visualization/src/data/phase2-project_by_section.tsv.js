import { DuckDBInstance } from '@duckdb/node-api'
import { tsvFormat } from 'd3-dsv'

const query = `
select
  "TITRE_COURT" as project_id,
  ABSTRACT,
  resume,
  "justification-0" as justification_1,
  "justification-1" as justification_2,
  problem,
  terrain,
  "sujet-0" as sujet_1,
  "sujet-1" as sujet_2,
  "sujet-2" as sujet_3,
  method,
  tasks,
  description,
  bibliography,
  'aap2_export' as source,
from 'src/data/private/AAP2_submission_metadata.tsv'
left join 'src/data/private/AAP2_template_export.tsv'
on AAP2_template_export.filename ^@ AAP2_submission_metadata.DOCID::VARCHAR
`

const instance = await DuckDBInstance.create()
const connection = await instance.connect()

const reader = await connection.runAndReadAll(query)
const rows = reader.getRowObjectsJson()

process.stdout.write(tsvFormat(rows))

connection.closeSync()
