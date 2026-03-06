---
style: /css/vdbi-page.css
sql:
  integreen_wps_en_cleaned: '/data/private/integreen_wps_en_cleaned.csv'
---

# Word cloud/bubble test

```js
// import { createCanvas } from 'canvas';
import d3_cloud from 'd3-cloud'
import * as d3 from 'd3'
```

Word cloud example using the [d3-cloud](https://github.com/jasondavies/d3-cloud)
extension.
Code adapted from [the basic examples](https://github.com/jasondavies/d3-cloud/tree/master/examples)

<div class="tip">
  The code used in this example is maintained in <code>/src/components/cloud.js</code>
  in the code repository
</div>

## Test basic configuration

Input words:

```js echo
const words = [
  'Hello',
  'world',
  'normally',
  'you',
  'want',
  'more',
  'words',
  'than',
  'this',
].map((d) => {
  return { text: d, value: 1000 + Math.random() * 90 }
})
display(words)
```

container_1:

<div id="container_1"></div>

```js echo
const cloud = d3_cloud()
  .size([500, 500])
  .words(words)
  .rotate(() => Math.random() * 2 * 90)
  .font('Impact')

cloud.on('end', (words) => draw(words, cloud, '#container_1'))

cloud.start()

function draw(words, cloud, element) {
  console.debug('words:', words)
  console.debug('cloud:', cloud)
  const container = d3.select(element)

  if (!container.empty()) {
    container.selectChildren().remove()
  }

  container
    .append('svg')
    .attr('width', cloud.size()[0])
    .attr('height', cloud.size()[1])
    .append('g')
    .attr(
      'transform',
      `translate( ${cloud.size()[0] / 2}, ${cloud.size()[1] / 2} )`,
    )
    .selectAll('text')
    .data(words)
    .join('text')
    .style('font-size', (d) => d.size + 'px')
    .style('font-family', (d) => d.font)
    .attr('text-anchor', 'middle')
    .attr(
      'transform',
      (d) => 'translate(' + [d.x, d.y] + ')rotate(' + d.rotate + ')',
    )
    .text((d) => d.text)
}
```

## Test with word count data

### Also test dynamic resizing, and word cloud size, and coloring

Word count data generated from [/data-analysis/wordcount.md](/data-analysis/wordcount.md):

```sql id=integreen_words display
select
  word as text,
  weight as value,
from integreen_wps_en_cleaned
```

```js
const formatted_words = [...integreen_words].map((d) => d.toJSON())
```

```js
import { vdbi_orange_analogic_color_scale } from '/components/color.js'
```

```js
import { copySVGToClipboardButton } from '/components/utilities.js'
```

container_2:

<div id="container_2">
${resize((width) =>
  generateWordCloud(
    formatted_words,
    { width: width, height: width * 0.7 }
  )
)}<!-- $ -->
</div>

```js
// make sure element is loaded, does observable have an on page load function?
console.log(1)
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
await sleep(3000)
console.log(2)

display(
  copySVGToClipboardButton(d3.select('#container_2').select('svg').node()),
)
```

```js echo
function generateWordCloud(
  data,
  {
    width = 500,
    height = 500,
    font_size_min = 20,
    font_size_max = 100,
    color = () => vdbi_orange_analogic_color_scale(Math.random()),
  } = {},
) {
  const range = [
    d3.min(data.map((d) => d.value)),
    d3.max(data.map((d) => d.value)),
  ]

  const cloud = d3_cloud()
    .size([width, height])
    .words(data)
    .rotate(() => (~~(Math.random() * 8) - 3) * 15)
    .font('Arial')
    .fontSize((d) =>
      d3.scaleLog(range, [font_size_min, font_size_max])(d.value),
    )
    .on('end', draw)

  const svg = d3
    .create('svg')
    .attr('width', cloud.size()[0])
    .attr('height', cloud.size()[1])

  const words = svg
    .append('g')
    .attr(
      'transform',
      `translate(${cloud.size()[0] / 2},${cloud.size()[1] / 2})`,
    )

  function draw(data) {
    console.debug('data', data)
    words
      .selectAll('text')
      .data(data)
      .join('text')
      .style('font-size', (d) => d.size + 'px')
      .style('font-family', (d) => d.font)
      .style('fill', color)
      .attr('text-anchor', 'middle')
      .attr('transform', (d) => `translate(${[d.x, d.y]})rotate(${d.rotate})`)
      .text((d) => d.text)
  }

  cloud.start()

  return svg.node()
}
```

## Again, but from imported code

```js echo
import { wordCloud } from '/components/cloud.js'
```

```js
const refresh = Mutable(true)
const flip = () => (refresh.value = !refresh.value)
display(
  Inputs.button('refresh cloud', {
    reduce: flip,
  }),
)
```

```js
const _invalidator = refresh
display(
  resize((width) =>
    wordCloud(formatted_words, { width: width, height: width * 0.7 }),
  ),
)
```

## Test websafe fonts and weights

```js
const fonts = [
  'Arial', // sans-serif
  'Verdana', // sans-serif
  'Tahoma', // sans-serif
  'Trebuchet MS', // sans-serif
  'Times New Roman', // serif
  'Georgia', // serif
  'Garamond', // serif
  'Courier New', // monospace
  'Brush Script MT', // cursive
]
const weights = ['normal', 'bold', 'bolder', 'lighter']
```

```js
fonts.forEach((font) => {
  weights.forEach((weight) => {
    display(html`<h2>${font} ${weight}</h2>`)
    display(
      resize((width) =>
        wordCloud(formatted_words, {
          width: width,
          height: width * 0.7,
          font: font,
          font_weight: weight,
        }),
      ),
    )
  })
})
```

## Test word bubbles

An alternative to wordclouds that better represents word occurrences

```js echo
import { Graph } from '/components/graph.js'

const word_graph = {
  nodes: words.map((d) => ({
    id: d.text,
    label: d.text,
    r: Math.random() * 100,
  })),
  links: [],
}

const word_bubble = new Graph(word_graph, {
  nodeLabelOffset: -5,
  nodeLabelOpacity: 1,
  textColor: 'white',
})
```

${word_bubble.getSVG()}

<!-- $ -->
