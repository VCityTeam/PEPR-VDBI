---
style: /css/vdbi-page.css
---

<!-- imports -->

```js
import { WordBubbles } from '/components/graph.js'
import { downloadSVGButton } from '/components/utilities.js'
import {
  vdbi_orange_analogic_color_scheme,
  vdbi_blue_analogic_color_scheme,
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

<!-- User parameters -->

<div class="grid card grid-cols-2">
  <div>
    ${selected_color}
    <!-- $ -->
    ${selected_text_color}
    <!-- $ -->
    ${selected_word_limit}
    <!-- $ -->
    ${selected_text_length}
    <!-- $ -->
    ${selected_height}
    <!-- $ -->
  </div>
  <div>
    ${selected_radius_min}
    <!-- $ -->
    ${selected_radius_max}
    <!-- $ -->
    ${selected_font_ratio}
    <!-- $ -->
    ${selected_charge}
    <!-- $ -->
  </div>
</div>
<details class="card">
  <summary>Advanced layout options</summary>
  <div class="grid grid-cols-2">
    <div>
      ${selected_wrap_ratio}
      <!-- $ -->
      ${selected_label_line_height}
      <!-- $ -->
      ${selected_collide_ratio}
      <!-- $ -->
    </div>
    <div>
      ${selected_collide_iterations}
      <!-- $ -->
      ${selected_charge_distance}
      <!-- $ -->
      ${selected_center_strength}
      <!-- $ -->
    </div>
  </div>
</details>
<div id="word_bubbles_container" class="card">
  ${bubbles}
  <!-- $ -->
  ${Inputs.button("Refresh", { reduce: flip })}
  <!-- $ -->
  ${copy_button}
  <!-- $ -->
</div>
<div class="card">${Inputs.table(bubble_nodes, {columns: table_columns})}</div>

```js
const _invalidator_1 = refresh

const bubbles = resize((width) => {
  const svg = new WordBubbles(bubble_nodes, {
    width,
    height: selected_height_value,
    id: 'word_bubbles_svg',
    ...color_config,
    textColor: selected_text_color_value,
    textLength: selected_text_length_value,
    fontSize: (d) => d.r / selected_font_ratio_value,
    chargeStrength: (d) => d.r * selected_charge_value,
    wrapRatio: selected_wrap_ratio_value,
    labelLineHeight: selected_label_line_height_value,
    collideRadiusRatio: selected_collide_ratio_value,
    collideIterations: selected_collide_iterations_value,
    chargeDistanceMax: width * selected_charge_distance_value,
    centerStrength: selected_center_strength_value,
  }).getSVG()

  // explicit dimensions so the downloaded SVG is not 0x0
  svg.setAttribute('width', width)
  svg.setAttribute('height', selected_height_value)
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

const selected_color = Inputs.select(
  [
    ...(has_groups ? ['By group'] : []),
    'Orange (by value)',
    'Blue (by value)',
    'Orange',
    'Blue',
  ],
  {
    label: 'Select color scheme',
  },
)

const selected_text_color = Inputs.color({
  label: 'Text color',
  value: '#ffffff',
})

const selected_word_limit = Inputs.range([1, 200], {
  label: 'Word limit',
  step: 1,
  value: 30,
})

const selected_text_length = Inputs.range([3, 100], {
  label: 'Label max length',
  step: 1,
  value: 60,
})

const selected_height = Inputs.range([200, 1500], {
  label: 'Chart height',
  step: 10,
  value: 600,
})

const selected_radius_min = Inputs.range([1, 200], {
  label: 'Bubble radius minimum',
  step: 1,
  value: 20,
})

const selected_radius_max = Inputs.range([1, 300], {
  label: 'Bubble radius maximum',
  step: 1,
  value: 80,
})

const selected_font_ratio = Inputs.range([1, 10], {
  label: 'Radius / font size ratio',
  step: 0.1,
  value: 3.5,
})

const selected_charge = Inputs.range([-2, 2], {
  label: 'Attraction (× radius)',
  step: 0.1,
  value: 1,
})

const selected_wrap_ratio = Inputs.range([1, 10], {
  label: 'Radius / characters per line ratio',
  step: 0.1,
  value: 4,
})

const selected_label_line_height = Inputs.range([0, 2], {
  label: 'Label line offset (em)',
  step: 0.05,
  value: 0.75,
})

const selected_collide_ratio = Inputs.range([0.5, 2], {
  label: 'Bubble spacing (× radius)',
  step: 0.01,
  value: 1.1,
})

const selected_collide_iterations = Inputs.range([1, 10], {
  label: 'Collision iterations',
  step: 1,
  value: 3,
})

const selected_charge_distance = Inputs.range([0.1, 2], {
  label: 'Attraction max distance (× width)',
  step: 0.05,
  value: 0.5,
})

const selected_center_strength = Inputs.range([0, 1], {
  label: 'Centering strength',
  step: 0.01,
  value: 0.1,
})
```

```js
const selected_color_value = Generators.input(selected_color)
const selected_text_color_value = Generators.input(selected_text_color)
const selected_word_limit_value = Generators.input(selected_word_limit)
const selected_text_length_value = Generators.input(selected_text_length)
const selected_height_value = Generators.input(selected_height)
const selected_radius_min_value = Generators.input(selected_radius_min)
const selected_radius_max_value = Generators.input(selected_radius_max)
const selected_font_ratio_value = Generators.input(selected_font_ratio)
const selected_charge_value = Generators.input(selected_charge)
const selected_wrap_ratio_value = Generators.input(selected_wrap_ratio)
const selected_label_line_height_value = Generators.input(
  selected_label_line_height,
)
const selected_collide_ratio_value = Generators.input(selected_collide_ratio)
const selected_collide_iterations_value = Generators.input(
  selected_collide_iterations,
)
const selected_charge_distance_value = Generators.input(
  selected_charge_distance,
)
const selected_center_strength_value = Generators.input(
  selected_center_strength,
)
```

```js
const filtered_wordcount = word_count
  .filter((d) => d.text != null && d.text !== '' && Number.isFinite(+d.value))
  .map((d) => ({ ...d, text: String(d.text), value: +d.value }))
  .sort((a, b) => b.value - a.value)
  .slice(0, selected_word_limit_value)
```

```js
// sqrt scale so that bubble *area* is proportional to the value
const radius_scale = d3
  .scaleSqrt()
  .domain(d3.extent(filtered_wordcount, (d) => d.value))
  .range([
    Math.min(selected_radius_min_value, selected_radius_max_value),
    Math.max(selected_radius_min_value, selected_radius_max_value),
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
  ['Orange (by value)', value_color(vdbi_orange_analogic_color_scheme)],
  ['Blue (by value)', value_color(vdbi_blue_analogic_color_scheme)],
  ['Orange', single_color('#ff6600')],
  ['Blue', single_color('#0064b5')],
]).get(selected_color_value)
```
