// Export the AAP2 template export as a TSV file with a UTF-8 encoding //

import { dsvFormat, tsvFormat } from 'd3-dsv'
import { readFile } from 'node:fs/promises'

// normally we should be able to load this csv through the an `sql` frontmatter
// declaration in markdown, but this csv needs a more refined parser to load correctly

const file = await readFile('src/data/private/AAP2_template_export.csv')
const parser = dsvFormat(';')
const data = parser.parse(file.toString())

data.forEach((row) => {
  Object.entries(row).forEach(([key, value]) => {
    if (typeof value !== 'string') {
      return
    } else {
      const clean_value = richTextFields.includes(key)
        ? value.trim()
        : value.replace(/\n/g, ' ').trim()
      row[key] = clean_value
    }
  })
})

process.stdout.write(tsvFormat(data))
