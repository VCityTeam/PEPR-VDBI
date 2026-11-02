---
style: /css/vdbi-dashboard.css
---

<!-- imports -->

```js
import { WordBubbles } from '/components/graph.js'
import { downloadSVGButton, formTemplate } from '/components/utilities.js'
import {
  vdbi_orange_analogic_color_scheme,
  vdbi_blue_analogic_color_scheme,
  valueTextColor,
} from '/components/color.js'
```

# Word Bubble Generator

Upload a word count file (.csv) to generate a word bubble chart. It uses the same format as the
[word cloud generator](./wordclouds), with an optional `group` column used to color the bubbles:

```csv
text,value,group
word1,1,A
word2,2,B
word3,3,A
```

Bubble areas are proportional to `value`. Bubbles can be dragged, and the chart can be zoomed and
panned.

```js
const word_count_file = view(Inputs.file({ accept: '.csv', required: true }))
```

```js
const word_count = word_count_file.csv({ typed: true })
```

```js
display(Inputs.table(word_count, { layout: 'auto' }))
```

<!-- User parameters -->

<div class="card">
  ${settings_form}
  <!-- $ -->
  <br>
  ${display_form}
  <!-- $ -->
</div>
<div id="word_bubbles_container" class="card">
  ${bubbles}
  <!-- $ -->
  ${Inputs.button("Refresh", { reduce: flip })}
  <!-- $ -->
  ${copy_button}
  <!-- $ -->
</div>

```js
const _invalidator_1 = refresh

const bubbles = resize((width) => {
  const svg = new WordBubbles(bubble_nodes, {
    width,
    height: display_settings.height,
    id: 'word_bubbles_svg',
    ...color_config,
    textColor: text_color,
    textLength: display_settings.text_length,
    fontSize: (d) => d.r / display_settings.font_ratio,
    chargeStrength: (d) => d.r * display_settings.charge,
    wrapRatio: display_settings.wrap_ratio,
    labelLineHeight: display_settings.label_line_height,
    collideRadiusRatio: display_settings.collide_ratio,
    collideIterations: display_settings.collide_iterations,
    chargeDistanceMax: width * display_settings.charge_distance,
    centerStrength: display_settings.center_strength,
  }).getSVG()

  // explicit dimensions so the downloaded SVG is not 0x0
  svg.setAttribute('width', width)
  svg.setAttribute('height', display_settings.height)
  return svg
})
```

```js
const table_columns = has_groups
  ? ['text', 'value', 'group', 'r']
  : ['text', 'value', 'r']
```

```js
const copy_button = downloadSVGButton(
  '#word_bubbles_svg',
  'Download (.svg)',
  'word-bubbles.svg',
)
```

```js
const refresh = Mutable(true)
const flip = () => (refresh.value = !refresh.value)
```

```js
const has_groups = word_count.some((d) => d.group != null && d.group !== '')
```

```js
// depends on the dataset, so these settings are reset when another file is loaded
const settings_form = Inputs.form(
  {
    color: Inputs.select(
      [
        ...(has_groups ? ['By group'] : []),
        'Orange (by value)',
        'Blue (by value)',
        'Orange',
        'Blue',
      ],
      { label: 'Select color scheme' },
    ),
    word_limit: Inputs.range([1, Math.max(1, word_count.length)], {
      label: 'Word limit',
      step: 1,
      value: Math.min(30, word_count.length),
    }),
  },
  { template: formTemplate(2) },
)
```

```js
const settings = Generators.input(settings_form)
```

