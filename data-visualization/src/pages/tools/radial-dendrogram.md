---
style: /css/vdbi-dashboard.css
---

<!-- imports -->

```js
import {
  collapsableRadialDendrogram,
  columnsToTree,
} from '/components/radial-dendrogram.js'
import { downloadSVGButton, formTemplate } from '/components/utilities.js'
```

# Radial dendrogram generator

Upload any table (.csv) to generate a radial dendrogram of its values. Choose the **levels** of the
tree, one column per level, from the center outwards. Each row of the table adds a branch going from
the root through its value in each level column, and rows sharing the same values are merged into the
same branch. For example, with the file below, using `institution`, `lab` then `project` as levels
groups projects by lab, and labs by institution:

```csv
project,lab,institution
P1,LAB-A,UNIV-1
P1,LAB-B,UNIV-2
P2,LAB-A,UNIV-1
P3,LAB-C,UNIV-2
```

Cells that hold several values (e.g. `LAB-A; LAB-B`) can be split with the _value delimiter_: the row
then branches into each of its values. Click on a node of the dendrogram to expand or collapse its
children; collapsed nodes are drawn with the link color.

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
  ${selected_level_count}
  <!-- $ -->
  ${selected_levels}
  <!-- $ -->
  ${selected_expand_depth}
  <!-- $ -->
  ${selected_style}
  <!-- $ -->
  ${selected_label_length}
  <!-- $ -->
  ${selected_size}
  <!-- $ -->
  ${selected_margins}
  <!-- $ -->
</div>
<div id="radial_dendrogram_container" class="card">
  ${dendrogram}
  <!-- $ -->
  ${copy_button}
  <!-- $ -->
</div>

```js
const dendrogram = resize((width) => {
  const svg_width = selected_size_value.width || width
  return collapsableRadialDendrogram(tree_data, {
    width: svg_width,
    height: selected_size_value.height || svg_width,
    // an emptied margin field is NaN
    ...Object.fromEntries(
      Object.entries(selected_margins_value).map(([k, v]) => [k, v || 0]),
    ),
    sort: settings.sort,
    expandDepth: selected_expand_depth_value,
    textLength: selected_label_length_value || Infinity,
    r: selected_style_value.r || 0,
    fontsize: selected_style_value.fontsize || 10,
    fill: selected_style_value.fill,
    stroke: selected_style_value.stroke,
  })
})
```

```js
const copy_button = downloadSVGButton(
  '#radial_dendrogram_container svg',
  'Download (.svg)',
  'radial-dendrogram.svg',
)
```

```js
const settings_form = Inputs.form(
  {
    root_name: Inputs.text({
      label: 'Root name',
      value: csv_file.name.replace(/\.csv$/i, ''),
    }),
    delimiter: Inputs.text({
      label: 'Value delimiter',
      placeholder: 'none, e.g. ; or |',
    }),
    empty_label: Inputs.text({
      label: 'Label for empty cells',
      placeholder: 'none, branch stops',
    }),
    sort: Inputs.select(
      new Map([
        ['Largest first', (a, b) => d3.descending(a.data.count, b.data.count)],
        ['Alphabetical', (a, b) => a.data.name.localeCompare(b.data.name)],
        ['Order in file', null],
      ]),
      { label: 'Node order' },
    ),
  },
  { template: formTemplate() },
)
```

```js
const settings = Generators.input(settings_form)
```

```js
const selected_level_count = Inputs.range([1, csv_data.columns.length], {
  label: 'Number of levels',
  step: 1,
  value: Math.min(csv_data.columns.length, 3),
})
```

```js
const selected_level_count_value = Generators.input(selected_level_count)
```

```js
// one select per level, as a multiple select would not preserve the level order
const selected_levels = Inputs.form(
  d3.range(selected_level_count_value).map((i) =>
    Inputs.select(csv_data.columns, {
      label: `Level ${i + 1}${i === 0 ? ' (center)' : ''} column`,
      value: csv_data.columns[i],
    }),
  ),
  { template: formTemplate() },
)
```

```js
const selected_levels_value = Generators.input(selected_levels)
```

```js
// depth 0 is the root, so the deepest level is selected_level_count_value
const selected_expand_depth = Inputs.range([1, selected_level_count_value], {
  label: 'Initially expanded levels',
  step: 1,
  value: 1,
})
```

```js
const selected_expand_depth_value = Generators.input(selected_expand_depth)
```

```js
const selected_style = Inputs.form(
  {
    r: Inputs.number([0, Infinity], {
      label: 'Node radius (px)',
      step: 0.5,
      value: 3,
    }),
    fontsize: Inputs.number([1, Infinity], {
      label: 'Font size (px)',
      step: 1,
      value: 10,
    }),
    fill: Inputs.color({ label: 'Node color', value: '#999999' }),
    stroke: Inputs.color({ label: 'Link color', value: '#555555' }),
  },
  { template: formTemplate() },
)
```

```js
const selected_style_value = Generators.input(selected_style)
```

```js
// left empty, labels are not clipped
const selected_label_length = Inputs.number([1, Infinity], {
  label: 'Max label length (characters)',
  step: 1,
  value: 15,
  placeholder: 'no limit',
})
```

```js
const selected_label_length_value = Generators.input(selected_label_length)
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
const tree_data = columnsToTree(csv_data, selected_levels_value, {
  rootName: settings.root_name || 'root',
  delimiter: settings.delimiter || null,
  emptyLabel: settings.empty_label || null,
})
console.debug('tree_data', tree_data)
```

<!-- Helpers -->

```js
/**
 * Flatten a `{name, count, children}` tree into one row per node, with the
 * path of names leading to it from the root.
 */
const treeToRows = (tree, levels) =>
  d3
    .hierarchy(tree)
    .descendants()
    .map((d) => ({
      level: d.depth === 0 ? '(root)' : levels[d.depth - 1],
      name: d.data.name,
      rows: d.data.count,
      children: d.children?.length ?? 0,
      path: d
        .ancestors()
        .reverse()
        .map((a) => a.data.name)
        .join(' → '),
    }))
```

## Data view

### Nodes

```js
display(
  Inputs.table(treeToRows(tree_data, selected_levels_value), {
    layout: 'auto',
  }),
)
```
