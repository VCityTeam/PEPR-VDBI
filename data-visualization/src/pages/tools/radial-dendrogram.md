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

Upload any table (.csv) to generate a radial dendrogram of its values. Each column of the table is a
**level** of the tree, in the order of the file, from the center outwards. Each row of the table adds
a branch going from the root through its value in each column, and rows sharing the same values are
merged into the same branch. For example, the file below groups projects by lab, and labs by
institution:

```csv
institution,lab,project
UNIV-1,LAB-A,P1
UNIV-2,LAB-B,P1
UNIV-1,LAB-A,P2
UNIV-2,LAB-C,P3
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
  <br>
  ${display_form}
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
  const svg_width = display_settings.width || width
  return collapsableRadialDendrogram(tree_data, {
    width: svg_width,
    height: display_settings.height || svg_width,
    // an emptied number field is NaN
    marginTop: display_settings.marginTop || 0,
    marginRight: display_settings.marginRight || 0,
    marginBottom: display_settings.marginBottom || 0,
    marginLeft: display_settings.marginLeft || 0,
    sort: display_settings.sort,
    expandDepth: settings.expand_depth,
    radialOffset: display_settings.radial_offset,
    textLength: display_settings.label_length || Infinity,
    r: display_settings.r || 0,
    fontsize: display_settings.fontsize || 10,
    fill: display_settings.fill,
    stroke: display_settings.stroke,
    expandedLabelAnchor: display_settings.expanded_label_anchor,
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
// depends on the dataset, so these settings are reset when another file is loaded
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
    // depth 0 is the root and leaves are at the last level, so the maximum expands every node
    expand_depth: Inputs.range([1, csv_data.columns.length], {
      label: 'Initially expanded levels',
      step: 1,
      value: csv_data.columns.length,
    }),
  },
  { template: formTemplate(3) },
)
```

```js
const settings = Generators.input(settings_form)
```

```js
// independent of the dataset, so these settings are kept when another file is loaded
const marginInput = (side) =>
  Inputs.number([0, Infinity], {
    label: `${side} margin (px)`,
    step: 1,
    value: 100,
  })

const display_form = Inputs.form(
  {
    sort: Inputs.select(
      new Map([
        ['Alphabetical', (a, b) => a.data.name.localeCompare(b.data.name)],
        ['Largest first', (a, b) => d3.descending(a.data.count, b.data.count)],
        ['Order in file', null],
      ]),
      { label: 'Node order' },
    ),
    radial_offset: Inputs.range([0, 359], {
      label: 'Rotation (degrees)',
      step: 1,
      value: 0,
    }),
    r: Inputs.number([0, Infinity], {
      label: 'Node radius (px)',
      step: 0.5,
      value: 3,
    }),
    fontsize: Inputs.number([1, Infinity], {
      label: 'Font size (px)',
      step: 1,
      value: 12,
    }),
    fill: Inputs.color({ label: 'Node color', value: '#999999' }),
    stroke: Inputs.color({ label: 'Link color', value: '#555555' }),
    expanded_label_anchor: Inputs.select(
      new Map([
        ['Away from the center', 'outward'],
        ['Towards the center', 'inward'],
        ['Centered on the node', 'middle'],
      ]),
      { label: 'Expanded node labels' },
    ),
    // left empty, labels are not clipped
    label_length: Inputs.number([1, Infinity], {
      label: 'Max label length (characters)',
      step: 1,
      value: 35,
      placeholder: 'no limit',
    }),
    // left empty, the diagram fits the page width and is square
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
    marginTop: marginInput('Top'),
    marginBottom: marginInput('Bottom'),
    marginLeft: marginInput('Left'),
    marginRight: marginInput('Right'),
  },
  { template: formTemplate(3) },
)
```

```js
const display_settings = Generators.input(display_form)
```

```js
const tree_data = columnsToTree(csv_data, csv_data.columns, {
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
  Inputs.table(treeToRows(tree_data, csv_data.columns), {
    layout: 'auto',
  }),
)
```
