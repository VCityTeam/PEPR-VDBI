import { resize } from 'observablehq:stdlib'
import * as Plot from '@observablehq/plot'
import * as d3 from 'npm:d3'
import { html } from 'npm:htl'

export const entity_type_map = new Map([
  ['loc', 'Location'],
  ['org', 'Organization'],
  ['misc', 'Miscellaneous'],
])

export const column_title_map = new Map([
  ['C-value', 'Fig 6. Top terms by frequency'],
  ['Gfidf', 'Fig 7. Top terms by group frequency'],
  // ["Specificity chi2", "Fig 8. Terms by specificity"],
  // ["Occurrences", "Fig 9. Terms by group occurrences"],
  // ["Cooccurrences", "Fig 10. Terms by group co-occurrences"],
])

export const column_label_map = new Map([
  ['C-value', 'C-value'],
  ['Gfidf', 'G2 (gf.idf)'],
  // ["Specificity chi2", "X^2"],
  // ["Occurrences", "Group occurrences"],
  // ["Cooccurrences", "Group co-occurrences"],
])

/**
 * Sort terms by C-value descending, limit to the top entries, and reshape
 * them for word-cloud sizing
 *
 * @param {Object[]} data - extracted term rows, each with `Main form` and `C-value`
 * @param {Object} [options]
 * @param {number} [options.limit=15] - maximum number of terms to keep
 * @param {number} [options.rFactor=6] - multiplier applied to C-value to compute the word-cloud radius
 * @returns {Object[]} an array of `{id, label, r}` word-cloud data
 */
export const freq_words = (data, { limit = 15, rFactor = 6 } = {}) =>
  data
    .sort((a, b) => b['C-value'] - a['C-value'])
    .slice(0, limit)
    .map((d) => ({
      id: d['Main form'],
      label: d['Main form'],
      r: d['C-value'] * rFactor,
    }))

/**
 * Sort terms by Gfidf descending, limit to the top entries, and reshape
 * them for word-cloud sizing
 *
 * @param {Object[]} data - extracted term rows, each with `Main form` and `Gfidf`
 * @param {Object} [options]
 * @param {number} [options.limit=15] - maximum number of terms to keep
 * @param {number} [options.rFactor=6] - multiplier applied to Gfidf to compute the word-cloud radius
 * @returns {Object[]} an array of `{id, label, r}` word-cloud data
 */
export const group_freq_words = (data, { limit = 15, rFactor = 6 } = {}) =>
  data
    .sort((a, b) => b['Gfidf'] - a['Gfidf'])
    .slice(0, limit)
    .map((d) => ({
      id: d['Main form'],
      label: d['Main form'],
      r: d['Gfidf'] * rFactor,
    }))

/**
 * Auto bar plot of extracted entity frequencies, faceted by group and
 * colored by entity type
 *
 * @param {Object[]} data - entity rows, each with `frequency`, `entity`, `group`, `type`
 * @param {number} width - chart width
 * @returns {SVGElement} the rendered bar plot
 */
export const generateWorkshopEntitiesPlot = (data, width) =>
  Plot.auto(data, {
    x: (d) => Number(d.frequency),
    y: 'entity',
    fx: 'group',
    color: (d) => entity_type_map.get(d.type),
    mark: 'bar',
  }).plot({
    width: width,
    y: { label: 'Entity', grid: true },
    x: { label: 'Frequency' },
    fx: { label: 'Group' },
    color: { legend: true },
    marginLeft: 140,
    caption: 'Fig 4. Extracted entities by group',
  })

/**
 * Auto bar plot of extracted entity frequencies, colored by entity type
 * (round-table variant, no group facet)
 *
 * @param {Object[]} data - entity rows, each with `frequency`, `entity`, `type`
 * @param {number} width - chart width
 * @returns {SVGElement} the rendered bar plot
 */
