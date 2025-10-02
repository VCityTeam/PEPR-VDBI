---
theme: [dashboard, light]
sql:
  integreen_wps_en_cleaned: "/data/private/integreen_wps_en_cleaned.csv"
  neo_wps_en_cleaned: "/data/private/neo_wps_en_cleaned.csv"
  resilience_wps_en_cleaned: "/data/private/resilience_wps_en_cleaned.csv"
  traces_wps_en_cleaned: "/data/private/traces_wps_en_cleaned.csv"
  urbhealth_wps_en_cleaned: "/data/private/urbhealth_wps_en_cleaned.csv"
  vfpp_wps_en_cleaned: "/data/private/vfpp_wps_en_cleaned.csv"
  villegarden_wps_en_cleaned: "/data/private/villegarden_wps_en_cleaned.csv"
  whaou_wps_en_cleaned: "/data/private/whaou_wps_en_cleaned.csv"
  js_vdbi_2025_roundtable_1: "/data/js_vdbi_2025_roundtable_1.csv"
  js_vdbi_2025_roundtable_2: "/data/js_vdbi_2025_roundtable_2.csv"
  js_vdbi_2025_roundtable_3: "/data/js_vdbi_2025_roundtable_3.csv"
---

<!-- imports -->

```js
import { wordCloud } from "/components/cloud.js"
```

```js
import { downloadSVGButton } from "/components/utilities.js"
```

```js
import {
  vdbi_orange_analogic_color_scale,
  vdbi_blue_analogic_color_scale,
  vdbi_color_scheme,
} from "/components/color.js"
```

# Word Cloud Generator

<div class="grid card grid-cols-3">
  <div>
    ${selected_wordcount}
    ${uploaded_wordcount}
    ${Inputs.button("Refresh cloud", { reduce: flip })}
    ${copy_button}
    <!-- $ -->
  </div>
  <div>
    ${selected_color}
    ${selected_font_size_min}
    ${selected_font_size_max}
    ${selected_word_limit}
    <!-- $ -->
  </div>
  <div>
    ${selected_angle_number}
    ${selected_angle_width}
    ${selected_angle_offset}
    <!-- $ -->
  </div>
</div>
<div id="word_cloud_container" class="card">${cloud}</div>
<div id="bar_chart_container" class="card">
  ${downloadSVGButton("#bar_chart_container svg", "Download chart")}
  <!-- $ -->
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
      axis: "both",
      label: "Occurrences",
    },
    marks: [
      Plot.barX([...selected_wordcount_value], {
        y: "text",
        x: "value",
        fill: "value",
        sort: { y: "-x" },
      }),
    ],
  }))}
  <!-- $ -->
</div>
<div class="card">${Inputs.table(selected_wordcount_value)}</div>

```js
const _invalidator_1 = refresh

const cloud = resize((width) =>
  wordCloud(
    [...selected_wordcount_value]
      .slice(0, selected_word_limit_value)
      .map((d) => (d.toJSON ? d.toJSON() : d)),
    {
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
    }
  )
)
```

```js
const copy_button = downloadSVGButton(
  "#word_cloud_container svg",
  "Download cloud"
)
```

```js
const refresh = Mutable(true)
const flip = () => (refresh.value = !refresh.value)
```

```js
const selected_wordcount = Inputs.select(
  new Map([
    [
      "Uploaded word count",
      uploaded_wordcount_value ? uploaded_wordcount_value.csv() : [],
    ],
    ["integreen work package words (EN)", integreen_words],
    ["neo work package words (EN)", neo_words],
    ["resilience work package words (EN)", resilience_words],
    ["traces work package words (EN)", traces_words],
    ["urbhealth work package words (EN)", urbhealth_words],
    ["vfpp work package words (EN)", vfpp_words],
    ["villegarden work package words (EN)", villegarden_words],
    ["whaou work package words (EN)", whaou_words],
    ["JS VDBI 2025 Roundtable 1 (EN)", roundtable_1_words],
    ["JS VDBI 2025 Roundtable 2 (EN)", roundtable_2_words],
    ["JS VDBI 2025 Roundtable 3 (EN)", roundtable_3_words],
  ]),
  {
    label: "Select a word count",
  }
)
```