```js
// independent of the dataset, so these settings are kept when another file is loaded
const display_form = Inputs.form(
  {
    text_color_mode: Inputs.select(['Fixed', 'By value'], {
      label: 'Text color mode',
    }),
    text_color: Inputs.color({
      label: 'Text color (fixed / high values)',
      value: '#ffffff',
    }),
    text_color_dark: Inputs.color({
      label: 'Text color (low values)',
      value: '#000000',
    }),
    text_color_threshold: Inputs.range([0, 1], {
      label: 'Text color threshold (normalized value)',
      step: 0.01,
      value: 0.5,
    }),
    text_length: Inputs.range([3, 100], {
      label: 'Label max length',
      step: 1,
      value: 50,
    }),
    height: Inputs.range([200, 1500], {
      label: 'Chart height',
      step: 10,
      value: 1000,
    }),
    radius_min: Inputs.range([1, 200], {
      label: 'Bubble radius minimum',
      step: 1,
      value: 50,
    }),
    radius_max: Inputs.range([1, 300], {
      label: 'Bubble radius maximum',
      step: 1,
      value: 100,
    }),
    font_ratio: Inputs.range([1, 10], {
      label: 'Radius / font size ratio',
      step: 0.1,
      value: 3.5,
    }),
    charge: Inputs.range([-2, 2], {
      label: 'Attraction (× radius)',
      step: 0.1,
      value: 1,
    }),
    wrap_ratio: Inputs.range([1, 10], {
      label: 'Radius / characters per line ratio',
      step: 0.1,
      value: 5,
    }),
    label_line_height: Inputs.range([0, 2], {
      label: 'Label line offset (em)',
      step: 0.05,
      value: 0.75,
    }),
    collide_ratio: Inputs.range([0.5, 2], {
      label: 'Bubble spacing (× radius)',
      step: 0.01,
      value: 1.1,
    }),
    collide_iterations: Inputs.range([1, 10], {
      label: 'Collision iterations',
      step: 1,
      value: 3,
    }),
    charge_distance: Inputs.range([0.1, 2], {
      label: 'Attraction max distance (× width)',
      step: 0.05,
      value: 0.5,
    }),
    center_strength: Inputs.range([0, 1], {
      label: 'Centering strength',
      step: 0.01,
      value: 0.1,
    }),
  },
  { template: formTemplate(3) },
)
```

```js
const display_settings = Generators.input(display_form)
```

```js
const filtered_wordcount = word_count
  .filter((d) => d.text != null && d.text !== '' && Number.isFinite(+d.value))
  .map((d) => ({ ...d, text: String(d.text), value: +d.value }))
  .sort((a, b) => b.value - a.value)
  .slice(0, settings.word_limit)
```

```js
// sqrt scale so that bubble *area* is proportional to the value
const radius_scale = d3
  .scaleSqrt()
  .domain(d3.extent(filtered_wordcount, (d) => d.value))
  .range([
    Math.min(display_settings.radius_min, display_settings.radius_max),
    Math.max(display_settings.radius_min, display_settings.radius_max),
  ])
```

```js
const bubble_nodes = filtered_wordcount.map((d, i) => ({
  ...d,
  id: `${i}_${d.text}`,
  label: d.text,
  r: radius_scale(d.value),
}))
```

```js
const value_color = (scheme) => ({
  valueMap: (d) => d.value,
  color: d3
    .scaleQuantize()
    .domain(d3.extent(filtered_wordcount, (d) => d.value))
    .range(scheme)
    .unknown('grey'),
  legend: null,
})

const single_color = (color) => ({
  valueMap: () => null,
  color: () => color,
  legend: null,
})

// `legend: undefined` falls back to the Graph default legend
const color_config = new Map([
  [
    'By group',
    {
      valueMap: (d) => d.group,
      color: d3.scaleOrdinal(d3.schemeTableau10).unknown('grey'),
      legend: undefined,
    },
  ],
  // ['Orange (by value)', value_color('black')],
  ['Orange (by value)', value_color(d3.schemeOrRd[3])],
  ['Blue (by value)', value_color(vdbi_blue_analogic_color_scheme)],
  ['Orange', single_color('var(--theme-foreground-focus-alt)')],
  ['Blue', single_color('var(--theme-foreground-focus)')],
]).get(settings.color)
```

```js
// "By value" uses the dark color for low values and the light color for high values,
// to stay readable on sequential schemes that go from light to dark
const value_text_color = valueTextColor(
  d3.extent(filtered_wordcount, (d) => d.value),
  {
    threshold: display_settings.text_color_threshold,
    dark: display_settings.text_color_dark,
    light: display_settings.text_color,
  },
)

const text_color =
  display_settings.text_color_mode === 'By value'
    ? (d) => value_text_color(d.value)
    : display_settings.text_color
```

## Data view

### Bubbles

```js
display(Inputs.table(bubble_nodes, { columns: table_columns }))
```
