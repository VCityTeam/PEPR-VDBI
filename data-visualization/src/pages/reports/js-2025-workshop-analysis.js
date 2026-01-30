import { resize } from "observablehq:stdlib"
import * as Plot from "@observablehq/plot"
import * as d3 from "npm:d3"
import { html } from "npm:htl"
import { cropText } from "/components/utilities.js"

export const freq_words = (data) =>
  data
    .sort((a, b) => b["C-value"] - a["C-value"])
    .slice(0, 10)
    .map((d) => ({
      id: d["Main form"],
      label: cropText(d["Main form"], d["C-value"] * 1.5),
      r: d["C-value"] * 6,
    }))

export const group_freq_words = (data) =>
  data
    .sort((a, b) => b["Gfidf"] - a["Gfidf"])
    .slice(0, 10)
    .map((d) => ({
      id: d["Main form"],
      label: cropText(d["Main form"], (d["Gfidf"] / d["Gfidf"]) * 10),
      r: d["Gfidf"] * 12,
    }))

export const graph_config = {
  nodeLabelOpacity: 1,
  textColor: "white",
  color: () => "var(--theme-foreground-focus)",
  fontSize: (d) => d.r / 2.7,
  nodeLabelOffset: (d) => -d.r / 10,
}

export const entity_type_map = new Map([
  ["loc", "Location"],
  ["org", "Organization"],
  ["misc", "Miscellaneous"],
])

export const generateEntitiesPlot = (data, width) =>
  Plot.auto(data, {
    x: (d) => Number(d.frequency),
    y: "entity",
    fx: "group",
    color: (d) => entity_type_map.get(d.type),
    mark: "bar",
  }).plot({
    width: width,
    y: { label: "Entity", grid: true },
    x: { label: "Frequency" },
    fx: { label: "Group" },
    color: { legend: true },
    marginLeft: 140,
    caption: "Fig 4. Extracted entities by group",
  })

export const column_title_map = new Map([
  ["C-value", "Fig 5. Terms by frequency"],
  ["Gfidf", "Fig 6. Terms by group frequency"],
  // ["Specificity chi2", "Fig 7. Terms by specificity"],
  ["Occurrences", "Fig 7. Terms by group occurrences"],
  ["Cooccurrences", "Fig 8. Terms by group co-occurrences"],
])

export const column_label_map = new Map([
  ["C-value", "C-value"],
  ["Gfidf", "G2 (gf.idf)"],
  // ["Specificity chi2", "X^2"],
  ["Occurrences", "Group occurrences"],
  ["Cooccurrences", "Group co-occurrences"],
])

export const generateExtractedTermsPlot = (data, x_column) =>
  resize((width) =>
    Plot.plot({
      x: {
        label: column_label_map.get(x_column),
        ticks: d3.max(data.map((d) => d[x_column])) === 1 ? 1 : undefined,
        // axis: "both",
        nice: true,
      },
      symbol: { legend: true },
      width: width,
      marginLeft: 180,
      grid: true,
      caption: column_title_map.get(x_column),
      marks: [
        Plot.frame(),
        Plot.barX(data, {
          x: (d) => Number(d[x_column]),
          y: "Main form",
          fill: "var(--theme-foreground-focus)",
          sort: { y: "-x" },
        }),
      ],
    }),
  )

export const extractedTermsHtmlTemplate = (data) =>
  html`<div class="grid grid-cols-2">
    ${column_title_map
      .keys()
      .map(
        (column) =>
          html`<div id="all-terms-${column}-plot">
            ${generateExtractedTermsPlot(data, column)}
          </div>`,
      )}
  </div>`
// ${downloadSVGButton(`#all-terms-${column}-plot svg`)}

export const extractedTermsByGroupHtmlTemplate = (data) =>
  html`${resize((width) =>
    Plot.plot({
      x: {
        label: column_label_map.get("C-value"),
        ticks: d3.max(data.map((d) => d["C-value"])) === 1 ? 1 : undefined,
        // axis: "both",
        nice: true,
      },
      fx: { label: "Group" },
      symbol: { legend: true },
      width: width,
      marginLeft: 180,
      grid: true,
      caption: "Fig 3. Extracted terms by frequency by group",
      marks: [
        Plot.frame(),
        Plot.barX(data, {
          x: (d) => Number(d["C-value"]),
          y: "Main form",
          fill: "var(--theme-foreground-focus)",
          fx: "group",
          sort: { y: "-x" },
        }),
      ],
    }),
  )}`
// ${downloadSVGButton(`#terms-${"C-value"}-plot svg`)}