```js
const selected_wordcount_value = Generators.input(selected_wordcount)
```

```js
const uploaded_wordcount = Inputs.file({ accept: ".csv" })
```

```js
const selected_color = Inputs.select(
  new Map([
    ["Orange", () => vdbi_orange_analogic_color_scale(Math.random())],
    ["Blue", () => vdbi_blue_analogic_color_scale(Math.random())],
  ]),
  {
    label: "Select color scheme",
  }
)

const selected_font_size_min = Inputs.range([1, 300], {
  label: "Font size minimum",
  step: 1,
  value: 50,
})

const selected_font_size_max = Inputs.range([1, 300], {
  label: "Font size maximum",
  step: 1,
  value: 100,
})

const selected_angle_number = Inputs.range([0, 10], {
  label: "Angle number",
  step: 1,
  value: 3,
})

const selected_angle_width = Inputs.range([0, 360], {
  label: "Angle width",
  step: 1,
  value: 90,
})

const selected_angle_offset = Inputs.range([0, 360], {
  label: "Angle offset",
  step: 1,
  value: 45,
})

const selected_word_limit = Inputs.range([1, 100], {
  label: "Word limit",
  step: 1,
  value: 20,
})
```

```js
const uploaded_wordcount_value = Generators.input(uploaded_wordcount)
const selected_color_value = Generators.input(selected_color)
const selected_font_size_min_value = Generators.input(selected_font_size_min)
const selected_font_size_max_value = Generators.input(selected_font_size_max)
const selected_angle_number_value = Generators.input(selected_angle_number)
const selected_angle_width_value = Generators.input(selected_angle_width)
const selected_angle_offset_value = Generators.input(selected_angle_offset)
const selected_word_limit_value = Generators.input(selected_word_limit)
```

```js
console.debug("selected_wordcount_value", selected_wordcount_value)
console.debug("uploaded_wordcount_value", uploaded_wordcount_value)
console.debug("selected_color_value", selected_color_value)
console.debug("selected_font_size_min_value", selected_font_size_min_value)
console.debug("selected_font_size_max_value", selected_font_size_max_value)
console.debug("selected_angle_number_value", selected_angle_number_value)
console.debug("selected_angle_width_value", selected_angle_width_value)
console.debug("selected_angle_offset_value", selected_angle_offset_value)
```

<!-- word counts -->

```sql id=integreen_words
select
  word as text,
  weight as value,
from integreen_wps_en_cleaned
```

```sql id=neo_words
select
  word as text,
  weight as value,
from neo_wps_en_cleaned
```

```sql id=resilience_words
select
  word as text,
  weight as value,
from resilience_wps_en_cleaned
```

```sql id=traces_words
select
  word as text,
  weight as value,
from traces_wps_en_cleaned
```

```sql id=urbhealth_words
select
  word as text,
  weight as value,
from urbhealth_wps_en_cleaned
```

```sql id=vfpp_words
select
  word as text,
  weight as value,
from vfpp_wps_en_cleaned
```

```sql id=villegarden_words
select
  word as text,
  weight as value,
from villegarden_wps_en_cleaned
```

```sql id=whaou_words
select
  word as text,
  weight as value,
from whaou_wps_en_cleaned
```

```sql id=roundtable_1_words
select
  word as text,
  weight as value,
from js_vdbi_2025_roundtable_1
```

```sql id=roundtable_2_words
select
  word as text,
  weight as value,
from js_vdbi_2025_roundtable_2
```

```sql id=roundtable_3_words
select
  word as text,
  weight as value,
from js_vdbi_2025_roundtable_3
```
