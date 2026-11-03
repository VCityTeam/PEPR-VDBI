---
style: /css/vdbi-dashboard.css
---

<!-- imports -->

```js
import { wordCloud } from '/components/cloud.js'
import { downloadSVGButton, formTemplate } from '/components/utilities.js'
import {
  vdbi_orange_analogic_color_scale,
  vdbi_blue_analogic_color_scale,
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

Font sizes are proportional to `value`. Word positions and angles are random: use the _Refresh_ button
to draw another layout. A bar chart of the same words is drawn below the cloud.

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
<div id="word_cloud_container" class="card">
  ${cloud}
  <!-- $ -->
  ${Inputs.button("Refresh", { reduce: flip })}
  <!-- $ -->
  ${copy_button}
  <!-- $ -->
</div>
<div id="bar_chart_container" class="card">
  ${resize((width) => barChart(filtered_wordcount, { width }))}
  <!-- $ -->
  ${bar_chart_copy_button}
  <!-- $ -->
</div>

```js
const _invalidator_1 = refresh

const cloud = resize((width) =>
  wordCloud(filtered_wordcount, {
    width: width,
    height: width * 0.56,
    angle_number: display_settings.angle_number,
    angle_width: display_settings.angle_width,
    angle_offset: display_settings.angle_offset,
    font_size_range: [
      display_settings.font_size_min,
      display_settings.font_size_max,
    ],
    color: display_settings.color,
  }),
)
```

```js
const copy_button = downloadSVGButton(
  '#word_cloud_container svg',
  'Download (.svg)',
  'word-cloud.svg',
)
```

```js
const refresh = Mutable(true)
const flip = () => (refresh.value = !refresh.value)
```

```js
const barChart = (data, options = {}) =>
  Plot.plot({
    marginLeft: 100,
    color: { scheme: 'Oranges', type: 'linear' },
    y: { label: 'Word' },
    x: { grid: true, axis: null, label: 'Occurrences' },
    marks: [
      Plot.barX(data, {
        y: 'text',
        x: 'value',
        fill: 'value',
        sort: { y: '-x' },
      }),
    ],
    ...options,
  })
```

```js
const bar_chart_copy_button = downloadSVGButton(
  '#bar_chart_container svg',
  'Download (.svg)',
  'word-count.svg',
)
```

```js
// depends on the dataset, so these settings are reset when another file is loaded
const settings_form = Inputs.form(
  {
    word_limit: Inputs.range([1, Math.max(1, word_count.length)], {
      label: 'Word limit',
      step: 1,
      value: Math.min(20, word_count.length),
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
    color: Inputs.select(
      new Map([
        ['Orange', () => vdbi_orange_analogic_color_scale(Math.random())],
        ['Blue', () => vdbi_blue_analogic_color_scale(Math.random())],
      ]),
      { label: 'Select color scheme' },
    ),
    font_size_min: Inputs.range([1, 300], {
      label: 'Font size minimum',
      step: 1,
      value: 50,
    }),
    font_size_max: Inputs.range([1, 300], {
      label: 'Font size maximum',
      step: 1,
      value: 100,
    }),
    angle_number: Inputs.range([0, 10], {
      label: 'Angle number',
      step: 1,
      value: 1,
    }),
    angle_width: Inputs.range([0, 360], {
      label: 'Angle width',
      step: 1,
      value: 0,
    }),
    angle_offset: Inputs.range([0, 360], {
      label: 'Angle offset',
      step: 1,
      value: 0,
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

## Data view

### Words

```js
display(Inputs.table(filtered_wordcount, { columns: ['text', 'value'] }))
```
