import { dsvFormat, tsvParse } from 'd3-dsv'
import { readFile } from 'node:fs/promises'

// normally we should be able to load this csv through the an `sql` frontmatter
// declaration in markdown, but this csv needs a more refined parser to load correctly

const file = await readFile('src/data/private/AAP2_template_export.tsv')
const data = tsvParse(file.toString())

const parser = dsvFormat(';')
process.stdout.write(parser.format(data))