export const generateRoundTableEntitiesPlot = (data, width) =>
  Plot.auto(data, {
    x: (d) => Number(d.frequency),
    y: 'entity',
    color: (d) => entity_type_map.get(d.type),
    mark: 'bar',
  }).plot({
    width: width,
    y: { label: 'Entity' },
    x: { label: 'Frequency', grid: true },
    color: { legend: true },
    marginLeft: 120,
    caption: 'Fig 4. Top 20 most frequent extracted entities',
  })

/**
 * Bar plot of the top terms by a chosen numeric column, resized to its
 * container width
 *
 * @param {Object[]} data - extracted term rows, each with `Main form` and the column named by `x_column`
 * @param {Object} [options]
 * @param {string} [options.x_column] - the numeric column to rank/plot terms by
 * @param {number} [options.limit] - maximum number of terms to display
 * @param {number} [options.marginLeft] - chart left margin
 * @param {string} [options.caption] - chart caption
 * @returns {Element} the rendered, auto-resizing bar plot
 */
const generateExtractedTermsPlot = (
  data,
  { x_column, limit, marginLeft, caption } = {},
) =>
  resize((width) =>
    Plot.plot({
      x: {
        label: column_label_map.get(x_column),
        ticks: d3.max(data.map((d) => d[x_column])) === 1 ? 1 : undefined,
        // axis: "both",
        nice: true,
      },
      y: {
        label: 'Term',
      },
      width: width,
      marginLeft: marginLeft,
      grid: true,
      caption: caption,
      marks: [
        Plot.frame(),
        Plot.barX(
          d3.sort(data, (a, b) => b[x_column] - a[x_column]).slice(0, limit),
          {
            x: (d) => Number(d[x_column]),
            y: 'Main form',
            fill: 'var(--theme-foreground-focus)',
            sort: { y: '-x' },
          },
        ),
      ],
    }),
  )

/**
 * Build a 2-column HTML grid of term frequency plots, one per column in
 * column_title_map (C-value, Gfidf)
 *
 * @param {Object[]} data - extracted term rows
 * @param {Object} [options]
 * @param {number} [options.marginLeft=180] - chart left margin for each plot
 * @param {number} [options.limit=30] - maximum number of terms per plot
 * @returns {Element} an HTML grid containing one term plot per column
 */
export const extractedTermsHtmlTemplate = (
  data,
  { marginLeft = 180, limit = 30 } = {},
) =>
  html`<div class="grid grid-cols-2">
    ${column_title_map.keys().map(
      (column) =>
        html`<div id="all-terms-${column}-plot">
          ${generateExtractedTermsPlot(data, {
            x_column: column,
            marginLeft,
            limit,
            caption: column_title_map.get(column),
          })}
        </div>`,
    )}
  </div>`
// ${downloadSVGButton(`#all-terms-${column}-plot svg`)}

/**
 * Build a C-value term-frequency bar plot faceted by group, resized to its
 * container width
 *
 * @param {Object[]} data - extracted term rows, each with `Main form`, `C-value`, `group`
 * @returns {Element} the rendered, auto-resizing faceted bar plot
 */
export const extractedTermsByGroupHtmlTemplate = (data) =>
  html`${resize((width) =>
    Plot.plot({
      x: {
        label: column_label_map.get('C-value'),
        ticks: d3.max(data.map((d) => d['C-value'])) === 1 ? 1 : undefined,
        // axis: "both",
        nice: true,
      },
      y: {
        label: 'Term',
      },
      fx: { label: 'Group' },
      symbol: { legend: true },
      width: width,
      marginLeft: 180,
      grid: true,
      caption: 'Fig 5. Extracted terms by frequency by group',
      marks: [
        Plot.frame(),
        Plot.barX(data, {
          x: (d) => Number(d['C-value']),
          y: 'Main form',
          fill: 'var(--theme-foreground-focus)',
          fx: 'group',
          sort: { y: '-x' },
        }),
      ],
    }),
  )}`
// ${downloadSVGButton(`#terms-${"C-value"}-plot svg`)}
