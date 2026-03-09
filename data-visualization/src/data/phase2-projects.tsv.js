import { DuckDBInstance } from '@duckdb/node-api'
import { tsvFormat } from 'd3-dsv'
import { projects_query } from './utilities/phase2-export.js'

const instance = await DuckDBInstance.create()
const connection = await instance.connect()

const reader = await connection.runAndReadAll(projects_query('src/data/'))
const rows = reader.getRowObjectsJson()

process.stdout.write(tsvFormat(rows))

connection.closeSync()
