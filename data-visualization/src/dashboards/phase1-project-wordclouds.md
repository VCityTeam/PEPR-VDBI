---
theme: [dashboard, light]
---

<!-- imports -->

```js
import { wordCloud } from "/components/cloud.js"
```

```js
import { copySVGToClipboardButton } from "/components/utilities.js"
```

```js
import {
  vdbi_orange_analogic_color_scale,
  vdbi_blue_analogic_color_scale,
} from "/components/color.js"
```

# Phase 1 Project Word Clouds

<div class="grid card grid-cols-3">
  <div>
    ${selected_project}
    ${Inputs.button("Refresh cloud", { reduce: flip })}
    ${copy_button}
    <!-- $ -->
  </div>
  <div>
    ${selected_color}
    ${selected_font_size_min}
    ${selected_font_size_max}
    <!-- $ -->
  </div>
  <div>
    ${selected_angle_number}
    ${selected_angle_width}
    ${selected_angle_offset}
    <!-- $ -->
  </div>
</div>
<div class="card">${cloud}</div>

```js
const _invalidator_1 = refresh
const word_count = await selected_project_value.csv()

const cloud = resize((width) =>
  wordCloud(
    word_count,
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
const _invalidator_2 = refresh
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
await sleep(500)
const getSVG = () => d3.select("svg").node()
while (!getSVG()) {
  await sleep(500)
}
const copy_button = copySVGToClipboardButton(getSVG())
```

```js
const refresh = Mutable(true)
const flip = () => (refresh.value = !refresh.value)
```

```js
const selected_project = Inputs.select(
  new Map([
    [
      "integreen work package words (EN)",
      FileAttachment("/data/private/integreen_wps_en_cleaned.csv"),
    ],
    [
      "neo work package words (EN)",
      FileAttachment("/data/private/neo_wps_en_cleaned.csv"),
    ],
    [
      "resilience work package words (EN)",
      FileAttachment("/data/private/resilience_wps_en_cleaned.csv"),
    ],
    [
      "traces work package words (EN)",
      FileAttachment("/data/private/traces_wps_en_cleaned.csv"),
    ],
    [
      "urbhealth work package words (EN)",
      FileAttachment("/data/private/urbhealth_wps_en_cleaned.csv"),
    ],
    [
      "vfpp work package words (EN)",
      FileAttachment("/data/private/vfpp_wps_en_cleaned.csv"),
    ],
    [
      "villegarden work package words (EN)",
      FileAttachment("/data/private/villegarden_wps_en_cleaned.csv"),
    ],
    [
      "whaou work package words (EN)",
      FileAttachment("/data/private/whaou_wps_en_cleaned.csv"),
    ],
    [
      "JS VDBI 2025 Roundtable 1 (EN)",
      FileAttachment("/data/js_vdbi_2025_roundtable_1.csv"),
    ],
    [
      "JS VDBI 2025 Roundtable 2 (EN)",
      FileAttachment("/data/js_vdbi_2025_roundtable_2.csv"),
    ],
    [
      "JS VDBI 2025 Roundtable 3 (EN)",
      FileAttachment("/data/js_vdbi_2025_roundtable_3.csv"),
    ],
  ]),
  {
    label: "Select project",
  }
)

const selected_color = Inputs.select(
  new Map([
    ["orange", () => vdbi_orange_analogic_color_scale(Math.random())],
    ["blue", () => vdbi_blue_analogic_color_scale(Math.random())],
  ]),
  {
    label: "Select color scheme",
  }
)

const selected_font_size_min = Inputs.range([1, 300], {
  label: "Font size minimum",
  step: 1,
  value: 10,
})

const selected_font_size_max = Inputs.range([1, 300], {
  label: "Font size minimum",
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
```

```js
const selected_project_value = Generators.input(selected_project)
const selected_color_value = Generators.input(selected_color)
const selected_font_size_min_value = Generators.input(selected_font_size_min)
const selected_font_size_max_value = Generators.input(selected_font_size_max)
const selected_angle_number_value = Generators.input(selected_angle_number)
const selected_angle_width_value = Generators.input(selected_angle_width)
const selected_angle_offset_value = Generators.input(selected_angle_offset)
```

```js
console.debug("selected_project_value", await selected_project_value.csv())
```
