---
style: /css/vdbi-dashboard.css
---

<!-- imports -->

```js
import {
  chordDiagram,
  columnsToIntersectionMatrix,
  transposeGroupsAndValues,
} from '/components/chord.js'
import { downloadSVGButton, formTemplate } from '/components/utilities.js'
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
display(Inputs.table(csv_data, { layout: 'auto' }))
```

<!-- User parameters -->

<div class="card">
  ${settings_form}
  <!-- $ -->
  ${selected_group_limit}
  <!-- $ -->
  ${selected_group_labels}
  <!-- $ -->
  ${selected_group_label_length}
  <!-- $ -->
  ${selected_size}
  <!-- $ -->
  ${selected_margins}
  <!-- $ -->
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
    width: selected_size_value.width || width,
    height: selected_size_value.height || selected_size_value.width || width,
    // an emptied margin field is NaN
    ...Object.fromEntries(
      Object.entries(selected_margins_value).map(([k, v]) => [k, v || 0]),
    ),
    showGroupLabels: selected_group_labels_value,
    groupLabelMaxLength: selected_group_label_length_value,
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
const settings_form = Inputs.form(
  {
    group_column: Inputs.select(csv_data.columns, {
      label: 'Group column (arcs)',
    }),
    // the group column is excluded from the value columns below
    value_columns: Inputs.select(csv_data.columns, {
      label: 'Value columns (ribbons)',
      multiple: true,
      value: csv_data.columns.slice(1, 2),
    }),
    delimiter: Inputs.text({
      label: 'Value delimiter',
      placeholder: 'none, e.g. ; or |',
    }),
    transpose: Inputs.toggle({
      label: 'Transpose groups and values',
      value: false,
    }),
    measure: Inputs.select(
      new Map([
        ['Number of shared values', 'count'],
        ['% share of all distinct values', 'superset'],
        ['Jaccard index (shared / either)', 'jaccard'],
      ]),
      { label: 'Ribbon size' },
    ),
    diagonal: Inputs.toggle({
      label: 'Show self-intersections',
      value: true,
    }),
    sort: Inputs.select(
      new Map([
        ['Largest first', ([, a], [, b]) => d3.descending(a.size, b.size)],
        ['Alphabetical', ([a], [b]) => a.localeCompare(b)],
        ['Order in file', null],
      ]),
      { label: 'Group order' },
    ),
  },
  { template: formTemplate() },
)
```

```js
const settings = Generators.input(settings_form)
```

```js
const value_columns = settings.value_columns.filter(
  (d) => d !== settings.group_column,
)
const delimiter = settings.delimiter || null
```

```js
// when transposed, the distinct values become the groups and the groups their values
const chord_input = settings.transpose
  ? {
      data: transposeGroupsAndValues(
        csv_data,
        settings.group_column,
        value_columns,
        { delimiter },
      ),
      group_column: 'group',
      value_columns: ['value'],
      delimiter: null, // already split by transposeGroupsAndValues
    }
  : {
      data: csv_data,
      group_column: settings.group_column,
      value_columns,
      delimiter,
    }
```

```js
const group_count = new Set(
  chord_input.data
    .map((d) => d[chord_input.group_column]?.trim())
    .filter((d) => d),
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
// kept out of settings_form so toggling labels only redraws the diagram
const selected_group_labels = Inputs.toggle({
  label: 'Show group labels',
  value: true,
})
```

```js
const selected_group_labels_value = Generators.input(selected_group_labels)
```

```js
// left empty, labels are not clipped; at least 4 so cropText keeps a character before '...'
const selected_group_label_length = Inputs.number([4, Infinity], {
  label: 'Max group label length (characters)',
  step: 1,
  placeholder: 'no limit',
})
```

```js
const selected_group_label_length_value = Generators.input(
  selected_group_label_length,
)
```

```js
// left empty, the diagram fits the page width and is square
const selected_size = Inputs.form(
  {
    width: Inputs.number([1, Infinity], {
      label: 'SVG width (px)',
      step: 1,
      placeholder: 'fit to page',
    }),
    height: Inputs.number([1, Infinity], {
      label: 'SVG height (px)',
      step: 1,
      placeholder: 'same as width',
    }),
  },
  { template: formTemplate() },
)
```

```js
const selected_size_value = Generators.input(selected_size)
```

```js
const marginInput = (side) =>
  Inputs.number([0, Infinity], {
    label: `${side} margin (px)`,
    step: 1,
    value: 100,
  })

const selected_margins = Inputs.form(
  {
    marginTop: marginInput('Top'),
    marginRight: marginInput('Right'),
    marginBottom: marginInput('Bottom'),
    marginLeft: marginInput('Left'),
  },
  { template: formTemplate() },
)
```

```js
const selected_margins_value = Generators.input(selected_margins)
```

```js
const chord_data = columnsToIntersectionMatrix(
  chord_input.data,
  chord_input.group_column,
  chord_input.value_columns,
  {
    delimiter: chord_input.delimiter,
    measure: settings.measure,
    diagonal: settings.diagonal,
    limit: selected_group_limit_value,
    sort: settings.sort,
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
  settings.measure === 'count'
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

const non_textual_columns = [settings.group_column, ...value_columns]
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
    { layout: 'auto' },
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
      layout: 'auto',
    },
  ),
)
```
