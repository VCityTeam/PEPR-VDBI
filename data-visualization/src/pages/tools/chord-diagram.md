---
style: /css/vdbi-page.css
---

<!-- imports -->

```js
import { chordDiagram, columnsToIntersectionMatrix } from '/components/chord.js'
import { downloadSVGButton } from '/components/utilities.js'
```

# Chord diagram generator

Upload any table (.csv) to generate a chord diagram of the values shared between groups. Choose a
**group column**, whose values become the arcs of the diagram, and one or more **value columns**.
Each ribbon shows how many values two groups have in common. For example, with the file below,
grouping by `project` and using the `lab` and `institution` columns links projects that share labs
or institutions:

```csv
project,lab,institution
P1,LAB-A,UNIV-1
P1,LAB-B,UNIV-2
P2,LAB-A,UNIV-1
P3,LAB-C,UNIV-2
```

Cells that hold several values (e.g. `LAB-A; LAB-B`) can be split with the _value delimiter_. All
values, including numbers and dates, are compared as text.

```js
const csv_file = view(Inputs.file({ accept: '.csv', required: true }))
```

```js
// untyped, so that values are compared using their original text (e.g. "01" ≠ "1")
const csv_data = csv_file.csv()
```

```js
display(Inputs.table(csv_data))
```

<!-- User parameters -->

<div class="grid card grid-cols-2">
  <div>
    ${selected_group_column}
    <!-- $ -->
    ${selected_value_columns}
    <!-- $ -->
    ${selected_delimiter}
    <!-- $ -->
  </div>
  <div>
    ${selected_measure}
    <!-- $ -->
    ${selected_diagonal}
    <!-- $ -->
    ${selected_group_limit}
    <!-- $ -->
  </div>
</div>
<div id="chord_diagram_container" class="card">
  ${chord}
  <!-- $ -->
  ${copy_button}
  <!-- $ -->
</div>

```js
const chord = resize((width) =>
  chordDiagram(chord_data.matrix, chord_data.names, chord_colors, {
    diagram_id: 'chord_diagram_svg',
    width,
    height: width,
    margin: 100,
    ...format_config,
  }),
)
```

```js
const copy_button = downloadSVGButton(
  '#chord_diagram_svg',
  'Download (.svg)',
  'chord-diagram.svg',
)
```

```js
const selected_group_column = Inputs.select(csv_data.columns, {
  label: 'Group column (arcs)',
})

const selected_measure = Inputs.select(
  new Map([
    ['Share of all distinct values', 'superset'],
    ['Number of shared values', 'count'],
    ['Jaccard index (shared / either)', 'jaccard'],
  ]),
  { label: 'Ribbon size' },
)

const selected_delimiter = Inputs.text({
  label: 'Value delimiter',
  placeholder: 'none, e.g. ; or |',
})

const selected_diagonal = Inputs.toggle({
  label: 'Show self-intersections',
  value: true,
})
```

```js
const selected_group_column_value = Generators.input(selected_group_column)
const selected_measure_value = Generators.input(selected_measure)
const selected_delimiter_value = Generators.input(selected_delimiter)
const selected_diagonal_value = Generators.input(selected_diagonal)
```

```js
const value_column_options = csv_data.columns.filter(
  (d) => d !== selected_group_column_value,
)

const selected_value_columns = Inputs.select(value_column_options, {
  label: 'Value columns (ribbons)',
  multiple: true,
  value: value_column_options.slice(0, 1),
})
```

```js
const selected_value_columns_value = Generators.input(selected_value_columns)
```

```js
const group_count = new Set(
  csv_data.map((d) => d[selected_group_column_value]?.trim()).filter((d) => d),
).size

const selected_group_limit = Inputs.range([1, Math.max(group_count, 1)], {
  label: 'Max groups (largest first)',
  step: 1,
  value: Math.min(group_count, 30),
})
```

```js
const selected_group_limit_value = Generators.input(selected_group_limit)
```

```js
const chord_data = columnsToIntersectionMatrix(
  csv_data,
  selected_group_column_value,
  selected_value_columns_value,
  {
    delimiter: selected_delimiter_value || null,
    measure: selected_measure_value,
    diagonal: selected_diagonal_value,
    limit: selected_group_limit_value,
  },
)
console.debug('chord_data', chord_data)
```

```js
const chord_colors =
  chord_data.names.length <= 10
    ? d3.schemeTableau10
    : d3.quantize(
        (t) =>
          d3.interpolateRainbow(
            (t * chord_data.names.length) / (chord_data.names.length + 1),
          ),
        chord_data.names.length,
      )
```

```js
// counts are integers, the other measures are ratios
const format_config =
  selected_measure_value === 'count'
    ? {
        formatValue: d3.format(',~r'),
        tickStep: Math.max(
          1,
          d3.tickStep(0, d3.sum(chord_data.matrix.flat()), 100),
        ),
      }
    : { formatValue: d3.format('.1~%') }
```

<!-- Non-textual column warning -->

```js
/**
 * Count the values of a column that d3.autoType would not parse as text
 * (numbers, dates, booleans). Empty cells are ignored.
 */
const nonTextualValues = (rows, column) =>
  rows
    .map((d) => d[column])
    .filter((value) => {
      if (value == null || value.trim() === '') return false
      const typed = d3.autoType({ value }).value
      return typed !== null && typeof typed !== 'string'
    })

const non_textual_columns = [
  selected_group_column_value,
  ...selected_value_columns_value,
]
  .map((column) => ({ column, values: nonTextualValues(csv_data, column) }))
  .filter((d) => d.values.length > 0)
```

```js
const warning_dialog = document.body.appendChild(
  html`<dialog class="card" style="margin: auto; max-width: 640px">
    <h2>Non-textual values</h2>
    <div class="dialog-body"></div>
    <p>
      These values will be treated as text: two values are only considered
      shared if they are written identically.
    </p>
    <form method="dialog"><button>OK</button></form>
  </dialog>`,
)
invalidation.then(() => warning_dialog.remove())
```

```js
if (non_textual_columns.length > 0) {
  warning_dialog.querySelector('.dialog-body').replaceChildren(
    html`<ul>
      ${non_textual_columns.map(
        ({ column, values }) =>
          html`<li>
            <code>${column}</code>: ${values.length} non-textual value(s), e.g.
            ${[...new Set(values)].slice(0, 3).join(', ')}
          </li>`,
      )}
    </ul>`,
  )
  if (!warning_dialog.open) warning_dialog.showModal()
}
```

## Data view

### Values by group

```js
display(
  Inputs.table(
    [...chord_data.sets].map(([group, set]) => ({
      group,
      count: set.size,
      values: [...set].join(', '),
    })),
  ),
)
```

### Matrix

```js
display(
  Inputs.table(
    chord_data.matrix.map((row, i) => ({
      group: chord_data.names[i],
      ...Object.fromEntries(
        row.map((value, j) => [chord_data.names[j], value]),
      ),
    })),
    {
      format: Object.fromEntries(
        chord_data.names.map((d) => [d, format_config.formatValue]),
      ),
    },
  ),
)
```
