import { csvParse, tsvFormat } from 'd3-dsv'
import { readFile } from 'node:fs/promises'

// normally we should be able to load this csv through the an `sql` frontmatter
// declaration in markdown, but this csv needs a more refined parser to load correctly

const data = csvParse(
  (await readFile('src/data/private/AAP2_template_export.csv')).toString(),
)

process.stdout.write(tsvFormat(data))
