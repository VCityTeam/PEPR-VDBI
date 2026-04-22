---
style: /css/vdbi-page.css
---

<!-- imports -->

```js
import { wordCloud } from '/components/cloud.js'
import { downloadSVGButton } from '/components/utilities.js'
import {
  vdbi_orange_analogic_color_scale,
  vdbi_blue_analogic_color_scale,
  vdbi_color_scheme,
} from '/components/color.js'
```

# Word Cloud Generator

Upload a word count file (.csv) to generate a word cloud. It should match the following format:

```csv
text,value
word1,1
word2,2
word3,3
```

```js
const word_count_file = view(Inputs.file({ accept: '.csv', required: true }))
```

```js
const word_count = word_count_file.csv()
```

<div class="grid card grid-cols-2">
  <div>
    ${selected_color}
    <!-- $ -->
    ${selected_font_size_min}
    <!-- $ -->
    ${selected_font_size_max}
    <!-- $ -->
    ${selected_word_limit}
    <!-- $ -->
  </div>
  <div>
    ${selected_angle_number}
    <!-- $ -->
    ${selected_angle_width}
    <!-- $ -->
    ${selected_angle_offset}
    <!-- $ -->
  </div>
</div>
<div id="word_cloud_container" class="card">
  ${cloud}
  <!-- $ -->
  ${Inputs.button("Refresh", { reduce: flip })}
  <!-- $ -->
  ${copy_button}
  <!-- $ -->
</div>
<div id="bar_chart_container" class="card">
  ${resize((width) => Plot.plot({
    width: width,
    marginLeft: 100,
    color: {
      scheme: "Oranges",
      // scheme: "Blues",
      type: "linear",
    },
    y: {
      label: "Word",
    },
    x: {
      grid: true,
      axis: null,
      label: "Occurrences",
    },
    marks: [
      Plot.barX(filtered_wordcount, {
        y: "text",
        x: "value",
        fill: "value",
        sort: { y: "-x" },
      }),
    ],
  }))}
  <!-- $ -->
  ${downloadSVGButton("#bar_chart_container svg", "Download (.svg)")}
  <!-- $ -->
</div>
<div class="card">${Inputs.table(filtered_wordcount, {columns: ["text", "value"]})}</div>

```js
const _invalidator_1 = refresh

const cloud = resize((width) =>
  wordCloud(filtered_wordcount, {
    width: width,
    height: width * 0.56,
    angle_number: selected_angle_number_value,
    angle_width: selected_angle_width_value,
    angle_offset: selected_angle_offset_value,
    font_size_range: [
      selected_font_size_min_value,
      selected_font_size_max_value,
    ],
    color: selected_color_value,
  }),
)
```

```js
const copy_button = downloadSVGButton(
  '#word_cloud_container svg',
  'Download (.svg)',
)
```

```js
const refresh = Mutable(true)
const flip = () => (refresh.value = !refresh.value)
```

```js
const selected_color = Inputs.select(
  new Map([
    ['Orange', () => vdbi_orange_analogic_color_scale(Math.random())],
    ['Blue', () => vdbi_blue_analogic_color_scale(Math.random())],
  ]),
  {
    label: 'Select color scheme',
  },
)

const selected_font_size_min = Inputs.range([1, 300], {
  label: 'Font size minimum',
  step: 1,
  value: 50,
})

const selected_font_size_max = Inputs.range([1, 300], {
  label: 'Font size maximum',
  step: 1,
  value: 100,
})

const selected_angle_number = Inputs.range([0, 10], {
  label: 'Angle number',
  step: 1,
  value: 1,
})

const selected_angle_width = Inputs.range([0, 360], {
  label: 'Angle width',
  step: 1,
  value: 0,
})

const selected_angle_offset = Inputs.range([0, 360], {
  label: 'Angle offset',
  step: 1,
  value: 0,
})

const selected_word_limit = Inputs.range([1, 100], {
  label: 'Word limit',
  step: 1,
  value: 20,
})
```

```js
const selected_color_value = Generators.input(selected_color)
const selected_font_size_min_value = Generators.input(selected_font_size_min)
const selected_font_size_max_value = Generators.input(selected_font_size_max)
const selected_angle_number_value = Generators.input(selected_angle_number)
const selected_angle_width_value = Generators.input(selected_angle_width)
const selected_angle_offset_value = Generators.input(selected_angle_offset)
const selected_word_limit_value = Generators.input(selected_word_limit)
```

```js
const filtered_wordcount = [...word_count]
  .sort((a, b) => b.value - a.value)
  .slice(0, selected_word_limit_value)
```

```js
console.debug('word_count', word_count)
// console.debug('uploaded_text_value', uploaded_text_value)
console.debug('selected_color_value', selected_color_value)
console.debug('selected_font_size_min_value', selected_font_size_min_value)
console.debug('selected_font_size_max_value', selected_font_size_max_value)
console.debug('selected_angle_number_value', selected_angle_number_value)
console.debug('selected_angle_width_value', selected_angle_width_value)
console.debug('selected_angle_offset_value', selected_angle_offset_value)
```
