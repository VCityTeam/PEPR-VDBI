import { resize } from "observablehq:stdlib";
import * as Plot from "@observablehq/plot";
import * as d3 from "npm:d3";
import { html } from "npm:htl";
import { cropText } from "/components/utilities.js";

export const graph_config_workshop = {
  textLength: 60,
  nodeLabelOpacity: 1,
  textColor: "white",
  color: () => "var(--theme-foreground-focus)",
  fontSize: (d) => d.r / 3.5,
  nodeLabelOffset: () => 0,
};

export const graph_config_round_table = {
  ...graph_config_workshop,
};

export const entity_type_map = new Map([
  ["loc", "Location"],
  ["org", "Organization"],
  ["misc", "Miscellaneous"],
]);

export const column_title_map = new Map([
  ["C-value", "Fig 5. Top 30 terms by frequency"],
  ["Gfidf", "Fig 6. Top 30 terms by group frequency"],
  // ["Specificity chi2", "Fig 7. Terms by specificity"],
  // ["Occurrences", "Fig 8. Terms by group occurrences"],
  // ["Cooccurrences", "Fig 9. Terms by group co-occurrences"],
]);

export const column_label_map = new Map([
  ["C-value", "C-value"],
  ["Gfidf", "G2 (gf.idf)"],
  // ["Specificity chi2", "X^2"],
  // ["Occurrences", "Group occurrences"],
  // ["Cooccurrences", "Group co-occurrences"],
]);

export const freq_words = (data, { limit = 10, rFactor = 6 } = {}) =>
  data
    .sort((a, b) => b["C-value"] - a["C-value"])
    .slice(0, limit)
    .map((d) => ({
      id: d["Main form"],
      label: d["Main form"],
      r: d["C-value"] * rFactor,
    }));

export const group_freq_words = (data, { limit = 10, rFactor = 6 } = {}) =>
  data
    .sort((a, b) => b["Gfidf"] - a["Gfidf"])
    .slice(0, limit)
    .map((d) => ({
      id: d["Main form"],
      label: d["Main form"],
      r: d["Gfidf"] * rFactor,
    }));

export const generateWorkshopEntitiesPlot = (data, width) =>
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
  });

export const generateRoundTableEntitiesPlot = (data, width) =>
  Plot.auto(data, {
    x: (d) => Number(d.frequency),
    y: "entity",
    color: (d) => entity_type_map.get(d.type),
    mark: "bar",
  }).plot({
    width: width,
    y: { label: "Entity" },
    x: { label: "Frequency", grid: true },
    color: { legend: true },
    marginLeft: 120,
    caption: "Fig 4. Top 20 most frequent extracted entities",
  });

export const generateExtractedTermsPlot = (
  data,
  { x_column, limit, marginLeft } = {},
) =>
  resize((width) =>
    Plot.plot({
      x: {
        label: column_label_map.get(x_column),
        ticks: d3.max(data.map((d) => d[x_column])) === 1 ? 1 : undefined,
        // axis: "both",
        nice: true,
      },
      width: width,
      marginLeft: marginLeft,
      grid: true,
      caption: column_title_map.get(x_column),
      marks: [
        Plot.frame(),
        Plot.barX(
          d3.sort(data, (a, b) => b[x_column] - a[x_column]).slice(0, limit),
          {
            x: (d) => Number(d[x_column]),
            y: "Main form",
            fill: "var(--theme-foreground-focus)",
            sort: { y: "-x" },
          },
        ),
      ],
    }),
  );

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
          })}
        </div>`,
    )}
  </div>`;
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
      caption: "Fig 5. Extracted terms by frequency by group",
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
  )}`;
// ${downloadSVGButton(`#terms-${"C-value"}-plot svg`)}
